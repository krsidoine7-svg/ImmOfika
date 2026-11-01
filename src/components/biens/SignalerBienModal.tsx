'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flag, X, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { creerSignalementAction } from '@/app/actions/signalementsActions'
import { cn } from '@/lib/utils'

interface SignalerBienModalProps {
  bienId: string
  bienTitre: string
  isOpen: boolean
  onClose: () => void
}

const MOTIFS = [
  { value: 'demarcheur_arnaque', label: 'Démarcheur pirate / Faux intermédiaire non mandaté' },
  { value: 'faux_prix', label: 'Prix manifestement trompeur ou non conforme' },
  { value: 'photos_trompeuses', label: 'Photos non authentiques ou volées sur un autre site' },
  { value: 'bien_deja_vendu', label: 'Bien déjà vendu / indisponible' },
  { value: 'autre', label: 'Autre infraction aux règles ImmOfika' },
]

export default function SignalerBienModal({
  bienId,
  bienTitre,
  isOpen,
  onClose,
}: SignalerBienModalProps) {
  const [motif, setMotif] = React.useState<any>('demarcheur_arnaque')
  const [description, setDescription] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await creerSignalementAction({
      bienId,
      motif,
      description,
    })

    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else {
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setDescription('')
        onClose()
      }, 2500)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Signaler cette annonce</h3>
                <p className="text-[11px] text-slate-400">Protection de la communauté ImmOfika</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-base text-slate-900">Signalement bien reçu</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Notre équipe de modération juridique examine votre signalement pour garantir l&apos;authenticité des biens sur ImmOfika.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Annonce concernée</span>
                <span className="font-bold text-slate-800 line-clamp-1">{bienTitre}</span>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Motif */}
              <div>
                <label className="font-bold text-slate-700 mb-1.5 block">Motif du signalement</label>
                <select
                  value={motif}
                  onChange={(e) => setMotif(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-red-500 outline-none bg-white"
                >
                  {MOTIFS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 mb-1.5 block">Précisions sur l&apos;anomalie constatée</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Décrivez précisément ce qui vous paraît suspect (faux numéro, démarcheur sans mandat, etc.)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-red-500 outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold flex items-center justify-center gap-2 shadow-md shadow-red-600/20 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmission...</span>
                    </>
                  ) : (
                    <span>Envoyer le signalement</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

