"use client"

import * as React from 'react'
import { useState } from 'react'
import { 
  FileText, 
  Plus, 
  Trash2, 
  Check, 
  Star, 
  Sparkles, 
  Download, 
  Loader2, 
  Copy, 
  FileCode 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CustomSelect } from '@/components/ui/custom-select'
import { toast } from 'sonner'
import { 
  creerTemplateAction, 
  definirTemplateParDefautAction, 
  supprimerTemplateAction 
} from '@/app/actions/templates'

interface Template {
  id: string
  nom: string
  description: string | null
  fichierUrl: string
  fichierNom: string
  typeBien: string
  isDefault: boolean
  createdAt: string | Date
  updatedAt?: string | Date
}

interface TemplatesManagerClientProps {
  initialTemplates: Template[]
}

const DYNAMIC_TAGS = [
  { tag: "{{NOM_CLIENT}}", label: "Nom complet du client" },
  { tag: "{{EMAIL_CLIENT}}", label: "Email du client" },
  { tag: "{{TELEPHONE_CLIENT}}", label: "Numéro de téléphone" },
  { tag: "{{CNI_CLIENT}}", label: "Numéro CNI ou Passeport" },
  { tag: "{{TITRE_BIEN}}", label: "Titre du bien immobilier" },
  { tag: "{{TYPE_BIEN}}", label: "Type (Terrain, Villa, Appartement)" },
  { tag: "{{VILLE_BIEN}}", label: "Ville (Abidjan, Assinie...)" },
  { tag: "{{QUARTIER_BIEN}}", label: "Quartier ou commune" },
  { tag: "{{SUPERFICIE_BIEN}}", label: "Superficie en m²" },
  { tag: "{{PRIX_TOTAL}}", label: "Prix total du bien (FCFA)" },
  { tag: "{{ACOMPTE_VALEUR}}", label: "Montant de l'acompte 10% (FCFA)" },
  { tag: "{{SOLDE_RESTANT}}", label: "Solde restant à régler (FCFA)" },
  { tag: "{{DATE_JOUR}}", label: "Date de création du contrat" },
  { tag: "{{DATE_EXPIRATION}}", label: "Date limite d'acompte (J+7)" },
  { tag: "{{RESERVE_PAR}}", label: "Nom de l'agent référent" },
]

