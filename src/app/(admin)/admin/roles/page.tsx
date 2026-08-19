import { db } from "@/lib/db/index"
import { roles, permissions, rolePermissions } from "@/lib/db/schema"
import { requireStrictSuperAdminAccess } from "@/lib/auth/permissions"
import { RoleCheckbox } from "./RoleCheckbox"
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const metadata = {
  title: "Gestion des Rôles et Permissions - Admin ImmOfika",
}

export default async function AdminRolesPage() {
  await requireStrictSuperAdminAccess()

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  
  let currentUserRole = 'client'
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile) {
      currentUserRole = profile.role
    }
  }

  const allRoles = await db.select().from(roles)
  const allPermissions = await db.select().from(permissions)
  const allRolePerms = await db.select().from(rolePermissions)

  const visibleRoles = currentUserRole === 'admin'
    ? allRoles.filter(r => r.name !== 'super_admin' && r.name !== 'tech_super_admin')
    : allRoles

  const granted = new Set(allRolePerms.map(rp => `${rp.roleName}-${rp.permissionCode}`))

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Rôles & Permissions</h1>
        <p className="text-slate-500 text-sm font-medium">Gérez les accès et autorisations de chaque rôle à travers la plateforme ImmOfika.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50/80 text-slate-400 font-extrabold text-[11px] uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Permission</th>
                {visibleRoles.map(role => (
                  <th key={role.name} className="px-6 py-4 text-center capitalize">
                    {role.name.replace('_', ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allPermissions.map(perm => (
                <tr key={perm.code} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-extrabold text-slate-900">{perm.code}</p>
                    <p className="text-xs text-slate-500 font-medium">{perm.description}</p>
                  </td>
                  {visibleRoles.map(role => {
                    const isGranted = granted.has(`${role.name}-${perm.code}`)
                    return (
                      <td key={`${role.name}-${perm.code}`} className="px-6 py-4 text-center">
                        <RoleCheckbox 
                          roleName={role.name}
                          permissionCode={perm.code}
                          isGranted={isGranted} 
                          currentUserRole={currentUserRole}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
