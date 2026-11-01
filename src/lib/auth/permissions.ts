import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/lib/db/schema'
import { db } from '@/lib/db/index'
import {
  roles,
  permissions,
  rolePermissions,
  defaultRolePermissions,
  userRoles,
  profiles,
} from '@/lib/db/schema'
import { eq, and, sql, inArray, or, isNull, gt } from 'drizzle-orm'
import { logAuditEvent } from '@/lib/audit/logger'

// ─── 1. Contexte Utilisateur & Types ──────────────────────────────────────────

export interface AuthUserContext {
  id: string
  email?: string | null
  role: UserRole | string          // Rôle principal (profiles.role)
  roles: string[]                  // Liste complète des rôles actifs (user_roles)
  hierarchyLevel: number           // Niveau hiérarchique maximum (1 à 8)
  isSuspended?: boolean
}

export type StandardPermissionCode =
  // Annonces & Catalogue Marketplace
  | 'annonce:voir_publiques'
  | 'annonce:creer:own'
  | 'annonce:modifier:own'
  | 'annonce:supprimer:own'
  | 'annonce:voir_toutes'
  | 'annonce:moderer'
  | 'annonce:supprimer:all'
  | 'annonce:mettre_en_avant'
  | 'mise_en_avant:gerer'
  // Profil, Candidature & Alertes
  | 'profil:voir_modifier:own'
  | 'profil:voir/modifier:own'
  | 'favori:gerer:own'
  | 'recherche_alerte:gerer:own'
  | 'dossier:deposer:own'
  | 'dossier:consulter:mandataire'
  // Organisations (Agences & Promoteurs)
  | 'organisation:gerer_profil:own'
  | 'organisation:inviter_membres:own'
  | 'agence:gerer_membres:own'
  | 'residence:gerer:own'
  // Visites & Réservations
  | 'visite:demander:own'
  | 'visite:gerer:own'
  | 'reservation:creer:own'
  | 'reservation:gerer:all'
  // Signalements, Avis & Support
  | 'signalement:creer'
  | 'signalement:traiter'
  | 'avis:creer:own'
  | 'avis:moderer'
  | 'contact:envoyer'
  | 'ticket:gerer'
  | 'message:voir_demandes:own'
  // Administration & Système (🔒 Sensibles)
  | 'utilisateur:voir'
  | 'utilisateur:desactiver'
  | 'role:attribuer'
  | 'role:permissions_gerer'
  | 'journal:voir'
  | 'facture:voir/exporter'
  | 'rapport:stats_voir'
  | 'paiement:configurer'
  | 'reglages:systeme'
  | 'sauvegarde:gerer'

// Alias legacy pour les actions existantes
export type PermissionAction =
  | StandardPermissionCode
  | 'bien:create'
  | 'bien:edit'
  | 'bien:delete'
  | 'bien:moderate'
  | 'bien:publish_direct'
  | 'reservation:create'
  | 'reservation:view'
  | 'reservation:cancel'
  | 'paiement:initiate'
  | 'visite:create'
  | 'visite:assign'
  | 'visite:manage'
  | 'kyc:validate'
  | 'audit:view'
  | 'users:manage_roles'

export interface ResourceContext {
  ownerId?: string | null
  clientId?: string | null
}

// Permissions sensibles réservées exclusivement au SUPER_ADMIN 🔒
export const SENSITIVE_PERMISSIONS = [
  'paiement:configurer',
  'reglages:systeme',
  'sauvegarde:gerer',
]

// ─── 2. Récupération du Contexte Utilisateur (Multi-Rôles + Hiérarchie) ────────

