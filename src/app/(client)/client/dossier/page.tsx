'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Upload,
  Lock,
  Building2,
  Briefcase,
  DollarSign,
  Send,
  Loader2,
  FileCheck,
} from 'lucide-react'
import {
  getMonDossierCandidatAction,
  sauvegarderDossierCandidatAction,
  soumettreDossierCandidatAction,
} from '@/app/actions/clientMarketplaceActions'
import { calculerCompletudeDossier } from '@/lib/dossier'
import { cn } from '@/lib/utils'

interface Dossier {
  id: string
  statut: 'brouillon' | 'soumis' | 'valide' | 'rejete'
  type_projet: 'location' | 'achat'
  profession?: string | null
  employeur?: string | null
  revenu_mensuel?: string | number | null
  fichiers?: {
    cniUrl?: string
    bulletinsSalaireUrls?: string[]
    attestationTravailUrl?: string
    quittanceUrl?: string
  }
  notes?: string | null
  created_at: string
  updated_at: string
}

export default function DossierCandidatPage() {
  const [dossier, setDossier] = React.useState<Dossier | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [statusMsg, setStatusMsg] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state
  const [form, setForm] = React.useState({
    typeProjet: 'location' as 'location' | 'achat',
    profession: '',
    employeur: '',
    revenuMensuel: '',
    notes: '',
    cniUrl: '',
    bulletinsUrl: '',
    attestationUrl: '',
    quittanceUrl: '',
  })

  const loadDossier = React.useCallback(async () => {
    setLoading(true)
    const res = await getMonDossierCandidatAction()
    if (res.dossier) {
      const d = res.dossier as Dossier
      setDossier(d)
      setForm({
        typeProjet: d.type_projet || 'location',
        profession: d.profession || '',
        employeur: d.employeur || '',
        revenuMensuel: d.revenu_mensuel ? String(d.revenu_mensuel) : '',
        notes: d.notes || '',
        cniUrl: d.fichiers?.cniUrl || '',
        bulletinsUrl: d.fichiers?.bulletinsSalaireUrls?.[0] || '',
        attestationUrl: d.fichiers?.attestationTravailUrl || '',
        quittanceUrl: d.fichiers?.quittanceUrl || '',
      })
    }
    setLoading(false)
  }, [])

  React.useEffect(() => {
    loadDossier()
  }, [loadDossier])

  const completude = calculerCompletudeDossier(
    {
      cniUrl: form.cniUrl,
      bulletinsSalaireUrls: form.bulletinsUrl ? [form.bulletinsUrl] : [],
      attestationTravailUrl: form.attestationUrl,
      quittanceUrl: form.quittanceUrl,
    },
    form.profession,
    form.revenuMensuel ? Number(form.revenuMensuel) : null
  )

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatusMsg(null)

    const res = await sauvegarderDossierCandidatAction({
      typeProjet: form.typeProjet,
      profession: form.profession,
      employeur: form.employeur,
      revenuMensuel: form.revenuMensuel ? Number(form.revenuMensuel) : null,
      notes: form.notes,
      fichiers: {
        cniUrl: form.cniUrl || undefined,
        bulletinsSalaireUrls: form.bulletinsUrl ? [form.bulletinsUrl] : [],
        attestationTravailUrl: form.attestationUrl || undefined,
        quittanceUrl: form.quittanceUrl || undefined,
      },
    })

    setSaving(false)

    if (res.error) {
      setStatusMsg({ type: 'error', text: res.error })
    } else {
      setStatusMsg({ type: 'success', text: 'Votre dossier a été enregistré avec succès.' })
      if (res.dossier) setDossier(res.dossier as Dossier)
    }
  }

  const handleSoumettre = async () => {
    if (completude < 40) {
      alert(`Dossier incomplet (${completude}%). Veuillez renseigner au moins votre profession, revenu et CNI.`)
      return
    }

    setSubmitting(true)
    setStatusMsg(null)
    const res = await soumettreDossierCandidatAction()
    setSubmitting(false)

    if (res.error) {
      setStatusMsg({ type: 'error', text: res.error })
    } else {
      setStatusMsg({ type: 'success', text: res.message || 'Dossier soumis avec succès !' })
      loadDossier()
    }
  }

  const statutBadge = {
    brouillon: { label: 'Brouillon', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    soumis: { label: 'En attente de certification', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    valide: { label: 'Dossier Certifié Conforme', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejete: { label: 'Pièce manquante / À corriger', color: 'bg-red-50 text-red-700 border-red-200' },
  }[dossier?.statut || 'brouillon']

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('px-3 py-1 rounded-full text-xs font-bold border', statutBadge.color)}>
              {statutBadge.label}
            </span>
            <span className="text-xs text-slate-400 font-semibold">Projet : {form.typeProjet === 'location' ? 'Location' : 'Acquisition'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Mon Dossier Candidat Numérique
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Transmettez en un clic votre solvabilité aux propriétaires et agences d&apos;Abidjan pour accélérer l&apos;obtention de votre bien.
          </p>
        </div>

        {/* Jauge de Complétude */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 min-w-[200px] text-center shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Complétude du Dossier
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 mb-2">
            {completude}%
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completude}%` }}
            />
          </div>
        </div>
      </div>

      {statusMsg && (
        <div
          className={cn(
            'p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border',
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          )}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Formulaire Dossier */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1 : Situation Professionnelle */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                1. Situation Professionnelle & Revenus
              </h2>
              <p className="text-[11px] text-slate-400">Évaluation de votre solvabilité mensuelle</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Type Projet */}
            <div>
              <label className="font-bold text-slate-700 mb-1.5 block">Nature du projet</label>
              <select
                value={form.typeProjet}
                onChange={(e) => setForm({ ...form, typeProjet: e.target.value as 'location' | 'achat' })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none bg-white"
              >
                <option value="location">Candidature Location</option>
                <option value="achat">Acquisition / Achat</option>
              </select>
            </div>

            {/* Profession */}
            <div>
              <label className="font-bold text-slate-700 mb-1.5 block">Profession / Titre</label>
              <input
                type="text"
                placeholder="Ex: Cadre Bancaire, Ingénieur, Commerçant..."
                value={form.profession}
                onChange={(e) => setForm({ ...form, profession: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Employeur */}
            <div>
              <label className="font-bold text-slate-700 mb-1.5 block">Entreprise / Employeur</label>
              <input
                type="text"
                placeholder="Ex: Société Générale CI, Orange..."
                value={form.employeur}
                onChange={(e) => setForm({ ...form, employeur: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Revenu Mensuel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="font-bold text-slate-700 mb-1.5 block">Revenu Net Mensuel Moyen (FCFA)</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Ex: 850000"
                  value={form.revenuMensuel}
                  onChange={(e) => setForm({ ...form, revenuMensuel: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none pr-14"
                />
                <span className="absolute right-3.5 top-2.5 text-[10px] font-bold text-slate-400">FCFA</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1.5 block">Notes ou Garant éventuel</label>
              <input
                type="text"
                placeholder="Ex: Caution solidaire disponible, CDI confirmé..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2 : Justificatifs Numériques Chiffrés */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                2. Justificatifs Numériques (Stockage Sécurisé & Chiffré)
              </h2>
              <p className="text-[11px] text-slate-400">Transmission chiffrée selon les normes APDP Côte d&apos;Ivoire</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* CNI */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">1. Pièce d&apos;identité officielle (CNI / Passeport)</span>
                {form.cniUrl ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <span className="text-[10px] font-bold text-amber-600">Requis</span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">PDF ou photo lisible de votre CNI ou Passeport en cours de validité.</p>
              <input
                type="text"
                placeholder="Lien ou référence du document CNI"
                value={form.cniUrl}
                onChange={(e) => setForm({ ...form, cniUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Bulletins de salaire */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">2. Bulletins de salaire ou Bilans</span>
                {form.bulletinsUrl ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <span className="text-[10px] font-bold text-amber-600">Requis</span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">3 derniers bulletins de paie ou relevés de compte pour non-salariés.</p>
              <input
                type="text"
                placeholder="Lien ou référence des bulletins"
                value={form.bulletinsUrl}
                onChange={(e) => setForm({ ...form, bulletinsUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Attestation de travail */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">3. Attestation d&apos;emploi ou RCCM</span>
                {form.attestationUrl && <CheckCircle className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-[10px] text-slate-400">Attestation employeur récente ou extrait RCCM entreprise.</p>
              <input
                type="text"
                placeholder="Lien ou référence de l'attestation"
                value={form.attestationUrl}
                onChange={(e) => setForm({ ...form, attestationUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Quittance */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">4. Dernière quittance de loyer</span>
                {form.quittanceUrl && <CheckCircle className="w-4 h-4 text-emerald-600" />}
              </div>
              <p className="text-[10px] text-slate-400">Reçu ou quittance de votre précédent bailleur.</p>
              <input
                type="text"
                placeholder="Lien ou référence de la quittance"
                value={form.quittanceUrl}
                onChange={(e) => setForm({ ...form, quittanceUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Vos documents sont strictement protégés par RLS et ne sont transmis qu&apos;aux annonceurs des biens auxquels vous postulez.</span>
          </div>
        </div>

        {/* Boutons d'Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 text-xs font-extrabold transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Sauvegarder le brouillon</span>
          </button>

          <button
            type="button"
            onClick={handleSoumettre}
            disabled={submitting || completude < 40}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Soumettre mon dossier ({completude}%)</span>
          </button>
        </div>
      </form>
    </div>
  )
}

