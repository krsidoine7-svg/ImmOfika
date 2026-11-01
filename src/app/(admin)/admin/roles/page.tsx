import { db } from "@/lib/db/index"
import { roles, permissions, rolePermissions, auditLogs, profiles, userRoles } from "@/lib/db/schema"
import { requireAdminAccess, getCurrentUserContext } from "@/lib/auth/permissions"
import { RolesManagementMatrix } from "@/components/admin/RolesManagementMatrix"
import { asc, desc, or, like } from "drizzle-orm"

export const metadata = {
  title: "Gestion des Rôles & Permissions - Admin ImmOfika",
}

export default async function AdminRolesPage() {
  await requireAdminAccess()
  const currentUser = await getCurrentUserContext()

  // 1. Récupérer les rôles classés par niveau hiérarchique croissant (1 à 8)
  const allRoles = await db
    .select({
      name: roles.name,
      label: roles.label,
      hierarchyLevel: roles.hierarchyLevel,
      isSystem: roles.isSystem,
      isLocked: roles.isLocked,
      description: roles.description,
    })
    .from(roles)
    .orderBy(asc(roles.hierarchyLevel))

  // 2. Récupérer toutes les permissions
  const allPermissions = await db
    .select({
      code: permissions.code,
      label: permissions.label,
      resource: permissions.resource,
      action: permissions.action,
      scope: permissions.scope,
      isSensitive: permissions.isSensitive,
      description: permissions.description,
    })
    .from(permissions)
    .orderBy(asc(permissions.code))

  // 3. Récupérer les assignations actives de rôle -> permission
  const allRolePerms = await db
    .select({
      roleName: rolePermissions.roleName,
      permissionCode: rolePermissions.permissionCode,
    })
    .from(rolePermissions)

  // 4. Récupérer le journal d'audit récent lié aux rôles et permissions
  const recentAudit = await db
    .select({
      id: auditLogs.id,
      userId: auditLogs.userId,
      userEmail: auditLogs.userEmail,
      userRole: auditLogs.userRole,
      action: auditLogs.action,
      entity: auditLogs.entity,
      entityId: auditLogs.entityId,
      details: auditLogs.details,
      ipAddress: auditLogs.ipAddress,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .where(
      or(
        like(auditLogs.action, 'permission.%'),
        like(auditLogs.action, 'role.%'),
        like(auditLogs.action, 'access.%')
      )
    )
    .orderBy(desc(auditLogs.createdAt))
    .limit(50)

  // 5. Récupérer les utilisateurs administratifs et leurs rôles assignés
  const userList = await db
    .select({
      id: profiles.id,
      fullName: profiles.fullName,
      email: profiles.email,
      primaryRole: profiles.role,
      deletedAt: profiles.deletedAt,
    })
    .from(profiles)
    .orderBy(asc(profiles.email))
    .limit(100)

  const rawAssignedRoles = await db
    .select({
      userId: userRoles.userId,
      roleName: userRoles.roleName,
      assignedBy: userRoles.assignedBy,
      assignedAt: userRoles.assignedAt,
      expiresAt: userRoles.expiresAt,
    })
    .from(userRoles)

  // Agréger les rôles par utilisateur
  const userRoleMap: Record<string, Array<{ roleName: string; expiresAt: Date | null }>> = {}
  for (const ar of rawAssignedRoles) {
    if (!userRoleMap[ar.userId]) userRoleMap[ar.userId] = []
    userRoleMap[ar.userId].push({
      roleName: ar.roleName,
      expiresAt: ar.expiresAt,
    })
  }

  const enrichedUsers = userList.map(u => ({
    id: u.id,
    fullName: u.fullName || 'Utilisateur',
    email: u.email || 'Sans email',
    primaryRole: u.primaryRole,
    isSuspended: Boolean(u.deletedAt),
    assignedRoles: userRoleMap[u.id] || (u.primaryRole ? [{ roleName: u.primaryRole, expiresAt: null }] : []),
  }))

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Matrice des Rôles & Permissions (RBAC)
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Contrôle d&apos;accès basé sur les rôles avec principe de moindre privilège, garde-fous stricts et audit immuable.
        </p>
      </div>

      <RolesManagementMatrix
        rolesList={allRoles}
        permissionsList={allPermissions}
        activeAssignments={allRolePerms}
        currentUserHierarchy={currentUser?.hierarchyLevel || 1}
        currentUserRole={currentUser?.role || 'client'}
        currentUserRoles={currentUser?.roles || []}
        currentUserId={currentUser?.id || ''}
        auditLogsList={recentAudit}
        usersList={enrichedUsers}
      />
    </div>
  )
}