export async function getCurrentUserContext(): Promise<AuthUserContext | null> {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return null

    // Profil de base
    const userProfile = await db
      .select({
        role: profiles.role,
        email: profiles.email,
        deletedAt: profiles.deletedAt,
      })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)

    if (!userProfile || userProfile.length === 0) return null
    const profile = userProfile[0]

    // Récupération de tous les rôles associés dans user_roles
    const assignedRoles = await db
      .select({ roleName: userRoles.roleName })
      .from(userRoles)
      .where(
        and(
          eq(userRoles.userId, user.id),
          or(isNull(userRoles.expiresAt), gt(userRoles.expiresAt, new Date()))
        )
      )

    const activeRoles = assignedRoles.map(r => r.roleName)
    // S'assurer que le rôle de profiles.role est toujours inclus
    if (profile.role && !activeRoles.includes(profile.role)) {
      activeRoles.push(profile.role)
    }

    // Récupérer le niveau hiérarchique le plus élevé
    let maxHierarchy = 1
    if (activeRoles.length > 0) {
      const roleRecords = await db
        .select({ level: roles.hierarchyLevel })
        .from(roles)
        .where(inArray(roles.name, activeRoles))

      for (const r of roleRecords) {
        if (r.level > maxHierarchy) maxHierarchy = r.level
      }
    }

    // Exception Super Admin
    if (activeRoles.includes('super_admin') || activeRoles.includes('tech_super_admin') || profile.role === 'super_admin') {
      maxHierarchy = 8
    }

    return {
      id: user.id,
      email: profile.email || user.email,
      role: (profile.role as UserRole) || 'client',
      roles: activeRoles,
      hierarchyLevel: maxHierarchy,
      isSuspended: Boolean(profile.deletedAt || profile.role === 'suspended'),
    }
  } catch {
    return null
  }
}

// ─── 3. Moteur RBAC Serveur Dynamique ─────────────────────────────────────────

/**
 * Vérifie si l'utilisateur possède la permission demandée (union des rôles)
 * ET valide le contrôle de propriété stricte pour la portée ':own'.
 */
export async function hasEffectivePermission(
  permissionCode: string,
  resource?: ResourceContext
): Promise<boolean> {
  const user = await getCurrentUserContext()
  if (!user || user.isSuspended) return false

  // 1. SUPER_ADMIN a tous les droits
  if (user.roles.includes('super_admin') || user.roles.includes('tech_super_admin') || user.role === 'super_admin') {
    return true
  }

  // 2. Si la permission est sensible 🔒 et que l'utilisateur n'est pas SUPER_ADMIN => REFUS STRICT
  if (SENSITIVE_PERMISSIONS.includes(permissionCode)) {
    return false
  }

  // 3. Contrôle de propriété si la permission est de portée :own
  if (permissionCode.endsWith(':own')) {
    if (!resource?.ownerId || resource.ownerId !== user.id) {
      return false
    }
  }

  // 4. Recherche dans la table active role_permissions pour l'union des rôles
  const matchingPerm = await db
    .select({ code: rolePermissions.permissionCode })
    .from(rolePermissions)
    .where(
      and(
        inArray(rolePermissions.roleName, user.roles),
        eq(rolePermissions.permissionCode, permissionCode)
      )
    )
    .limit(1)

  return matchingPerm && matchingPerm.length > 0
}

/**
 * Évaluation synchrone en mémoire pour la rétrocompatibilité
 */
export function can(
  user: AuthUserContext | null | undefined,
  action: PermissionAction,
  resource?: ResourceContext
): boolean {
  if (!user || user.isSuspended || user.role === 'suspended') return false

  const role = user.role as UserRole

  // 1. Super Admin
  if (role === 'super_admin' || user.roles?.includes('super_admin') || role === 'tech_super_admin') {
    return true
  }

  // 2. Refus par défaut sur les permissions sensibles pour les non super_admins
  if (SENSITIVE_PERMISSIONS.includes(action)) {
    return false
  }

  // 3. Portée :own
  if (typeof action === 'string' && action.endsWith(':own')) {
    return Boolean(resource?.ownerId && resource.ownerId === user.id)
  }

  // 4. Admin standard
  if (role === 'admin' || user.roles?.includes('admin')) {
    if (action === 'paiement:configurer' || action === 'reglages:systeme' || action === 'sauvegarde:gerer') {
      return false
    }
    return true
  }

  // 5. Agence & Propriétaire
  if (role === 'proprietaire' || role === 'agence' || role === 'promoteur' || user.roles?.includes('proprietaire') || user.roles?.includes('agence')) {
    switch (action) {
      case 'annonce:voir_publiques':
      case 'profil:voir_modifier:own':
      case 'favori:gerer:own':
      case 'contact:envoyer':
      case 'avis:creer:own':
      case 'signalement:creer':
      case 'annonce:creer:own':
      case 'bien:create':
        return true
      case 'annonce:modifier:own':
      case 'annonce:supprimer:own':
      case 'bien:edit':
      case 'bien:delete':
      case 'residence:gerer:own':
      case 'message:voir_demandes:own':
      case 'agence:gerer_membres:own':
        return Boolean(resource?.ownerId && resource.ownerId === user.id)
      default:
        return false
    }
  }

  // 6. Client
  if (role === 'client' || user.roles?.includes('client')) {
    switch (action) {
      case 'annonce:voir_publiques':
      case 'profil:voir_modifier:own':
      case 'favori:gerer:own':
      case 'contact:envoyer':
      case 'avis:creer:own':
      case 'signalement:creer':
      case 'reservation:create':
      case 'paiement:initiate':
      case 'visite:create':
        return true
      default:
        return false
    }
  }

  return false
}

