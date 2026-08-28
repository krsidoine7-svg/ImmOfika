import { NextRequest, NextResponse } from 'next/server'
import { getFormulaireById, saveFormulaireReponse } from '@/lib/db/queries/formulaires'
import { uploadToR2 } from '@/lib/r2/client'
import { envoyerEmailHelper, creerNotificationHelper } from '@/lib/notifications/service'
import { FormulaireNotificationEmail } from '@/lib/emails/FormulaireNotificationEmail'
import { render } from '@react-email/render'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { siteConfig } from '@/config/site'
import { ChampFormulaire } from '@/types/formulaire'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const formulaireId = formData.get('formulaireId') as string
    const reponsesRaw = formData.get('reponses') as string

    if (!formulaireId || !reponsesRaw) {
      return NextResponse.json({ success: false, error: 'Champs requis manquants' }, { status: 400 })
    }

    const formulaire = await getFormulaireById(formulaireId)
    if (!formulaire || formulaire.statut !== 'actif') {
      return NextResponse.json({ success: false, error: 'Formulaire introuvable ou inactif' }, { status: 404 })
    }

    const reponsesParsed: Record<string, unknown> = JSON.parse(reponsesRaw)
    const fichiersObject: Record<string, { url: string; name: string; size: number }> = {}

    // Gérer les fichiers joints dans le FormData
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file_') && value instanceof File) {
        const champId = key.replace('file_', '')
        try {
          const arrayBuffer = await value.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          const fileUrl = await uploadToR2(buffer, value.name, value.type, 'formulaires')

          fichiersObject[champId] = {
            url: fileUrl,
            name: value.name,
            size: value.size,
          }
          reponsesParsed[champId] = fileUrl
        } catch (uploadErr) {
          console.warn('[File Upload Fallback]', uploadErr)
          // Fallback en cas d'absence de R2 bucket configuré localement
          fichiersObject[champId] = {
            url: '#file-uploaded',
            name: value.name,
            size: value.size,
          }
          reponsesParsed[champId] = value.name
        }
      }
    }

    // Récupérer l'adresse IP et le User-Agent
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1'
    const userAgent = req.headers.get('user-agent') || 'inconnu'

    // Enregistrer la réponse en BDD
    const newReponse = await saveFormulaireReponse({
      formulaireId,
      reponses: reponsesParsed,
      fichiers: fichiersObject,
      ipAddress,
      userAgent,
    })

    // Préparer le résumé pour la notification Email
    const champsList = (formulaire.champs || []) as ChampFormulaire[]
    const reponsesSummary = champsList
      .filter((c: ChampFormulaire) => c.type !== 'section')
      .map((champ: ChampFormulaire) => {
        const val = reponsesParsed[champ.id]
        let strVal = '-'
        if (Array.isArray(val)) strVal = val.join(', ')
        else if (val !== undefined && val !== null) strVal = String(val)
        return { label: champ.label, value: strVal }
      })

    const submittedAt = new Date().toLocaleString('fr-FR')
    const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://immofika.ci'}/admin/formulaires/${formulaire.id}/reponses`

    // Render HTML pour l'email
    const emailHtml = await render(
      FormulaireNotificationEmail({
        formulaireTitre: formulaire.titre,
        reponsesSummary,
        formulaireUrl: adminUrl,
        submittedAt,
      })
    )

    // Destinataire : Email spécifié sur le formulaire ou email officiel du site
    const recipientEmail = formulaire.notificationsEmail || siteConfig.company.email

    // Envoi de l'email admin (Fire and forget sans bloquer)
    envoyerEmailHelper(
      recipientEmail,
      `[Formulaire ImmOfika] Nouvelle réponse : ${formulaire.titre}`,
      emailHtml
    ).catch(err => console.error('[Email Notification Error]', err))

    // Créer une notification in-app pour tous les administrateurs
    try {
      const adminProfiles = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(inArray(profiles.role, ['admin', 'super_admin', 'agent']))

      for (const admin of adminProfiles) {
        await creerNotificationHelper(
          admin.id,
          `Formulaire : ${formulaire.titre}`,
          `Une nouvelle réponse a été soumise le ${submittedAt}.`,
          'system',
          `/admin/formulaires/${formulaire.id}/reponses`
        )
      }
    } catch (notifErr) {
      console.warn('[In-app Notification Error]', notifErr)
    }

    return NextResponse.json({ success: true, reponse: newReponse })
  } catch (error) {
    console.error('[POST /api/formulaires/submit] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur serveur lors de la soumission' },
      { status: 500 }
    )
  }
}
