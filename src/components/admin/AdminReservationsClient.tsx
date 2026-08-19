'use client'

import * as React from 'react'
import { CalendarIcon, HomeIcon, UserIcon, Send, FileText, Sparkles, Download, Eye } from 'lucide-react'
import { UploadContratModal } from './UploadContratModal'
import { CustomSelect } from '@/components/ui/custom-select'

interface ReservationItem {
  id: string
  statut: string
  createdAt: Date
  bienTitre: string | null
  clientName: string | null
  clientEmail: string | null
  contratStatut?: string | null
  contratRejetRaison?: string | null
  signatureClientUrl?: string | null
  contratScanneUrl?: string | null
}

interface AdminReservationsClientProps {
  reservationsList: ReservationItem[]
  updateStatusAction: (formData: FormData) => Promise<void>
}

export function AdminReservationsClient({
  reservationsList,
  updateStatusAction,
}: AdminReservationsClientProps) {
  const [selectedResForModal, setSelectedResForModal] = React.useState<ReservationItem | null>(null)
  
  // Search, Filter & Pagination state
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(6)

  // Reset to page 1 on search or filter change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, pageSize])

  // Filtering Logic
  const filteredReservations = React.useMemo(() => {
    return reservationsList.filter((res) => {
      // 1. Search Query
      const query = searchTerm.toLowerCase().trim()
      const matchesSearch =
        !query ||
        (res.id && res.id.toLowerCase().includes(query)) ||
        (res.bienTitre && res.bienTitre.toLowerCase().includes(query)) ||
        (res.clientName && res.clientName.toLowerCase().includes(query)) ||
        (res.clientEmail && res.clientEmail.toLowerCase().includes(query))

      // 2. Status Filter
      let matchesStatus = true
      if (statusFilter !== 'all') {
        if (statusFilter === 'acompte_paye') {
          matchesStatus = res.statut === 'acompte_paye' || !res.contratStatut || res.contratStatut === 'non_genere'
        } else {
          matchesStatus = res.contratStatut === statusFilter || res.statut === statusFilter
        }
      }

      return matchesSearch && matchesStatus
    })
  }, [reservationsList, searchTerm, statusFilter])

  // Pagination Calculations
  const totalItems = filteredReservations.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages)
  const startIndex = (validCurrentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedReservations = filteredReservations.slice(startIndex, startIndex + pageSize)

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold w-fit mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Promoteur Immobilier Agréé — Gestion Administrative</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Réservations & Contrats</h1>
          <p className="text-slate-500 text-sm font-medium">Filtrez, recherchez et gérez les dossiers de réservation et signatures clients.</p>
        </div>
      </div>

      {/* BARRE DE RECHERCHE, FILTRES & TAILLE DE PAGE */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par client, email, bien ou Réf..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div>
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: `Tous les Statuts (${reservationsList.length})` },
                { value: 'acompte_paye', label: 'Acompte Payé / À traiter' },
                { value: 'transmis_client', label: 'Contrat Transmis au Client' },
                { value: 'signe_client', label: 'Contrat Signé (À Vérifier)' },
                { value: 'valide_agent', label: 'Contrat Validé (OK)' },
                { value: 'rejete_agent', label: 'Contrat Rejeté' },
              ]}
            />
          </div>
        </div>

        {/* Counter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
          <span>
            Résultats : <strong>{totalItems}</strong> dossier(s) trouvé(s)
            {searchTerm && ` pour "${searchTerm}"`}
          </span>
          <span className="text-[11px] text-emerald-700 font-extrabold">
            Page {validCurrentPage} sur {totalPages}
          </span>
        </div>
      </div>

      {/* TABLE CONTAINER WITH SCROLLABLE VIEWPORT */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[650px] scrollbar-thin">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 uppercase text-[11px] tracking-wider sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="px-6 py-3.5 bg-slate-50">Réf / Date</th>
                <th className="px-6 py-3.5 bg-slate-50">Bien Immobilier</th>
                <th className="px-6 py-3.5 bg-slate-50">Client Acquéreur</th>
                <th className="px-6 py-3.5 bg-slate-50">Statut Contrat</th>
                <th className="px-6 py-3.5 text-right bg-slate-50">Actions Contrat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedReservations.map(res => (
                <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-mono text-[11px] font-bold text-slate-400 mb-1">{res.id.substring(0, 8)}</p>
                    <div className="flex items-center gap-1.5 font-medium text-slate-900 text-xs">
                      <CalendarIcon className="h-3.5 w-3.5 text-emerald-600" />
                      {new Date(res.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <HomeIcon className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-slate-900 text-xs max-w-xs truncate">{res.bienTitre || 'Bien Inconnu'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-slate-400 shrink-0" />
                      <div>
                        <p className="font-bold text-xs text-slate-900">{res.clientName || 'Client Inconnu'}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{res.clientEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider block w-fit
                        ${(!res.contratStatut || res.contratStatut === 'non_genere') ? 'bg-slate-100 text-slate-700 border border-slate-200' : ''}
                        ${res.contratStatut === 'en_attente_generation' ? 'bg-amber-50 text-amber-700 border border-amber-200' : ''}
                        ${res.contratStatut === 'genere' ? 'bg-blue-50 text-blue-700 border border-blue-200' : ''}
                        ${res.contratStatut === 'transmis_client' ? 'bg-purple-50 text-purple-700 border border-purple-200' : ''}
                        ${res.contratStatut === 'signe_client' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse' : ''}
                        ${res.contratStatut === 'valide_agent' ? 'bg-emerald-600 text-white font-black' : ''}
                        ${res.contratStatut === 'rejete_agent' ? 'bg-rose-50 text-rose-700 border border-rose-200' : ''}
                      `}>
                        {res.contratStatut ? res.contratStatut.replace('_', ' ') : res.statut.replace('_', ' ')}
                      </span>
                      {res.contratRejetRaison && (
                        <p className="text-[10px] text-rose-600 font-medium italic">Rejet : {res.contratRejetRaison}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      {/* Bouton unique d'action en forme d'œil pour ouvrir la modale globale */}
                      {res.statut !== 'en_attente' ? (
                        <button
                          type="button"
                          onClick={() => setSelectedResForModal(res)}
                          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                          title="Ouvrir la modale globale d'édition, reçus, contrat PDF et signature"
                        >
                          <Eye className="w-4 h-4 text-white" />
                          <span>Détails & Gestion Dossier</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic font-medium">
                          En attente de paiement
                        </span>
                      )}

                    </div>
                  </td>
                </tr>
              ))}
              {paginatedReservations.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 font-medium italic">
                    Aucun dossier de réservation ne correspond à votre recherche ou filtre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* CONTROLES DE PAGINATION BAS DE TABLEAU */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-600">
          <div>
            Affichage de <strong className="text-slate-900">{totalItems > 0 ? startIndex + 1 : 0}</strong> à{' '}
            <strong className="text-slate-900">{endIndex}</strong> sur <strong className="text-slate-900">{totalItems}</strong> dossiers
          </div>

          {/* Page Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              ◀ Précédent
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-xl font-extrabold transition-all cursor-pointer ${
                  validCurrentPage === page
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-700'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              Suivant ▶
            </button>
          </div>
        </div>
      </div>

      {/* Modal d'Édition et Envoi du Contrat */}
      {selectedResForModal && (
        <UploadContratModal
          isOpen={!!selectedResForModal}
          onClose={() => setSelectedResForModal(null)}
          reservation={{
            id: selectedResForModal.id,
            bienTitre: selectedResForModal.bienTitre || 'Bien immobilier',
            clientName: selectedResForModal.clientName || 'Client',
            clientEmail: selectedResForModal.clientEmail || '',
            contratScanneUrl: selectedResForModal.contratScanneUrl,
            contratStatut: selectedResForModal.contratStatut,
            statut: selectedResForModal.statut,
          }}
        />
      )}

    </div>
  )
}