/**
 * Assure qu'une action est permise ou lève une redirection 403 / un événement d'audit
 */
export async function assertCan(
  action: PermissionAction,
  resource?: ResourceContext
): Promise<AuthUserContext> {
  const user = await getCurrentUserContext()
  if (!user) redirect('/auth/login')
  if (user.isSuspended) redirect('/suspended')

  const allowed = can(user, action, resource)
  if (!allowed) {
    try {
      await logAuditEvent({
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        action: 'access.denied',
        details: { attemptedAction: action, resource },
      })
    } catch {
      // Ignorer pour ne pas masquer la redirection
    }
    redirect('/unauthorized')
  }

  return user
}

// ─── 4. Les 12 Garde-fous Serveur ─────────────────────────────────────────────

/**
 * Garde-fou 1, 2, 3 : L'acteur peut-il modifier les permissions du rôle cible ?
 * - Ne peut pas modifier son propre rôle.
 * - Le rôle cible doit avoir un niveau hiérarchique STRICTEMENT inférieur au sien.
 */
export async function assertCanModifyRole(
  actor: AuthUserContext,
  targetRoleName: string
): Promise<void> {
  const normTarget = targetRoleName.toUpperCase()

  // Garde-fou 1 : Rôle SUPER_ADMIN verrouillé
  if (normTarget === 'SUPER_ADMIN' || targetRoleName === 'super_admin' || targetRoleName === 'tech_super_admin') {
    throw new Error('Garde-fou #1 : Le rôle SUPER_ADMIN est strictement verrouillé. Ses permissions ne peuvent pas être modifiées.')
  }

  // Garde-fou 2 : Interdiction de modifier les droits de son propre rôle
  if (actor.roles.map(r => r.toUpperCase()).includes(normTarget)) {
    throw new Error('Garde-fou #2 : Vous ne pouvez pas modifier les permissions de votre propre rôle.')
  }

  const targetRole = await db
    .select({ level: roles.hierarchyLevel, isSystem: roles.isSystem, isLocked: roles.isLocked })
    .from(roles)
    .where(eq(roles.name, targetRoleName))
    .limit(1)

  if (!targetRole || targetRole.length === 0) {
    throw new Error('Rôle introuvable.')
  }

  if (targetRole[0].isLocked) {
    throw new Error('Garde-fou #1 : Ce rôle est verrouillé par le système.')
  }

  // Garde-fou 3 : Rôles de niveau strictement inférieur
  if (targetRole[0].level >= actor.hierarchyLevel && actor.hierarchyLevel < 8) {
    throw new Error('Garde-fou #3 : Vous ne pouvez agir que sur des rôles de niveau STRICTEMENT inférieur au vôtre.')
  }
}

/**
 * Garde-fou 4 & 5 : L'acteur peut-il toucher à une permission sensible 🔒 ?
 */
export function assertCanTouchSensitivePermission(
  actor: AuthUserContext,
  permissionCode: string
): void {
  if (SENSITIVE_PERMISSIONS.includes(permissionCode) && actor.hierarchyLevel < 8) {
    throw new Error('Garde-fou #4 & #5 : Seul un Super Administrateur peut accorder ou révoquer une permission sensible 🔒.')
  }
}

/**
 * Garde-fou 6 : Vérifier qu'on ne supprime ni ne rétrograde le DERNIER super_admin
 */
