import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paiements, reservations, biens, profiles, leads } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { genererRecuPdfBuffer, RecuData } from '@/lib/pdf/genererRecuPdf'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paiementId: string }> }
) {
  try {
    const { paiementId } = await params

    if (!paiementId) {
      return NextResponse.json({ error: 'ID de paiement requis' }, { status: 400 })
    }

    // 1. Récupérer le paiement
    const [paiement] = await db
      .select()
      .from(paiements)
      .where(eq(paiements.id, paiementId))

    if (!paiement) {
      return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })
    }

    // 2. Récupérer la réservation
    const [reservation] = await db
      .select()
      .from(reservations)
      .where(eq(reservations.id, paiement.reservationId))

    // 3. Récupérer le bien
    let bienTitre = 'Bien Immobilier Favor'
    let bienType = 'Foncier'
    let bienPrix = Number(paiement.montant)
    let bienLocalisation = 'Abidjan, Côte d\'Ivoire'

    if (reservation) {
      const [bien] = await db
        .select()
        .from(biens)
        .where(eq(biens.id, reservation.bienId))
      if (bien) {
        bienTitre = bien.titre
        bienType = bien.type
        bienPrix = Number(bien.prix)
        bienLocalisation = `${bien.quartier || ''}, ${bien.ville}`.replace(/^,\s/, '')
      }
    }

    // 4. Récupérer le profil client & fallback téléphone multi-sources
    const [client] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, paiement.clientId))

    let clientNom = client?.fullName || 'Client Acquéreur'
    let clientEmail = client?.email || 'client@favorcompany.ci'
    let clientPhone = client?.phone || ''

    if (!clientPhone) {
      const [lead] = await db
        .select()
        .from(leads)
        .where(eq(leads.email, clientEmail))
      if (lead && lead.telephone) {
        clientPhone = lead.telephone
      }
    }

    const recuNumero = paiement.recuNumero || `REC-FAVOR-${paiement.id.slice(0, 8).toUpperCase()}`
    const dateEmission = paiement.paidAt
      ? new Date(paiement.paidAt).toLocaleDateString('fr-FR')
      : new Date(paiement.createdAt).toLocaleDateString('fr-FR')

    const montantVerse = Number(paiement.montant)
    const cumulPaye = paiement.cumulPaye ? Number(paiement.cumulPaye) : montantVerse
    const resteAPayer = paiement.resteAPayer ? Number(paiement.resteAPayer) : Math.max(bienPrix - cumulPaye, 0)

    const recuData: RecuData = {
      recuNumero,
      dateEmission,
      client: {
        nom: clientNom,
        email: clientEmail,
        telephone: clientPhone || 'Non renseigné',
      },
      bien: {
        titre: bienTitre,
        type: bienType,
        prixTotal: bienPrix,
        localisation: bienLocalisation,
      },
      paiement: {
        montantVerse,
        cumulPaye,
        resteAPayer,
        typePaiement: paiement.typePaiement || 'acompte',
        modePaiement: paiement.paystackChannel ? paiement.paystackChannel.toUpperCase() : 'ESPÈCES / VIREMENT',
        referenceTransaction: paiement.paystackReference || 'REGLEMENT_AGENCE',
      },
      agrementNumero: reservation?.agrementNumero || '049/MCU/DGUF',
      notaireNom: reservation?.notaireNom || undefined,
    }

    const pdfBuffer = await genererRecuPdfBuffer(recuData)

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Recu_${recuNumero}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('[Export Recu API Error]', error)
    return NextResponse.json({ error: error.message || 'Erreur lors de la génération du reçu' }, { status: 500 })
  }
}