export function TemplatesManagerClient({ initialTemplates }: TemplatesManagerClientProps) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates)
  const [nom, setNom] = useState("")
  const [description, setDescription] = useState("")
  const [typeBien, setTypeBien] = useState("tous")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [copiedTag, setCopiedTag] = useState<string | null>(null)

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag)
    setCopiedTag(tag)
    toast.success(`Balise ${tag} copiée dans le presse-papier !`)
    setTimeout(() => setCopiedTag(null), 2000)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nom.trim()) {
      toast.error("Le nom du modèle est obligatoire.")
      return
    }

    if (!selectedFile) {
      toast.error("Veuillez sélectionner un fichier Word (.docx).")
      return
    }

    if (!selectedFile.name.endsWith('.docx') && !selectedFile.name.endsWith('.doc')) {
      toast.error("Seuls les fichiers Microsoft Word (.docx, .doc) sont autorisés.")
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("nom", nom)
      formData.append("description", description)
      formData.append("typeBien", typeBien)
      formData.append("file", selectedFile)

      const res = await creerTemplateAction(formData)

      if (!res.success || !res.template) {
        throw new Error(res.error || "Erreur lors de l'enregistrement.")
      }

      const newTplFormatted: Template = {
        id: res.template.id,
        nom: res.template.nom,
        description: res.template.description,
        fichierUrl: res.template.fichierUrl,
        fichierNom: res.template.fichierNom,
        typeBien: res.template.typeBien,
        isDefault: res.template.isDefault,
        createdAt: new Date(res.template.createdAt).toISOString(),
      }

      setTemplates(prev => [newTplFormatted, ...prev])
      setNom("")
      setDescription("")
      setSelectedFile(null)
      toast.success("Nouveau modèle Word enregistré avec succès !")
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Impossible d'uploader le modèle.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSetDefault = async (templateId: string) => {
    try {
      const res = await definirTemplateParDefautAction(templateId)
      if (!res.success) {
        throw new Error(res.error || "Impossible d'actualiser le modèle par défaut.")
      }

      setTemplates(prev =>
        prev.map(t => ({
          ...t,
          isDefault: t.id === templateId,
        }))
      )
      toast.success("Modèle défini par défaut !")
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (templateId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce modèle Word ?")) return

    try {
      const res = await supprimerTemplateAction(templateId)
      if (!res.success) {
        throw new Error(res.error || "Impossible de supprimer ce modèle.")
      }

      setTemplates(prev => prev.filter(t => t.id !== templateId))
      toast.success("Modèle supprimé avec succès.")
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold w-fit mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Promoteur Immobilier Agréé — Modèles de Contrats Officiels</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Bibliothèque de Modèles Word (.docx)</h1>
          <p className="text-slate-500 text-sm font-medium">Enregistrez, gérez et réutilisez vos modèles de contrats d&apos;entreprise ImmOfika.</p>
        </div>
      </div>

      {/* Dynamic Tags Cheat Sheet */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <FileCode className="w-5 h-5" />
          <h3 className="font-bold text-sm uppercase tracking-wider">Balises Dynamiques Disponibles pour vos Fichiers Word</h3>
        </div>
        <p className="text-xs text-slate-300 font-medium">
          Insérez ces balises directement dans vos documents Microsoft Word (.docx). Le système remplacera automatiquement chaque balise par les données réelles du client lors de la réservation :
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2">
          {DYNAMIC_TAGS.map(({ tag, label }) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleCopyTag(tag)}
              className="group bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500 p-2.5 rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center justify-between font-mono text-[11px] font-bold text-emerald-400 group-hover:text-white">
                <span>{tag}</span>
                {copiedTag === tag ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Upload New Template Form & Templates List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form: Add Template */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5 h-fit">
          <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
            <Plus className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm">Importer un Modèle Word (.docx)</h3>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Nom du Modèle :</label>
              <Input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex: Contrat Vente Foncier OHADA"
                className="text-xs font-medium rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Description (Optionnelle) :</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Précisions juridiques, conditions particulières..."
                rows={2}
                className="text-xs font-medium rounded-xl resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Type de Bien Associé :</label>
              <CustomSelect
                value={typeBien}
                onChange={setTypeBien}
                options={[
                  { value: 'tous', label: 'Tous les types de biens' },
                  { value: 'terrain', label: 'Terrains uniquement' },
                  { value: 'villa', label: 'Villas uniquement' },
                  { value: 'appartement', label: 'Appartements uniquement' },
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Fichier Word (.docx) :</label>
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl bg-slate-50 hover:bg-emerald-50/20 transition-all cursor-pointer text-center">
                <FileText className="w-8 h-8 text-emerald-600 mb-1" />
                <span className="text-xs font-bold text-slate-700">
                  {selectedFile ? selectedFile.name : "Cliquez pour choisir un fichier .docx"}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Format MS Word accepté</span>
                <input
                  type="file"
                  accept=".docx,.doc"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            <Button
              type="submit"
              disabled={isUploading}
              className="w-full text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white mr-2" />
                  <span>Enregistrement en cours...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-white mr-2" />
                  <span>Enregistrer le Modèle Word</span>
                </>
              )}
            </Button>
          </form>
        </div>

        {/* List of Templates */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Modèles Enregistrés ({templates.length})</h3>
            <span className="text-xs text-slate-400 font-medium">Utilisables directement pour toutes les réservations</span>
          </div>

          <div className="space-y-3">
            {templates.map(tpl => (
              <div
                key={tpl.id}
                className={`bg-white rounded-2xl p-5 border transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  tpl.isDefault ? 'border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-50/20' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                    <h4 className="font-bold text-sm text-slate-900">{tpl.nom}</h4>
                    {tpl.isDefault && (
                      <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <Star className="w-3 h-3 fill-white" />
                        Par Défaut
                      </span>
                    )}
                  </div>

                  {tpl.description && (
                    <p className="text-xs text-slate-500 font-medium pl-7">{tpl.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pl-7 font-mono pt-1">
                    <span>📁 {tpl.fichierNom}</span>
                    <span>🏷️ {tpl.typeBien.toUpperCase()}</span>
                    <span>📅 {new Date(tpl.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <a
                    href={tpl.fichierUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                    title="Télécharger le modèle Word"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Télécharger</span>
                  </a>

                  {!tpl.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(tpl.id)}
                      className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-emerald-200"
                      title="Définir comme modèle par défaut"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>Définir par Défaut</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(tpl.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Supprimer le modèle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
