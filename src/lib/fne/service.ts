import { db } from '@/lib/db'
import { paiements, fneSequences } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { siteConfig } from '@/config/site'
import { createHash } from 'crypto'
import { generateQrMatrix, qrMatrixToSvg, qrMatrixToDataUrl, type QrMatrix } from './qrcode'
import type { FneType, FneStatut, FneCertificationResult } from './types'
import { logAuditEvent } from '@/lib/audit/logger'

/**
 * Préfixes officiels par type de document fiscal (Art. 5 Arrêté 0337) :
 * - Vente : aucun préfixe
 * - Avoir : A
 * - Proforma : P
 * - Bordereau d'achat : B
 */
export const FNE_PREFIXES: Record<FneType, string> = {
  VENTE: '',
  AVOIR: 'A',
  PROFORMA: 'P',
  BORDEREAU: 'B',
}

/**
 * 1. Génère un numéro officiel FNE séquentiel et ininterrompu (Art. 5) :
 * Format : [Préfixe] + NCC + Année (2 car.) + Séquence annuelle (10 chiffres)
 * Exemple : 2034567A260000000001
 */
export async function genererNumeroFNE(type: FneType = 'VENTE', anneeParam?: number): Promise<string> {
  const annee = anneeParam || new Date().getFullYear()
  const annee2Digits = String(annee).slice(-2)
  const ncc = siteConfig.company.ncc
  const prefix = FNE_PREFIXES[type] ?? ''

  // Incrément atomique de la séquence annuelle pour ce type
  let nextSeq = 1

  const existingSeq = await db
    .select({ derniereSequence: fneSequences.derniereSequence })
    .from(fneSequences)
    .where(and(eq(fneSequences.annee, annee), eq(fneSequences.type, type)))
    .limit(1)

  if (existingSeq.length === 0) {
    // Initialiser le compteur pour la nouvelle année / type
    await db.insert(fneSequences).values({
      annee,
      type,
      derniereSequence: 1,
      updatedAt: new Date(),
    })
    nextSeq = 1
  } else {
    // Incrémenter de façon atomique
    const updated = await db
      .update(fneSequences)
      .set({
        derniereSequence: sql`${fneSequences.derniereSequence} + 1`,
        updatedAt: new Date(),
      })
      .where(and(eq(fneSequences.annee, annee), eq(fneSequences.type, type)))
      .returning({ seq: fneSequences.derniereSequence })

    nextSeq = updated[0]?.seq || existingSeq[0].derniereSequence + 1
  }

  // Formatage strict sur 10 chiffres avec zéros à gauche
  const seqStr = String(nextSeq).padStart(10, '0')
  return `${prefix}${ncc}${annee2Digits}${seqStr}`
}

/**
 * 2. Calcule la signature électronique officielle de la facture (Art. 4)
 */
export function calculerSignatureFNE(
  fneNumero: string,
  dateIso: string,
  montantTTC: number,
  reference: string
): string {
  const secretOrKey = process.env.FNE_API_KEY || 'fne_immOfika_secret_key_2026'
  const payloadToSign = `${fneNumero}|${siteConfig.company.ncc}|${dateIso}|${montantTTC}|${reference}|${secretOrKey}`
  return createHash('sha256').update(payloadToSign).digest('hex')
}

/**
 * 3. Génère le Sticker Électronique complet (Visuel, QR Code et URL de contrôle)
 */
export function genererStickerFNE(
  fneNumero: string,
  signature: string,
  montantTTC: number
): {
  verificationUrl: string
  qrCodeSvg: string
  qrCodeDataUrl: string
  qrMatrix: QrMatrix
} {
  const verificationUrl = `${siteConfig.company.fneApiUrl.replace(/\/api$/, '')}/v/${fneNumero}?sig=${signature.slice(0, 12)}&mt=${montantTTC}`
  const qrMatrix = generateQrMatrix(verificationUrl)
  const qrCodeSvg = qrMatrixToSvg(qrMatrix)
  const qrCodeDataUrl = qrMatrixToDataUrl(qrMatrix)

  return {
    verificationUrl,
    qrCodeSvg,
    qrCodeDataUrl,
    qrMatrix,
  }
}

/**
 * 4. Certifie fiscalement un paiement existant (Génération FNE officielle)
 */
export async function certifierFacturePaiement(
  paiementId: string,
  options?: {
    type?: FneType
    originalPaiementId?: string
    actorId?: string
  }
): Promise<FneCertificationResult> {
  const [paiement] = await db
    .select()
    .from(paiements)
    .where(eq(paiements.id, paiementId))
    .limit(1)

  if (!paiement) {
    throw new Error('Paiement introuvable pour certification FNE.')
  }

  // Si déjà certifiée, renvoyer la certification existante (idempotence absolue)
  if (paiement.fneStatut === 'certifie' && paiement.fneNumero && paiement.fneSignature) {
    const sticker = genererStickerFNE(
      paiement.fneNumero,
      paiement.fneSignature,
      Number(paiement.montant)
    )
    return {
      fneNumero: paiement.fneNumero,
      fneType: (paiement.fneType as FneType) || 'VENTE',
      signature: paiement.fneSignature,
      verificationUrl: sticker.verificationUrl,
      qrCodeSvg: sticker.qrCodeSvg,
      qrCodeDataUrl: sticker.qrCodeDataUrl,
      certifieLe: paiement.fneCertifieLe || new Date(),
      statut: 'certifie',
      mode: siteConfig.company.fneMode,
    }
  }

  const type = options?.type || 'VENTE'
  const certifieLe = new Date()
  const dateIso = certifieLe.toISOString()

  // 1. Génération du numéro officiel
  const fneNumero = await genererNumeroFNE(type, certifieLe.getFullYear())

  // 2. Signature électronique
  const signature = calculerSignatureFNE(
    fneNumero,
    dateIso,
    Number(paiement.montant),
    paiement.paystackReference || paiement.id
  )

  // 3. Sticker QR Code
  const sticker = genererStickerFNE(fneNumero, signature, Number(paiement.montant))

  // 4. Mise à jour atomique en base
  await db
    .update(paiements)
    .set({
      fneNumero,
      fneType: type,
      fneSignature: signature,
      fneQrData: sticker.verificationUrl,
      fneStatut: 'certifie',
      fneCertifieLe: certifieLe,
      fneOriginalId: options?.originalPaiementId || null,
    })
    .where(eq(paiements.id, paiementId))

  // 5. Journalisation d'audit immuable
  await logAuditEvent({
    userId: options?.actorId || paiement.clientId,
    action: 'fne.certified',
    entity: 'paiements',
    entityId: paiementId,
    details: {
      fneNumero,
      fneType: type,
      montantTTC: paiement.montant,
      mode: siteConfig.company.fneMode,
    },
  })

  return {
    fneNumero,
    fneType: type,
    signature,
    verificationUrl: sticker.verificationUrl,
    qrCodeSvg: sticker.qrCodeSvg,
    qrCodeDataUrl: sticker.qrCodeDataUrl,
    certifieLe,
    statut: 'certifie',
    mode: siteConfig.company.fneMode,
  }
}

