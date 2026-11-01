'use client'

import * as React from 'react'
import { DownloadIcon, CreditCardIcon, FileSpreadsheetIcon, Sparkles, ShieldCheck, RotateCcw, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CustomSelect } from '@/components/ui/custom-select'
import { certifierPaiementManuelAction, genererFactureAvoirFNEAction } from '@/app/actions/fneActions'

interface PaiementItem {
  id: string
  montant: number | string
  statut: string
  factureNumero: string | null
  factureUrl: string | null
  paystackChannel: string | null
  paidAt: Date | string | null
  clientName: string | null
  clientEmail: string | null
  fneNumero?: string | null
  fneType?: string | null
  fneStatut?: string | null
  fneQrData?: string | null
  fneCertifieLe?: Date | string | null
}

interface AdminPaiementsClientProps {
  paiementsList: PaiementItem[]
}

export function AdminPaiementsClient({ paiementsList }: AdminPaiementsClientProps) {
  // Search, Filter & Pagination state
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(6)
  const [isPending, startTransition] = React.useTransition()
  const [actionMessage, setActionMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Reset page on filter change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, pageSize])

  // Filtering Logic
  const filteredPaiements = React.useMemo(() => {
    return paiementsList.filter((p) => {
      const query = searchTerm.toLowerCase().trim()
      const matchesSearch =
        !query ||
        (p.id && p.id.toLowerCase().includes(query)) ||
        (p.factureNumero && p.factureNumero.toLowerCase().includes(query)) ||
        (p.fneNumero && p.fneNumero.toLowerCase().includes(query)) ||
        (p.clientName && p.clientName.toLowerCase().includes(query)) ||
        (p.clientEmail && p.clientEmail.toLowerCase().includes(query)) ||
        (p.paystackChannel && p.paystackChannel.toLowerCase().includes(query))

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'fne' && Boolean(p.fneNumero)) ||
        p.statut === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [paiementsList, searchTerm, statusFilter])

  // Pagination Calculations
  const totalItems = filteredPaiements.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages)
  const startIndex = (validCurrentPage - 1) * pageSize
  const paginatedPaiements = filteredPaiements.slice(startIndex, startIndex + pageSize)

  // Certification manuelle
  const handleCertifierFNE = (paiementId: string) => {
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('paiementId', paiementId)
        const res = await certifierPaiementManuelAction(formData)
        setActionMessage({
          type: 'success',
          text: `Facture certifiée avec succès par la DGI ! N° FNE : ${res.fneNumero}`,
        })
        setTimeout(() => setActionMessage(null), 4000)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erreur de certification'
        setActionMessage({ type: 'error', text: msg })
        setTimeout(() => setActionMessage(null), 4000)
      }
    })
  }

  // Émission d'un Avoir FNE
  const handleCreerAvoir = (paiementId: string) => {
    const motif = prompt('Veuillez préciser le motif de la facture d\'avoir FNE (ex: Annulation de réservation) :')
    if (!motif) return

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('paiementId', paiementId)
        formData.append('motif', motif)
        const res = await genererFactureAvoirFNEAction(formData)
        setActionMessage({
          type: 'success',
          text: `Avoir FNE émis avec succès sous le N° : ${res.avoirFneNumero}`,
        })
        setTimeout(() => setActionMessage(null), 4000)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erreur lors de la génération de l\'avoir'
        setActionMessage({ type: 'error', text: msg })
        setTimeout(() => setActionMessage(null), 4000)
      }
    })
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {actionMessage && (
        <div
          className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold w-fit mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Facturation Normalisée Électronique (FNE) & Encaissements</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Historique des Paiements & FNE</h1>
          <p className="text-slate-500 text-sm font-medium">
            Factures certifiées DGI (Arrêté 0337), QR Codes de contrôle et exports comptables conformes.
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer" render={<a href="/api/export/paiements" target="_blank" rel="noopener noreferrer" />}>
          <FileSpreadsheetIcon className="h-4 w-4 mr-2" /> Exporter en Excel (.xlsx)
        </Button>
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
              placeholder="Rechercher par client, e-mail, N° FNE..."
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

          {/* Status Filter */}
          <div>
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: `💳 Tous les statuts (${paiementsList.length})` },
                { value: 'paye', label: '✅ Payé / Confirmé' },
                { value: 'fne', label: '🛡️ Certifié FNE (DGI)' },
                { value: 'rembourse', label: '↩️ Remboursé / Avoir' },
                { value: 'en_attente', label: '⏳ En attente de règlement' },
              ]}
            />
          </div>
        </div>

        {/* Counter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
          <span>
            Résultats : <strong>{totalItems}</strong> paiement(s) trouvé(s)
          </span>
          <span className="text-[11px] text-emerald-700 font-extrabold">
            Page {validCurrentPage} sur {totalPages}
          </span>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[650px] scrollbar-thin">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 uppercase text-[11px] tracking-wider sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="px-6 py-3.5 bg-slate-50">Date</th>
                <th className="px-6 py-3.5 bg-slate-50">Client Acquéreur</th>
                <th className="px-6 py-3.5 bg-slate-50">Montant</th>
                <th className="px-6 py-3.5 bg-slate-50">Certification FNE (DGI)</th>
                <th className="px-6 py-3.5 bg-slate-50">Statut</th>
                <th className="px-6 py-3.5 text-right bg-slate-50">Actions & Facture</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPaiements.map((p) => {
                const isAvoir = p.fneType === 'AVOIR'
                const isCertified = Boolean(p.fneNumero)

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-xs text-slate-900">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString('fr-FR') : 'En attente'}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-xs text-slate-900">{p.clientName || 'Client Inconnu'}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{p.clientEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">
                      {Number(p.montant).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="px-6 py-4">
                      {isCertified ? (
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              isAvoir
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            <ShieldCheck className="h-3 w-3" />
                            {isAvoir ? 'Avoir FNE' : 'FNE Certifiée'}
                          </span>
                          <p className="text-[10px] font-mono font-bold text-slate-700">{p.fneNumero}</p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Non certifiée</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          p.statut === 'paye'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : p.statut === 'rembourse'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {p.statut === 'paye' ? '✅ Payé' : p.statut === 'rembourse' ? '↩️ Remboursé' : p.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Téléchargement de la facture PDF */}
                        {p.factureUrl ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl cursor-pointer"
                            render={
                              <a
                                href={p.factureUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              />
                            }
                          >
                            <DownloadIcon className="h-3.5 w-3.5 mr-1" /> FNE PDF
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-xl cursor-pointer"
                            render={
                              <a
                                href={`/api/export/recu/${p.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              />
                            }
                          >
                            <DownloadIcon className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Reçu PDF
                          </Button>
                        )}

                        {/* Certification FNE si manquante */}
                        {!isCertified && p.statut === 'paye' && (
                          <Button
                            size="sm"
                            disabled={isPending}
                            onClick={() => handleCertifierFNE(p.id)}
                            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                          >
                            <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Certifier
                          </Button>
                        )}

                        {/* Émission d'un Avoir FNE pour les règlements payés */}
                        {p.statut === 'paye' && isCertified && !isAvoir && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => handleCreerAvoir(p.id)}
                            title="Générer une facture d'avoir FNE conforme (Art. 5)"
                            className="text-xs border-slate-200 text-slate-600 hover:text-purple-700 hover:bg-purple-50 font-bold rounded-xl"
                          >
                            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Avoir
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
