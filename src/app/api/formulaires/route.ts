import { NextRequest, NextResponse } from 'next/server'
import { getFormulairesAdmin, createFormulaire } from '@/lib/db/queries/formulaires'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const forms = await getFormulairesAdmin()
    return NextResponse.json({ success: true, formulaires: forms })
  } catch (error) {
    console.error('[GET /api/formulaires] Error:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    const body = await req.json()
    const { titre, description, slug, champs, notificationsEmail, statut } = body

    if (!titre || !slug || !champs || !Array.isArray(champs)) {
      return NextResponse.json({ success: false, error: 'Données requises manquantes' }, { status: 400 })
    }

    const newForm = await createFormulaire({
      titre,
      description,
      slug,
      champs,
      notificationsEmail,
      statut: statut || 'actif',
      createdBy: user?.id,
    })

    return NextResponse.json({ success: true, formulaire: newForm })
  } catch (error) {
    console.error('[POST /api/formulaires] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur lors de la création' },
      { status: 500 }
    )
  }
}
