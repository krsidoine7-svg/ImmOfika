import { renderToStream } from '@react-pdf/renderer'
import { render } from '@react-email/render'
import { Resend } from 'resend'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq } from 'drizzle-orm'
import { paiements, reservations, biens, profiles } from '@/lib/db/schema'
import { uploadToR2 } from '@/lib/r2/client'
import { FacturePDF, FactureData } from '@/lib/pdf/FacturePDF'
import { FactureEmail } from '@/lib/emails/FactureEmail'
import React from 'react'

const resend = new Resend(process.env.RESEND_API_KEY || 're_fake_key_for_dev')
const pgClient = postgres(process.env.DATABASE_URL!)
const db = drizzle(pgClient)

/**
 * Génère la facture PDF, l'upload sur Cloudflare R2, met à jour la base de données,
 * et envoie l'email au client.
 * @param paiementId L'ID du paiement qui vient d'être validé
 */
export async function genererEtEnvoyerFacture(paiementId: string) {
  try {
    // 1. Récupérer les données de la base de données
    const paiementList = await db.select().from(paiements).where(eq(paiements.id, paiementId))
    if (paiementList.length === 0) throw new Error('Paiement introuvable')
    const paiement = paiementList[0]

    const reservationList = await db.select().from(reservations).where(eq(reservations.id, paiement.reservationId))
    if (reservationList.length === 0) throw new Error('Réservation introuvable')
    const reservation = reservationList[0]

    const bienList = await db.select().from(biens).where(eq(biens.id, reservation.bienId))
    if (bienList.length === 0) throw new Error('Bien introuvable')
    const bien = bienList[0]

    const profileList = await db.select().from(profiles).where(eq(profiles.id, paiement.clientId))
    if (profileList.length === 0) throw new Error('Client introuvable')
    const profile = profileList[0]

    // 2. Générer le numéro de facture (FC-YYYY-XXXX)
    const annee = new Date().getFullYear()
    const uniqueNum = Math.floor(1000 + Math.random() * 9000) // Simple pour l'instant
    const factureNumero = `FC-${annee}-${uniqueNum}`

    // 3. Calculer les montants (TVA 18% CI)
    const montantTTC = Number(paiement.montant)
    const montantHT = Math.round(montantTTC / 1.18)
    const montantTVA = montantTTC - montantHT

    const factureData: FactureData = {
      numero: factureNumero,
      date: new Date().toLocaleDateString('fr-CI'),
      client: {
        nom: profile.fullName || 'Client Anonyme',
        email: profile.email,
        telephone: 'Non renseigné',
      },
      bien: {
        titre: bien.titre,
        type: bien.type,
        localisation: `${bien.quartier || ''}, ${bien.ville}`.replace(/^,\s/, ''),
      },
      montants: {
        ht: montantHT,
        tva: montantTVA,
        ttc: montantTTC,
        dejaPaye: montantTTC, // Acompte
      },
      paiement: {
        mode: paiement.paystackChannel || 'Paystack',
        reference: paiement.paystackReference || 'Inconnue',
      }
    }

    // 4. Générer le PDF (React-PDF)
    // On appelle directement le composant pour qu'il retourne le type <Document> attendu par renderToStream
    const pdfElement = FacturePDF({ data: factureData }) as any
    const pdfStream = await renderToStream(pdfElement)
    
    // Convert Node stream to Buffer
    const chunks: any[] = []
    for await (const chunk of pdfStream) {
      chunks.push(chunk)
    }
    const pdfBuffer = Buffer.concat(chunks)

    // 5. Upload sur Cloudflare R2
    const pdfFileName = `Facture_${factureNumero}.pdf`
    const publicUrl = await uploadToR2(pdfBuffer, pdfFileName, 'application/pdf')

    // 6. Mettre à jour la base de données (paiements)
    await db.update(paiements).set({
      factureNumero: factureNumero,
      factureUrl: publicUrl,
    }).where(eq(paiements.id, paiementId))

    // 7. Envoyer l'email avec la facture en pièce jointe
    const emailHtml = await render(
      React.createElement(FactureEmail, {
        clientNom: profile.fullName || profile.email.split('@')[0],
        factureNumero,
        bienNom: bien.titre,
        montant: montantTTC,
        datePaiement: factureData.date,
        factureUrl: publicUrl,
      })
    )

    await resend.emails.send({
      from: 'ImmOfika <facturation@immofika.ci>',
      to: profile.email,
      subject: `Votre facture N° ${factureNumero} - ImmOfika`,
      html: emailHtml,
      attachments: [
        {
          filename: pdfFileName,
          content: pdfBuffer,
        }
      ]
    })

    console.log(`[Facturation] Facture ${factureNumero} générée et envoyée à ${profile.email}. URL: ${publicUrl}`)
    return { success: true, url: publicUrl, numero: factureNumero }

  } catch (error: any) {
    console.error('[Erreur genererEtEnvoyerFacture]', error)
    return { success: false, error: error.message }
  }
}