export async function assertNotLastSuperAdmin(targetUserId: string): Promise<void> {
  const superAdminRoles = ['super_admin', 'SUPER_ADMIN', 'tech_super_admin']

  const superAdminCount = await db
    .select({ count: sql<number>`count(distinct ${userRoles.userId})::int` })
    .from(userRoles)
    .where(inArray(userRoles.roleName, superAdminRoles))

  const currentCount = superAdminCount[0]?.count || 0
  if (currentCount <= 1) {
    const isTargetSuperAdmin = await db
      .select()
      .from(userRoles)
      .where(and(eq(userRoles.userId, targetUserId), inArray(userRoles.roleName, superAdminRoles)))
      .limit(1)

    if (isTargetSuperAdmin.length > 0) {
      throw new Error('Garde-fou #6 : Impossible de supprimer, suspendre ou rétrograder le DERNIER Super Administrateur de la plateforme.')
    }
  }
}

/**
 * Garde-fou 7 : Interdiction de supprimer un rôle système de base
 */
/**
 * Garde-fou #3b : Un ADMIN n'accorde que des permissions qu'il possède lui-même.
 */
export async function assertActorPossessesPermission(
  actor: AuthUserContext,
  permissionCode: string
): Promise<void> {
  const isSuperAdmin = actor.hierarchyLevel >= 8 || actor.roles.includes('super_admin') || actor.roles.includes('SUPER_ADMIN')
  if (isSuperAdmin) return

  const hasPerm = await db
    .select({ code: rolePermissions.permissionCode })
    .from(rolePermissions)
    .where(
      and(
        inArray(rolePermissions.roleName, actor.roles),
        eq(rolePermissions.permissionCode, permissionCode)
      )
    )
    .limit(1)

  if (!hasPerm || hasPerm.length === 0) {
    throw new Error(`Garde-fou : Un Administrateur ne peut accorder que des permissions qu'il possède lui-même. Vous ne possédez pas '${permissionCode}'.`)
  }
}

/**
 * Paires de rôles incompatibles (Ségrégation stricte des tâches)
 */
export const INCOMPATIBLE_ROLE_PAIRS: [string, string][] = [
  ['COMPTA', 'LOGISTIQUE'],
  ['COMPTA', 'CATALOGUE'],
  ['SUPPORT', 'COMPTA'],
  ['ADMIN', 'SUPER_ADMIN'],
  ['compta', 'logistique'],
  ['compta', 'catalogue'],
  ['support', 'compta'],
  ['admin', 'super_admin'],
]

/**
 * Garde-fou Multi-Rôles : Vérifie la compatibilité et le plafond de 2 rôles
 */
export function checkRoleCompatibility(existingRoles: string[], newRole: string): void {
  const normNew = newRole.toUpperCase()
  const normExisting = existingRoles.map(r => r.toUpperCase())

  // Règle 1 : Maximum 2 rôles par utilisateur
  if (normExisting.length >= 2 && !normExisting.includes(normNew)) {
    throw new Error('Garde-fou Multi-Rôles : Un utilisateur ne peut cumuler au maximum que 2 rôles actifs.')
  }

  // Règle 2 : ADMIN et SUPER_ADMIN non cumulables
  if ((normNew === 'SUPER_ADMIN' && normExisting.includes('ADMIN')) || (normNew === 'ADMIN' && normExisting.includes('SUPER_ADMIN'))) {
    throw new Error('Garde-fou Multi-Rôles : Les rôles ADMIN et SUPER_ADMIN sont strictement mutuellement exclusifs.')
  }

  // Règle 3 : Rôles incompatibles
  for (const [r1, r2] of INCOMPATIBLE_ROLE_PAIRS) {
    const normR1 = r1.toUpperCase()
    const normR2 = r2.toUpperCase()

    if (
      (normNew === normR1 && normExisting.includes(normR2)) ||
      (normNew === normR2 && normExisting.includes(normR1))
    ) {
      throw new Error(`Garde-fou Multi-Rôles : Incompatibilité de fonctions. Les rôles '${r1}' et '${r2}' ne peuvent pas être cumulés.`)
    }
  }
}

/**
 * Garde-fou : Interdiction d'agir sur son propre compte
 */
