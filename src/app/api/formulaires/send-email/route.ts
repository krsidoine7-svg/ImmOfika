import { NextRequest, NextResponse } from 'next/server'
import { getFormulaireById } from '@/lib/db/queries/formulaires'
import { envoyerEmailHelper } from '@/lib/notifications/service'
import { FormulaireShareEmail } from '@/lib/emails/FormulaireShareEmail'
import { render } from '@react-email/render'
import { siteConfig } from '@/config/site'

export async function POST(req: NextRequest) {
  try {
    const { formulaireId, destinataireEmail, destinataireNom, messagePersonalise } = await req.json()

    if (!formulaireId || !destinataireEmail) {
      return NextResponse.json({ success: false, error: 'Champs requis manquants' }, { status: 400 })
    }

    const formulaire = await getFormulaireById(formulaireId)
    if (!formulaire) {
      return NextResponse.json({ success: false, error: 'Formulaire introuvable' }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://immofika.ci'
    const formulaireUrl = `${baseUrl}/f/${formulaire.slug}`

    const emailHtml = await render(
      FormulaireShareEmail({
        destinataireNom,
        formulaireTitre: formulaire.titre,
        formulaireDescription: formulaire.description || undefined,
        formulaireUrl,
        messagePersonalise,
      })
    )

    const result = await envoyerEmailHelper(
      destinataireEmail,
      `[${siteConfig.company.name}] Formulaire à remplir : ${formulaire.titre}`,
      emailHtml
    )

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de l\'envoi par Resend')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/formulaires/send-email] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur d\'envoi' },
      { status: 500 }
    )
  }
}
