import { requireStrictSuperAdminAccess } from "@/lib/auth/permissions"
import { getSystemSettingsAction } from "@/app/actions/settings"
import SecuriteClient from "./SecuriteClient"

export const metadata = {
  title: "Paramètres Sécurité - ImmOfika Admin",
}

export default async function SecuriteSettingsPage() {
  await requireStrictSuperAdminAccess()

  const res = await getSystemSettingsAction()
  const initialConfigs = res.success ? (res.configs || {}) : {}

  return (
    <div className="container mx-auto max-w-4xl py-2">
      <div className="mb-8 border-b border-slate-100 pb-5">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Paramètres Sécurité
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Gérez la politique de sécurité, les sessions et le mode maintenance ImmOfika.
        </p>
      </div>
      
      <SecuriteClient initialConfigs={initialConfigs} />
    </div>
  )
}
