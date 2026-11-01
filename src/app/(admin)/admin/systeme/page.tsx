import { requireAdminAccess } from "@/lib/auth/permissions"
import { getSupabaseHealthAction } from "@/app/actions/keepalive"
import SupabaseHealthClient from "@/components/admin/SupabaseHealthClient"
import { Activity } from "lucide-react"

export const metadata = {
  title: "Santé Supabase & Keep-Alive | Admin ImmOfika",
  description: "Surveillance et maintien actif automatique de la base de données Supabase anti-mise en veille.",
}

export default async function AdminSystemeHealthPage() {
  await requireAdminAccess()

  const initialData = await getSupabaseHealthAction()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""

  return (
    <div className="space-y-6">
      {/* Fil d'ariane & Titre de section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Administration</span>
            <span>/</span>
            <span className="text-emerald-600">Système & Infrastructure</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-emerald-600" />
            Santé Supabase & Maintien Actif (Keep-Alive)
          </h1>
        </div>
      </div>

      <SupabaseHealthClient initialData={initialData} appUrl={appUrl} />
    </div>
  )
}
