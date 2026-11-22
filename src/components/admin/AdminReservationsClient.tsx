'use client'

import * as React from 'react'
import { CalendarIcon, HomeIcon, UserIcon, Loader2 } from 'lucide-react'
import { CustomSelect } from '@/components/ui/custom-select'
import { toast } from 'sonner'

interface ReservationItem {
  id: string
  statut: string
  createdAt: Date
  bienTitre: string | null
  clientName: string | null
  clientEmail: string | null
}

interface AdminReservationsClientProps {
  reservationsList: ReservationItem[]
  updateStatusAction: (formData: FormData) => Promise<void>
}

const STATUTS: Record<string, { label: string; className: string }> = {
  en_attente: { label: 'En attente', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  confirme: { label: 'Confirmée', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  annule: { label: 'Annulée', className: 'bg-slate-100 text-slate-600 border border-slate-200' },
  expire: { label: 'Expirée', className: 'bg-rose-50 text-rose-700 border border-rose-200' },
}

export function AdminReservationsClient({ reservationsList, updateStatusAction }: AdminReservationsClientProps) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pendingId, setPendingId] = React.useState<string | null>(null)
  const pageSize = 10

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  const filtered = React.useMemo(() => {
    const query = searchTerm.toLowerCase().trim()
    return reservationsList.filter((res) => {
      const matchesSearch =
        !query ||
        res.id.toLowerCase().includes(query) ||
        (res.bienTitre || '').toLowerCase().includes(query) ||
        (res.clientName || '').toLowerCase().includes(query) ||
        (res.clientEmail || '').toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'all' || res.statut === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [reservationsList, searchTerm, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const page = Math.min(currentPage, totalPages)
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)

  async function changerStatut(id: string, statut: string) {
    setPendingId(id)
    try {
      const fd = new FormData()
      fd.set('id', id)
      fd.set('statut', statut)
      await updateStatusAction(fd)
      toast.success(`Réservation passée au statut « ${STATUTS[statut]?.label || statut} ».`)
    } catch (err: any) {
      toast.error(err?.message || 'Impossible de modifier le statut.')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Réservations</h1>
        <p className="text-slate-500 text-sm font-medium">
          L&apos;acompte se règle hors plateforme. Confirmez la réservation une fois l&apos;acompte reçu par l&apos;annonceur :
          le bien passe alors en « Réservé ».
        </p>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par client, email, bien ou réf..."
          className="sm:col-span-2 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: `Tous les statuts (${reservationsList.length})` },
            ...Object.entries(STATUTS).map(([value, s]) => ({ value, label: s.label })),
          ]}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[11px] tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Réf / Date</th>
              <th className="px-6 py-3.5">Bien</th>
              <th className="px-6 py-3.5">Client</th>
              <th className="px-6 py-3.5">Statut</th>
              <th className="px-6 py-3.5 text-right">Changer le statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((res) => {
              const s = STATUTS[res.statut] || { label: res.statut, className: 'bg-slate-100 text-slate-700' }
              return (
                <tr key={res.id} className="hover:bg-slate-50/70">
                  <td className="px-6 py-4">
                    <p className="font-mono text-[11px] font-bold text-slate-400 mb-1">{res.id.substring(0, 8)}</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-900">
                      <CalendarIcon className="h-3.5 w-3.5 text-emerald-600" />
                      {new Date(res.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <HomeIcon className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-slate-900 text-xs max-w-xs truncate">{res.bienTitre || 'Bien inconnu'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-slate-400 shrink-0" />
                      <div>
                        <p className="font-bold text-xs text-slate-900">{res.clientName || 'Client inconnu'}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{res.clientEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${s.className}`}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {pendingId === res.id && <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />}
                      <select
                        aria-label="Changer le statut de la réservation"
                        value={res.statut}
                        disabled={pendingId === res.id}
                        onChange={(e) => changerStatut(res.id, e.target.value)}
                        className="text-xs font-bold border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
                      >
                        {Object.entries(STATUTS).map(([value, st]) => (
                          <option key={value} value={value}>{st.label}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-400 italic">
                  Aucune réservation ne correspond à votre recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
          <span>{filtered.length} réservation(s)</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setCurrentPage(page - 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white disabled:opacity-40"
            >
              ◀ Précédent
            </button>
            <span>Page {page} / {totalPages}</span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setCurrentPage(page + 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white disabled:opacity-40"
            >
              Suivant ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
