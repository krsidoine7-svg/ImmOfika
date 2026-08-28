import React from 'react'
import { getFormulaireById, getFormulaireReponses } from '@/lib/db/queries/formulaires'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { ResponseTable } from '@/components/formulaires/ResponseTable'
import { Formulaire, FormulaireReponse } from '@/types/formulaire'

export const metadata = {
  title: 'Réponses au Formulaire — Admin ImmOfika',
}

export default async function FormulaireReponsesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const formRaw = await getFormulaireById(id)

  if (!formRaw) {
    notFound()
  }

  const reponsesRaw = await getFormulaireReponses(id)

  // Adapter les types
  const form: Formulaire = {
    ...formRaw,
    champs: formRaw.champs as Formulaire['champs'],
    statut: formRaw.statut as Formulaire['statut'],
    createdAt: String(formRaw.createdAt),
    updatedAt: String(formRaw.updatedAt),
  }

  const reponses: FormulaireReponse[] = reponsesRaw.map(r => ({
    id: r.id,
    formulaireId: r.formulaireId,
    reponses: r.reponses as Record<string, unknown>,
    fichiers: r.fichiers as FormulaireReponse['fichiers'],
    ipAddress: r.ipAddress,
    userAgent: r.userAgent,
    createdAt: String(r.createdAt),
  }))

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/formulaires"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Réponses : {form.titre}
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              {reponses.length} réponse(s) enregistrée(s) à ce jour.
            </p>
          </div>
        </div>

        <Link
          href={`/f/${form.slug}`}
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Voir la page client (/f/{form.slug})</span>
        </Link>
      </div>

      <ResponseTable formulaire={form} reponses={reponses} />
    </div>
  )
}