export function assertNotModifyingSelf(actor: AuthUserContext, targetUserId: string): void {
  if (actor.id === targetUserId) {
    throw new Error('Garde-fou : Il est strictement interdit de modifier ses propres rôles ou privilèges.')
  }
}

export async function assertRoleDeletable(roleName: string): Promise<void> {
  const roleRecord = await db
    .select({ isSystem: roles.isSystem })
    .from(roles)
    .where(eq(roles.name, roleName))
    .limit(1)

  if (roleRecord.length > 0 && roleRecord[0].isSystem) {
    throw new Error('Garde-fou #7 : Les rôles système par défaut ne peuvent jamais être supprimés.')
  }
}

/**
 * Réinitialiser les permissions d'un rôle aux valeurs par défaut
 */
export async function resetRolePermissionsToDefault(
  actor: AuthUserContext,
  roleName: string
): Promise<void> {
  await assertCanModifyRole(actor, roleName)

  // 1. Supprimer les permissions actuelles du rôle
  await db.delete(rolePermissions).where(eq(rolePermissions.roleName, roleName))

  // 2. Réinsérer depuis default_role_permissions
  const defaults = await db
    .select({ perm: defaultRolePermissions.permissionCode })
    .from(defaultRolePermissions)
    .where(eq(defaultRolePermissions.roleName, roleName))

  if (defaults.length > 0) {
    await db.insert(rolePermissions).values(
      defaults.map(d => ({
        roleName,
        permissionCode: d.perm,
      }))
    )
  }

  // 3. Log d'audit immuable
  await logAuditEvent({
    userId: actor.id,
    userEmail: actor.email,
    userRole: actor.role,
    action: 'role.permissions_reset',
    details: { targetRole: roleName, countRestored: defaults.length },
  })
}

// ─── 5. Helpers de compatibilité existants ───────────────────────────────────

export async function checkAdminAccess(): Promise<boolean> {
  const user = await getCurrentUserContext()
  if (!user || user.isSuspended) return false
  return user.hierarchyLevel >= 7 || user.role.includes('admin') || user.role === 'agent'
}

export async function requireAdminAccess(): Promise<AuthUserContext> {
  const user = await getCurrentUserContext()
  if (!user) redirect('/auth/login')
  if (user.isSuspended) redirect('/suspended')
  if (user.hierarchyLevel < 7 && !user.role.includes('admin') && user.role !== 'agent') {
    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'access.denied',
      entity: 'navigation',
      details: { attemptedRoute: 'admin_section', hierarchyLevel: user.hierarchyLevel },
    })
    redirect('/unauthorized')
  }
  return user
}

export async function requireSuperAdminAccess(): Promise<AuthUserContext> {
  const user = await getCurrentUserContext()
  if (!user) redirect('/auth/login')
  if (user.isSuspended) redirect('/suspended')
  if (user.hierarchyLevel < 8 && user.role !== 'super_admin' && user.role !== 'tech_super_admin') {
    redirect('/unauthorized')
  }
  return user
}

export async function requireStrictSuperAdminAccess(): Promise<AuthUserContext> {
  return requireSuperAdminAccess()
}

export async function hasPermission(permissionCode: string): Promise<boolean> {
  return hasEffectivePermission(permissionCode)
}

export async function requirePermission(permissionCode: string): Promise<void> {
  const user = await getCurrentUserContext()
  if (!user) redirect('/auth/login')
  if (user.isSuspended) redirect('/suspended')

  const allowed = await hasEffectivePermission(permissionCode)
  if (!allowed) redirect('/unauthorized')
}


// ─── Cache & Invalidation Instantanée des Permissions ─────────────────────────

const permissionsCache = new Map<string, { permissions: Set<string>; expiry: number }>()

/**
 * Invalide immédiatement le cache des permissions (globalement ou pour un utilisateur).
 */
export function invaliderCachePermissions(userId?: string): void {
  if (userId) {
    permissionsCache.delete(userId)
  } else {
    permissionsCache.clear()
  }
}

export type ResourceParam =
  | string
  | { ownerId?: string | null; clientId?: string | null; userId?: string | null }
  | null
  | undefined

