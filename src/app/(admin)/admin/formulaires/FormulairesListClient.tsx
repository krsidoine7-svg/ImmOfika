'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Formulaire } from '@/types/formulaire'
import { SendFormModal } from '@/components/formulaires/SendFormModal'
import {
  FileText,
  Edit,
  BarChart3,
  ExternalLink,
  Mail,
  Copy,
  Trash2,
  CheckCircle,
  Archive,
  Search,
} from 'lucide-react'

interface FormulaireWithCount extends Formulaire {
  reponsesCount: number
}

interface FormulairesListClientProps {
  initialFormulaires: FormulaireWithCount[]
}

export function FormulairesListClient({ initialFormulaires }: FormulairesListClientProps) {
  const [formulaires, setFormulaires] = useState<FormulaireWithCount[]>(initialFormulaires)
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [sendModalForm, setSendModalForm] = useState<Formulaire | null>(null)

  const filtered = formulaires.filter(f =>
    f.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCopyLink = (slug: string, id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://immofika.ci'
    const fullUrl = `${origin}/f/${slug}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce formulaire et toutes ses réponses ?')) return

    try {
      const res = await fetch(`/api/formulaires/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setFormulaires(prev => prev.filter(f => f.id !== id))
      } else {
        alert(json.error || 'Erreur lors de la suppression')
      }
    } catch (err) {
      console.error(err)
      alert('Erreur réseau')
    }
  }

  return (
    <div className="space-y-4">
      {/* Barre de filtre */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Filtrer par titre ou slug..."
          className="w-full text-sm bg-transparent border-none focus:outline-none text-slate-800"
        />
      </div>

      {/* Grille des formulaires */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Aucun formulaire trouvé</h3>
          <p className="text-xs text-slate-500">
            Créez votre premier formulaire en cliquant sur "Nouveau Formulaire".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(form => (
            <div
              key={form.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      form.statut === 'actif'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {form.statut}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {form.champs.length} champ(s)
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition">
                  {form.titre}
                </h3>

                {form.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {form.description}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-between text-xs text-slate-400 font-mono border-t border-slate-100">
                  <span>/f/{form.slug}</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    {form.reponsesCount} réponse(s)
                  </span>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/formulaires/${form.id}`}
                    title="Éditer le formulaire"
                    className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>

                  <Link
                    href={`/admin/formulaires/${form.id}/reponses`}
                    title="Voir les réponses"
                    className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setSendModalForm(form)}
                    title="Envoyer par email"
                    className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition"
                  >
                    <Mail className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(form.slug, form.id)}
                    title="Copier le lien public"
                    className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition"
                  >
                    {copiedId === form.id ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/f/${form.slug}`}
                    target="_blank"
                    title="Ouvrir la page client"
                    className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(form.id)}
                    title="Supprimer"
                    className="p-2 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal d'envoi par email */}
      {sendModalForm && (
        <SendFormModal
          formulaire={sendModalForm}
          isOpen={!!sendModalForm}
          onClose={() => setSendModalForm(null)}
        />
      )}
    </div>
  )
}
