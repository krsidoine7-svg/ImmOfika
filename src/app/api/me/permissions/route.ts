import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { profiles, rolePermissions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // 1. Récupérer le rôle de l'utilisateur depuis son profil
    const profileRecords = await db
      .select({ role: profiles.role })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)

    if (!profileRecords.length) {
      return NextResponse.json([])
    }

    const userRole = profileRecords[0].role

    // 2. Si le rôle est "admin", on pourrait retourner toutes les permissions directement.
    // Mais pour garder la granularité, on va plutôt chercher les permissions liées au rôle dans "role_permissions"
    const permissionsRecords = await db
      .select({ code: rolePermissions.permissionCode })
      .from(rolePermissions)
      .where(eq(rolePermissions.roleName, userRole))

    // 3. Formater la réponse pour coller au hook côté client
    // Le hook attend: [{ code: 'manage:biens', granted: true }]
    const formattedPermissions = permissionsRecords.map(p => ({
      code: p.code,
      granted: true
    }))

    return NextResponse.json(formattedPermissions)

  } catch (error) {
    console.error('Erreur /api/me/permissions:', error)
    return NextResponse.json({ error: 'Erreur Serveur' }, { status: 500 })
  }
}
