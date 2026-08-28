import { getDashboardKPIsAction, KPIParams } from "@/app/actions/kpis"
import DashboardClient from "@/components/admin/DashboardClient"
import { requireAdminAccess } from "@/lib/auth/permissions"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export const metadata = {
  title: "Tableau de Bord - ImmOfika",
}

export default async function AdminDashboardPage() {
  // Garantir l'accès à l'espace d'administration de base (admin et agent)
  await requireAdminAccess()

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  const initialFilters: KPIParams = {
    period: "ce_mois",
  }

  // Chargement serveur des données initiales du mois en cours
  const initialData = await getDashboardKPIsAction(initialFilters)

  return (
    <div className="py-2 px-1 sm:px-2 lg:px-4">
      <DashboardClient 
        initialData={initialData} 
        initialFilters={initialFilters} 
        userRole={profile?.role} 
      />
    </div>
  )
}
