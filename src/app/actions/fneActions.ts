'use server'

import { db } from '@/lib/db'
import { paiements } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { exiger, getCurrentUserContext } from '@/lib/auth/permissions'
import { certifierFacturePaiement, genererNumeroFNE, calculerSignatureFNE, genererStickerFNE } from '@/lib/fne/service'
import { genererEtEnvoyerFacture } from '@/lib/factures/genererFacture'
import { logAuditEvent } from '@/lib/audit/logger'

/**
 * Server Action : Forcer ou relancer la certification FNE d'un paiement
 */
export async function certifierPaiementManuelAction(formData: FormData) {
  const actor = await getCurrentUserContext()
  if (!actor) throw new Error('Authentification requise.')
  await exiger('facture:voir/exporter')

  const paiementId = formData.get('paiementId') as string
  if (!paiementId) throw new Error('Identifiant du paiement manquant.')

  const res = await certifierFacturePaiement(paiementId, {
    type: 'VENTE',
    actorId: actor.id,
  })

  // Régénérer le PDF et envoyer au client
  await genererEtEnvoyerFacture(paiementId)

  revalidatePath('/admin/paiements')
  return { success: true, fneNumero: res.fneNumero }
}

/**
 * Server Action : Générer une Facture d'Avoir FNE (Préfixe A, Art. 5 Arrêté 0337)
 */
export async function genererFactureAvoirFNEAction(formData: FormData) {
  const actor = await getCurrentUserContext()
  if (!actor) throw new Error('Authentification requise.')
  await exiger('remboursement:approuver')

  const originalPaiementId = formData.get('paiementId') as string
  const motif = (formData.get('motif') as string) || 'Annulation ou remboursement de réservation'

  if (!originalPaiementId) throw new Error('Identifiant du paiement d\'origine manquant.')

  const [original] = await db
    .select()
    .from(paiements)
    .where(eq(paiements.id, originalPaiementId))
    .limit(1)

  if (!original) throw new Error('Facture initiale introuvable.')

  const annee = new Date().getFullYear()
  const certifieLe = new Date()
  const dateIso = certifieLe.toISOString()

  // 1. Numéro officiel d'avoir FNE (Art. 5 : Préfixe A)
  const avoirFneNumero = await genererNumeroFNE('AVOIR', annee)

  // 2. Signature électronique de l'avoir
  const signature = calculerSignatureFNE(
    avoirFneNumero,
    dateIso,
    Number(original.montant),
    `AVOIR-${original.paystackReference || original.id}`
  )

  const sticker = genererStickerFNE(avoirFneNumero, signature, Number(original.montant))

  // 3. Insérer la facture d'avoir dans la table paiements
  const [avoirPaiement] = await db
    .insert(paiements)
    .values({
      reservationId: original.reservationId,
      clientId: original.clientId,
      montant: original.montant, // Montant de l'avoir
      devise: original.devise,
      statut: 'rembourse',
      typePaiement: 'total',
      paystackReference: `AVOIR-${Date.now()}`,
      paystackChannel: original.paystackChannel,
      factureNumero: avoirFneNumero,
      fneNumero: avoirFneNumero,
      fneType: 'AVOIR',
      fneQrData: sticker.verificationUrl,
      fneSignature: signature,
      fneStatut: 'certifie',
      fneCertifieLe: certifieLe,
      fneOriginalId: originalPaiementId,
    })
    .returning()

  // 4. Mettre à jour le statut du paiement d'origine
  await db
    .update(paiements)
    .set({
      statut: 'rembourse',
      updatedAt: new Date(),
    })
    .where(eq(paiements.id, originalPaiementId))

  // 5. Journalisation d'audit immuable
  await logAuditEvent({
    userId: actor.id,
    userEmail: actor.email,
    userRole: actor.role,
    action: 'fne.credit_note_generated',
    entity: 'paiements',
    entityId: avoirPaiement.id,
    details: {
      avoirFneNumero,
      originalPaiementId,
      originalFneNumero: original.fneNumero,
      montant: original.montant,
      motif,
    },
  })

  revalidatePath('/admin/paiements')
  return { success: true, avoirFneNumero }
}

