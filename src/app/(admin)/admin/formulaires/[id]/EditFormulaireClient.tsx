'use client'

import React, { useState } from 'react'
import { FormBuilder } from '@/components/formulaires/FormBuilder'
import { Formulaire } from '@/types/formulaire'
import { useRouter } from 'next/navigation'

interface EditFormulaireClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialFormulaire: any
}

export function EditFormulaireClient({ initialFormulaire }: EditFormulaireClientProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSave = async (formData: any) => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/formulaires/${initialFormulaire.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Erreur lors de la mise à jour')
      }

      router.push('/admin/formulaires')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <FormBuilder initialData={initialFormulaire} onSave={handleSave} isSaving={isSaving} />
  )
}
