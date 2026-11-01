'use server'

import { db } from "@/lib/db/index"
import { profiles, reservations, paiements, favoris } from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"
import { requireAdminAccess, getCurrentUserContext, assertNotModifyingSelf, assertNotLastSuperAdmin, checkRoleCompatibility, invaliderCachePermissions, exiger } from "@/lib/auth/permissions"
import { userRoles, roles } from "@/lib/db/schema"
import { and } from "drizzle-orm"
import { logAuditEvent } from "@/lib/audit/logger"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const ToggleStatusSchema = z.object({
  id: z.string().uuid("ID utilisateur invalide"),
  currentStatus: z.string()
})

const UserImpactSchema = z.object({
  userId: z.string().uuid("ID utilisateur invalide")
})

export async function toggleUserStatusAction(formData: FormData) {
  const actor = await getCurrentUserContext()
  if (!actor) throw new Error('Authentification requise')
  await exiger('utilisateur:desactiver')
  
  const id = formData.get('id') as string
  const currentStatus = formData.get('currentStatus') as string

  assertNotModifyingSelf(actor, id)
  if (currentStatus === 'active') {
    await assertNotLastSuperAdmin(id)
  }

  const parsed = ToggleStatusSchema.safeParse({ id, currentStatus })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  if (parsed.data.currentStatus === 'active') {
    // Suspend user (soft delete)
    await db.update(profiles).set({ deletedAt: new Date() }).where(eq(profiles.id, parsed.data.id))
  } else {
    // Reactivate user
    await db.update(profiles).set({ deletedAt: null }).where(eq(profiles.id, parsed.data.id))
  }

  revalidatePath('/admin/utilisateurs')
}

export async function getUserImpact(userId: string) {
  await requireAdminAccess()

  const parsed = UserImpactSchema.safeParse({ userId })
  if (!parsed.success) {
    return { reservations: 0, paiements: 0, favoris: 0 }
  }

  const [[resCount], [paiCount], [favCount]] = await Promise.all([
    db.select({ count: count() }).from(reservations).where(eq(reservations.clientId, parsed.data.userId)),
    db.select({ count: count() }).from(paiements).where(eq(paiements.clientId, parsed.data.userId)),
    db.select({ count: count() }).from(favoris).where(eq(favoris.clientId, parsed.data.userId)),
  ])

  return {
    reservations: resCount?.count || 0,
    paiements: paiCount?.count || 0,
    favoris: favCount?.count || 0,
  }
}

export async function assignUserRoleAction(formData: FormData) {
  const actor = await getCurrentUserContext()
  if (!actor) throw new Error('Authentification requise')
  await exiger('role:attribuer')

  const targetUserId = formData.get('userId') as string
  const newRoleName = formData.get('roleName') as string
  const expiresAtStr = formData.get('expiresAt') as string | null

  if (!targetUserId || !newRoleName) {
    throw new Error('Paramètres manquants')
  }

  // Garde-fou : interdiction de modifier ses propres rôles
  assertNotModifyingSelf(actor, targetUserId)

  // Garde-fou hiérarchie : l'acteur ne peut attribuer qu'un rôle de niveau inférieur
  const targetRoleRecord = await db
    .select({ level: roles.hierarchyLevel, isLocked: roles.isLocked })
    .from(roles)
    .where(eq(roles.name, newRoleName))
    .limit(1)

  if (!targetRoleRecord || targetRoleRecord.length === 0) {
    throw new Error('Rôle inexistant')
  }

  if (targetRoleRecord[0].level >= actor.hierarchyLevel && actor.hierarchyLevel < 7) {
    throw new Error('Vous ne pouvez attribuer qu\'un rôle de niveau strictement inférieur au vôtre.')
  }

  // Récupérer les rôles actuels de l'utilisateur cible
  const currentRoles = await db
    .select({ roleName: userRoles.roleName })
    .from(userRoles)
    .where(eq(userRoles.userId, targetUserId))

  const existingRoleNames = currentRoles.map(r => r.roleName)

  // Garde-fou multi-rôles (max 2 rôles + incompatibilités)
  checkRoleCompatibility(existingRoleNames, newRoleName)

  const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null

  // Insérer ou mettre à jour le rôle
  await db.insert(userRoles).values({
    userId: targetUserId,
    roleName: newRoleName,
    assignedBy: actor.id,
    expiresAt,
  })

  // Synchroniser profiles.role avec le rôle le plus fort
  await db.update(profiles).set({ role: newRoleName }).where(eq(profiles.id, targetUserId))

  invaliderCachePermissions(targetUserId)

  await logAuditEvent({
    userId: actor.id,
    userEmail: actor.email,
    userRole: actor.role,
    action: 'role.assigned',
    entity: 'user_roles',
    entityId: targetUserId,
    details: { assignedRole: newRoleName, expiresAt },
  })

  revalidatePath('/admin/utilisateurs')
}

export async function revokeUserRoleAction(formData: FormData) {
  const actor = await getCurrentUserContext()
  if (!actor) throw new Error('Authentification requise')
  await exiger('role:attribuer')

  const targetUserId = formData.get('userId') as string
  const roleNameToRevoke = formData.get('roleName') as string

  if (!targetUserId || !roleNameToRevoke) {
    throw new Error('Paramètres manquants')
  }

  // Garde-fou : interdiction d'agir sur son propre compte
  assertNotModifyingSelf(actor, targetUserId)

  // Garde-fou : protection du dernier Super Admin
  if (roleNameToRevoke.toUpperCase() === 'SUPER_ADMIN' || roleNameToRevoke === 'super_admin') {
    await assertNotLastSuperAdmin(targetUserId)
  }

  await db.delete(userRoles).where(
    and(
      eq(userRoles.userId, targetUserId),
      eq(userRoles.roleName, roleNameToRevoke)
    )
  )

  invaliderCachePermissions(targetUserId)

  await logAuditEvent({
    userId: actor.id,
    userEmail: actor.email,
    userRole: actor.role,
    action: 'role.revoked',
    entity: 'user_roles',
    entityId: targetUserId,
    details: { revokedRole: roleNameToRevoke },
  })

  revalidatePath('/admin/utilisateurs')
}
