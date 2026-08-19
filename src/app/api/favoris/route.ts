import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  const { bienId } = await request.json()
  if (!bienId) {
    return NextResponse.json({ error: 'bienId requis' }, { status: 400 })
  }

  // Vérifier si déjà en favori
  const { data: existing } = await supabase
    .from('favoris')
    .select('id')
    .eq('bien_id', bienId)
    .eq('client_id', user.id)
    .single()

  if (existing) {
    // Supprimer
    await supabase.from('favoris').delete().eq('id', existing.id)
    return NextResponse.json({ favori: false })
  } else {
    // Ajouter
    await supabase.from('favoris').insert({ bien_id: bienId, client_id: user.id })
    return NextResponse.json({ favori: true })
  }
}
