import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BienFilters {
  type?: string
  transaction?: string
  ville?: string
  prixMin?: number
  prixMax?: number
  surfaceMin?: number
  search?: string
  page?: number
  limit?: number
}

// ─── Helper interne ───────────────────────────────────────────────────────────

async function getClient() {
  const cookieStore = await cookies()
  return createClient(cookieStore)
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Récupère les biens disponibles avec filtres et pagination
 */
export async function getBiensDisponibles(filters: BienFilters = {}) {
  const supabase = await getClient()
  const {
    type,
    transaction,
    ville,
    prixMin,
    prixMax,
    surfaceMin,
    search,
    page = 1,
    limit = 12,
  } = filters

  let query = supabase
    .from('biens')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (type) query = query.eq('type', type)
  if (transaction) query = query.eq('transaction', transaction)
  if (ville) query = query.ilike('ville', `%${ville}%`)
  if (prixMin) query = query.gte('prix', prixMin)
  if (prixMax) query = query.lte('prix', prixMax)
  if (surfaceMin) query = query.gte('surface', surfaceMin)
  if (search) {
    query = query.or(
      `titre.ilike.%${search}%,description.ilike.%${search}%,ville.ilike.%${search}%,quartier.ilike.%${search}%`
    )
  }

  const { data, error, count } = await query

  if (error) {
    console.error('[getBiensDisponibles]', error.message)
    return { biens: [], total: 0 }
  }

  return { biens: data ?? [], total: count ?? 0 }
}

/**
 * Récupère un bien par son slug (avec incrément du compteur de vues)
 */
export async function getBienBySlug(slug: string) {
  const supabase = await getClient()

  const { data: bien, error } = await supabase
    .from('biens')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single()

  if (error || !bien) return null

  // Incrémenter le compteur de vues (fire and forget)
  supabase
    .from('biens')
    .update({ vues: (bien.vues ?? 0) + 1 })
    .eq('id', bien.id)
    .then(() => {})

  return bien
}

/**
 * Récupère les images additionnelles d'un bien
 */
export async function getBienImages(bienId: string) {
  const supabase = await getClient()

  const { data } = await supabase
    .from('bien_images')
    .select('*')
    .eq('bien_id', bienId)
    .order('order', { ascending: true })

  return data ?? []
}

/**
 * Récupère des biens suggérés (même type, même ville, excl. le bien actuel)
 */
export async function getBiensSuggeres(bienId: string, type: string, ville: string, limit = 3) {
  const supabase = await getClient()

  const { data } = await supabase
    .from('biens')
    .select('id, slug, titre, prix, type, transaction, ville, quartier, surface, chambres, main_image_url, statut')
    .neq('id', bienId)
    .eq('type', type)
    .ilike('ville', `%${ville}%`)
    .is('deleted_at', null)
    .limit(limit)

  return data ?? []
}

/**
 * Vérifie si un bien est dans les favoris du client
 */
export async function isBienFavori(bienId: string) {
  const supabase = await getClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('favoris')
    .select('id')
    .eq('bien_id', bienId)
    .eq('client_id', user.id)
    .single()

  return !!data
}

/**
 * Toggle favori (ajouter/supprimer)
 */
export async function toggleFavori(bienId: string): Promise<boolean> {
  const supabase = await getClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: existing } = await supabase
    .from('favoris')
    .select('id')
    .eq('bien_id', bienId)
    .eq('client_id', user.id)
    .single()

  if (existing) {
    await supabase.from('favoris').delete().eq('id', existing.id)
    return false
  } else {
    await supabase.from('favoris').insert({ bien_id: bienId, client_id: user.id })
    return true
  }
}
