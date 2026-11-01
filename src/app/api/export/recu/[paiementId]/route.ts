import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paiements, reservations, biens, profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { genererRecuPdfBuffer, RecuData } from '@/lib/pdf/genererRecuPdf'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paiementId: string }> }
) {
  try {
    const { paiementId } = await params

    if (!paiementId) {
      return NextResponse.json({ error: 'ID de paiement requis' }, { status: 400 })
    }

    // 0. Vérification d'authentification de l'utilisateur
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié. Veuillez vous connecter pour accéder à ce reçu.' },
        { status: 401 }
      )
    }

    // 1. Récupérer le paiement
    const [paiement] = await db
      .select()
      .from(paiements)
      .where(eq(paiements.id, paiementId))

    if (!paiement) {
      return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })
    }

    // Récupérer le profil de l'utilisateur demandeur
    const [userProfile] = await db
      .select({ role: profiles.role, deletedAt: profiles.deletedAt })
      .from(profiles)
      .where(eq(profiles.id, user.id))

    if (!userProfile || userProfile.deletedAt || userProfile.role === 'suspended') {
      return NextResponse.json({ error: 'Compte inactif ou suspendu' }, { status: 403 })
    }

    const role = userProfile.role as string
    const isStaff = role?.includes('admin') || role === 'agent'
    const isOwner = paiement.clientId === user.id

    // Si ni staff ni payeur direct, vérifier via la réservation associée
    let isReservationClient = false
    if (!isStaff && !isOwner && paiement.reservationId) {
      const [res] = await db
        .select({ clientId: reservations.clientId })
        .from(reservations)
        .where(eq(reservations.id, paiement.reservationId))
      if (res && res.clientId === user.id) {
        isReservationClient = true
      }
    }

    if (!isStaff && !isOwner && !isReservationClient) {
      return NextResponse.json(
        { error: 'Accès interdit. Vous n\'êtes pas autorisé à consulter ce reçu.' },
        { status: 403 }
      )
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
    let clientEmail = client?.email || 'client@immofika.ci'
    let clientPhone = client?.phone || ''

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
