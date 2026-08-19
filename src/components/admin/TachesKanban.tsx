"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  Plus, 
  HelpCircle, 
  Play, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  User, 
  Loader2, 
  Trash2, 
  Edit,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { 
  deplacerTacheAction, 
  ajouterCommentaireBlocageAction, 
  creerTacheAction, 
  modifierTacheAction, 
  supprimerTacheAction 
} from "@/app/actions/kanban-taches"
import { TaskStatut, TaskPriorite } from "@/types/crm"

interface TaskAssignee {
  id: string
  fullName: string | null
  email: string
}

interface KanbanTask {
  id: string
  dossierId: string
  titre: string
  description: string | null
  statut: TaskStatut
  priorite: TaskPriorite
  position: number
  deadline: string | null
  bloqueCommentaire: string | null
  assignee: TaskAssignee | null
}

interface AgentOption {
  id: string
  fullName: string | null
  email: string
}

interface TachesKanbanProps {
  dossierId: string
  taches: KanbanTask[]
  agents: AgentOption[]
}

interface CustomSelectProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

function CustomSelect({ options, value, onChange, placeholder }: CustomSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedOption = options.find(o => o.value === value)

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-white text-slate-800 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold transition-all text-left h-10"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : (placeholder || "Sélectionner...")}</span>
        <svg className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-250 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <ul className="absolute z-[99] mt-1 w-full bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1">
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2.5 text-xs font-bold hover:bg-slate-50 transition-colors ${
                  opt.value === value ? "text-emerald-700 bg-emerald-50" : "text-slate-700"
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function TachesKanban({ dossierId, taches: initialTaches, agents }: TachesKanbanProps) {
  const router = useRouter()
  const [taches, setTaches] = React.useState<KanbanTask[]>(initialTaches)
  const [draggedTaskId, setDraggedTaskId] = React.useState<string | null>(null)
  const [draggedOverCol, setDraggedOverCol] = React.useState<TaskStatut | null>(null)
  const [isPending, setIsPending] = React.useState(false)

  // State pour le modal de commentaire de blocage obligatoire
  const [blockModalData, setBlockModalData] = React.useState<{
    isOpen: boolean
    taskId: string | null
    newPosition: number
    comment: string
  }>({
    isOpen: false,
    taskId: null,
    newPosition: 0,
    comment: ""
  })

  // State pour le modal d'ajout / modification de tâche
  const [taskFormModal, setTaskFormModal] = React.useState<{
    isOpen: boolean
    mode: 'create' | 'edit'
    taskId?: string
    titre: string
    description: string
    statut: TaskStatut
    priorite: TaskPriorite
    assigneeId: string
    deadline: string
    bloqueCommentaire: string
  }>({
    isOpen: false,
    mode: 'create',
    titre: "",
    description: "",
    statut: 'a_faire',
    priorite: 'normale',
    assigneeId: "",
    deadline: "",
    bloqueCommentaire: ""
  })

  const [isDeletingId, setIsDeletingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    setTaches(initialTaches)
  }, [initialTaches])

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id)
    e.dataTransfer.setData("text/plain", id)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, colId: TaskStatut) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (draggedOverCol !== colId) {
      setDraggedOverCol(colId)
    }
  }

  const handleDragEnd = () => {
    setDraggedTaskId(null)
    setDraggedOverCol(null)
  }

  const handleDrop = async (e: React.DragEvent, targetStatut: TaskStatut) => {
    e.preventDefault()
    setDraggedOverCol(null)
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId
    if (!taskId) return

    const task = taches.find(t => t.id === taskId)
    if (!task || task.statut === targetStatut) return

    const colTargetTasks = taches.filter(t => t.statut === targetStatut)
    const newPosition = colTargetTasks.length

    if (targetStatut === 'bloquee') {
      setBlockModalData({
        isOpen: true,
        taskId: task.id,
        newPosition,
        comment: task.bloqueCommentaire || ""
      })
      return
    }

    setTaches(prev => prev.map(t => t.id === taskId ? { ...t, statut: targetStatut, position: newPosition } : t))

    try {
      const res = await deplacerTacheAction(taskId, targetStatut, newPosition)
      if (!res.success) {
        toast.error(res.error || "Impossible de déplacer la tâche.")
        setTaches(initialTaches)
      } else {
        toast.success("Statut de la tâche mis à jour.")
        router.refresh()
      }
    } catch (err) {
      toast.error("Erreur de connexion.")
      setTaches(initialTaches)
    }
  }

  const handleSaveBlockComment = async () => {
    if (!blockModalData.taskId || !blockModalData.comment.trim()) {
      toast.error("Le commentaire de blocage est obligatoire.")
      return
    }

    setIsPending(true)
    try {
      const moveRes = await deplacerTacheAction(blockModalData.taskId, 'bloquee', blockModalData.newPosition)
      if (!moveRes.success) {
        toast.error(moveRes.error || "Échec du déplacement.")
        setIsPending(false)
        return
      }

      const commentRes = await ajouterCommentaireBlocageAction(blockModalData.taskId, blockModalData.comment.trim())
      if (!commentRes.success) {
        toast.error(commentRes.error || "Échec de l'enregistrement du commentaire.")
      } else {
        toast.success("Tâche bloquée et commentaire enregistré.")
        setTaches(prev => prev.map(t => t.id === blockModalData.taskId ? { 
          ...t, 
          statut: 'bloquee', 
          position: blockModalData.newPosition,
          bloqueCommentaire: blockModalData.comment.trim() 
        } : t))
      }
    } catch (err) {
      toast.error("Erreur serveur lors du blocage.")
    } finally {
      setIsPending(false)
      setBlockModalData(prev => ({ ...prev, isOpen: false }))
      router.refresh()
    }
  }

  const handleOpenCreateModal = (defaultStatut: TaskStatut = 'a_faire') => {
    setTaskFormModal({
      isOpen: true,
      mode: 'create',
      titre: "",
      description: "",
      statut: defaultStatut,
      priorite: 'normale',
      assigneeId: "",
      deadline: "",
      bloqueCommentaire: ""
    })
  }

  const handleOpenEditModal = (task: KanbanTask) => {
    setTaskFormModal({
      isOpen: true,
      mode: 'edit',
      taskId: task.id,
      titre: task.titre,
      description: task.description || "",
      statut: task.statut,
      priorite: task.priorite,
      assigneeId: task.assignee?.id || "",
      deadline: task.deadline ? task.deadline.split('T')[0] : "",
      bloqueCommentaire: task.bloqueCommentaire || ""
    })
  }

  const handleSaveTaskForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskFormModal.titre.trim()) {
      toast.error("Le titre de la tâche est obligatoire.")
      return
    }

    if (taskFormModal.statut === 'bloquee' && !taskFormModal.bloqueCommentaire.trim()) {
      toast.error("Veuillez saisir la raison du blocage.")
      return
    }

    setIsPending(true)
    try {
      if (taskFormModal.mode === 'create') {
        const res = await creerTacheAction({
          dossierId,
          titre: taskFormModal.titre.trim(),
          description: taskFormModal.description.trim() || undefined,
          statut: taskFormModal.statut,
          priorite: taskFormModal.priorite,
          assigneeId: taskFormModal.assigneeId || undefined,
          deadline: taskFormModal.deadline ? new Date(taskFormModal.deadline) : undefined,
          bloqueCommentaire: taskFormModal.statut === 'bloquee' ? taskFormModal.bloqueCommentaire.trim() : undefined,
        })
        if (res.success) {
          toast.success("Tâche créée avec succès !")
        } else {
          toast.error(res.error || "Impossible de créer la tâche.")
        }
      } else if (taskFormModal.mode === 'edit' && taskFormModal.taskId) {
        const res = await modifierTacheAction({
          id: taskFormModal.taskId,
          titre: taskFormModal.titre.trim(),
          description: taskFormModal.description.trim() || undefined,
          statut: taskFormModal.statut,
          priorite: taskFormModal.priorite,
          assigneeId: taskFormModal.assigneeId || undefined,
          deadline: taskFormModal.deadline ? new Date(taskFormModal.deadline) : undefined,
          bloqueCommentaire: taskFormModal.statut === 'bloquee' ? taskFormModal.bloqueCommentaire.trim() : undefined,
        })
        if (res.success) {
          toast.success("Tâche modifiée avec succès !")
        } else {
          toast.error(res.error || "Impossible de modifier la tâche.")
        }
      }
    } catch (err) {
      toast.error("Erreur de communication serveur.")
    } finally {
      setIsPending(false)
      setTaskFormModal(prev => ({ ...prev, isOpen: false }))
      router.refresh()
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette tâche ?")) return
    setIsDeletingId(id)
    try {
      const res = await supprimerTacheAction(id)
      if (res.success) {
        toast.success("Tâche supprimée.")
        setTaches(prev => prev.filter(t => t.id !== id))
        router.refresh()
      } else {
        toast.error(res.error || "Échec de la suppression.")
      }
    } catch (err) {
      toast.error("Erreur serveur.")
    } finally {
      setIsDeletingId(null)
    }
  }

  const columns: { id: TaskStatut; title: string; color: string; bg: string; border: string; icon: React.ReactNode }[] = [
    {
      id: 'a_faire',
      title: 'À faire',
      color: 'text-indigo-700 border-indigo-200 bg-indigo-50/50',
      bg: 'bg-indigo-50/20',
      border: 'border-indigo-200',
      icon: <HelpCircle className="w-4 h-4 text-indigo-600" />
    },
    {
      id: 'en_cours',
      title: 'En cours',
      color: 'text-emerald-700 border-emerald-200 bg-emerald-50/50',
      bg: 'bg-emerald-50/20',
      border: 'border-emerald-200',
      icon: <Play className="w-4 h-4 text-emerald-600" />
    },
    {
      id: 'bloquee',
      title: 'Bloquée',
      color: 'text-rose-600 border-rose-200 bg-rose-50/50',
      bg: 'bg-rose-50/20',
      border: 'border-rose-200',
      icon: <AlertCircle className="w-4 h-4 text-rose-500" />
    },
    {
      id: 'terminee',
      title: 'Terminée',
      color: 'text-emerald-600 border-emerald-200 bg-emerald-50/50',
      bg: 'bg-emerald-50/20',
      border: 'border-emerald-200',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    }
  ]

  const getPriorityStyle = (prio: TaskPriorite) => {
    switch (prio) {
      case 'urgente':
        return 'bg-red-50 text-red-700 border border-red-200 font-bold'
      case 'haute':
        return 'bg-amber-50 text-amber-800 border border-amber-200 font-bold'
      case 'normale':
        return 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold'
      case 'basse':
        return 'bg-slate-50 text-slate-600 border border-slate-200 font-bold'
    }
  }

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header and Quick stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-md font-extrabold text-slate-900 uppercase tracking-wider">Tableau des Tâches</h3>
          <p className="text-xs text-slate-500 font-medium">Glissez-déposez les tâches pour mettre à jour leur progression.</p>
        </div>
        
        <Button
          onClick={() => handleOpenCreateModal('a_faire')}
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          Nouvelle Tâche
        </Button>
      </div>

      {/* Kanban Board Layout */}
      <div className="flex overflow-x-auto gap-4 pb-4 pr-1 scrollbar-thin -mx-2 px-2">
        {columns.map((col) => {
          const colTasks = taches.filter(t => t.statut === col.id)
          const isOver = draggedOverCol === col.id

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              onDragLeave={() => setDraggedOverCol(null)}
              className={`flex flex-col rounded-2xl p-4 transition-all duration-200 min-h-[450px] min-w-[260px] max-w-[320px] flex-1 shrink-0 ${
                isOver ? 'bg-emerald-50/50 border-2 border-dashed border-emerald-400 shadow-inner scale-[1.01]' : 'bg-slate-50/50 border border-slate-200/60'
              }`}
            >
              {/* Column Title */}
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg border ${col.color.split(' ')[1]} ${col.color.split(' ')[2]}`}>
                    {col.icon}
                  </div>
                  <span className="font-extrabold text-sm text-slate-900">{col.title}</span>
                </div>
                <span className="text-[10px] font-black bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full shadow-xs">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List Container */}
              <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto max-h-[500px] pr-0.5 scrollbar-thin">
                {colTasks.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-center">
                    <p className="text-[11px] font-bold">Aucune tâche</p>
                    <button
                      onClick={() => handleOpenCreateModal(col.id)}
                      className="text-emerald-600 text-[10px] font-bold hover:underline mt-1 cursor-pointer transition-colors"
                    >
                      Ajouter +
                    </button>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      className={`p-4 rounded-xl border bg-white hover:bg-slate-50/30 border-slate-200/80 transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-slate-300 group relative ${
                        draggedTaskId === task.id ? 'opacity-30 border-dashed border-slate-300 shadow-none' : ''
                      }`}
                    >
                      {/* Priority and Actions */}
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityStyle(task.priorite)}`}>
                          {task.priorite}
                        </span>
                        
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-opacity duration-150">
                          <button
                            onClick={() => handleOpenEditModal(task)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-900 cursor-pointer transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={isDeletingId === task.id}
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                            title="Supprimer"
                          >
                            {isDeletingId === task.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h4 className="text-xs font-bold text-slate-900 leading-snug tracking-wide group-hover:text-emerald-700 transition-colors duration-150 break-words pr-2">
                        {task.titre}
                      </h4>
                      {task.description && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed font-medium">
                          {task.description}
                        </p>
                      )}

                      {/* Blocking comment warning banner */}
                      {task.statut === 'bloquee' && task.bloqueCommentaire && (
                        <div className="mt-2.5 p-2.5 rounded-xl border border-rose-200 bg-rose-50/60 text-rose-800 text-[10px] flex gap-1.5 items-start">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <p className="font-semibold leading-normal break-all">
                            {task.bloqueCommentaire}
                          </p>
                        </div>
                      )}

                      {/* Footer Details */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <div className="flex items-center gap-1 font-bold text-slate-500">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>
                            {task.deadline 
                              ? new Date(task.deadline).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) 
                              : 'Pas de date'
                            }
                          </span>
                        </div>

                        {task.assignee ? (
                          <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full" title={task.assignee.email}>
                            <User className="w-2.5 h-2.5 text-emerald-600" />
                            <span className="font-bold text-[9px] text-slate-900 truncate max-w-[80px]">
                              {task.assignee.fullName || task.assignee.email.split('@')[0]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[9px] text-slate-400 italic">Non assignée</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── MODAL COMMENTAIRE DE BLOCAGE OBLIGATOIRE ─── */}
      <Dialog 
        open={blockModalData.isOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setBlockModalData(prev => ({ ...prev, isOpen: false }))
          }
        }}
      >
        <DialogContent className="max-w-md bg-white border border-slate-100 text-slate-900 rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                Action Requise
              </span>
            </div>
            <DialogTitle className="text-lg font-black text-slate-900 mt-1">
              Pourquoi cette tâche est-elle bloquée ?
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs font-medium leading-relaxed">
              Pour pouvoir marquer cette tâche comme &quot;Bloquée&quot;, vous devez obligatoirement fournir un commentaire expliquant le blocage. Ce commentaire sera visible par tous les agents.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Commentaire de blocage</label>
            <Textarea
              value={blockModalData.comment}
              onChange={(e) => setBlockModalData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Ex: En attente de signature du document chez le notaire..."
              className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 text-xs rounded-xl focus:border-emerald-500 focus:ring-emerald-500/10 focus:bg-white transition-all resize-none h-24 font-medium"
            />
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setBlockModalData(prev => ({ ...prev, isOpen: false }))
                router.refresh()
              }}
              className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs h-10 font-bold rounded-xl cursor-pointer"
            >
              Annuler
            </Button>
            <Button
              type="button"
              disabled={isPending || !blockModalData.comment.trim()}
              onClick={handleSaveBlockComment}
              className={`text-xs h-10 font-bold rounded-xl px-4 cursor-pointer flex items-center justify-center gap-1.5 transition-colors ${
                blockModalData.comment.trim()
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                  : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                'Bloquer la tâche'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL FORMULAIRE TACHE (AJOUT / MODIFICATION) ─── */}
      <Dialog 
        open={taskFormModal.isOpen} 
        onOpenChange={(open) => {
          if (!open) setTaskFormModal(prev => ({ ...prev, isOpen: false }))
        }}
      >
        <DialogContent className="max-w-md bg-white border border-slate-100 text-slate-900 rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-extrabold text-slate-900 mt-1">
              {taskFormModal.mode === 'create' ? "Créer une Tâche" : "Modifier la Tâche"}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs font-medium leading-relaxed">
              {taskFormModal.mode === 'create' ? "Remplissez les informations ci-dessous pour ajouter une tâche au dossier." : "Ajustez les détails de la tâche ci-dessous."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveTaskForm} className="my-4 space-y-4">
            {/* Titre */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Titre *</label>
              <Input
                value={taskFormModal.titre}
                onChange={(e) => setTaskFormModal(prev => ({ ...prev, titre: e.target.value }))}
                placeholder="Ex: Récupérer le titre foncier"
                required
                className="bg-slate-50 border-slate-200 text-slate-900 text-xs h-10 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/10 focus:bg-white transition-all font-semibold"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
              <Textarea
                value={taskFormModal.description}
                onChange={(e) => setTaskFormModal(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Détails additionnels sur les étapes à suivre..."
                className="bg-slate-50 border-slate-200 text-slate-900 text-xs rounded-xl focus:border-emerald-500 focus:ring-emerald-500/10 focus:bg-white transition-all resize-none h-20 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Statut */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Statut</label>
                <CustomSelect
                  value={taskFormModal.statut}
                  onChange={(val) => setTaskFormModal(prev => ({ ...prev, statut: val as TaskStatut }))}
                  options={[
                    { value: 'a_faire', label: 'À faire' },
                    { value: 'en_cours', label: 'En cours' },
                    { value: 'bloquee', label: 'Bloquée' },
                    { value: 'terminee', label: 'Terminée' },
                  ]}
                />
              </div>

              {/* Priorité */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priorité</label>
                <CustomSelect
                  value={taskFormModal.priorite}
                  onChange={(val) => setTaskFormModal(prev => ({ ...prev, priorite: val as TaskPriorite }))}
                  options={[
                    { value: 'basse', label: 'Basse' },
                    { value: 'normale', label: 'Normale' },
                    { value: 'haute', label: 'Haute' },
                    { value: 'urgente', label: 'Urgente' },
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Assignataire */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Agent Assigné</label>
                <CustomSelect
                  value={taskFormModal.assigneeId}
                  onChange={(val) => setTaskFormModal(prev => ({ ...prev, assigneeId: val }))}
                  placeholder="Non assignée"
                  options={[
                    { value: '', label: 'Non assignée' },
                    ...agents.map(agent => ({
                      value: agent.id,
                      label: agent.fullName || agent.email.split('@')[0]
                    }))
                  ]}
                />
              </div>

              {/* Date limite */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date Limite</label>
                <DatePicker
                  value={taskFormModal.deadline ? new Date(taskFormModal.deadline) : undefined}
                  onChange={(date) => {
                    if (date) {
                      const yyyy = date.getFullYear();
                      const mm = String(date.getMonth() + 1).padStart(2, '0');
                      const dd = String(date.getDate()).padStart(2, '0');
                      setTaskFormModal(prev => ({ ...prev, deadline: `${yyyy}-${mm}-${dd}` }));
                    } else {
                      setTaskFormModal(prev => ({ ...prev, deadline: '' }));
                    }
                  }}
                />
              </div>
            </div>

            {/* Commentaire de blocage */}
            {taskFormModal.statut === 'bloquee' && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Raison du blocage *</label>
                <Textarea
                  value={taskFormModal.bloqueCommentaire}
                  onChange={(e) => setTaskFormModal(prev => ({ ...prev, bloqueCommentaire: e.target.value }))}
                  placeholder="Expliquez brièvement pourquoi la tâche est bloquée..."
                  required={taskFormModal.statut === 'bloquee'}
                  className="bg-slate-50 text-slate-900 border-rose-300 focus:border-rose-500 focus:ring-rose-500/10 transition-all text-xs rounded-xl resize-none h-16 font-medium"
                />
              </div>
            )}

            {/* Actions buttons */}
            <div className="mt-5 border-t border-slate-100 pt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setTaskFormModal(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs h-10 font-bold rounded-xl cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-10 font-bold rounded-xl px-5 cursor-pointer shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-colors"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  taskFormModal.mode === 'create' ? 'Créer la tâche' : 'Sauvegarder les modifications'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
