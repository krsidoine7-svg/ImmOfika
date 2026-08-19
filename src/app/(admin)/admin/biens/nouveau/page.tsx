import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import { NouveauBienForm } from "@/components/admin/NouveauBienForm"

export const metadata = {
  title: "Nouveau Bien - Admin ImmOfika",
}

export default function NouveauBienPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="rounded-xl" render={<Link href="/admin/biens" />}>
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Ajouter un Bien</h1>
          <p className="text-slate-500 text-sm font-medium">Publiez un nouveau bien immobilier sur la plateforme ImmOfika.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <NouveauBienForm />
      </div>
    </div>
  )
}
