import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const search = searchParams.get('search') ?? ''
  const type = searchParams.get('type') ?? ''
  const transaction = searchParams.get('transaction') ?? ''
  const ville = searchParams.get('ville') ?? ''
  const prixMin = searchParams.get('prixMin') ?? ''
  const prixMax = searchParams.get('prixMax') ?? ''
  const statut = searchParams.get('statut') ?? ''
  const quartier = searchParams.get('quartier') ?? ''
  const surfaceMin = searchParams.get('surfaceMin') ?? ''
  const page = Number(searchParams.get('page') ?? 1)
  const limit = Number(searchParams.get('limit') ?? 12)

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let query = supabase
    .from('biens')
    .select(
      'id, slug, titre, prix, type, transaction, statut, ville, quartier, surface, chambres, main_image_url, vues, created_at, latitude, longitude',
      { count: 'exact' }
    )
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (type) query = query.eq('type', type)
  if (transaction) query = query.eq('transaction', transaction)
  if (ville) query = query.ilike('ville', `%${ville}%`)
  if (prixMin) query = query.gte('prix', Number(prixMin))
  if (prixMax) query = query.lte('prix', Number(prixMax))
  if (statut) query = query.eq('statut', statut)
  if (quartier) query = query.ilike('quartier', `%${quartier}%`)
  if (surfaceMin) query = query.gte('surface', Number(surfaceMin))
  if (search) {
    query = query.or(
      `titre.ilike.%${search}%,description.ilike.%${search}%,ville.ilike.%${search}%,quartier.ilike.%${search}%`
    )
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    biens: data ?? [],
    total: count ?? 0,
    page,
    limit,
  })
}
