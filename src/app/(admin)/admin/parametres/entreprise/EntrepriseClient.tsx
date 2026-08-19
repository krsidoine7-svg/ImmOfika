"use client"

import React from 'react'
import PromoterSettings from '@/components/admin/settings/PromoterSettings'
import { saveSystemSettingsAction } from '@/app/actions/settings'
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"

export default function EntrepriseClient({ initialConfigs }: { initialConfigs: Record<string, any> }) {
  const [formData, setFormData] = React.useState({
    legalName: initialConfigs.promoter?.legalName || 'ImmOfika Immobilier International',
    agrement: initialConfigs.promoter?.agrement || '',
    ncc: initialConfigs.promoter?.ncc || '',
    phone: initialConfigs.promoter?.phone || '+225 0701020304',
    address: initialConfigs.promoter?.address || 'Cocody Mermoz, Abidjan, Côte d\'Ivoire',
    email: initialConfigs.promoter?.email || 'contact@immofika.ci',
    whatsappPhone: initialConfigs.promoter?.whatsappPhone || '2250707070707',
    whatsappTemplate: initialConfigs.promoter?.whatsappTemplate || 'Bonjour ImmOfika, je suis {name}. Je souhaite échanger concernant mes projets immobiliers.',
  })

  const [initialState, setInitialState] = React.useState(JSON.parse(JSON.stringify(formData)))
  const [isSaving, setIsSaving] = React.useState(false)
  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialState)

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await saveSystemSettingsAction('promoter', formData)
      if (res.success) {
        toast.success("Paramètres entreprise enregistrés avec succès !")
        setInitialState(JSON.parse(JSON.stringify(formData)))
      } else {
        toast.error(`Erreur: ${res.error}`)
      }
    } catch (err) {
      toast.error("Erreur de communication")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6">
        <PromoterSettings values={formData} onChange={handleChange} />
      </div>
      <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
        {isDirty && (
          <Button variant="outline" className="rounded-xl text-xs font-bold" onClick={() => setFormData(initialState)}>
            Annuler
          </Button>
        )}
        <Button onClick={handleSave} disabled={!isDirty || isSaving} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 cursor-pointer">
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </div>
  )
}
