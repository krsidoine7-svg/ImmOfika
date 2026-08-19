import { db } from "@/lib/db/index"
import { biens } from "@/lib/db/schema"
import { desc, isNull, sql } from "drizzle-orm"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusIcon, EditIcon, ImageOffIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { deleteBienAction } from "@/app/actions/adminBiens"
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog"
import { requirePermission } from "@/lib/auth/permissions"

export const metadata = {
  title: "Gestion des Biens - Admin ImmOfika",
}

export default async function AdminBiensPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  await requirePermission('view:biens')

  const ITEMS_PER_PAGE = 10
  const currentPage = Number(searchParams?.page) || 1
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  const [totalRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(biens)
    .where(isNull(biens.deletedAt))
  
  const totalItems = Number(totalRes.count)
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  const allBiens = await db
    .select()
    .from(biens)
    .where(isNull(biens.deletedAt))
    .orderBy(desc(biens.createdAt))
    .limit(ITEMS_PER_PAGE)
    .offset(offset)

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Biens Immobiliers</h1>
          <p className="text-slate-500 text-sm font-medium">Gérez le catalogue des biens disponibles sur la plateforme ImmOfika.</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-500/20" render={<Link href="/admin/biens/nouveau" />}>
          <PlusIcon className="h-4 w-4 mr-2" /> Ajouter un Bien
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50/80 text-slate-400 font-extrabold text-[11px] uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 w-16">Photo</th>
                <th className="px-6 py-3">Titre</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Transaction</th>
                <th className="px-6 py-3">Prix</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allBiens.map((b: any) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3">
                    {b.mainImageUrl ? (
                      <div className="h-10 w-10 relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                        <img src={b.mainImageUrl} alt={b.titre} className="object-cover w-full h-full" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 border border-slate-200">
                        <ImageOffIcon className="h-4 w-4" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{b.titre}</td>
                  <td className="px-6 py-4 capitalize font-medium">{b.type}</td>
                  <td className="px-6 py-4 capitalize">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${b.transaction === 'vente' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
                      {b.transaction}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {new Intl.NumberFormat('fr-CI').format(parseFloat(b.prix || '0'))} FCFA
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl" render={<Link href={`/admin/biens/${b.id}/edit`} />}>
                      <EditIcon className="h-4 w-4 text-slate-600" />
                    </Button>
                    <DeleteConfirmDialog 
                      id={b.id} 
                      titre={b.titre} 
                      deleteAction={deleteBienAction} 
                    />
                  </td>
                </tr>
              ))}
              {allBiens.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                    Aucun bien immobilier enregistré sur cette page.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between bg-slate-50/50">
            <div className="text-xs text-slate-500 font-medium">
              Affichage de {offset + 1} à {Math.min(offset + ITEMS_PER_PAGE, totalItems)} sur {totalItems} biens
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="rounded-xl text-xs font-bold"
                disabled={currentPage <= 1}
                render={<Link href={`/admin/biens?page=${currentPage - 1}`} />}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="rounded-xl text-xs font-bold"
                disabled={currentPage >= totalPages}
                render={<Link href={`/admin/biens?page=${currentPage + 1}`} />}
              >
                Suivant <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
