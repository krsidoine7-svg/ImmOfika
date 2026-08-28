import React from 'react'
import { getFormulaireBySlug } from '@/lib/db/queries/formulaires'
import { notFound } from 'next/navigation'
import { FormRenderer } from '@/components/formulaires/FormRenderer'
import { Formulaire } from '@/types/formulaire'
import { siteConfig } from '@/config/site'
import Image from 'next/image'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const form = await getFormulaireBySlug(slug)

  if (!form) {
    return { title: 'Formulaire introuvable — ImmOfika' }
  }

  return {
    title: `${form.titre} — ${siteConfig.name}`,
    description: form.description || `Remplissez le formulaire ${form.titre} en ligne.`,
  }
}

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const formRaw = await getFormulaireBySlug(slug)

  if (!formRaw) {
    notFound()
  }

  const form: Formulaire = {
    ...formRaw,
    champs: formRaw.champs as Formulaire['champs'],
    statut: formRaw.statut as Formulaire['statut'],
    createdAt: String(formRaw.createdAt),
    updatedAt: String(formRaw.updatedAt),
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-10 px-4 md:px-6 flex flex-col justify-between">
      {/* Header marque */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center font-black text-white text-lg shadow-md shadow-emerald-600/30">
            I
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-tight">{siteConfig.name}</p>
            <p className="text-xs text-slate-400 font-medium">{siteConfig.company.legalStatus}</p>
          </div>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
          Formulaire Sécurisé
        </span>
      </div>

      {/* Rendu du Formulaire */}
      <div className="w-full my-auto">
        <FormRenderer formulaire={form} />
      </div>

      {/* Pied de page */}
      <footer className="mt-12 text-center text-xs text-slate-400 max-w-2xl mx-auto w-full space-y-2 border-t border-slate-200/60 pt-6">
        <p>
          Propulsé par <strong>{siteConfig.name}</strong> — Plateforme Immobilière & Promotion Agréée
        </p>
        <p>
          © {new Date().getFullYear()} {siteConfig.company.name}. Tous droits réservés.
        </p>
      </footer>
    </div>
  )
}
