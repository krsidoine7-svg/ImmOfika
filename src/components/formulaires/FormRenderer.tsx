'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Formulaire, buildDynamicZodSchema } from '@/types/formulaire'
import { ChampRenderer } from './ChampRenderer'
import { CheckCircle2, Loader2, Send } from 'lucide-react'

interface FormRendererProps {
  formulaire: Formulaire
  onSubmitSuccess?: () => void
  isEmbed?: boolean
}

export function FormRenderer({ formulaire, onSubmitSuccess, isEmbed = false }: FormRendererProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const schema = buildDynamicZodSchema(formulaire.champs)

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {},
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = async (values: Record<string, any>) => {
    setSubmitting(true)
    setErrorMessage(null)

    try {
      // 1. Gérer les fichiers éventuels (convertir File en FormData)
      const formData = new FormData()
      formData.append('formulaireId', formulaire.id)

      const plainValues: Record<string, unknown> = {}

      for (const key of Object.keys(values)) {
        const val = values[key]
        if (val instanceof File) {
          formData.append(`file_${key}`, val)
        } else {
          plainValues[key] = val
        }
      }

      formData.append('reponses', JSON.stringify(plainValues))

      const res = await fetch('/api/formulaires/submit', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Erreur lors de l\'enregistrement de votre réponse')
      }

      setSubmitted(true)
      if (onSubmitSuccess) {
        onSubmitSuccess()
      }
    } catch (err) {
      console.error('[FormRenderer] Submission error:', err)
      setErrorMessage(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-emerald-100 text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Merci !</h2>
        <p className="text-slate-600">
          Votre réponse au formulaire <strong>"{formulaire.titre}"</strong> a bien été enregistrée et transmise à nos équipes.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false)
            form.reset()
          }}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition text-sm"
        >
          Envoyer une autre réponse
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-white ${isEmbed ? '' : 'rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100'} max-w-2xl mx-auto space-y-8`}>
      {/* En-tête du formulaire */}
      <div className="border-b border-slate-100 pb-6 text-left space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          {formulaire.titre}
        </h1>
        {formulaire.description && (
          <p className="text-slate-600 leading-relaxed text-sm md:text-base">
            {formulaire.description}
          </p>
        )}
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium text-left">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Champs du formulaire */}
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {formulaire.champs.map(champ => (
          <ChampRenderer key={champ.id} champ={champ} form={form} disabled={submitting} />
        ))}

        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Envoi en cours...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Envoyer le formulaire</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
