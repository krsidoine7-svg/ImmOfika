'use client'

import React, { useState } from 'react'
import {
  ChampFormulaire,
  Formulaire,
  LISTE_TYPES_CHAMPS,
  TypeChamp,
} from '@/types/formulaire'
import { FormRenderer } from './FormRenderer'
import {
  GripVertical,
  Plus,
  Trash2,
  Settings,
  Eye,
  Edit3,
  Check,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Save,
  Globe,
  Mail,
  HelpCircle,
  Copy,
} from 'lucide-react'

interface FormBuilderProps {
  initialData?: Partial<Formulaire>
  onSave: (data: {
    titre: string
    description?: string
    slug: string
    champs: ChampFormulaire[]
    notificationsEmail?: string
    statut: 'actif' | 'archive'
  }) => Promise<void>
  isSaving?: boolean
}

export function FormBuilder({ initialData, onSave, isSaving = false }: FormBuilderProps) {
  const [titre, setTitre] = useState(initialData?.titre || 'Nouveau Formulaire')
  const [description, setDescription] = useState(
    initialData?.description || 'Merci de prendre quelques instants pour remplir ce formulaire.'
  )
  const [slug, setSlug] = useState(
    initialData?.slug || `formulaire-${Math.random().toString(36).substring(2, 8)}`
  )
  const [notificationsEmail, setNotificationsEmail] = useState(
    initialData?.notificationsEmail || ''
  )
  const [statut, setStatut] = useState<'actif' | 'archive'>(initialData?.statut || 'actif')

  const [champs, setChamps] = useState<ChampFormulaire[]>(
    initialData?.champs || [
      { id: '1', type: 'text', label: 'Nom complet', requis: true, placeholder: 'Ex: Jean Kouassi' },
      { id: '2', type: 'email', label: 'Adresse Email', requis: true, placeholder: 'jean@exemple.com' },
      { id: '3', type: 'telephone', label: 'Téléphone', requis: true, placeholder: '+225 07 00 00 00 00' },
    ]
  )

  const [activeTab, setActiveTab] = useState<'builder' | 'preview'>('builder')
  const [selectedChampId, setSelectedChampId] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Champ en cours de modification dans le tiroir
  const selectedChamp = champs.find(c => c.id === selectedChampId)

  // 1. Ajouter un nouveau champ depuis la palette
  const handleAddField = (type: TypeChamp) => {
    const def = LISTE_TYPES_CHAMPS.find(t => t.type === type)
    const newId = `field_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`

    const newChamp: ChampFormulaire = {
      id: newId,
      type: type,
      label: def?.defaultValues.label || 'Nouveau champ',
      placeholder: def?.defaultValues.placeholder || '',
      requis: def?.defaultValues.requis ?? false,
      options: def?.defaultValues.options ? [...def.defaultValues.options] : undefined,
      acceptedTypes: def?.defaultValues.acceptedTypes ? [...def.defaultValues.acceptedTypes] : undefined,
      maxSize: def?.defaultValues.maxSize ?? 5,
    }

    setChamps(prev => [...prev, newChamp])
    setSelectedChampId(newId)
  }

  // 2. Mettre à jour les propriétés d'un champ
  const handleUpdateChamp = (id: string, updates: Partial<ChampFormulaire>) => {
    setChamps(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    )
  }

  // 3. Supprimer un champ
  const handleDeleteChamp = (id: string) => {
    setChamps(prev => prev.filter(c => c.id !== id))
    if (selectedChampId === id) setSelectedChampId(null)
  }

  // 4. Déplacer un champ (Monter / Descendre)
  const handleMoveChamp = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === champs.length - 1) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const newChamps = [...champs]
    const [moved] = newChamps.splice(index, 1)
    newChamps.splice(targetIndex, 0, moved)
    setChamps(newChamps)
  }

  // 5. Drag & Drop natif HTML5 pour réorganiser les champs dans la liste
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newChamps = [...champs]
    const [draggedItem] = newChamps.splice(draggedIndex, 1)
    newChamps.splice(index, 0, draggedItem)
    setDraggedIndex(index)
    setChamps(newChamps)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  // Générer un slug automatique si modifié depuis le titre
  const handleTitreChange = (newTitre: string) => {
    setTitre(newTitre)
    if (!initialData?.id) {
      const generatedSlug = newTitre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      if (generatedSlug) {
        setSlug(generatedSlug)
      }
    }
  }

  const handleSubmitSave = async () => {
    if (!titre.trim()) {
      alert('Veuillez saisir un titre de formulaire')
      return
    }
    if (!slug.trim()) {
      alert('Veuillez saisir un slug unique')
      return
    }
    if (champs.length === 0) {
      alert('Veuillez ajouter au moins un champ dans le formulaire')
      return
    }

    await onSave({
      titre,
      description,
      slug,
      champs,
      notificationsEmail,
      statut,
    })
  }

  return (
    <div className="space-y-6">
      {/* Barre de contrôle supérieure */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Éditeur de Formulaire Tally</h2>
            <p className="text-xs text-slate-500">
              Glissez & déposez les composants pour structurer votre formulaire
            </p>
          </div>
        </div>

        {/* Switcher d'Onglets (Éditeur / Aperçu) */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'builder'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Éditeur</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'preview'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Aperçu Client</span>
          </button>
        </div>

        {/* Bouton de sauvegarde */}
        <button
          type="button"
          onClick={handleSubmitSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</span>
        </button>
      </div>

      {/* Mode APERÇU */}
      {activeTab === 'preview' ? (
        <div className="bg-slate-50 p-6 md:p-10 rounded-3xl border border-slate-200">
          <FormRenderer
            formulaire={{
              id: initialData?.id || 'preview',
              titre,
              description,
              slug,
              champs,
              statut,
              notificationsEmail,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }}
          />
        </div>
      ) : (
        /* Mode ÉDITEUR DRAG & DROP */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Palette Latérale de composants (3 Cols) */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Palette de Champs
            </h3>

            <div className="grid grid-cols-1 gap-2">
              {LISTE_TYPES_CHAMPS.map(item => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => handleAddField(item.type)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-700 flex items-center justify-center font-bold text-xs transition">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-950">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {item.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Canvas Principal du Formulaire (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Métadonnées du formulaire */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <input
                type="text"
                value={titre}
                onChange={e => handleTitreChange(e.target.value)}
                placeholder="Titre du formulaire..."
                className="w-full text-2xl font-bold text-slate-900 border-none bg-transparent focus:outline-none focus:ring-0 placeholder:text-slate-300"
              />
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Description / Consignes pour le client..."
                className="w-full text-sm text-slate-600 border-none bg-transparent focus:outline-none focus:ring-0 placeholder:text-slate-300"
              />

              <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> Lien unique (Slug)
                  </label>
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5">
                    <span className="text-slate-400">/f/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={e => setSlug(e.target.value)}
                      className="bg-transparent text-slate-700 font-semibold focus:outline-none w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> Notification Admin (Email)
                  </label>
                  <input
                    type="email"
                    value={notificationsEmail}
                    onChange={e => setNotificationsEmail(e.target.value)}
                    placeholder="admin@immofika.ci"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Zone de Drag & Drop des champs */}
            <div className="space-y-3">
              {champs.length === 0 ? (
                <div className="bg-dashed border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-2">
                  <p className="text-sm font-semibold text-slate-600">
                    Votre formulaire n'a aucun champ
                  </p>
                  <p className="text-xs text-slate-400">
                    Cliquez sur un élément de la palette de gauche pour l'ajouter.
                  </p>
                </div>
              ) : (
                champs.map((champ, index) => {
                  const isSelected = champ.id === selectedChampId

                  return (
                    <div
                      key={champ.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={e => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedChampId(champ.id)}
                      className={`group relative bg-white rounded-2xl p-4 border transition cursor-pointer shadow-sm ${
                        isSelected
                          ? 'border-emerald-500 ring-2 ring-emerald-100'
                          : 'border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Drag Handle */}
                        <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600">
                          <GripVertical className="w-5 h-5" />
                        </div>

                        {/* Nom du champ & badge type */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800 truncate">
                              {champ.label || 'Champ sans titre'}
                            </span>
                            {champ.requis && (
                              <span className="text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-600 font-bold">
                                Requis
                              </span>
                            )}
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                              {champ.type}
                            </span>
                          </div>
                          {champ.placeholder && (
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              Placeholder: {champ.placeholder}
                            </p>
                          )}
                        </div>

                        {/* Commandes d'action (Monter, Descendre, Supprimer) */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation()
                              handleMoveChamp(index, 'up')
                            }}
                            disabled={index === 0}
                            className="p-1 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation()
                              handleMoveChamp(index, 'down')
                            }}
                            disabled={index === champs.length - 1}
                            className="p-1 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation()
                              handleDeleteChamp(champ.id)
                            }}
                            className="p-1 rounded text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Panneau de Réglage des Propriétés du Champ sélectionné (3 Cols) */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4 sticky top-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Settings className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Propriétés du champ
              </h3>
            </div>

            {selectedChamp ? (
              <div className="space-y-4 text-left">
                {/* Libellé */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Intitulé / Label
                  </label>
                  <input
                    type="text"
                    value={selectedChamp.label}
                    onChange={e => handleUpdateChamp(selectedChamp.id, { label: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Placeholder */}
                {selectedChamp.type !== 'section' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Placeholder (Exemple de texte)
                    </label>
                    <input
                      type="text"
                      value={selectedChamp.placeholder || ''}
                      onChange={e =>
                        handleUpdateChamp(selectedChamp.id, { placeholder: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                {/* Case Requis */}
                {selectedChamp.type !== 'section' && (
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedChamp.requis}
                      onChange={e =>
                        handleUpdateChamp(selectedChamp.id, { requis: e.target.checked })
                      }
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-700">Champ Obligatoire</span>
                  </label>
                )}

                {/* Options pour select, radio, checkbox, tags */}
                {['select', 'radio', 'checkbox', 'tags'].includes(selectedChamp.type) && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-600">
                      Options (une par ligne)
                    </label>
                    <textarea
                      rows={5}
                      value={(selectedChamp.options || []).join('\n')}
                      onChange={e =>
                        handleUpdateChamp(selectedChamp.id, {
                          options: e.target.value.split('\n').filter(Boolean),
                        })
                      }
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                )}

                {/* Configuration spécifiques pour type File */}
                {selectedChamp.type === 'file' && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Taille maximale (Mo)
                      </label>
                      <input
                        type="number"
                        value={selectedChamp.maxSize || 5}
                        onChange={e =>
                          handleUpdateChamp(selectedChamp.id, {
                            maxSize: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <HelpCircle className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium">
                  Cliquez sur n'importe quel champ dans l'éditeur pour configurer ses propriétés.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