/**
 * FONCTION CENTRALE : exiger(permission, ressource?)
 * 
 * Applique le principe du moindre privilège strict :
 * 1. Vérification session active (throw 401 si non connecté)
 * 2. Vérification statut non suspendu (throw 403 si suspendu)
 * 3. Union des permissions de tous les rôles non expirés (avec cache 60s)
 * 4. Contrôle strict de portée own vs all (protection anti-IDOR)
 * 5. Refus par défaut absolu si non accordé
 * 
 * @throws Error avec code 401 ou 403 en cas de refus
 */
export async function exiger(
  permissionCode: string,
  ressource?: ResourceParam
): Promise<AuthUserContext> {
  const user = await getCurrentUserContext()
  if (!user) {
    throw new Error('401: Non authentifié. Veuillez vous connecter.')
  }

  if (user.isSuspended) {
    throw new Error('403: Compte suspendu. Accès refusé.')
  }

  // 1. SUPER_ADMIN a tous les droits
  const isSuperAdmin =
    user.roles.includes('SUPER_ADMIN') ||
    user.roles.includes('super_admin') ||
    user.roles.includes('tech_super_admin') ||
    user.role === 'super_admin'

  if (isSuperAdmin) {
    return user
  }

  // 2. Permissions sensibles 🔒 réservées exclusivement au SUPER_ADMIN
  if (SENSITIVE_PERMISSIONS.includes(permissionCode)) {
    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'access.denied',
      entity: 'permission',
      details: { attemptedPermission: permissionCode, reason: 'Sensible permission denied for non-superadmin' },
    })
    throw new Error(`403: Accès refusé. La permission '${permissionCode}' est strictement réservée au Super Administrateur.`)
  }

  // 3. Récupération des permissions effectives (Union multi-rôles avec cache)
  let effectivePerms: Set<string>
  const cached = permissionsCache.get(user.id)
  const now = Date.now()

  if (cached && now < cached.expiry) {
    effectivePerms = cached.permissions
  } else {
    const rows = await db
      .select({ code: rolePermissions.permissionCode })
      .from(rolePermissions)
      .where(inArray(rolePermissions.roleName, user.roles))

    effectivePerms = new Set(rows.map((r) => r.code))
    permissionsCache.set(user.id, {
      permissions: effectivePerms,
      expiry: now + 60000, // 60 secondes
    })
  }

  // 4. Vérification de portée :own vs :all
  const baseResourceAction = permissionCode.replace(/:own$/, '')
  const hasGlobalAll =
    effectivePerms.has(`${baseResourceAction}:all`) ||
    effectivePerms.has(baseResourceAction)

  if (permissionCode.endsWith(':own')) {
    // Si l'utilisateur n'a pas la permission globale :all, on vérifie la propriété stricte
    if (!hasGlobalAll) {
      if (!effectivePerms.has(permissionCode)) {
        await logAuditEvent({
          userId: user.id,
          userEmail: user.email,
          userRole: user.role,
          action: 'access.denied',
          entity: 'permission',
          details: { attemptedPermission: permissionCode, reason: 'Missing own permission' },
        })
        throw new Error(`403: Accès refusé. Permission manquante : '${permissionCode}'.`)
      }

      // Extraction de l'identifiant propriétaire
      let targetOwnerId: string | null = null
      if (typeof ressource === 'string') {
        targetOwnerId = ressource
      } else if (ressource && typeof ressource === 'object') {
        targetOwnerId = ressource.ownerId || ressource.clientId || ressource.userId || null
      }

      if (!targetOwnerId || targetOwnerId !== user.id) {
        await logAuditEvent({
          userId: user.id,
          userEmail: user.email,
          userRole: user.role,
          action: 'access.denied',
          entity: 'idor_protection',
          details: { attemptedPermission: permissionCode, targetOwnerId, userId: user.id },
        })
        throw new Error(`403: Accès refusé. Vous ne pouvez agir que sur vos propres ressources (:own).`)
      }
    }

    return user
  }

  // 5. Vérification standard pour permission globale (:all ou simple)
  if (!effectivePerms.has(permissionCode)) {
    await logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'access.denied',
      entity: 'permission',
      details: { attemptedPermission: permissionCode },
    })
    throw new Error(`403: Accès refusé. Permission manquante : '${permissionCode}'.`)
  }

  return user
}
