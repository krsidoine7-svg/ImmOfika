import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function checkAdminAccess() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return false
  }

  // Vérifier le rôle de l'utilisateur et sa suspension
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, deleted_at')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.role || profile.deleted_at) return false

  const role = profile.role as string

  // Tout rôle contenant "admin" ou "agent" donne accès au dashboard de base
  if (role.includes('admin') || role === 'agent') {
    return true
  }

  return false
}

export async function requireAdminAccess() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Vérifier le rôle et la suspension
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, deleted_at')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.role) {
    redirect('/auth/login')
  }

  // Si le compte est suspendu ou supprimé, redirection immédiate
  if (profile.deleted_at || profile.role === 'suspended') {
    redirect('/suspended')
  }

  const role = profile.role as string
  const hasAccess = role.includes('admin') || role === 'agent'

  if (!hasAccess) {
    redirect('/auth/login')
  }
}

export async function requireSuperAdminAccess() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, deleted_at')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.role || profile.deleted_at || profile.role === 'suspended') {
    redirect('/suspended')
  }

  if (profile.role !== 'admin' && profile.role !== 'super_admin' && profile.role !== 'tech_super_admin') {
    redirect('/admin') // Refus d'accès pour les simples admin / managers
  }
}

export async function requireStrictSuperAdminAccess() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, deleted_at')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.role || profile.deleted_at || profile.role === 'suspended') {
    redirect('/suspended')
  }

  if (profile.role !== 'super_admin' && profile.role !== 'tech_super_admin') {
    redirect('/admin')
  }
}

export async function hasPermission(permissionCode: string): Promise<boolean> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.role) return false

  const role = profile.role as string

  // L'admin a accès à tout
  if (role === 'admin' || role === 'super_admin' || role === 'tech_super_admin') return true

  // Charger dynamiquement les modules requis
  const { db } = await import('@/lib/db/index')
  const { rolePermissions } = await import('@/lib/db/schema')
  const { and, eq } = await import('drizzle-orm')

  const perm = await db.select().from(rolePermissions).where(
    and(
      eq(rolePermissions.roleName, role),
      eq(rolePermissions.permissionCode, permissionCode)
    )
  ).limit(1)

  return perm && perm.length > 0
}

export async function requirePermission(permissionCode: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.role) redirect('/client/dashboard')

  const role = profile.role as string

  // L'admin a accès à tout
  if (role === 'admin' || role === 'super_admin') return

  // Vérifier la permission spécifique du rôle
  const { db } = await import('@/lib/db/index')
  const { rolePermissions } = await import('@/lib/db/schema')
  const { and, eq } = await import('drizzle-orm')

  const perm = await db.select().from(rolePermissions).where(
    and(
      eq(rolePermissions.roleName, role),
      eq(rolePermissions.permissionCode, permissionCode)
    )
  ).limit(1)

  if (!perm || perm.length === 0) {
    redirect('/admin') // Redirige vers l'accueil admin si pas autorisé
  }
}
