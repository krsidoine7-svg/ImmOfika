import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { 
  getAnalyticsDataAction, 
  getAllUsersRolesAction, 
  getRbacConfigurationAction 
} from '@/app/actions/analytics-actions'
import AnalyticsDashboardClient from '@/components/admin/analytics/AnalyticsDashboardClient'

export const metadata = {
  title: 'Audiences & Pixels — ImmOfika',
}

export default async function AudiencesPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin' && profile?.role !== 'tech_super_admin') {
    redirect('/admin')
  }

  const analyticsRes = await getAnalyticsDataAction()
  const usersRes = await getAllUsersRolesAction()
  const rbacRes = await getRbacConfigurationAction()

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      <AnalyticsDashboardClient 
        currentUserRole={profile?.role || 'client'}
        initialAnalytics={analyticsRes.data || null}
        initialUsers={usersRes.users || []}
        initialRbac={
          rbacRes.success ? {
            roles: rbacRes.roles || [],
            permissions: rbacRes.permissions || [],
            rolePermissions: rbacRes.rolePermissions || []
          } : null
        }
        defaultTab="visites"
      />
    </div>
  )
}
