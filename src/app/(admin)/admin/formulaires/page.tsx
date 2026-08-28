import React from 'react'
import { getFormulairesAdmin, getFormulaireReponsesCount } from '@/lib/db/queries/formulaires'
import Link from 'next/link'
import {
  FileText,
  Plus,
  Edit,
  BarChart3,
  ExternalLink,
  Share2,
  Copy,
  Trash2,
  CheckCircle,
  Archive,
} from 'lucide-react'
import { FormulairesListClient } from './FormulairesListClient'

import { ChampFormulaire } from '@/types/formulaire'

export const metadata = {
  title: 'Générateur de Formulaires (Tally) — Admin ImmOfika',
}

export default async function AdminFormulairesPage() {
  const formulairesRaw = await getFormulairesAdmin()

  // Calculer le nombre de réponses pour chaque formulaire
  const formulairesWithCounts = await Promise.all(
    formulairesRaw.map(async form => {
      const count = await getFormulaireReponsesCount(form.id)
      return {
        ...form,
        champs: (form.champs || []) as ChampFormulaire[],
        statut: form.statut as 'actif' | 'archive',
        reponsesCount: count,
      }
    })
  )

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Formulaires Dynamiques</h1>
          <p className="text-slate-500 text-sm font-medium">
            Créez des formulaires sur-mesure (style Tally), partagez-les et analysez les réponses.
          </p>
        </div>

        <Link
          href="/admin/formulaires/nouveau"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Formulaire</span>
        </Link>
      </div>

      {/* Composant Client pour la liste & actions dynamiques */}
      <FormulairesListClient initialFormulaires={formulairesWithCounts} />
    </div>
  )
}
