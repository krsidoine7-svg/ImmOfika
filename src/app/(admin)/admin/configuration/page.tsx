import { requirePermission } from "@/lib/auth/permissions"
import { getHomepageConfigsAction } from "@/app/actions/homepage"
import HomepageConfigClient from "@/components/admin/HomepageConfigClient"

export const metadata = {
  title: "Configuration Page d'Accueil - ImmOfika Admin",
}

export default async function AdminConfigPage() {
  await requirePermission("manage:config")

  const res = await getHomepageConfigsAction()
  const initialConfigs: Record<string, any> = res.configs || {}

  return (
    <div className="container mx-auto max-w-7xl py-2">
      <div className="mb-8 border-b border-slate-100 pb-5">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Configuration Page d&apos;Accueil
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Personnalisez les textes, images, témoignages et visuels de la page d&apos;accueil ImmOfika.
        </p>
      </div>
      
      <HomepageConfigClient initialConfigs={initialConfigs} />
    </div>
  )
}
