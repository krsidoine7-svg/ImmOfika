'use client'

import React, { useState } from 'react'
import { Formulaire } from '@/types/formulaire'
import { Mail, Send, X, Loader2, CheckCircle2 } from 'lucide-react'

interface SendFormModalProps {
  formulaire: Formulaire
  isOpen: boolean
  onClose: () => void
}

export function SendFormModal({ formulaire, isOpen, onClose }: SendFormModalProps) {
  const [destinataireEmail, setDestinataireEmail] = useState('')
  const [destinataireNom, setDestinataireNom] = useState('')
  const [messagePersonalise, setMessagePersonalise] = useState(
    'Merci de bien vouloir remplir ce formulaire afin d\'étudier votre dossier.'
  )
  const [sending, setSending] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!destinataireEmail.trim()) return

    setSending(true)
    setErrorMessage(null)

    try {
      const res = await fetch('/api/formulaires/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formulaireId: formulaire.id,
          destinataireEmail,
          destinataireNom,
          messagePersonalise,
        }),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Impossible d\'envoyer l\'email')
      }

      setSentSuccess(true)
      setTimeout(() => {
        setSentSuccess(false)
        onClose()
      }, 2000)
    } catch (err) {
      console.error('[SendFormModal] Error:', err)
      setErrorMessage(err instanceof Error ? err.message : 'Erreur réseau')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Envoyer le formulaire par Email</h3>
              <p className="text-xs text-slate-500">{formulaire.titre}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {sentSuccess ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <p className="text-base font-bold text-slate-800">Email envoyé avec succès !</p>
            <p className="text-xs text-slate-500">Un lien sécurisé a été transmis à {destinataireEmail}.</p>
          </div>
        ) : (
          <form onSubmit={handleSendEmail} className="space-y-4 text-left">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                ⚠️ {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email du destinataire <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={destinataireEmail}
                onChange={e => setDestinataireEmail(e.target.value)}
                placeholder="client@exemple.ci"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nom du destinataire (Optionnel)
              </label>
              <input
                type="text"
                value={destinataireNom}
                onChange={e => setDestinataireNom(e.target.value)}
                placeholder="Ex: M. Jean Kouassi"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Message personnalisé
              </label>
              <textarea
                rows={3}
                value={messagePersonalise}
                onChange={e => setMessagePersonalise(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Envoyer l'Email</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
