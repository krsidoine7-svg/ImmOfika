'use server'

import { db } from '@/lib/db/index'
import { rolePermissions } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function toggleRolePermissionAction(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Non autorisé")

  const roleName = formData.get('roleName') as string
  const permissionCode = formData.get('permissionCode') as string
  const action = formData.get('action') as 'grant' | 'revoke'

  if (!roleName || !permissionCode || !action) return

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

  revalidatePath('/admin/roles')
}
