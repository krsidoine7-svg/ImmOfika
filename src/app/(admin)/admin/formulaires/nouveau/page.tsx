'use client'

import React, { useState } from 'react'
import { FormBuilder } from '@/components/formulaires/FormBuilder'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NouveauFormulairePage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSave = async (formData: any) => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/formulaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Erreur lors de la création du formulaire')
      }

      router.push('/admin/formulaires')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/formulaires"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Nouveau Formulaire</h1>
          <p className="text-slate-500 text-sm font-medium">
            Concevez votre formulaire interactif par glisser-déposer.
          </p>
        </div>
      </div>

      <FormBuilder onSave={handleSave} isSaving={isSaving} />
    </div>
  )
}
