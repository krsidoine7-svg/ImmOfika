'use client'

import * as React from 'react'
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Flag,
  FileCheck2,
  ExternalLink,
  Search,
  Loader2,
  Copy,
  Building2,
  Eye,
} from 'lucide-react'
import {
  traiterSignalementAction,
  validerTitreFoncierAction,
  detecterDoublonsAnnonceAction,
} from '@/app/actions/signalementsActions'
import { TITRES_FONCIERS } from '@/lib/constants/abidjan'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface SignalementItem {
  id: string
  motif: string
  description: string
  statut: string
  decisionCommentaire: string | null
  createdAt: Date
  bien: {
    id: string
    titre: string
    slug: string
    prix: string
    ville: string
    quartier: string | null
    statutModeration: string
    mainImageUrl: string | null
  }
  auteur: {
    id: string
    fullName: string | null
    email: string | null
  } | null
}

interface ModerationMarketplaceProps {
  initialSignalements: SignalementItem[]
}

const MOTIF_LABELS: Record<string, { label: string; color: string }> = {
  demarcheur_arnaque: {
    label: 'Démarcheur pirate / Sans mandat',
    color: 'bg-red-100 text-red-800 border-red-200',
  },
  faux_prix: {
    label: 'Prix trompeur / Démarquage abusif',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  photos_trompeuses: {
    label: 'Photos volées / Non conformes',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  bien_deja_vendu: {
    label: 'Bien déjà vendu / Non disponible',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  autre: {
    label: 'Autre infraction',
    color: 'bg-slate-100 text-slate-800 border-slate-200',
  },
}

export default function ModerationMarketplaceTab({ initialSignalements }: ModerationMarketplaceProps) {
  const [signalementsList, setSignalementsList] = React.useState<SignalementItem[]>(initialSignalements)
  const [subTab, setSubTab] = React.useState<'signalements' | 'titres'>('signalements')
  const [filterStatut, setFilterStatut] = React.useState<'tous' | 'nouveau' | 'traite' | 'rejete'>('nouveau')
  const [search, setSearch] = React.useState('')
  const [loadingId, setLoadingId] = React.useState<string | null>(null)
  const [actionSuccessMsg, setActionSuccessMsg] = React.useState<string | null>(null)

  // Modale action signalement
  const [selectedSig, setSelectedSig] = React.useState<SignalementItem | null>(null)
  const [decision, setDecision] = React.useState<'approuve_retrait' | 'rejeter_signalement'>('approuve_retrait')
  const [commentaire, setCommentaire] = React.useState('')

  // Modale scan doublons
  const [scanResult, setScanResult] = React.useState<{ bienId: string; doublons: any[] } | null>(null)
  const [isScanning, setIsScanning] = React.useState(false)

  // Filtrage
  const filteredSignalements = signalementsList.filter((s) => {
    if (filterStatut !== 'tous' && s.statut !== filterStatut) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      s.bien.titre.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.auteur?.email?.toLowerCase().includes(q) ||
      s.auteur?.fullName?.toLowerCase().includes(q)
    )
  })

  // Traiter un signalement
  const handleConfirmDecision = async () => {
    if (!selectedSig) return
    setLoadingId(selectedSig.id)
    try {
      const res = await traiterSignalementAction({
        signalementId: selectedSig.id,
        decision,
        commentaire: commentaire || (decision === 'approuve_retrait' ? 'Infraction avérée, annonce retirée' : 'Signalement non fondé'),
      })

      if (res.success) {
        setSignalementsList((prev) =>
          prev.map((item) =>
            item.id === selectedSig.id
              ? {
                  ...item,
                  statut: decision === 'approuve_retrait' ? 'traite' : 'rejete',
                  decisionCommentaire: commentaire,
                }
              : item
          )
        )
        setActionSuccessMsg(res.message)
        setSelectedSig(null)
        setCommentaire('')
        setTimeout(() => setActionSuccessMsg(null), 4000)
      } else {
        alert(res.error || 'Erreur lors du traitement')
      }
    } finally {
      setLoadingId(null)
    }
  }

  // Scan de doublons / arnaques pirates
  const handleScanDoublons = async (bienId: string) => {
    setIsScanning(true)
    try {
      const res = await detecterDoublonsAnnonceAction(bienId)
      setScanResult({ bienId, doublons: res.doublons || [] })
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Notifications flash */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* En-tête Navigation sous-onglets */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('signalements')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer',
              subTab === 'signalements'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            <Flag className="w-3.5 h-3.5 text-rose-500" />
            <span>Signalements Abus & Fraude ({signalementsList.length})</span>
          </button>
        </div>

        {/* Filtres de statut & Recherche */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
            {(['tous', 'nouveau', 'traite', 'rejete'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatut(st)}
                className={cn(
                  'px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer',
                  filterStatut === st
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                {st === 'tous' ? 'Tous' : st === 'nouveau' ? 'À traiter' : st}
              </button>
            ))}
          </div>

          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrer bien, auteur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
        </div>
      </div>

      {/* Liste des Signalements */}
      {subTab === 'signalements' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                File de Modération Anti-Fraude
              </h3>
              <p className="text-xs text-slate-500">
                Alertes déposées par les acquéreurs et locataires d&apos;Abidjan. Vérifiez les allégations avant retrait.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {filteredSignalements.length} signalement{filteredSignalements.length > 1 ? 's' : ''}
            </span>
          </div>

          {filteredSignalements.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-80" />
              <p className="font-bold text-slate-700 text-sm">Aucun signalement en attente</p>
              <p className="text-xs text-slate-400">Toutes les alertes de fraude ont été traitées ou classées.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredSignalements.map((s) => {
                const motifCfg = MOTIF_LABELS[s.motif] || MOTIF_LABELS.autre
                return (
                  <div key={s.id} className="p-5 hover:bg-slate-50/50 transition-colors space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={cn('px-2.5 py-1 rounded-full text-[11px] font-extrabold border', motifCfg.color)}>
                          {motifCfg.label}
                        </span>
                        <span
                          className={cn(
                            'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase',
                            s.statut === 'nouveau'
                              ? 'bg-rose-100 text-rose-700'
                              : s.statut === 'traite'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          )}
                        >
                          {s.statut === 'nouveau' ? 'En attente d arbitrage' : s.statut}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Signalé le {new Date(s.createdAt).toLocaleDateString('fr-CI', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Actions rapides */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleScanDoublons(s.bien.id)}
                          disabled={isScanning}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Search className="w-3.5 h-3.5" />
                          <span>Scan doublons</span>
                        </button>
                        <Link
                          href={`/biens/${s.bien.slug}`}
                          target="_blank"
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:border-slate-300 text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Voir bien</span>
                        </Link>
                        {s.statut === 'nouveau' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSig(s)
                              setDecision('approuve_retrait')
                              setCommentaire('')
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-all cursor-pointer"
                          >
                            Arbitrer
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Contenu du signalement & Annonce ciblée */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                      {/* Annonce ciblée */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Annonce ciblée</span>
                        <p className="font-extrabold text-xs text-slate-900 line-clamp-1">{s.bien.titre}</p>
                        <p className="text-[11px] text-emerald-700 font-extrabold">
                          {new Intl.NumberFormat('fr-CI').format(Number(s.bien.prix))} FCFA — {s.bien.ville}
                          {s.bien.quartier ? `, ${s.bien.quartier}` : ''}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Statut catalogue : <strong className="capitalize">{s.bien.statutModeration}</strong>
                        </p>
                      </div>

                      {/* Témoignage / Motif */}
                      <div className="md:col-span-2 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Description de l infraction par l utilisateur
                        </span>
                        <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-100">
                          &laquo; {s.description} &raquo;
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Auteur : {s.auteur?.fullName || 'Utilisateur ImmOfika'} ({s.auteur?.email || 'Non renseigné'})
                        </p>
                        {s.decisionCommentaire && (
                          <p className="text-[11px] font-bold text-slate-800 pt-1">
                            Décision modérateur : <span className="font-normal">{s.decisionCommentaire}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal d'arbitrage de signalement */}
      {selectedSig && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">Arbitrage de modération</h3>
                <p className="text-xs text-slate-500">Décision administrative sur l&apos;annonce {selectedSig.bien.titre}</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Choisir la sentence</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDecision('approuve_retrait')}
                  className={cn(
                    'p-3.5 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer',
                    decision === 'approuve_retrait'
                      ? 'border-rose-500 bg-rose-50/50 text-rose-900 ring-2 ring-rose-500/30'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <XCircle className="w-4 h-4 text-rose-600 mb-1" />
                  <span className="block font-black">Valider le retrait</span>
                  <span className="text-[10px] font-normal text-slate-500">Dépublie le bien et pénalise le vendeur</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('rejeter_signalement')}
                  className={cn(
                    'p-3.5 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer',
                    decision === 'rejeter_signalement'
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="block font-black">Classer sans suite</span>
                  <span className="text-[10px] font-normal text-slate-500">Maintient l&apos;annonce en ligne</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motif motivé / Justification administrative *
                </label>
                <textarea
                  rows={3}
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Ex : Faux mandat vérifié auprès du propriétaire légal / Prix non conforme aux mercuriales..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSig(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDecision}
                disabled={Boolean(loadingId) || !commentaire.trim()}
                className={cn(
                  'flex-1 py-3 rounded-xl text-white font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2',
                  decision === 'approuve_retrait'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25',
                  (!commentaire.trim() || Boolean(loadingId)) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {loadingId ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Confirmer l&apos;arbitrage</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal scan de doublons / démarquage pirate */}
      {scanResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-600" />
                Résultat de l&apos;Analyse Anti-Fraude & Doublons
              </h3>
              <button
                type="button"
                onClick={() => setScanResult(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Fermer
              </button>
            </div>

            {scanResult.doublons.length === 0 ? (
              <div className="p-6 text-center bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-extrabold text-emerald-900 text-xs">Aucun clone ni démarquage pirate détecté</p>
                <p className="text-[11px] text-emerald-700">Aucune autre annonce ne présente d&apos;écart suspect de prix ou de titre identique dans ce périmètre.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-rose-700 font-extrabold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  ⚠️ {scanResult.doublons.length} annonce(s) concurrente(s) suspecte(s) détectée(s) (écart de prix &gt; 25% ou titre clone).
                </p>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {scanResult.doublons.map((d: any) => (
                    <div key={d.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <p className="font-bold text-slate-900">{d.titre}</p>
                      <p className="text-emerald-700 font-extrabold">
                        {new Intl.NumberFormat('fr-CI').format(Number(d.prix))} FCFA — {d.ville}
                      </p>
                      <Link
                        href={`/biens/${d.slug}`}
                        target="_blank"
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-bold pt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Inspecter l&apos;annonce clone</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setScanResult(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

