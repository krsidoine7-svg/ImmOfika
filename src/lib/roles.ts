/**
 * IMMOFIKA - Centralisation des Rôles et Autorisations de Navigation
 * 
 * Définit la cartographie officielle des rôles, leurs pages d'atterrissage
 * par défaut et les sections autorisées, avec validation stricte anti-détournement
 * de redirection (anti-Open Redirect & anti-privilege escalation).
 */

export type PlatformRole =
  | 'client'
  | 'support'
  | 'catalogue'
  | 'moderateur'
  | 'compta'
  | 'proprietaire'
  | 'agence'
  | 'agent'
  | 'promoteur'
  | 'admin'
  | 'super_admin'
  | 'tech_super_admin'
  | 'tech'
  | 'visiteur'
  | 'suspended'

// Normalisation des rôles insensibles à la casse (ex: 'CLIENT' -> 'client')
export function normalizeRole(rawRole?: string | null): PlatformRole {
  if (!rawRole) return 'client'
  const r = rawRole.toLowerCase().trim()
  if (r === 'client') return 'client'
  if (r === 'support') return 'support'
  if (r === 'catalogue' || r === 'moderateur') return 'catalogue'
  if (r === 'compta') return 'compta'
  if (r === 'proprietaire') return 'proprietaire'
  if (r === 'agence') return 'agence'
  if (r === 'agent') return 'agent'
  if (r === 'promoteur') return 'promoteur'
  if (r === 'admin') return 'admin'
  if (r === 'super_admin' || r === 'tech_super_admin' || r === 'tech') return 'tech'
  if (r === 'suspended') return 'suspended'
  return 'client'
}

// 1. Page d'accueil officielle par rôle
export const ROLE_DEFAULT_DASHBOARDS: Record<PlatformRole, string> = {
  client: '/client/dashboard',
  support: '/admin/visites',
  catalogue: '/admin/biens',
  moderateur: '/admin/moderation',
  compta: '/admin/paiements',
  proprietaire: '/dashboard/bailleur',
  agence: '/dashboard/bailleur',
  agent: '/admin/visites',
  promoteur: '/dashboard/bailleur',
  admin: '/admin',
  super_admin: '/admin',
  tech_super_admin: '/admin',
  tech: '/admin',
  visiteur: '/',
  suspended: '/suspended',
}

// 2. Préfixes de sections autorisées par rôle
export const ROLE_ALLOWED_PREFIXES: Record<PlatformRole, string[]> = {
  client: ['/client', '/compte', '/mon-compte', '/biens', '/contact', '/paiement'],
  support: ['/admin/visites', '/admin/dossiers', '/admin/moderation', '/admin/notifications', '/client'],
  catalogue: ['/admin/biens', '/admin/moderation', '/biens'],
  moderateur: ['/admin/biens', '/admin/moderation', '/biens'],
  compta: ['/admin/paiements', '/admin/reservations', '/admin/analytics'],
  proprietaire: ['/dashboard/bailleur', '/biens', '/client'],
  agence: ['/dashboard/bailleur', '/admin/visites', '/admin/agenda', '/biens', '/client'],
  agent: ['/admin/visites', '/admin/agenda', '/admin/biens', '/biens', '/client'],
  promoteur: ['/dashboard/bailleur', '/admin/visites', '/biens', '/client'],
  admin: ['/admin', '/client', '/dashboard', '/biens'],
  super_admin: ['/admin', '/client', '/dashboard', '/biens'],
  tech_super_admin: ['/admin', '/client', '/dashboard', '/biens'],
  tech: ['/admin', '/client', '/dashboard', '/biens'],
  visiteur: ['/', '/biens', '/contact', '/legal', '/auth'],
  suspended: ['/suspended', '/auth/login'],
}

/**
 * Retourne la page d'accueil par défaut selon le rôle
 */
export function getDefaultDashboardForRole(role?: string | null): string {
  const normalized = normalizeRole(role)
  return ROLE_DEFAULT_DASHBOARDS[normalized] || '/client/dashboard'
}

/**
 * Vérifie si un rôle a le droit d'accéder à un chemin URL donné
 */
export function canRoleAccessPath(role: string | null | undefined, pathname: string): boolean {
  const normalized = normalizeRole(role)

  if (normalized === 'suspended') {
    return pathname === '/suspended' || pathname.startsWith('/auth')
  }

  // Rôles administratifs complets (Admin, Tech, Super Admin)
  if (normalized === 'admin' || normalized === 'super_admin' || normalized === 'tech_super_admin' || normalized === 'tech') {
    return true
  }

  // Pages publiques universelles
  if (
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/legal') ||
    pathname.startsWith('/cookies') ||
    pathname.startsWith('/confidentiality') ||
    pathname.startsWith('/privacy')
  ) {
    return true
  }

  const allowedPrefixes = ROLE_ALLOWED_PREFIXES[normalized] || []
  return allowedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'))
}

/**
 * Valide un chemin de redirection pour empêcher l'Open Redirect
 * et s'assurer que l'utilisateur ne sera pas envoyé vers une section interdite à son rôle.
 */
export function getSafeRedirectUrl(
  requestedUrl: string | null | undefined,
  userRole?: string | null
): string {
  const defaultUrl = getDefaultDashboardForRole(userRole)
  if (!requestedUrl) return defaultUrl

  const trimmed = requestedUrl.trim()

  // Protection stricte anti-Open Redirect (doit débuter par un seul '/')
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('/\\') ||
    trimmed.includes('://') ||
    trimmed.includes('\r') ||
    trimmed.includes('\n')
  ) {
    return defaultUrl
  }

  // Vérification de la compatibilité du rôle avec la route ciblée
  const pathname = trimmed.split('?')[0]
  if (!canRoleAccessPath(userRole, pathname)) {
    return defaultUrl
  }

  return trimmed
}

