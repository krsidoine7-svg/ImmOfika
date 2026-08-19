'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Calendar as CalendarIcon, 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Building, 
  Clock, 
  BookOpen, 
  Loader2, 
  Flag,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import TachesKanban from './TachesKanban'
import { 
  creerDossierAction, 
  modifierDossierAction, 
  supprimerDossierAction 
} from '@/app/actions/dossiers'
import { motion, AnimatePresence } from 'framer-motion'
import { CustomSelect } from "@/components/ui/custom-select"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { DatePicker } from "@/components/ui/date-picker"
import { DateRange } from "react-day-picker"

type DossierStatut = 'ouvert' | 'en_cours' | 'bloque' | 'clos'
type DossierPriorite = 'basse' | 'normale' | 'haute' | 'urgente'

interface Profile {
  id: string
  fullName: string | null
  email: string
  phone?: string | null
}

interface Bien {
  id: string
  titre: string
  slug?: string
  ville?: string
}

interface Dossier {
  id: string
  titre: string
  description: string | null
  statut: DossierStatut
  progression: number
  priorite: DossierPriorite
  deadline: Date | null
  createdAt: Date
  client: Profile
  agent: Profile | null
  bien: Bien | null
}

interface DossiersManagerClientProps {
  dossiers: Dossier[]
  taches: any[]
  clients: Profile[]
  agents: Profile[]
  biens: Bien[]
}


