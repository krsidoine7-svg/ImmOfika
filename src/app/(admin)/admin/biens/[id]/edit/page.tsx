import { db } from "@/lib/db/index"
import { biens } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { EditBienForm } from "@/components/admin/EditBienForm"

export const metadata = {
  title: "Modifier un Bien - Admin ImmOfika",
}

export default async function EditBienPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [bien] = await db.select().from(biens).where(eq(biens.id, id))

  if (!bien) notFound()

  const bienData = {
    ...bien,
    transaction: bien.transaction as "vente" | "location",
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="rounded-xl" render={<Link href="/admin/biens" />}>
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Modifier le Bien</h1>
          <p className="text-slate-500 text-sm font-medium">Modifiez les informations de ce bien immobilier sur ImmOfika.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <EditBienForm bien={bienData} />
      </div>
    </div>
  )
}
