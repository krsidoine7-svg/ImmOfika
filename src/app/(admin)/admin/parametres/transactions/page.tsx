import { requireAdminAccess } from "@/lib/auth/permissions"
import { getSystemSettingsAction } from "@/app/actions/settings"
import TransactionsClient from "./TransactionsClient"

export const metadata = {
  title: "Paramètres Transactions - ImmOfika Admin",
}

export default async function TransactionsSettingsPage() {
  await requireAdminAccess()

  const res = await getSystemSettingsAction()
  const initialConfigs = res.success ? (res.configs || {}) : {}

  return (
    <div className="container mx-auto max-w-4xl py-2">
      <div className="mb-8 border-b border-slate-100 pb-5">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Paramètres Transactions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Gérez vos clés Paystack et vos paramètres financiers sur ImmOfika.
        </p>
      </div>
      
      <TransactionsClient initialConfigs={initialConfigs} />
    </div>
  )
}
