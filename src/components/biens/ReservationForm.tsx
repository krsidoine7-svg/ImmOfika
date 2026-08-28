'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Phone,
  Mail,
  MessageSquare,
} from 'lucide-react'
import { creerReservation } from '@/app/actions/reservation'
import { cn } from '@/lib/utils'

interface Props {
  bienId: string
  bienSlug: string
  bienStatut: string
  clientNom: string
  clientEmail: string
  clientPhone: string
}

type StepStatus = 'form' | 'loading' | 'success' | 'error'

export default function ReservationForm({
  bienId,
  bienSlug,
  bienStatut,
  clientNom,
  clientEmail,
  clientPhone,
}: Props) {
  const router = useRouter()
  const [status, setStatus] = React.useState<StepStatus>('form')
  const [errorMessage, setErrorMessage] = React.useState('')
  const [reservationId, setReservationId] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [accepted, setAccepted] = React.useState(false)

  const isDisponible = bienStatut === 'disponible'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!accepted || !isDisponible) return

    setStatus('loading')

    try {
      const result = await creerReservation(bienId, notes)

      if (result.success && result.reservationId) {
        setReservationId(result.reservationId)
        setStatus('success')
      } else {
        setErrorMessage(result.error ?? 'Une erreur est survenue.')
        setStatus('error')
      }
    } catch {
      setErrorMessage('Erreur réseau. Veuillez réessayer.')
      setStatus('error')
    }
  }

  // ─── Succès ───────────────────────────────────────────────────────────────

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center text-center"
      >
        <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <CheckCircle className="h-10 w-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-[#1A2A4A] mb-3">Réservation confirmée !</h2>
        <p className="text-gray-500 mb-6 max-w-sm">
          Votre réservation a bien été enregistrée. Vous recevrez un email de confirmation 
          avec les prochaines étapes pour finaliser votre dossier.
        </p>

        <div className="w-full bg-slate-50 rounded-xl p-4 mb-6 text-left text-sm border border-slate-100">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-1 font-semibold">N° de réservation</p>
          <p className="font-mono font-bold text-slate-900 text-xs break-all">{reservationId}</p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => router.push('/client/dashboard')}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all"
          >
            Aller à mon espace client
          </button>
          <button
            onClick={() => router.push('/biens')}
            className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Retour au catalogue
          </button>
        </div>
      </motion.div>
    )
  }

  // ─── Erreur ───────────────────────────────────────────────────────────────

  if (status === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 flex flex-col items-center text-center"
      >
        <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Réservation impossible</h2>
        <p className="text-gray-500 mb-6">{errorMessage}</p>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => { setStatus('form'); setErrorMessage('') }}
            className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors"
          >
            Réessayer
          </button>
          <button
            onClick={() => router.push(`/biens/${bienSlug}`)}
            className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Retour au bien
          </button>
        </div>
      </motion.div>
    )
  }

  // ─── Bien non disponible ──────────────────────────────────────────────────

  if (!isDisponible) {
    return (
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-8 flex flex-col items-center text-center">
        <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center mb-6">
          <AlertCircle className="h-10 w-10 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-3">Bien non disponible</h2>
        <p className="text-gray-500 mb-6">
          Ce bien est actuellement <strong className="capitalize">{bienStatut}</strong> et ne peut pas être réservé.
        </p>
        <button
          onClick={() => router.push('/biens')}
          className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors"
        >
          Voir d&apos;autres biens
        </button>
      </div>
    )
  }

  // ─── Formulaire ───────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-bold text-slate-900 mb-6">Vos informations</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom */}
        <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
          <User className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 mb-0.5">Nom complet</p>
            <p className="text-sm font-bold text-slate-900 truncate">{clientNom || '—'}</p>
          </div>
        </div>

        {/* Email */}
        <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
          <Mail className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 mb-0.5">Email</p>
            <p className="text-sm font-bold text-slate-900 truncate">{clientEmail}</p>
          </div>
        </div>

        {/* Téléphone */}
        <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
          <Phone className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 mb-0.5">Téléphone</p>
            <p className="text-sm font-bold text-slate-900">{clientPhone || 'Non renseigné'}</p>
          </div>
        </div>

        {/* Notes optionnelles */}
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <label className="flex items-center gap-2 text-xs text-slate-400 font-semibold mb-2">
            <MessageSquare className="h-4 w-4 text-emerald-600" />
            Message pour notre équipe (optionnel)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Je souhaite visiter le bien avant de finaliser..."
            rows={3}
            className="w-full text-sm text-slate-900 font-medium placeholder:text-slate-300 outline-none resize-none"
          />
        </div>

        {/* Conditions */}
        <label className="flex items-start gap-3 cursor-pointer">
          <div
            onClick={() => setAccepted(!accepted)}
            className={cn(
              'h-5 w-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors mt-0.5',
              accepted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
            )}
          >
            {accepted && <CheckCircle className="h-3.5 w-3.5 text-white fill-white" />}
          </div>
          <span className="text-xs text-slate-500 leading-relaxed font-medium">
            J&apos;accepte les{' '}
            <a href="/legal" className="text-emerald-600 underline font-bold">conditions générales</a>
            {' '}d&apos;ImmOfika et je comprends que la réservation 
            sera valable 3 mois avec paiement d&apos;un acompte requis sous 7 jours.
          </span>
        </label>

        {/* Bouton */}
        <button
          type="submit"
          disabled={!accepted || status === 'loading'}
          className={cn(
            'w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2',
            accepted && status !== 'loading'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 cursor-pointer'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          )}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Réservation en cours...
            </>
          ) : (
            '🔒 Confirmer la réservation'
          )}
        </button>

        <p className="text-xs text-center text-gray-400">
          Aucun paiement n&apos;est requis à cette étape
        </p>
      </form>
    </motion.div>
  )
}