export default function DossiersManagerClient({
  dossiers,
  taches,
  clients,
  agents,
  biens
}: DossiersManagerClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  // Filter and Search States
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all')
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)
  
  // View mode
  const [viewMode, setViewMode] = React.useState<'board' | 'list' | 'calendar'>('board')

  // Selected dossier for details sheet
  const [selectedDossier, setSelectedDossier] = React.useState<Dossier | null>(null)
  
  // Create / Edit Dossier Dialog State
  const [dossierModal, setDossierModal] = React.useState<{
    isOpen: boolean
    mode: 'create' | 'edit'
    dossierId?: string
    clientId: string
    agentId: string
    bienId: string
    titre: string
    description: string
    priorite: DossierPriorite
    statut: DossierStatut
    deadline: string
  }>({
    isOpen: false,
    mode: 'create',
    clientId: '',
    agentId: '',
    bienId: '',
    titre: '',
    description: '',
    priorite: 'normale',
    statut: 'ouvert',
    deadline: ''
  })

  // Drag & drop folders state
  const [draggedDossierId, setDraggedDossierId] = React.useState<string | null>(null)
  const [draggedOverStatut, setDraggedOverStatut] = React.useState<DossierStatut | null>(null)
  const [isDeletingId, setIsDeletingId] = React.useState<string | null>(null)
  const [dossierToDeleteId, setDossierToDeleteId] = React.useState<string | null>(null)

  // --- ACTIONS ---

  const handleUpdateDossierStatus = async (dossierId: string, targetStatut: DossierStatut) => {
    startTransition(async () => {
      try {
        const res = await modifierDossierAction({
          id: dossierId,
          statut: targetStatut
        })

        if (res.error) {
          toast.error(res.error)
        } else {
          toast.success("Statut du dossier mis à jour !")
          
          // Update selected dossier state if open to keep view synced
          if (selectedDossier && selectedDossier.id === dossierId) {
            setSelectedDossier(prev => prev ? { ...prev, statut: targetStatut } : null)
          }

          router.refresh()
        }
      } catch (err: any) {
        toast.error(err.message || "Erreur de mise à jour.")
      }
    })
  }

  // --- DRAG & DROP DOSSIERS ---

  const handleDossierDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("dossierId", id)
    setDraggedDossierId(id)
  }

  const handleDossierDragEnd = () => {
    setDraggedDossierId(null)
    setDraggedOverStatut(null)
  }

  const handleDossierDragOver = (e: React.DragEvent, status: DossierStatut) => {
    e.preventDefault()
    setDraggedOverStatut(status)
  }

  const handleDossierDrop = async (e: React.DragEvent, targetStatut: DossierStatut) => {
    e.preventDefault()
    setDraggedOverStatut(null)
    const id = e.dataTransfer.getData("dossierId") || draggedDossierId
    if (!id) return

    const dossier = dossiers.find(d => d.id === id)
    if (!dossier) return

    if (dossier.statut === targetStatut) return

    await handleUpdateDossierStatus(id, targetStatut)
  }

  // --- FILTERED DATA ---

  const filteredDossiers = dossiers.filter((dossier) => {
    const matchesSearch = 
      dossier.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dossier.client.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      dossier.client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dossier.bien?.titre || '').toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || dossier.statut === statusFilter
    const matchesPriority = priorityFilter === 'all' || dossier.priorite === priorityFilter

    const matchesDate = !dateRange?.from || !dateRange?.to || (
      new Date(dossier.createdAt) >= dateRange.from &&
      new Date(dossier.createdAt) <= dateRange.to
    )

    return matchesSearch && matchesStatus && matchesPriority && matchesDate
  })

  // --- MODALS TOGGLES ---

  const handleOpenCreateModal = () => {
    setDossierModal({
      isOpen: true,
      mode: 'create',
      clientId: clients[0]?.id || '',
      agentId: '',
      bienId: '',
      titre: '',
      description: '',
      priorite: 'normale',
      statut: 'ouvert',
      deadline: ''
    })
  }

  const handleOpenEditModal = (e: React.MouseEvent, dossier: Dossier) => {
    e.stopPropagation() // Avoid opening details sheet
    setDossierModal({
      isOpen: true,
      mode: 'edit',
      dossierId: dossier.id,
      clientId: dossier.client.id,
      agentId: dossier.agent?.id || '',
      bienId: dossier.bien?.id || '',
      titre: dossier.titre,
      description: dossier.description || '',
      priorite: dossier.priorite,
      statut: dossier.statut,
      deadline: dossier.deadline ? new Date(dossier.deadline).toISOString().split('T')[0] : ''
    })
  }

  const handleSaveDossierForm = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!dossierModal.titre.trim()) {
      toast.error("Le titre du dossier est obligatoire.")
      return
    }

    if (!dossierModal.clientId) {
      toast.error("Veuillez sélectionner un client.")
      return
    }

    startTransition(async () => {
      try {
        let res
        if (dossierModal.mode === 'create') {
          res = await creerDossierAction({
            clientId: dossierModal.clientId,
            agentId: dossierModal.agentId || null,
            bienId: dossierModal.bienId || null,
            titre: dossierModal.titre,
            description: dossierModal.description || null,
            statut: dossierModal.statut,
            priorite: dossierModal.priorite,
            deadline: dossierModal.deadline ? new Date(dossierModal.deadline) : null
          })
        } else {
          res = await modifierDossierAction({
            id: dossierModal.dossierId!,
            clientId: dossierModal.clientId,
            agentId: dossierModal.agentId || null,
            bienId: dossierModal.bienId || null,
            titre: dossierModal.titre,
            description: dossierModal.description || null,
            statut: dossierModal.statut,
            priorite: dossierModal.priorite,
            deadline: dossierModal.deadline ? new Date(dossierModal.deadline) : null
          })
        }

        if (res.error) {
          toast.error(res.error)
        } else {
          toast.success(dossierModal.mode === 'create' ? "Dossier créé avec succès !" : "Dossier modifié avec succès !")
          setDossierModal(prev => ({ ...prev, isOpen: false }))
          
          // Update selected dossier state if open
          if (dossierModal.mode === 'edit' && selectedDossier && selectedDossier.id === dossierModal.dossierId) {
            const updated = dossiers.find(d => d.id === dossierModal.dossierId)
            if (updated) {
              setSelectedDossier(updated)
            }
          }

          router.refresh()
        }
      } catch (err: any) {
        toast.error(err.message || "Une erreur est survenue.")
      }
    })
  }

  const handleDeleteDossier = (e: React.MouseEvent, dossierId: string) => {
    e.stopPropagation()
    setDossierToDeleteId(dossierId)
  }

  const confirmDeleteDossier = async () => {
    if (!dossierToDeleteId) return

    setIsDeletingId(dossierToDeleteId)
    try {
      const res = await supprimerDossierAction(dossierToDeleteId)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("Dossier supprimé avec succès !")
        if (selectedDossier && selectedDossier.id === dossierToDeleteId) {
          setSelectedDossier(null)
        }
        router.refresh()
      }
    } catch (err: any) {
      toast.error(err.message || "Une erreur est survenue.")
    } finally {
      setIsDeletingId(null)
      setDossierToDeleteId(null)
    }
  }

  // --- STATS / COLUMNS DEFINITION ---

  const columns: { id: DossierStatut; title: string; color: string; hoverBorder: string }[] = [
    { id: 'ouvert', title: 'Ouvert', color: 'text-indigo-600 border-indigo-200 bg-indigo-50/50', hoverBorder: 'border-indigo-400' },
    { id: 'en_cours', title: 'En cours', color: 'text-amber-600 border-amber-200 bg-amber-50/50', hoverBorder: 'border-amber-400' },
    { id: 'bloque', title: 'Bloqué', color: 'text-rose-600 border-rose-200 bg-rose-50/50', hoverBorder: 'border-rose-400' },
    { id: 'clos', title: 'Clos', color: 'text-emerald-600 border-emerald-200 bg-emerald-50/50', hoverBorder: 'border-emerald-400' },
  ]

  const getPriorityStyle = (prio: DossierPriorite) => {
    switch (prio) {
      case 'urgente':
        return 'bg-red-50 text-red-650 border border-red-200 font-bold'
      case 'haute':
        return 'bg-amber-50 text-amber-650 border border-amber-200 font-bold'
      case 'normale':
        return 'bg-blue-50 text-blue-650 border border-blue-200 font-bold'
      case 'basse':
        return 'bg-slate-50 text-slate-600 border border-slate-200 font-bold'
    }
  }

  // Organize calendar milestones
  const getCalendarSections = () => {
    const now = new Date()
    const overdue: Dossier[] = []
    const thisWeek: Dossier[] = []
    const upcoming: Dossier[] = []
    const noDeadline: Dossier[] = []

    filteredDossiers.forEach(d => {
      if (!d.deadline) {
        noDeadline.push(d)
        return
      }
      const dead = new Date(d.deadline)
      if (dead < now && d.statut !== 'clos') {
        overdue.push(d)
      } else {
        const diffTime = dead.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        if (diffDays <= 7) {
          thisWeek.push(d)
        } else {
          upcoming.push(d)
        }
      }
    })

    return { overdue, thisWeek, upcoming, noDeadline }
  }

  const calendarSections = getCalendarSections()

  // Find updated selected dossier details if list updates in parent
  React.useEffect(() => {
    if (selectedDossier) {
      const freshDossier = dossiers.find(d => d.id === selectedDossier.id)
      if (freshDossier) {
        setSelectedDossier(freshDossier)
      }
    }
  }, [dossiers])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-900">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
              Espace Suivi
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5.5 h-5.5 text-emerald-600" />
            Dossiers & Tâches Clients
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Pilotez les dossiers de transaction immobilière et les checklist de tâches de vos agents.
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 scale-[1.01] hover:scale-[1.02] transition-all cursor-pointer shrink-0 border border-emerald-600"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          Créer un Dossier
        </Button>
      </div>

      {/* ─── FILTRES ET EN-TÊTE DE VUE ─── */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
        {/* Recherche et Filtres */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Rechercher titre, client, bien..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 text-xs h-10 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'Tous les Statuts' },
                { value: 'ouvert', label: 'Ouverts' },
                { value: 'en_cours', label: 'En cours' },
                { value: 'bloque', label: 'Bloqués' },
                { value: 'clos', label: 'Clos' },
              ]}
              className="min-w-[150px]"
            />

            <CustomSelect
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={[
                { value: 'all', label: 'Toutes les Priorités' },
                { value: 'basse', label: 'Priorité Basse' },
                { value: 'normale', label: 'Priorité Normale' },
                { value: 'haute', label: 'Priorité Haute' },
                { value: 'urgente', label: 'Priorité Urgente' },
              ]}
              className="min-w-[170px]"
            />

            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder="Filtrer par date de création"
            />
          </div>
        </div>

        {/* Switcher de Vues */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setViewMode('board')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'board' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Kanban
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'list' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Tableau
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'calendar' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Calendrier
          </button>
        </div>
      </div>

      {/* ─── VUES DYNAMIQUES ─── */}
      {filteredDossiers.length === 0 ? (
        <div className="relative overflow-hidden p-16 border border-dashed border-slate-200 bg-white/70 backdrop-blur-md rounded-3xl text-center space-y-4 shadow-sm flex flex-col items-center max-w-2xl mx-auto mt-8">
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl" />
          <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl" />
          <div className="w-14 h-14 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center shadow-md">
            <BookOpen className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">Aucun dossier de suivi client</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Pilotez les dossiers d&apos;achat immobilier, affectez des agents et gérez la progression des checklist de tâches.
            </p>
          </div>
          <Button
            onClick={handleOpenCreateModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4 mr-1.5 stroke-[3px]" />
            Créer le premier dossier
          </Button>
        </div>
      ) : (
        <>
          {/* 1. KANBAN BOARD DOSSIERS */}
          {viewMode === 'board' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {columns.map((col) => {
                const colDossiers = filteredDossiers.filter(d => d.statut === col.id)
                const isOver = draggedOverStatut === col.id

                return (
                  <div
                    key={col.id}
                    onDragOver={(e) => handleDossierDragOver(e, col.id)}
                    onDrop={(e) => handleDossierDrop(e, col.id)}
                    onDragLeave={() => setDraggedOverStatut(null)}
                    className={`flex flex-col gap-3.5 rounded-2xl p-4 transition-all duration-200 min-h-[500px] ${
                      isOver ? 'bg-emerald-50/50 border-2 border-dashed border-emerald-500/40 shadow-inner scale-[1.01]' : 'bg-slate-50/50 border border-slate-200/60'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5 mb-1 shrink-0">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span 
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            col.id === 'ouvert' ? 'bg-indigo-500' :
                            col.id === 'en_cours' ? 'bg-amber-500' :
                            col.id === 'bloque' ? 'bg-rose-500' : 'bg-emerald-500'
                          }`} 
                        />
                        {col.title}
                      </span>
                      <span className="text-[10px] font-black bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full shadow-sm">
                        {colDossiers.length}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto max-h-[600px] pr-0.5 scrollbar-thin">
                      {colDossiers.map((dossier) => (
                        <div
                          key={dossier.id}
                          draggable
                          onDragStart={(e) => handleDossierDragStart(e, dossier.id)}
                          onDragEnd={handleDossierDragEnd}
                          onClick={() => setSelectedDossier(dossier)}
                          className="group p-4 bg-white hover:bg-slate-50/30 border border-slate-150 hover:border-emerald-300 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col gap-3.5 shadow-sm hover:shadow-md relative"
                        >
                          {/* Top Row: Priority Badge & Actions */}
                          <div className="flex justify-between items-start gap-2">
                            <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityStyle(dossier.priorite)}`}>
                              {dossier.priorite}
                            </span>
                            
                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-opacity duration-150">
                              <button
                                onClick={(e) => handleOpenEditModal(e, dossier)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-900 cursor-pointer transition-colors"
                                title="Modifier"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                disabled={isDeletingId === dossier.id}
                                onClick={(e) => handleDeleteDossier(e, dossier.id)}
                                className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                                title="Supprimer"
                              >
                                {isDeletingId === dossier.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Dossier details */}
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors duration-150 break-words pr-2">
                              {dossier.titre}
                            </h4>
                            {dossier.description && (
                              <p className="text-[10px] text-slate-500 line-clamp-1 leading-normal font-medium">
                                {dossier.description}
                              </p>
                            )}
                          </div>

                          {/* Client, Property tags */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-900 font-bold">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{dossier.client.fullName || dossier.client.email}</span>
                            </div>
                            {dossier.bien && (
                              <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-semibold">
                                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{dossier.bien.titre}</span>
                              </div>
                            )}
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1.5 mt-0.5">
                            <div className="flex items-center justify-between text-[9px] font-bold">
                              <span className="text-slate-500">Progression</span>
                              <span className="text-emerald-700 font-black">{dossier.progression}%</span>
                            </div>
                            <div className="w-full bg-slate-100 border border-slate-200/50 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${dossier.progression}%` }}
                              />
                            </div>
                          </div>

                          {/* Footer - Deadline / Agent */}
                          <div className="flex items-center justify-between text-[9px] pt-2 border-t border-slate-100 text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1 font-bold text-slate-500">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              {dossier.deadline ? new Date(dossier.deadline).toLocaleDateString('fr-FR') : 'Sans date'}
                            </span>
                            
                            {dossier.agent ? (
                              <span className="bg-slate-50 border border-slate-200 text-slate-655 px-2 py-0.5 rounded-full font-bold shadow-sm truncate max-w-[95px]">
                                {dossier.agent.fullName || dossier.agent.email.split('@')[0]}
                              </span>
                            ) : (
                              <span className="italic text-[9px] text-slate-450">Non affecté</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* 2. LIST VIEW TABLE */}
          {viewMode === 'list' && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-555 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4 font-black">Dossier</th>
                      <th className="p-4 font-black">Client</th>
                      <th className="p-4 font-black">Bien lié</th>
                      <th className="p-4 font-black">Progression</th>
                      <th className="p-4 font-black">Statut</th>
                      <th className="p-4 font-black">Priorité</th>
                      <th className="p-4 font-black">Agent de suivi</th>
                      <th className="p-4 font-black">Deadline</th>
                      <th className="p-4 text-right font-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDossiers.map((dossier) => (
                      <tr 
                        key={dossier.id}
                        onClick={() => setSelectedDossier(dossier)}
                        className="hover:bg-slate-50/50 transition-colors duration-150 cursor-pointer group"
                      >
                        <td className="p-4 font-bold text-slate-900 group-hover:text-emerald-700 transition-colors max-w-xs truncate">
                          {dossier.titre}
                        </td>
                        <td className="p-4 text-slate-600 font-semibold truncate max-w-[150px]">
                          {dossier.client.fullName || dossier.client.email}
                        </td>
                        <td className="p-4 text-slate-500 truncate max-w-[150px] font-medium">
                          {dossier.bien?.titre || <span className="text-slate-400 italic">Aucun</span>}
                        </td>
                        <td className="p-4 min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-100 border border-slate-200/50 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${dossier.progression}%` }}
                              />
                            </div>
                            <span className="text-emerald-700 font-black text-[10px] w-8 text-right shrink-0">{dossier.progression}%</span>
                          </div>
                        </td>
                        <td className="p-4 capitalize">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border ${
                            dossier.statut === 'ouvert' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                            dossier.statut === 'en_cours' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                            dossier.statut === 'bloque' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                            'bg-emerald-50 text-emerald-600 border-emerald-200'
                          }`}>
                            {dossier.statut === 'en_cours' ? 'en cours' : dossier.statut}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider border ${getPriorityStyle(dossier.priorite)}`}>
                            {dossier.priorite}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-700">
                          {dossier.agent?.fullName || <span className="text-slate-400 italic font-medium">Non affecté</span>}
                        </td>
                        <td className="p-4 text-slate-500 font-bold">
                          {dossier.deadline ? new Date(dossier.deadline).toLocaleDateString('fr-FR') : '-'}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleOpenEditModal(e, dossier)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={isDeletingId === dossier.id}
                              onClick={(e) => handleDeleteDossier(e, dossier.id)}
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              {isDeletingId === dossier.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. CALENDAR MILESTONES VIEW */}
          {viewMode === 'calendar' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Overdue Section */}
              {calendarSections.overdue.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-rose-250 pb-2">
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-rose-600">Échéances Dépassées</h3>
                    <span className="text-[10px] font-black bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-rose-655">
                      {calendarSections.overdue.length} dossier(s)
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {calendarSections.overdue.map(d => (
                      <div
                        key={d.id}
                        onClick={() => setSelectedDossier(d)}
                        className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50/90 cursor-pointer transition-all duration-150 relative group shadow-sm"
                      >
                        <div className="absolute right-4 top-4">
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-700 transition-colors leading-snug">{d.titre}</h4>
                        <p className="text-[10px] text-rose-600 font-bold mt-1">
                          Échéance le : {d.deadline ? new Date(d.deadline).toLocaleDateString('fr-FR') : ''}
                        </p>
                        <div className="flex items-center justify-between text-[9px] text-slate-500 mt-4 pt-2.5 border-t border-rose-100">
                          <span className="truncate max-w-[120px] font-semibold">{d.client.fullName || d.client.email}</span>
                          <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[9px] uppercase font-black">
                            {d.statut}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* This Week Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-600">Échéances cette semaine</h3>
                  <span className="text-[10px] font-black bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-amber-700">
                    {calendarSections.thisWeek.length} dossier(s)
                  </span>
                </div>
                
                {calendarSections.thisWeek.length === 0 ? (
                  <p className="text-xs text-slate-400 italic font-medium pl-1">Aucun dossier n&apos;arrive à échéance cette semaine.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {calendarSections.thisWeek.map(d => (
                      <div
                        key={d.id}
                        onClick={() => setSelectedDossier(d)}
                        className="p-4 rounded-xl border border-amber-200 bg-amber-50/20 hover:bg-amber-50/40 cursor-pointer transition-all duration-150 group shadow-sm"
                      >
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors leading-snug">{d.titre}</h4>
                        <p className="text-[10px] text-amber-600 font-bold mt-1">
                          Échéance le : {d.deadline ? new Date(d.deadline).toLocaleDateString('fr-FR') : ''}
                        </p>
                        <div className="flex items-center justify-between text-[9px] text-slate-500 mt-4 pt-2.5 border-t border-amber-100">
                          <span className="truncate max-w-[120px] font-semibold">{d.client.fullName || d.client.email}</span>
                          <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[9px] uppercase font-bold">
                            {d.statut}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Échéances futures</h3>
                  <span className="text-[10px] font-black bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full text-slate-500">
                    {calendarSections.upcoming.length} dossier(s)
                  </span>
                </div>
                
                {calendarSections.upcoming.length === 0 ? (
                  <p className="text-xs text-slate-400 italic font-medium pl-1">Aucune échéance future planifiée.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {calendarSections.upcoming.map(d => (
                      <div
                        key={d.id}
                        onClick={() => setSelectedDossier(d)}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 cursor-pointer transition-all duration-150 group shadow-sm"
                      >
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">{d.titre}</h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">
                          Échéance le : {d.deadline ? new Date(d.deadline).toLocaleDateString('fr-FR') : ''}
                        </p>
                        <div className="flex items-center justify-between text-[9px] text-slate-500 mt-4 pt-2.5 border-t border-slate-100">
                          <span className="truncate max-w-[120px] font-semibold">{d.client.fullName || d.client.email}</span>
                          <span className="bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[9px] uppercase font-bold">
                            {d.statut}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* No Deadline Section */}
              {calendarSections.noDeadline.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Sans date limite</h3>
                    <span className="text-[10px] font-black bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full text-slate-500">
                      {calendarSections.noDeadline.length} dossier(s)
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {calendarSections.noDeadline.map(d => (
                      <div
                        key={d.id}
                        onClick={() => setSelectedDossier(d)}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 cursor-pointer transition-all duration-150 group shadow-sm"
                      >
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">{d.titre}</h4>
                        <p className="text-[10px] text-slate-400 italic font-medium mt-1">Aucune échéance spécifiée</p>
                        <div className="flex items-center justify-between text-[9px] text-slate-500 mt-4 pt-2.5 border-t border-slate-100">
                          <span className="truncate max-w-[120px] font-semibold">{d.client.fullName || d.client.email}</span>
                          <span className="bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[9px] uppercase font-bold">
                            {d.statut}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ─── MODAL TACHES / DETAILS SHEET DU DOSSIER SELECTIONNE ─── */}
      <Sheet 
        open={!!selectedDossier} 
        onOpenChange={(open) => {
          if (!open) setSelectedDossier(null)
        }}
      >
        <SheetContent className="w-[95vw] sm:!max-w-3xl md:!max-w-4xl lg:!max-w-5xl bg-white border-l border-slate-200 text-slate-900 p-6 overflow-y-auto scrollbar-thin">
          {selectedDossier && (
            <div className="space-y-6">
              {/* Sheet Header */}
              <SheetHeader className="p-0 space-y-2 text-left border-b border-slate-150 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Dossier Client
                    </span>
                    <span className={`text-[9px] font-black border uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      selectedDossier.statut === 'ouvert' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                      selectedDossier.statut === 'en_cours' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                      selectedDossier.statut === 'bloque' ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' :
                      'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}>
                      {selectedDossier.statut === 'en_cours' ? 'en cours' : selectedDossier.statut}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={(e) => handleOpenEditModal(e, selectedDossier)}
                      className="h-8 text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-bold cursor-pointer transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={(e) => handleDeleteDossier(e, selectedDossier.id)}
                      className="h-8 text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl px-3 text-xs font-bold cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>

                <SheetTitle className="text-xl font-extrabold tracking-tight text-slate-900 mt-2 leading-tight">
                  {selectedDossier.titre}
                </SheetTitle>
                <SheetDescription className="text-slate-500 text-xs mt-1 max-w-2xl font-medium leading-relaxed">
                  {selectedDossier.description || "Aucune description fournie pour ce dossier."}
                </SheetDescription>
              </SheetHeader>

              {/* Grid: Folder Info & Key KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
                {/* Progression metric */}
                <div className="space-y-2.5 min-w-0">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progression Globale</h5>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-2xl font-black text-slate-900">{selectedDossier.progression}%</span>
                    <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                      Enregistrée BDD
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 border border-slate-300/40 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${selectedDossier.progression}%` }}
                    />
                  </div>
                </div>

                {/* Client / Property info */}
                <div className="space-y-1.5 min-w-0">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client & Bien Lié</h5>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5 truncate" title={selectedDossier.client.fullName || selectedDossier.client.email}>
                      <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{selectedDossier.client.fullName || selectedDossier.client.email}</span>
                    </p>
                    {selectedDossier.bien ? (
                      <p className="font-semibold text-slate-600 flex items-center gap-1.5 truncate" title={selectedDossier.bien.titre}>
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{selectedDossier.bien.titre}</span>
                      </p>
                    ) : (
                      <p className="text-slate-400 italic font-medium">Aucun bien immobilier attaché</p>
                    )}
                  </div>
                </div>

                {/* Deadlines & Agent */}
                <div className="space-y-1.5 min-w-0">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suivi et Échéance</h5>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5 truncate">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Deadline : {selectedDossier.deadline ? new Date(selectedDossier.deadline).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Aucune date limite'}</span>
                    </p>
                    <p className="font-semibold text-slate-600 flex items-center gap-1.5 truncate" title={selectedDossier.agent ? selectedDossier.agent.fullName || selectedDossier.agent.email : 'Non affecté'}>
                      <Flag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Agent : {selectedDossier.agent ? selectedDossier.agent.fullName || selectedDossier.agent.email : 'Non affecté'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive tasks Kanban board */}
              <div className="pt-4 border-t border-slate-150">
                <TachesKanban
                  dossierId={selectedDossier.id}
                  taches={taches}
                  agents={agents}
                />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ─── MODAL DIALOG POUR CREER / MODIFIER UN DOSSIER ─── */}
      <Dialog
        open={dossierModal.isOpen}
        onOpenChange={(open) => {
          if (!open) setDossierModal(prev => ({ ...prev, isOpen: false }))
        }}
      >
        <DialogContent className="max-w-lg bg-white border border-slate-200 text-slate-900 rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-bold text-slate-900 mt-1">
              {dossierModal.mode === 'create' ? "Créer un Dossier de Suivi" : "Modifier le Dossier"}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs font-semibold leading-relaxed">
              Associez un client, un agent de suivi et un bien immobilier pour suivre les tâches associées.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveDossierForm} className="my-4 space-y-4">
            {/* Titre */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Titre du dossier *</label>
              <Input
                value={dossierModal.titre}
                onChange={(e) => setDossierModal(prev => ({ ...prev, titre: e.target.value }))}
                placeholder="Ex: Achat Villa Prestige Cocody - M. Koné"
                required
                className="bg-slate-50 border-slate-200 text-slate-800 text-xs h-10 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-semibold"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
              <Textarea
                value={dossierModal.description}
                onChange={(e) => setDossierModal(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Détails du dossier, objectifs et notes sur la vente..."
                className="bg-slate-50 border-slate-200 text-slate-800 text-xs rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none h-16 font-semibold"
              />
            </div>

            {/* Client Sélectionné */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client associé *</label>
              <CustomSelect
                value={dossierModal.clientId}
                onChange={(val) => setDossierModal(prev => ({ ...prev, clientId: val }))}
                placeholder="Sélectionner un client"
                options={clients.map(c => ({
                  value: c.id,
                  label: c.fullName ? `${c.fullName} (${c.email})` : c.email
                }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Agent Assigné */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Agent en charge</label>
                <CustomSelect
                  value={dossierModal.agentId}
                  onChange={(val) => setDossierModal(prev => ({ ...prev, agentId: val }))}
                  placeholder="Non assigné"
                  options={[
                    { value: '', label: 'Non assigné' },
                    ...agents.map(a => ({
                      value: a.id,
                      label: a.fullName || a.email.split('@')[0]
                    }))
                  ]}
                />
              </div>

              {/* Bien lié */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bien lié</label>
                <CustomSelect
                  value={dossierModal.bienId}
                  onChange={(val) => setDossierModal(prev => ({ ...prev, bienId: val }))}
                  placeholder="Aucun bien lié"
                  options={[
                    { value: '', label: 'Aucun bien lié' },
                    ...biens.map(b => ({
                      value: b.id,
                      label: b.titre + (b.ville ? ` (${b.ville})` : '')
                    }))
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Priorité */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Priorité</label>
                <CustomSelect
                  value={dossierModal.priorite}
                  onChange={(val) => setDossierModal(prev => ({ ...prev, priorite: val as DossierPriorite }))}
                  options={[
                    { value: 'basse', label: 'Basse' },
                    { value: 'normale', label: 'Normale' },
                    { value: 'haute', label: 'Haute' },
                    { value: 'urgente', label: 'Urgente' },
                  ]}
                />
              </div>

              {/* Statut (Uniquement visible si édition) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Statut</label>
                <CustomSelect
                  value={dossierModal.statut}
                  onChange={(val) => setDossierModal(prev => ({ ...prev, statut: val as DossierStatut }))}
                  options={[
                    { value: 'ouvert', label: 'Ouvert' },
                    { value: 'en_cours', label: 'En cours' },
                    { value: 'bloque', label: 'Bloqué' },
                    { value: 'clos', label: 'Clos' },
                  ]}
                />
              </div>

              {/* Deadline */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date Limite</label>
                <DatePicker
                  value={dossierModal.deadline ? new Date(dossierModal.deadline) : undefined}
                  onChange={(date) => {
                    if (date) {
                      const yyyy = date.getFullYear();
                      const mm = String(date.getMonth() + 1).padStart(2, '0');
                      const dd = String(date.getDate()).padStart(2, '0');
                      setDossierModal(prev => ({ ...prev, deadline: `${yyyy}-${mm}-${dd}` }));
                    } else {
                      setDossierModal(prev => ({ ...prev, deadline: '' }));
                    }
                  }}
                />
              </div>
            </div>

            {/* Actions buttons */}
            <div className="mt-5 border-t border-slate-100 pt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDossierModal(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs h-10 font-bold rounded-xl cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-10 font-bold rounded-xl px-5 cursor-pointer shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  dossierModal.mode === 'create' ? 'Créer le dossier' : 'Sauvegarder les modifications'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL DE CONFIRMATION DE SUPPRESSION AVEC CARTOGRAPHIE D'IMPACT ─── */}
      <Dialog open={!!dossierToDeleteId} onOpenChange={(open) => { if (!open) setDossierToDeleteId(null) }}>
        <DialogContent className="sm:max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-0 overflow-hidden text-slate-900">
          {(() => {
            const dossierToDelete = dossiers.find(d => d.id === dossierToDeleteId)
            if (!dossierToDelete) return null

            const linkedTaches = taches.filter(t => t.dossierId === dossierToDeleteId)
            const tachesEnCours = linkedTaches.filter(t => t.statut === 'en_cours').length
            const tachesAFaire = linkedTaches.filter(t => t.statut === 'a_faire').length
            const tachesTerminees = linkedTaches.filter(t => t.statut === 'terminee').length
            const tachesBloquees = linkedTaches.filter(t => t.statut === 'bloquee').length

            return (
              <>
                {/* En-tête alerte premium */}
                <div className="px-6 pt-6 pb-4 flex items-start gap-4 border-b border-slate-100 bg-slate-50/40">
                  <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-rose-500 shrink-0 shadow-sm shadow-rose-100/50">
                    <AlertTriangle className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <DialogTitle className="text-base font-extrabold text-slate-900 tracking-tight">Supprimer le dossier de suivi ?</DialogTitle>
                    <DialogDescription className="text-slate-500 text-xs font-semibold leading-relaxed">
                      Cette action est réversible (archivage temporaire en base de données) mais affectera les éléments liés.
                    </DialogDescription>
                  </div>
                </div>

                {/* Cartographie d'impact */}
                <div className="px-6 py-5 space-y-5">
                  {/* Dossier ciblé */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-50/30 border border-slate-200/80 border-l-4 border-l-emerald-500 rounded-2xl p-4.5 space-y-2 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dossier ciblé</p>
                    <h4 className="text-sm font-extrabold text-slate-900 leading-snug tracking-tight">{dossierToDelete.titre}</h4>
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        dossierToDelete.statut === 'ouvert' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                        dossierToDelete.statut === 'en_cours' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        dossierToDelete.statut === 'bloque' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                        'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}>
                        {dossierToDelete.statut === 'en_cours' ? 'en cours' : dossierToDelete.statut}
                      </span>
                      <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-sm">
                        {dossierToDelete.progression}% de progression
                      </span>
                    </div>
                  </div>

                  {/* Grille d'impact */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Éléments impactés par la suppression</p>
                    <div className="grid grid-cols-2 gap-3.5">
                      {/* Client */}
                      <div className="bg-white hover:bg-slate-50/20 border border-slate-150 rounded-2xl p-3.5 space-y-1.5 shadow-sm transition-all duration-200 group">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 bg-blue-50 border border-blue-100 rounded-md flex items-center justify-center text-blue-500">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[9px] font-black text-slate-400 group-hover:text-blue-500 transition-colors uppercase tracking-wider">Client</span>
                        </div>
                        <p className="text-xs font-extrabold text-slate-900 truncate">
                          {dossierToDelete.client.fullName || dossierToDelete.client.email}
                        </p>
                      </div>

                      {/* Agent */}
                      <div className="bg-white hover:bg-slate-50/20 border border-slate-150 rounded-2xl p-3.5 space-y-1.5 shadow-sm transition-all duration-200 group">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 bg-indigo-50 border border-indigo-100 rounded-md flex items-center justify-center text-indigo-500">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[9px] font-black text-slate-400 group-hover:text-indigo-500 transition-colors uppercase tracking-wider">Agent</span>
                        </div>
                        <p className="text-xs font-extrabold text-slate-900 truncate">
                          {dossierToDelete.agent?.fullName || dossierToDelete.agent?.email?.split('@')[0] || <span className="text-slate-400 italic font-semibold">Non affecté</span>}
                        </p>
                      </div>

                      {/* Bien lié */}
                      <div className="bg-white hover:bg-slate-50/20 border border-slate-150 rounded-2xl p-3.5 space-y-1.5 shadow-sm transition-all duration-200 group">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 bg-emerald-50 border border-emerald-100 rounded-md flex items-center justify-center text-emerald-600">
                            <Building className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[9px] font-black text-slate-400 group-hover:text-emerald-600 transition-colors uppercase tracking-wider">Bien lié</span>
                        </div>
                        <p className="text-xs font-extrabold text-slate-900 truncate">
                          {dossierToDelete.bien?.titre || <span className="text-slate-400 italic font-semibold">Aucun</span>}
                        </p>
                      </div>

                      {/* Tâches */}
                      <div className="bg-white hover:bg-slate-50/20 border border-slate-150 rounded-2xl p-3.5 space-y-1.5 shadow-sm transition-all duration-200 group">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 bg-rose-50 border border-rose-100 rounded-md flex items-center justify-center text-rose-500">
                            <Flag className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[9px] font-black text-slate-400 group-hover:text-rose-500 transition-colors uppercase tracking-wider">Tâches liées</span>
                        </div>
                        <p className="text-sm font-black text-rose-600">{linkedTaches.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Détail des tâches si il y en a */}
                  {linkedTaches.length > 0 && (
                    <div className="bg-rose-50/40 border border-rose-100/75 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
                      <div className="w-8 h-8 bg-rose-100 border border-rose-200 rounded-xl flex items-center justify-center text-rose-600 shrink-0 mt-0.5">
                        <AlertTriangle className="w-4.5 h-4.5" />
                      </div>
                      <div className="space-y-2.5 flex-1">
                        <p className="text-[10px] font-black text-rose-700 uppercase tracking-wider">⚠ Ces tâches seront également supprimées</p>
                        <div className="flex flex-wrap gap-2">
                          {tachesAFaire > 0 && (
                            <span className="text-[9px] font-black bg-white text-slate-500 border border-slate-200/80 px-2.5 py-0.5 rounded-full shadow-sm">
                              {tachesAFaire} à faire
                            </span>
                          )}
                          {tachesEnCours > 0 && (
                            <span className="text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full shadow-sm">
                              {tachesEnCours} en cours
                            </span>
                          )}
                          {tachesBloquees > 0 && (
                            <span className="text-[9px] font-black bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full shadow-sm">
                              {tachesBloquees} bloquée(s)
                            </span>
                          )}
                          {tachesTerminees > 0 && (
                            <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-sm">
                              {tachesTerminees} terminée(s)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer avec boutons */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setDossierToDeleteId(null)}
                    className="text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 text-xs h-10 font-bold px-4 rounded-xl cursor-pointer border border-slate-200 shadow-sm transition-all"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="button"
                    disabled={isDeletingId === dossierToDeleteId}
                    onClick={confirmDeleteDossier}
                    className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs h-10 font-bold px-5 rounded-xl cursor-pointer shadow-md shadow-rose-600/10 transition-all flex items-center justify-center gap-1.5"
                  >
                    {isDeletingId === dossierToDeleteId ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.5px]" />
                        Confirmer la suppression
                      </>
                    )}
                  </Button>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
