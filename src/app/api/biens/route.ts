import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const search = searchParams.get('search') ?? ''
  const type = searchParams.get('type') ?? ''
  const transaction = searchParams.get('transaction') ?? ''
  const ville = searchParams.get('ville') ?? ''
  const commune = searchParams.get('commune') ?? ''
  const quartier = searchParams.get('quartier') ?? ''
  const prixMin = searchParams.get('prixMin') ?? ''
  const prixMax = searchParams.get('prixMax') ?? ''
  const statut = searchParams.get('statut') ?? ''
  const surfaceMin = searchParams.get('surfaceMin') ?? ''
  const piecesMin = searchParams.get('piecesMin') ?? ''
  const chambresMin = searchParams.get('chambresMin') ?? ''
  const typeTitrePropriete = searchParams.get('typeTitrePropriete') ?? ''
  const meuble = searchParams.get('meuble')
  const parking = searchParams.get('parking')
  const piscine = searchParams.get('piscine')
  const gardiennage = searchParams.get('gardiennage')
  const sort = searchParams.get('sort') ?? 'recent'
  const page = Number(searchParams.get('page') ?? 1)
  const limit = Number(searchParams.get('limit') ?? 12)

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let query = supabase
    .from('biens')
    .select(
      `
      id, slug, titre, description, prix, type, transaction, statut, ville, quartier,
      surface, pieces, chambres, salles_de_bain, meuble, parking, piscine, gardiennage,
      main_image_url, vues, created_at, latitude, longitude,
      type_titre_propriete, preuve_propriete_url,
      organization:organizations(id, name, slug, type, agrement_numero, logo_url, telephone, whatsapp, verified_at)
      `,
      { count: 'exact' }
    )
    .is('deleted_at', null)
    .or('statut_moderation.eq.valide,statut_moderation.is.null')

  // Filtres
  if (type) query = query.eq('type', type)
  if (transaction) query = query.eq('transaction', transaction)
  if (statut) query = query.eq('statut', statut)
  if (ville) query = query.ilike('ville', `%${ville}%`)
  if (commune) {
    query = query.or(`ville.ilike.%${commune}%,quartier.ilike.%${commune}%`)
  }
  if (quartier) query = query.ilike('quartier', `%${quartier}%`)
  if (prixMin) query = query.gte('prix', Number(prixMin))
  if (prixMax) query = query.lte('prix', Number(prixMax))
  if (surfaceMin) query = query.gte('surface', Number(surfaceMin))
  if (piecesMin) query = query.gte('pieces', Number(piecesMin))
  if (chambresMin) query = query.gte('chambres', Number(chambresMin))

  if (typeTitrePropriete) {
    if (typeTitrePropriete === 'has_titre') {
      query = query.not('type_titre_propriete', 'is', null)
    } else {
      query = query.eq('type_titre_propriete', typeTitrePropriete)
    }
  }

  if (meuble === 'true') query = query.eq('meuble', true)
  if (parking === 'true') query = query.eq('parking', true)
  if (piscine === 'true') query = query.eq('piscine', true)
  if (gardiennage === 'true') query = query.eq('gardiennage', true)

  if (search) {
    query = query.or(
      `titre.ilike.%${search}%,description.ilike.%${search}%,ville.ilike.%${search}%,quartier.ilike.%${search}%`
    )
  }

  // Tri
  if (sort === 'prix_asc') {
    query = query.order('prix', { ascending: true })
  } else if (sort === 'prix_desc') {
    query = query.order('prix', { ascending: false })
  } else if (sort === 'surface_desc') {
    query = query.order('surface', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  // Pagination
  query = query.range((page - 1) * limit, page * limit - 1)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Formater les biens avec les métadonnées annonceur
  const formattedBiens = (data ?? []).map((b: any) => {
    const org = Array.isArray(b.organization) ? b.organization[0] : b.organization
    return {
      ...b,
      advertiser: org
        ? {
            name: org.name,
            type: org.type,
            phone: org.telephone,
            whatsapp: org.whatsapp,
            agrementNumero: org.agrement_numero,
            verified: !!org.verified_at,
            logoUrl: org.logo_url,
          }
        : {
            name: 'Particulier Vérifié',
            type: 'particulier',
            phone: null,
            whatsapp: null,
            agrementNumero: null,
            verified: false,
            logoUrl: null,
          },
    }
  })

  return NextResponse.json({
    biens: formattedBiens,
    total: count ?? 0,
    page,
    limit,
  })
}
