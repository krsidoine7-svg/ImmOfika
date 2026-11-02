const FALLBACK_SUPABASE_URL = "https://wolkpqgsddudulkhbzef.supabase.co"
const FALLBACK_SUPABASE_KEY = "sb_publishable_x6uNySVa3hjr-eDvR4pnQA_Xl3kzC0R"

/**
 * Résolution résiliente de l'URL Supabase.
 * Empêche les crashs si l'URL configurée dans Vercel manque le protocole 'https://',
 * ou si le domaine Vercel de déploiement a été collé par mégarde à la place du projet Supabase.
 */
export function getSupabaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || typeof url !== 'string' || !url.trim()) {
    return FALLBACK_SUPABASE_URL
  }
  url = url.trim()

  // Détection si le domaine de la plateforme a été configuré par erreur
  if (url.includes('vercel.app') || url.includes('immofika.ci')) {
    return FALLBACK_SUPABASE_URL
  }

  // Correction automatique si le préfixe https:// est manquant
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`
  }

  return url
}

/**
 * Résolution résiliente de la clé publique Supabase (Publishable Key / Anon Key).
 */
export function getSupabaseAnonKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key || typeof key !== 'string' || !key.trim()) {
    return FALLBACK_SUPABASE_KEY
  }
  return key.trim()
}
