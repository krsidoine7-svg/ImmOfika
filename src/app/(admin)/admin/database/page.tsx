import { getAirtableDataAction } from "@/app/actions/airtableDatabase"
import { DataViewContainer } from "@/components/admin/DataView"
import { Database } from "lucide-react"

export const metadata = {
  title: "Base de Données Visuelle | Admin ImmOfika",
  description: "Vue centralisée avec édition en direct, Kanban, Calendrier, Galerie et Graphiques.",
}

export default async function AdminDatabasePage() {
  const res = await getAirtableDataAction()

  const initialData = res.success && res.data ? res.data : {
    biens: [],
    leads: [],
    reservations: [],
    paiements: [],
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1700px] mx-auto">
      {/* Header Page */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="h-6 w-6 text-emerald-600" />
            Base de Données Visuelle
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Éditez en direct, filtrez et explorez les données ImmOfika sous forme de Tableau, Kanban, Calendrier, Galerie ou Graphiques.
          </p>
        </div>
      </div>

      {/* Conteneur Interactif Base de Données */}
      <DataViewContainer initialData={initialData} />
    </div>
  )
}
