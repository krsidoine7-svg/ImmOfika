'use server'

import { db } from '@/lib/db/index'
import { rolePermissions, userRoles, profiles } from '@/lib/db/schema'
import { and, eq, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import {
  getCurrentUserContext,
  assertCanModifyRole,
  assertCanTouchSensitivePermission,
  assertActorPossessesPermission,
  resetRolePermissionsToDefault,
  invaliderCachePermissions,
  SENSITIVE_PERMISSIONS,
} from '@/lib/auth/permissions'
import { logAuditEvent } from '@/lib/audit/logger'
import { envoyerEmailHelper } from '@/lib/notifications/service'

export async function toggleRolePermissionAction(formData: FormData) {
  const currentUser = await getCurrentUserContext()

  // 1. Authentification obligatoire
  if (!currentUser) {
    throw new Error('Authentification requise')
  }

  // 2. Vérification de rôle : seuls admin et super_admin peuvent modifier des permissions
  if (currentUser.hierarchyLevel < 7) {
    await logAuditEvent({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: 'access.denied',
      details: { attemptedAction: 'role:permissions_gerer', reason: 'Insufficient hierarchy level' },
    })
    throw new Error('Action non autorisée. Privilèges administratifs requis.')
  }

  const roleName = formData.get('roleName') as string
  const permissionCode = formData.get('permissionCode') as string
  const action = formData.get('action') as 'grant' | 'revoke'

  if (!roleName || !permissionCode || !action) {
    throw new Error('Paramètres manquants')
  }

  // 3. Garde-fous hiérarchiques et de sensibilité
  await assertCanModifyRole(currentUser, roleName)
  assertCanTouchSensitivePermission(currentUser, permissionCode)
  if (action === 'grant') {
    await assertActorPossessesPermission(currentUser, permissionCode)
  }

  // 4. Exécution sécurisée
  if (action === 'grant') {
    await db.insert(rolePermissions).values({
      roleName,
      permissionCode,
    }).onConflictDoNothing()
  } else {
    await db.delete(rolePermissions).where(
      and(
        eq(rolePermissions.roleName, roleName),
        eq(rolePermissions.permissionCode, permissionCode)
      )
    )
  }

  // 5. Journalisation d'audit immuable
  await logAuditEvent({
    userId: currentUser.id,
    userEmail: currentUser.email,
    userRole: currentUser.role,
    action: action === 'grant' ? 'permission.grant' : 'permission.revoke',
    details: {
      targetRole: roleName,
      permissionCode,
      action,
      isSensitive: SENSITIVE_PERMISSIONS.includes(permissionCode),
    },
  })

  // 6. Alerte email au SUPER_ADMIN pour toute modification d'un droit sensible 🔒
  if (SENSITIVE_PERMISSIONS.includes(permissionCode)) {
    try {
      const superAdminUsers = await db
        .select({ email: profiles.email })
        .from(profiles)
        .leftJoin(userRoles, eq(userRoles.userId, profiles.id))
        .where(
          and(
            inArray(userRoles.roleName, ['super_admin', 'SUPER_ADMIN', 'tech_super_admin']),
            profiles.email ? eq(profiles.email, profiles.email) : undefined
          )
        )

      const recipientEmails = Array.from(new Set(superAdminUsers.map(u => u.email).filter(Boolean))) as string[]

      for (const email of recipientEmails) {
        await envoyerEmailHelper(
          email,
          `⚠️ [SÉCURITÉ IMMOFIKA] Modification de droit sensible : ${permissionCode}`,
          `<div style="font-family: sans-serif; line-height: 1.6; color: #1e293b;">
            <h2 style="color: #dc2626;">Alerte Sécurité — Modification de droit sensible</h2>
            <p>Une modification de permission sensible a été effectuée sur la plateforme :</p>
            <ul>
              <li><strong>Acteur :</strong> ${currentUser.email || currentUser.id} (Rôle : ${currentUser.role})</li>
              <li><strong>Action :</strong> ${action === 'grant' ? 'ACCORDÉE' : 'RÉVOQUÉE'}</li>
              <li><strong>Permission :</strong> <code>${permissionCode}</code> 🔒</li>
              <li><strong>Rôle cible :</strong> <strong>${roleName}</strong></li>
              <li><strong>Date & Heure :</strong> ${new Date().toISOString()}</li>
            </ul>
            <p style="font-size: 13px; color: #64748b;">Ceci est un message de sécurité automatique généré par le moteur RBAC ImmOfika.</p>
          </div>`
        )
      }
    } catch (emailErr) {
      console.error('[RBAC] Erreur lors de l\'envoi de l\'alerte email Super Admin:', emailErr)
    }
  }

  // Invalidation immédiate du cache en mémoire
  invaliderCachePermissions()
  revalidatePath('/admin/roles')
}

export async function resetRolePermissionsAction(formData: FormData) {
  const currentUser = await getCurrentUserContext()
  if (!currentUser) throw new Error('Authentification requise')
  if (currentUser.hierarchyLevel < 7) throw new Error('Action non autorisée')

  const roleName = formData.get('roleName') as string
  if (!roleName) throw new Error('Nom de rôle manquant')

  await resetRolePermissionsToDefault(currentUser, roleName)
  invaliderCachePermissions()
  revalidatePath('/admin/roles')
}
