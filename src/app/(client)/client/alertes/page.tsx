'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Plus,
  Trash2,
  ExternalLink,
  MapPin,
  Home,
  DollarSign,
  ShieldCheck,
  CheckCircle,
  Clock,
  Power,
  X,
  Loader2,
} from 'lucide-react'
import {
  getMesAlertesAction,
  creerAlerteAction,
  toggleAlerteAction,
  supprimerAlerteAction,
} from '@/app/actions/clientMarketplaceActions'
import { COMMUNES_ABIDJAN, TYPES_BIENS } from '@/lib/constants/abidjan'
import { cn } from '@/lib/utils'

interface Alerte {
  id: string
  titre: string
  criteres: {
    commune?: string
    type?: string
    transaction?: string
    prixMax?: number
    piecesMin?: number
    typeTitrePropriete?: string
  }
  frequence: 'immediat' | 'quotidien' | 'hebdomadaire'
  is_active: boolean
  last_notified_at?: string | null
  created_at: string
}

export default function AlertesClientPage() {
  const [alertes, setAlertes] = React.useState<Alerte[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showModal, setShowModal] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [actionError, setActionError] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

  // Formulaire nouvelle alerte
  const [form, setForm] = React.useState({
    titre: '',
    commune: '',
    transaction: 'vente' as 'vente' | 'location',
    type: 'villa',
    prixMax: '',
    piecesMin: '',
    acdSeulement: false,
    frequence: 'quotidien' as 'immediat' | 'quotidien' | 'hebdomadaire',
  })

  const loadAlertes = React.useCallback(async () => {
    setLoading(true)
    const res = await getMesAlertesAction()
    if (res.alertes) {
      setAlertes(res.alertes as Alerte[])
    }
    setLoading(false)
  }, [])

  React.useEffect(() => {
    loadAlertes()
  }, [loadAlertes])

  const handleToggle = async (alerte: Alerte) => {
    const newStatus = !alerte.is_active
    setAlertes((prev) =>
      prev.map((a) => (a.id === alerte.id ? { ...a, is_active: newStatus } : a))
    )
    const res = await toggleAlerteAction(alerte.id, newStatus)
    if (res.error) {
      // rollback
      setAlertes((prev) =>
        prev.map((a) => (a.id === alerte.id ? { ...a, is_active: !newStatus } : a))
      )
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette alerte ?')) return
    setAlertes((prev) => prev.filter((a) => a.id !== id))
    await supprimerAlerteAction(id)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setActionError(null)

    const criteres: Record<string, any> = {
      transaction: form.transaction,
      type: form.type,
    }
    if (form.commune) criteres.commune = form.commune
    if (form.prixMax) criteres.prixMax = Number(form.prixMax)
    if (form.piecesMin) criteres.piecesMin = Number(form.piecesMin)
    if (form.acdSeulement) criteres.typeTitrePropriete = 'acd'

    const res = await creerAlerteAction({
      titre: form.titre || `Recherche ${form.type} à ${form.commune || 'Abidjan'}`,
      criteres,
      frequence: form.frequence,
    })

    setSubmitting(false)

    if (res.error) {
      setActionError(res.error)
    } else {
      setShowModal(false)
      setSuccessMsg('Votre alerte immobilière a été créée avec succès.')
      setTimeout(() => setSuccessMsg(null), 4000)
      setForm({
        titre: '',
        commune: '',
        transaction: 'vente',
        type: 'villa',
        prixMax: '',
        piecesMin: '',
        acdSeulement: false,
        frequence: 'quotidien',
      })
      loadAlertes()
    }
  }

  // Générer le lien vers le catalogue pour une alerte
  const buildSearchUrl = (criteres: Alerte['criteres']) => {
    const params = new URLSearchParams()
    if (criteres.transaction) params.set('transaction', criteres.transaction)
    if (criteres.type) params.set('type', criteres.type)
    if (criteres.commune) params.set('commune', criteres.commune)
    if (criteres.prixMax) params.set('prixMax', String(criteres.prixMax))
    if (criteres.piecesMin) params.set('piecesMin', String(criteres.piecesMin))
    if (criteres.typeTitrePropriete) params.set('typeTitrePropriete', criteres.typeTitrePropriete)
    return `/biens?${params.toString()}`
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Veille Immobilière Abidjan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Mes Alertes & Recherches Sauvegardées
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Soyez averti dès qu&apos;une opportunité (villa, terrain ACD, appartement) correspond à vos critères.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-extrabold transition-all shadow-md shadow-emerald-500/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Créer une alerte</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Liste des Alertes */}
      {loading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-6 bg-slate-200 rounded w-2/3" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : alertes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-2xs flex flex-col items-center justify-center">
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <Bell className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 mb-1">Aucune alerte configurée</h3>
          <p className="text-xs text-slate-500 max-w-md mb-6">
            Créez votre première alerte pour être notifié automatiquement des nouveaux biens à Abidjan (Cocody, Marcory, etc.).
          </p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold transition-colors cursor-pointer"
          >
            Créer ma première alerte
          </button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {alertes.map((alerte) => {
            const crit = alerte.criteres
            return (
              <motion.div
                key={alerte.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'bg-white rounded-3xl p-6 border transition-all shadow-2xs flex flex-col justify-between',
                  alerte.is_active ? 'border-slate-200' : 'border-slate-100 opacity-60'
                )}
              >
                <div>
                  {/* Top Bar : Titre + Switch */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                        {alerte.titre}
                      </h3>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        Fréquence : {alerte.frequence}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggle(alerte)}
                      className={cn(
                        'p-2 rounded-xl transition-colors cursor-pointer',
                        alerte.is_active
                          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      )}
                      title={alerte.is_active ? 'Désactiver cette alerte' : 'Activer cette alerte'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Badges de critères */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {crit.commune && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {crit.commune}
                      </span>
                    )}
                    {crit.type && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold capitalize">
                        <Home className="w-3 h-3" />
                        {crit.type}
                      </span>
                    )}
                    {crit.transaction && (
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold capitalize">
                        {crit.transaction}
                      </span>
                    )}
                    {crit.prixMax && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[11px] font-bold">
                        <DollarSign className="w-3 h-3" />
                        Max {Number(crit.prixMax).toLocaleString('fr-CI')} F
                      </span>
                    )}
                    {crit.typeTitrePropriete === 'acd' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-extrabold">
                        <ShieldCheck className="w-3 h-3" />
                        ACD Garanti
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions du bas */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={buildSearchUrl(crit)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    <span>Voir les biens ({crit.commune || 'Abidjan'})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(alerte.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Supprimer cette alerte"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Modal Créer Alerte */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">Nouvelle Alerte Immo</h3>
                    <p className="text-[11px] text-slate-400">Paramétrez vos critères de notification</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {actionError && (
                <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
                  {actionError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Titre */}
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Titre de l&apos;alerte</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Villa avec ACD à Cocody"
                    value={form.titre}
                    onChange={(e) => setForm({ ...form, titre: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Commune & Transaction */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">Commune d&apos;Abidjan</label>
                    <select
                      value={form.commune}
                      onChange={(e) => setForm({ ...form, commune: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none bg-white"
                    >
                      <option value="">Toutes les communes</option>
                      {COMMUNES_ABIDJAN.map((c) => (
                        <option key={c.id} value={c.nom}>
                          {c.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">Transaction</label>
                    <select
                      value={form.transaction}
                      onChange={(e) =>
                        setForm({ ...form, transaction: e.target.value as 'vente' | 'location' })
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none bg-white"
                    >
                      <option value="vente">Achat / Vente</option>
                      <option value="location">Location</option>
                    </select>
                  </div>
                </div>

                {/* Type de bien & Pièces */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">Type de bien</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none bg-white"
                    >
                      {TYPES_BIENS.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">Pièces minimum</label>
                    <input
                      type="number"
                      placeholder="Ex: 3"
                      value={form.piecesMin}
                      onChange={(e) => setForm({ ...form, piecesMin: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* Budget Max */}
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Budget maximal (FCFA)</label>
                  <input
                    type="number"
                    placeholder="Ex: 150000000"
                    value={form.prixMax}
                    onChange={(e) => setForm({ ...form, prixMax: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* ACD checkbox */}
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.acdSeulement}
                    onChange={(e) => setForm({ ...form, acdSeulement: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-emerald-900 block">
                      Titre ACD Garanti exclusivement
                    </span>
                    <span className="text-[10px] text-emerald-700">
                      Recevoir uniquement les annonces à la pleine propriété validée par le Ministère (MCLU).
                    </span>
                  </div>
                </label>

                {/* Fréquence */}
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Fréquence de notification</label>
                  <select
                    value={form.frequence}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        frequence: e.target.value as 'immediat' | 'quotidien' | 'hebdomadaire',
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none bg-white"
                  >
                    <option value="immediat">Instantané (dès parution)</option>
                    <option value="quotidien">Quotidien (digest tous les soirs)</option>
                    <option value="hebdomadaire">Hebdomadaire</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Création...</span>
                      </>
                    ) : (
                      <span>Enregistrer l&apos;alerte</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

