import React from 'react'
import { getFormulaireById } from '@/lib/db/queries/formulaires'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { EditFormulaireClient } from './EditFormulaireClient'

export const metadata = {
  title: 'Éditer le Formulaire — Admin ImmOfika',
}

export default async function EditFormulairePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const form = await getFormulaireById(id)

  if (!form) {
    notFound()
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
          <h1 className="text-2xl font-black text-slate-900">Édition : {form.titre}</h1>
          <p className="text-slate-500 text-sm font-medium">
            Modifiez la structure, les règles de champs et le style de votre formulaire.
          </p>
        </div>
      </div>

      <EditFormulaireClient initialFormulaire={form} />
    </div>
  )
}
