import { NextRequest, NextResponse } from 'next/server'
import { getFormulaireById, updateFormulaire, deleteFormulaire } from '@/lib/db/queries/formulaires'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const form = await getFormulaireById(id)
    if (!form) {
      return NextResponse.json({ success: false, error: 'Formulaire introuvable' }, { status: 404 })
    }
    return NextResponse.json({ success: true, formulaire: form })
  } catch (error) {
    console.error('[GET /api/formulaires/[id]] Error:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const updated = await updateFormulaire(id, body)
    return NextResponse.json({ success: true, formulaire: updated })
  } catch (error) {
    console.error('[PUT /api/formulaires/[id]] Error:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteFormulaire(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/formulaires/[id]] Error:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
