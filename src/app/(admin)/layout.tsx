import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { requireAdminAccess } from "@/lib/auth/permissions"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { NotificationsBell } from "@/components/admin/NotificationsBell"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdminAccess()

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single()

  const adminUser = {
    name: profile?.full_name || 'Admin',
    email: user?.email || '',
    avatar: profile?.avatar_url || '',
    role: profile?.role || 'admin',
  }

  return (
    <SidebarProvider>
      <AppSidebar user={adminUser} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-slate-600 hover:text-slate-900" />
            <div className="font-extrabold text-xs sm:text-sm text-slate-900 hidden xs:block">Espace Administration — ImmOfika</div>
          </div>
          <div className="flex items-center gap-4 px-2">
            <NotificationsBell userId={user?.id} />
          </div>
        </header>
        <main className="flex-1 p-6 bg-slate-50/50 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
