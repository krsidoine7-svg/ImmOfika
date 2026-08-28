'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon, 
  SearchIcon, 
  FilterIcon, 
  TrashIcon, 
  UserIcon, 
  TrendingUpIcon, 
  MessageSquareIcon, 
  XIcon, 
  Loader2, 
  CheckIcon,
  FlameIcon,
  ChevronDown,
  Globe,
  MessageCircle,
  PhoneCall,
  Share2,
  Users,
  Calendar,
  Layers,
  ShieldAlert,
  AlertTriangleIcon
} from 'lucide-react'
import { 
  creerLeadManuelAction, 
  attribuerLeadManuelAction, 
  modifierStatutLeadAction, 
  supprimerLeadAction,
  creerLeadInteractionAction,
  getLeadInteractionsAction,
  getLeadImpactAction,
  modifierEtapeLeadAction,
  evaluerConditionsAction
} from '@/app/actions/leads'
import { 
  getLeadVisitesAction, 
  creerVisiteAction, 
  modifierVisiteAction 
} from '@/app/actions/visites'
import KanbanPipeline from '@/components/admin/KanbanPipeline'
import { TransitionGatingModal } from '@/components/admin/TransitionGatingModal'
import { PIPELINE_ETAPES, PipelineEtapeCode } from '@/constants/pipeline'
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import { CustomSelect } from "@/components/ui/custom-select"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"
import { DateRange } from "react-day-picker"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type LeadStatut = 'nouveau' | 'contacte' | 'qualifie' | 'converti' | 'perdu'
type LeadSource = 'site_web' | 'whatsapp' | 'appel' | 'reseaux_sociaux' | 'referral'

interface Profile {
  id: string
  fullName: string | null
  email: string
  role?: string
}

interface Bien {
  id: string
  titre: string
  ville?: string
}

interface Lead {
  id: string
  nom: string | null
  prenom: string | null
  telephone: string
  email: string | null
  source: LeadSource
  statut: LeadStatut
  etape: PipelineEtapeCode
  score: number
  bienInteresse: string | null
  agentId: string | null
  message: string | null
  visiteConfirmee: boolean
  offreValidee: boolean
  engagementSigne: boolean
  createdAt: Date | string
}

interface LeadsManagerClientProps {
  leads: Lead[]
  agents: Profile[]
  biens: Bien[]
}



const statutColors: Record<string, string> = {
  nouveau: 'bg-blue-50 border border-blue-200 text-blue-700',
  contacte: 'bg-amber-50 border border-amber-200 text-amber-700',
  qualifie: 'bg-indigo-50 border border-indigo-200 text-indigo-700',
  converti: 'bg-emerald-50 border border-emerald-200 text-emerald-700',
  perdu: 'bg-rose-50 border border-rose-200 text-rose-700',
}

const sourceLabels: Record<string, string> = {
  site_web: 'Site Web',
  whatsapp: 'WhatsApp',
  appel: 'Appel direct',
  reseaux_sociaux: 'Réseaux Sociaux',
  referral: 'Recommandation',
}

const sourceIcons: Record<string, React.ReactNode> = {
  site_web: <Globe className="w-3.5 h-3.5 text-emerald-600" />,
  whatsapp: <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />,
  appel: <PhoneCall className="w-3.5 h-3.5 text-blue-500" />,
  reseaux_sociaux: <Share2 className="w-3.5 h-3.5 text-indigo-500" />,
  referral: <Users className="w-3.5 h-3.5 text-purple-500" />,
}

export default function LeadsManagerClient({ leads: initialLeads, agents, biens }: LeadsManagerClientProps) {
  const [leadsList, setLeadsList] = React.useState<Lead[]>(initialLeads)
  
  // State pour la modal de transition conditionnelle (F12.1)
  const [gatingLead, setGatingLead] = React.useState<Lead | null>(null)
  const [gatingTargetEtape, setGatingTargetEtape] = React.useState<PipelineEtapeCode | null>(null)
  const [gatingConditions, setGatingConditions] = React.useState<any[]>([])
  const [peutForcerGating, setPeutForcerGating] = React.useState(false)
  const [isLoadingGating, setIsLoadingGating] = React.useState(false)

  const refreshGatingConditions = async () => {
    if (!gatingLead || !gatingTargetEtape) return
    try {
      const res = await evaluerConditionsAction(gatingLead.id, gatingTargetEtape)
      if (res.error) {
        toast.error(res.error)
      } else if (res.conditions) {
        setGatingConditions(res.conditions)
        if (res.peutForcer !== undefined) {
          setPeutForcerGating(res.peutForcer)
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur de mise à jour des conditions.")
    }
  }

  const handleConfirmGatedMove = async () => {
    if (!gatingLead || !gatingTargetEtape) return

    const leadId = gatingLead.id
    const newEtape = gatingTargetEtape
    const originalLeads = [...leadsList]

    // Optimistic UI update
    setLeadsList((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, etape: newEtape } : l))
    )

    try {
      const res = await modifierEtapeLeadAction(leadId, newEtape)
      if (res.error) {
        toast.error(res.error)
        setLeadsList(originalLeads)
      } else {
        toast.success('Étape du prospect mise à jour !')
        setGatingLead(null)
        setGatingTargetEtape(null)
      }
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du changement de phase.')
      setLeadsList(originalLeads)
    }
  }

  // State pour les filtres
  const [searchTerm, setSearchTerm] = React.useState('')
  const [viewMode, setViewMode] = React.useState<'table' | 'kanban'>('table')

  React.useEffect(() => {
    const saved = localStorage.getItem('crm_leads_view_mode')
    if (saved === 'table' || saved === 'kanban') {
      setViewMode(saved)
    }
  }, [])

  const handleToggleView = (mode: 'table' | 'kanban') => {
    setViewMode(mode)
    localStorage.setItem('crm_leads_view_mode', mode)
  }

  const handleLeadMove = async (leadId: string, newEtape: PipelineEtapeCode) => {
    const lead = leadsList.find(l => l.id === leadId)
    if (!lead) return

    try {
      const res = await evaluerConditionsAction(leadId, newEtape)
      if (res.error) {
        toast.error(res.error)
        return
      }

      if (res.conditions) {
        setGatingLead(lead)
        setGatingTargetEtape(newEtape)
        setGatingConditions(res.conditions)
        setPeutForcerGating(!!res.peutForcer)
      }
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'évaluation des conditions.')
    }
  }
  const [statusFilter, setStatusFilter] = React.useState('')
  const [sourceFilter, setSourceFilter] = React.useState('')
  const [agentFilter, setAgentFilter] = React.useState('')
  const [sortBy, setSortBy] = React.useState<'date' | 'score'>('date')
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)

  // State pour le modal d'ajout
  const [showAddModal, setShowAddModal] = React.useState(false)
  const [addingLead, setAddingLead] = React.useState(false)
  const [newLead, setNewLead] = React.useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    source: 'site_web' as 'site_web' | 'whatsapp' | 'appel' | 'reseaux_sociaux' | 'referral',
    bienInteresse: '',
    agentId: '',
    message: '',
  })

  // State pour le tiroir de détails d'un lead
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null)
  const [leadToDeleteId, setLeadToDeleteId] = React.useState<string | null>(null)
  
  // States pour la cartographie d'impact de suppression
  const [leadImpact, setLeadImpact] = React.useState<{
    interactionsCount: number
    propertyName: string | null
    agentName: string | null
  } | null>(null)
  const [loadingImpact, setLoadingImpact] = React.useState(false)

  React.useEffect(() => {
    if (leadToDeleteId) {
      const fetchImpact = async () => {
        setLoadingImpact(true)
        try {
          const res = await getLeadImpactAction(leadToDeleteId)
          if (res.success && res.impact) {
            setLeadImpact(res.impact)
          }
        } catch (e) {
          console.error(e)
        } finally {
          setLoadingImpact(false)
        }
      }
      fetchImpact()
    } else {
      setLeadImpact(null)
    }
  }, [leadToDeleteId])

  const [interactions, setInteractions] = React.useState<any[]>([])
  const [loadingInteractions, setLoadingInteractions] = React.useState(false)
  const [newInteraction, setNewInteraction] = React.useState({
    type: 'appel' as 'appel' | 'email' | 'whatsapp' | 'note',
    details: '',
  })
  const [submittingInteraction, setSubmittingInteraction] = React.useState(false)

  const [leadVisites, setLeadVisites] = React.useState<any[]>([])
  const [loadingVisites, setLoadingVisites] = React.useState(false)
  const [showAddVisitDrawer, setShowAddVisitDrawer] = React.useState(false)
  const [addingVisit, setAddingVisit] = React.useState(false)
  const [newVisit, setNewVisit] = React.useState({
    dateVisite: '',
    timeVisite: '10:00',
    agentId: '',
    commentaires: '',
  })

  // Validation du formulaire de visite rapide
  const isVisitFormValid = React.useMemo(() => {
    return (
      !!newVisit.dateVisite &&
      !!newVisit.timeVisite &&
      !!newVisit.agentId
    )
  }, [newVisit])

  React.useEffect(() => {
    if (selectedLead) {
      const fetchInteractions = async () => {
        setLoadingInteractions(true)
        try {
          const res = await getLeadInteractionsAction(selectedLead.id)
          if (res.success && res.interactions) {
            setInteractions(res.interactions)
          } else {
            toast.error(res.error || "Erreur de chargement des interactions")
          }
        } catch (e) {
          console.error(e)
        } finally {
          setLoadingInteractions(false)
        }
      }
      fetchInteractions()

      const fetchVisites = async () => {
        setLoadingVisites(true)
        try {
          const res = await getLeadVisitesAction(selectedLead.id)
          if (res.success && res.visites) {
            setLeadVisites(res.visites)
          }
        } catch (e) {
          console.error(e)
        } finally {
          setLoadingVisites(false)
        }
      }
      fetchVisites()
    } else {
      setInteractions([])
      setLeadVisites([])
      setNewInteraction({ type: 'appel', details: '' })
    }
  }, [selectedLead])

  const handleQuickCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLead) return
    if (!selectedLead.bienInteresse) {
      toast.error("Le prospect doit être intéressé par un bien pour planifier une visite.")
      return
    }
    if (!newVisit.dateVisite) {
      toast.error("Veuillez indiquer la date.")
      return
    }
    setAddingVisit(true)

    try {
      const combinedDateTime = `${newVisit.dateVisite}T${newVisit.timeVisite}:00`
      const res = await creerVisiteAction({
        leadId: selectedLead.id,
        bienId: selectedLead.bienInteresse,
        agentId: newVisit.agentId || null,
        dateVisite: combinedDateTime,
        statut: 'planifiee',
        commentaires: newVisit.commentaires || null,
      })

      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("Visite planifiée avec succès !")
        setShowAddVisitDrawer(false)
        setNewVisit({ dateVisite: '', timeVisite: '10:00', agentId: '', commentaires: '' })
        
        // Refresh visits list
        const resList = await getLeadVisitesAction(selectedLead.id)
        if (resList.success && resList.visites) {
          setLeadVisites(resList.visites)
        }
        
        // Refresh interactions
        const resInt = await getLeadInteractionsAction(selectedLead.id)
        if (resInt.success && resInt.interactions) {
          setInteractions(resInt.interactions)
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur de création.")
    } finally {
      setAddingVisit(false)
    }
  }

  const handleCreateInteraction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLead) return
    if (!newInteraction.details.trim()) {
      toast.error("Le compte-rendu est obligatoire.")
      return
    }
    setSubmittingInteraction(true)

    try {
      const res = await creerLeadInteractionAction({
        leadId: selectedLead.id,
        type: newInteraction.type,
        details: newInteraction.details,
      })

      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("Interaction enregistrée !")
        
        const created = res.interaction!
        const newRecord = {
          ...created,
          agentName: "Vous",
        }
        setInteractions((prev) => [newRecord, ...prev])
        setNewInteraction((prev) => ({ ...prev, details: '' }))
        
        const bonus = (newInteraction.type === 'appel' || newInteraction.type === 'whatsapp') ? 10 : 5
        setLeadsList((prev) => 
          prev.map((l) => {
            if (l.id === selectedLead.id) {
              const updated = { ...l, score: Math.min(l.score + bonus, 100) }
              setSelectedLead(updated)
              return updated
            }
            return l
          })
        )
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement.")
    } finally {
      setSubmittingInteraction(false)
    }
  }
  
  // State pour les actions asynchrones
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null)

  // Options des CustomSelects
  const statusOptions = [
    { value: '', label: 'Tous les statuts', icon: <Layers className="w-3.5 h-3.5 text-slate-400" /> },
    { value: 'nouveau', label: 'nouveau', icon: <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" /> },
    { value: 'contacte', label: 'contacté', icon: <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" /> },
    { value: 'qualifie', label: 'qualifié', icon: <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" /> },
    { value: 'converti', label: 'converti', icon: <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> },
    { value: 'perdu', label: 'perdu', icon: <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" /> },
  ]

  const sourceOptions = [
    { value: '', label: 'Toutes les sources', icon: <FilterIcon className="w-3.5 h-3.5 text-slate-400" /> },
    { value: 'site_web', label: 'Site Web', icon: <Globe className="w-3.5 h-3.5 text-emerald-600" /> },
    { value: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-3.5 h-3.5 text-emerald-500" /> },
    { value: 'appel', label: 'Appel direct', icon: <PhoneCall className="w-3.5 h-3.5 text-blue-500" /> },
    { value: 'reseaux_sociaux', label: 'Réseaux Sociaux', icon: <Share2 className="w-3.5 h-3.5 text-indigo-500" /> },
    { value: 'referral', label: 'Recommandation', icon: <Users className="w-3.5 h-3.5 text-purple-500" /> },
  ]

  const agentOptions = [
    { value: '', label: 'Tous les agents', icon: <UserIcon className="w-3.5 h-3.5 text-slate-400" /> },
    ...agents.map((agent) => ({
      value: agent.id,
      label: agent.fullName || agent.email,
      icon: <UserIcon className="w-3.5 h-3.5 text-slate-600" />
    }))
  ]

  const sortOptions = [
    { value: 'date', label: 'Trier par Date (Récent)', icon: <Calendar className="w-3.5 h-3.5 text-slate-400" /> },
    { value: 'score', label: 'Trier par Score (Maturité)', icon: <FlameIcon className="w-3.5 h-3.5 text-amber-500" /> },
  ]

  // Filtrage et Tri
  const filteredLeads = React.useMemo(() => {
    return leadsList
      .filter((lead) => {
        const fullString = `${lead.nom || ''} ${lead.prenom || ''} ${lead.telephone} ${lead.email || ''}`.toLowerCase()
        const matchesSearch = fullString.includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === '' || lead.statut === statusFilter
        const matchesSource = sourceFilter === '' || lead.source === sourceFilter
        const matchesAgent = agentFilter === '' || lead.agentId === agentFilter
        
        const matchesDate = !dateRange?.from || !dateRange?.to || (
          new Date(lead.createdAt) >= dateRange.from &&
          new Date(lead.createdAt) <= dateRange.to
        )
        
        return matchesSearch && matchesStatus && matchesSource && matchesAgent && matchesDate
      })
      .sort((a, b) => {
        if (sortBy === 'score') {
          return b.score - a.score
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [leadsList, searchTerm, statusFilter, sourceFilter, agentFilter, sortBy, dateRange])

  // 1. Soumission d'un nouveau lead manuel
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLead.telephone) {
      toast.error('Le numéro de téléphone est obligatoire.')
      return
    }
    setAddingLead(true)

    try {
      const res = await creerLeadManuelAction({
        ...newLead,
        bienInteresse: newLead.bienInteresse || undefined,
        agentId: newLead.agentId || undefined,
      })

      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Lead créé avec succès !')
        
        // Ajouter localement le lead créé pour éviter un rechargement complet
        const newlyCreatedLead: Lead = {
          id: res.leadId!,
          nom: newLead.nom || null,
          prenom: newLead.prenom || null,
          email: newLead.email || null,
          telephone: newLead.telephone,
          source: newLead.source,
          statut: 'nouveau',
          etape: 'prospect' as PipelineEtapeCode,
          score: 25,
          bienInteresse: newLead.bienInteresse || null,
          agentId: newLead.agentId || null,
          message: newLead.message || null,
          visiteConfirmee: false,
          offreValidee: false,
          engagementSigne: false,
          createdAt: new Date(),
        }

        setLeadsList((prev) => [newlyCreatedLead, ...prev])
        setShowAddModal(false)
        setNewLead({ nom: '', prenom: '', email: '', telephone: '', source: 'site_web', bienInteresse: '', agentId: '', message: '' })
      }
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création.')
    } finally {
      setAddingLead(false)
    }
  }

  // 2. Attribution manuelle d'un lead
  const handleAssignAgent = async (leadId: string, agentId: string) => {
    setActionLoadingId(leadId)
    const targetAgentId = agentId === 'aucun' ? null : agentId

    try {
      const res = await attribuerLeadManuelAction(leadId, targetAgentId)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Agent assigné avec succès !')
        setLeadsList((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, agentId: targetAgentId } : l))
        )
        if (selectedLead?.id === leadId) {
          setSelectedLead((prev) => prev ? { ...prev, agentId: targetAgentId } : null)
        }
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setActionLoadingId(null)
    }
  }

  // 3. Modification du statut d'un lead
  const handleUpdateStatus = async (leadId: string, statut: LeadStatut) => {
    setActionLoadingId(leadId)

    try {
      const res = await modifierStatutLeadAction(leadId, statut)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Statut mis à jour avec succès !')
        setLeadsList((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, statut } : l))
        )
        if (selectedLead?.id === leadId) {
          setSelectedLead((prev) => prev ? { ...prev, statut } : null)
        }
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setActionLoadingId(null)
    }
  }

  // 4. Soft Delete d'un lead (Exécuté après confirmation dans le modal)
  const confirmDeleteLead = async () => {
    if (!leadToDeleteId) return
    setActionLoadingId(leadToDeleteId)

    try {
      const res = await supprimerLeadAction(leadToDeleteId)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Prospect supprimé avec succès.')
        setLeadsList((prev) => prev.filter((l) => l.id !== leadToDeleteId))
        if (selectedLead?.id === leadToDeleteId) {
          setSelectedLead(null)
        }
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setActionLoadingId(null)
      setLeadToDeleteId(null)
    }
  }

  const handleCopyContactLink = () => {
    const contactUrl = typeof window !== 'undefined' ? `${window.location.origin}/contact` : 'https://immofika.ci/contact'
    navigator.clipboard.writeText(contactUrl)
      .then(() => {
        toast.success('Lien de capture copié ! Envoyez-le par WhatsApp ou E-mail.')
      })
      .catch((err) => {
        console.error('Erreur de copie:', err)
        toast.error('Impossible de copier le lien.')
      })
  }

  // Calcul des statistiques pour les cartes KPI de prestige
  const totalLeads = leadsList.length
  const averageScore = totalLeads ? Math.round(leadsList.reduce((acc, l) => acc + l.score, 0) / totalLeads) : 0
  const hotLeads = leadsList.filter((l) => l.score >= 70).length
  const assignedLeadsCount = leadsList.filter((l) => l.agentId).length

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* En-tête de page */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            CRM Leads & Prospects
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-bold">
              {leadsList.length} Prospect{leadsList.length > 1 ? 's' : ''}
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Gérez, notez, et attribuez vos opportunités d'affaires en temps réel.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleCopyContactLink}
            className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm h-12 px-6 rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto shadow-sm"
          >
            <Share2 className="w-4 h-4 text-slate-400" />
            <span>Partager le lien</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm h-12 px-6 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Nouveau Prospect</span>
          </button>
        </div>
      </div>

      {/* Cartes KPIs de Prestige */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 : Total Leads */}
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Prospects Totaux</span>
            <span className="text-3xl font-black text-slate-900 block">{totalLeads}</span>
            <span className="text-[10px] text-slate-400 block font-medium">Enregistrés dans le CRM</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <UserIcon className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2 : Maturité Moyenne */}
        <div className="bg-gradient-to-br from-emerald-50/30 to-white rounded-2xl border border-emerald-100/50 p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Maturité Moyenne</span>
            <span className="text-3xl font-black text-emerald-700 block">{averageScore}%</span>
            <span className="text-[10px] text-slate-400 block font-medium">Score global d'intérêt</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <TrendingUpIcon className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3 : Prospects Chauds */}
        <div className="bg-gradient-to-br from-emerald-50/30 to-white rounded-2xl border border-emerald-100 p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Prospects Chauds</span>
            <span className="text-3xl font-black text-emerald-600 block">{hotLeads}</span>
            <span className="inline-flex items-center text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded-md mt-1">
              Score ≥ 70%
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <FlameIcon className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4 : Attribution Rate */}
        <div className="bg-gradient-to-br from-indigo-50/20 to-white rounded-2xl border border-indigo-100 p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Leads Assignés</span>
            <span className="text-3xl font-black text-indigo-600 block">{assignedLeadsCount}</span>
            <span className="text-[10px] text-slate-400 block font-medium">
              {totalLeads ? Math.round((assignedLeadsCount / totalLeads) * 100) : 0}% du total qualifié
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-500">
            <UserIcon className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Sélecteur de Vue */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => handleToggleView('table')}
          className={`py-3 px-6 border-b-2 font-bold text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 ${
            viewMode === 'table'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span>Vue Tableau</span>
        </button>
        <button
          onClick={() => handleToggleView('kanban')}
          className={`py-3 px-6 border-b-2 font-bold text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 ${
            viewMode === 'kanban'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span>Vue Pipeline (Kanban)</span>
        </button>
      </div>

      {/* Statistiques de progression du pipeline (Funnel de conversion) */}
      {viewMode === 'kanban' && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h4 className="text-sm font-bold tracking-tight text-emerald-400 uppercase">Entonnoir de Conversion</h4>
            <p className="text-[11px] text-slate-300 font-medium">Visualisation de la progression de vos opportunités d'affaires à travers les 8 étapes du pipeline.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 shrink-0">
            {PIPELINE_ETAPES.map((etape) => {
              const count = leadsList.filter(l => l.etape === etape.code).length
              const pct = totalLeads ? Math.round((count / totalLeads) * 100) : 0
              return (
                <div key={etape.code} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-center min-w-[95px] shadow-sm">
                  <div className="text-[10px] font-bold text-slate-300 truncate max-w-[85px]">{etape.nom}</div>
                  <div className="text-lg font-black mt-1 text-emerald-400">{count}</div>
                  <div className="text-[9px] text-slate-400 font-semibold">{pct}%</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Barre de filtres CRM */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 items-center">
          
          {/* Recherche textuelle */}
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher nom, téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none text-xs text-slate-800 transition-all"
            />
          </div>

          {/* Filtre statut */}
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            placeholder="Tous les statuts"
          />

          {/* Filtre source */}
          <CustomSelect
            value={sourceFilter}
            onChange={setSourceFilter}
            options={sourceOptions}
            placeholder="Toutes les sources"
          />

          {/* Filtre agent */}
          <CustomSelect
            value={agentFilter}
            onChange={setAgentFilter}
            options={agentOptions}
            placeholder="Tous les agents"
          />

          {/* Tri par */}
          <CustomSelect
            value={sortBy}
            onChange={(val) => setSortBy(val as 'date' | 'score')}
            options={sortOptions}
            placeholder="Trier par"
          />

          {/* Intervalle de dates */}
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder="Période de création"
          />

          {/* Bouton réinitialiser */}
          <button
            type="button"
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('')
              setSourceFilter('')
              setAgentFilter('')
              setSortBy('date')
              setDateRange(undefined)
            }}
            disabled={!searchTerm && !statusFilter && !sourceFilter && !agentFilter && sortBy === 'date' && !dateRange}
            className="h-8 px-3 rounded-lg border border-slate-200 hover:border-rose-200 hover:bg-rose-50/30 text-slate-500 hover:text-rose-600 disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:bg-transparent disabled:hover:text-slate-400 font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed w-fit justify-self-center lg:justify-self-end"
          >
            <XIcon className="w-3 h-3" />
            <span>Réinitialiser</span>
          </button>

        </div>
      </div>

      {/* Grille/Tableau des Leads / Pipeline */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nom Complet / Contact</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Maturité (Score)</th>
                  <th className="px-6 py-4">Agent Attribué</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLeads.map((lead) => {
                  const assignedAgent = agents.find((a) => a.id === lead.agentId)
                  const associatedProperty = biens.find((b) => b.id === lead.bienInteresse)

                  return (
                    <motion.tr
                      key={lead.id}
                      layout
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      {/* Nom & Téléphone */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {lead.nom || lead.prenom ? `${lead.prenom || ''} ${lead.nom || ''}`.trim() : 'Prospect Anonyme'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">{lead.telephone}</div>
                        {lead.email && <div className="text-[10px] text-slate-400 font-medium">{lead.email}</div>}
                      </td>

                      {/* Source */}
                      {/* Identité prospect */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {lead.nom || lead.prenom ? `${lead.prenom || ''} ${lead.nom || ''}`.trim() : 'Prospect Anonyme'}
                          </div>
                          <div className="text-[11px] text-slate-400 font-normal">
                            {lead.telephone} {lead.email && `• ${lead.email}`}
                          </div>
                        </div>
                      </td>

                      {/* Source & Bien rattaché */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[11px] text-slate-600 font-semibold">
                            {sourceIcons[lead.source]}
                            <span>{sourceLabels[lead.source] || lead.source}</span>
                          </div>
                          {associatedProperty ? (
                            <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block max-w-[150px] truncate" title={associatedProperty.titre}>
                              {associatedProperty.titre}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-300 italic">Aucun bien rattaché</span>
                          )}
                        </div>
                      </td>

                      {/* Score de Maturité (Funnel) */}
                      <td className="px-6 py-4">
                        <div className="space-y-1 w-[120px]">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                            <span>{lead.score}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                lead.score >= 80 ? 'bg-emerald-500' :
                                lead.score >= 50 ? 'bg-teal-500' : 'bg-slate-400'
                              }`}
                              style={{ width: `${lead.score}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Agent Assigné */}
                      <td className="px-6 py-4">
                        <CustomSelect
                          size="sm"
                          value={lead.agentId || 'aucun'}
                          onChange={(val) => handleAssignAgent(lead.id, val)}
                          options={[
                            { value: 'aucun', label: 'Non attribué', icon: <UserIcon className="w-3.5 h-3.5 text-slate-400" /> },
                            ...agents.map((agent) => ({
                              value: agent.id,
                              label: agent.fullName || agent.email,
                              icon: <UserIcon className="w-3.5 h-3.5 text-slate-600" />
                            }))
                          ]}
                          className="w-[140px]"
                        />
                      </td>

                      {/* Statut (Pillule colorée de prestige) */}
                      <td className="px-6 py-4 capitalize">
                        <CustomSelect
                          size="sm"
                          value={lead.statut}
                          onChange={(val) => handleUpdateStatus(lead.id, val as LeadStatut)}
                          options={[
                            { value: 'nouveau', label: 'nouveau', icon: <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" /> },
                            { value: 'contacte', label: 'contacté', icon: <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" /> },
                            { value: 'qualifie', label: 'qualifié', icon: <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" /> },
                            { value: 'converti', label: 'converti', icon: <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" /> },
                            { value: 'perdu', label: 'perdu', icon: <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" /> },
                          ]}
                          triggerClassName={`font-bold rounded-full px-2.5 py-1 text-[10px] flex items-center justify-between gap-1 w-[96px] cursor-pointer outline-none transition-all shadow-sm ${statutColors[lead.statut] || 'bg-gray-100'}`}
                          className="w-[96px]"
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="h-8 px-3 rounded-lg border border-slate-200 hover:border-emerald-500 text-slate-700 hover:text-emerald-700 font-semibold text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <MessageSquareIcon className="w-3.5 h-3.5" />
                            <span>Détails</span>
                          </button>
                          <button
                            disabled={actionLoadingId === lead.id}
                            onClick={() => setLeadToDeleteId(lead.id)}
                            className="h-8 w-8 rounded-lg border border-slate-100 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-all flex items-center justify-center cursor-pointer shrink-0"
                            title="Supprimer le prospect"
                          >
                            {actionLoadingId === lead.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <TrashIcon className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}

                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-slate-400 font-medium">
                      Aucun prospect ne correspond à vos critères de recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <KanbanPipeline
          leads={filteredLeads}
          agents={agents}
          biens={biens}
          onLeadMove={handleLeadMove}
          onSelectLead={(lead) => setSelectedLead(lead as Lead)}
        />
      )}

      {/* Modal / Dialog de Création Manuelle */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <XIcon className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2">
                <span>Créer un prospect manuellement</span>
              </h3>

              <form onSubmit={handleCreateLead} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Prénom</label>
                    <input
                      type="text"
                      placeholder="Ex: Koffi"
                      value={newLead.prenom}
                      onChange={(e) => setNewLead((prev) => ({ ...prev, prenom: e.target.value }))}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none text-xs text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Nom</label>
                    <input
                      type="text"
                      placeholder="Ex: Renaud"
                      value={newLead.nom}
                      onChange={(e) => setNewLead((prev) => ({ ...prev, nom: e.target.value }))}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Téléphone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: +225 07 07 07 07 07"
                    value={newLead.telephone}
                    onChange={(e) => setNewLead((prev) => ({ ...prev, telephone: e.target.value }))}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">E-mail</label>
                  <input
                    type="email"
                    placeholder="Ex: k.renaud@exemple.com"
                    value={newLead.email}
                    onChange={(e) => setNewLead((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none text-xs text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Source</label>
                    <CustomSelect
                      value={newLead.source}
                      onChange={(val) => setNewLead((prev) => ({ ...prev, source: val as any }))}
                      options={[
                        { value: 'appel', label: 'Appel direct', icon: <PhoneCall className="w-3.5 h-3.5 text-blue-500" /> },
                        { value: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-3.5 h-3.5 text-emerald-500" /> },
                        { value: 'site_web', label: 'Site Web', icon: <Globe className="w-3.5 h-3.5 text-emerald-600" /> },
                        { value: 'reseaux_sociaux', label: 'Réseaux Sociaux', icon: <Share2 className="w-3.5 h-3.5 text-indigo-500" /> },
                        { value: 'referral', label: 'Recommandation', icon: <Users className="w-3.5 h-3.5 text-purple-500" /> },
                      ]}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Bien intéressé</label>
                    <CustomSelect
                      value={newLead.bienInteresse}
                      onChange={(val) => setNewLead((prev) => ({ ...prev, bienInteresse: val }))}
                      options={[
                        { value: '', label: 'Aucun bien particulier' },
                        ...biens.map((b) => ({
                          value: b.id,
                          label: `${b.titre} (${b.ville})`
                        }))
                      ]}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Agent assigné d'office</label>
                  <CustomSelect
                    value={newLead.agentId}
                    onChange={(val) => setNewLead((prev) => ({ ...prev, agentId: val }))}
                    options={[
                      { value: '', label: 'Laisser le Round-Robin choisir', icon: <Users className="w-3.5 h-3.5 text-slate-400" /> },
                      ...agents.map((a) => ({
                        value: a.id,
                        label: a.fullName || a.email,
                        icon: <UserIcon className="w-3.5 h-3.5 text-slate-600" />
                      }))
                    ]}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Note / Message</label>
                  <textarea
                    rows={3}
                    placeholder="Saisissez un commentaire sur ce prospect..."
                    value={newLead.message}
                    onChange={(e) => setNewLead((prev) => ({ ...prev, message: e.target.value }))}
                    className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none text-xs text-slate-800 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingLead}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-6"
                >
                  {addingLead ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      <span>Ajouter le prospect</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tiroir de détails d'un lead */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end p-4"
            onClick={() => setSelectedLead(null)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-[#F8F6F1] h-full max-w-md w-full shadow-2xl relative p-6 flex flex-col justify-between overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                
                {/* En-tête tiroir */}
                <div className="flex justify-between items-start border-b border-slate-200/50 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Fiche Prospect</span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      {selectedLead.nom || selectedLead.prenom ? `${selectedLead.prenom || ''} ${selectedLead.nom || ''}`.trim() : 'Prospect Anonyme'}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">Créé le {new Date(selectedLead.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="h-8 w-8 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Score */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                      <TrendingUpIcon className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Score de maturité</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Calculé automatiquement</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-slate-900">
                    {selectedLead.score} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                  </span>
                </div>

                {/* Coordonnées détaillées */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-50 pb-2">Informations de contact</h4>
                  <div className="space-y-3 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Téléphone :</span>
                      <a href={`tel:${selectedLead.telephone}`} className="font-bold text-slate-900 hover:underline">
                        {selectedLead.telephone}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Adresse E-mail :</span>
                      {selectedLead.email ? (
                        <a href={`mailto:${selectedLead.email}`} className="font-bold text-slate-900 hover:underline">
                          {selectedLead.email}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Non fournie</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Source :</span>
                      <span className="font-semibold text-slate-900">
                        {sourceLabels[selectedLead.source] || selectedLead.source}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bien intéressé si présent */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-50 pb-2">Bien d'intérêt ciblé</h4>
                  {selectedLead.bienInteresse ? (
                    <div className="text-xs">
                      {(() => {
                        const bien = biens.find((b) => b.id === selectedLead.bienInteresse)
                        if (!bien) return <span className="text-slate-400 italic">Bien supprimé ou introuvable</span>
                        return (
                          <div className="space-y-2">
                            <p className="font-bold text-slate-900">{bien.titre}</p>
                            <p className="text-slate-500">{bien.ville}</p>
                          </div>
                        )
                      })()}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Aucun bien ciblé en particulier</span>
                  )}
                </div>

                {/* Section Visites du Prospect */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Visites de ce Prospect</h4>
                    <button
                      type="button"
                      onClick={() => setShowAddVisitDrawer(true)}
                      className="text-[10px] text-emerald-700 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      + Planifier
                    </button>
                  </div>

                  {loadingVisites ? (
                    <div className="flex items-center justify-center py-4 text-slate-400 gap-2 text-xs">
                      <Loader2 className="w-4 h-4 animate-spin animate-spin-fast" />
                      <span>Chargement...</span>
                    </div>
                  ) : leadVisites.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">Aucune visite planifiée pour le moment</span>
                  ) : (
                    <div className="space-y-3.5">
                      {leadVisites.map((vis) => {
                        const vDate = new Date(vis.dateVisite)
                        const formattedD = vDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ' à ' + vDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                        
                        return (
                          <div key={vis.id} className="text-xs p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between gap-2.5">
                            <div className="flex items-center justify-between">
                              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                                vis.statut === 'effectuee' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                vis.statut === 'annulee' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                vis.statut === 'client_absent' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                'bg-blue-50 text-blue-700 border border-blue-100'
                              }`}>
                                {vis.statut === 'planifiee' ? 'Planifiée' : 
                                 vis.statut === 'confirmee' ? 'Confirmée' : 
                                 vis.statut === 'effectuee' ? 'Effectuée' : 
                                 vis.statut === 'annulee' ? 'Annulée' : 'Absent'}
                              </span>
                              <span className="text-[10px] text-slate-500 font-bold">{formattedD}</span>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="font-bold text-slate-900">{vis.bienTitre}</p>
                              <p className="text-[10px] text-slate-500">Agent : {vis.agentName || 'Non assigné'}</p>
                              {vis.commentaires && (
                                <p className="text-[10px] text-slate-500 italic bg-white p-1.5 rounded border border-slate-100">
                                  {vis.commentaires}
                                </p>
                              )}
                            </div>

                            {/* Actions rapides pour changer le statut de la visite */}
                            {vis.statut !== 'effectuee' && vis.statut !== 'annulee' && (
                              <div className="flex gap-1.5 border-t border-slate-200/50 pt-2">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const rep = prompt("Rapport de visite (optionnel) :")
                                    if (rep === null) return
                                    const res = await modifierVisiteAction({ id: vis.id, statut: 'effectuee', commentaires: rep })
                                    if (res.error) toast.error(res.error)
                                    else {
                                      toast.success("Visite effectuée !")
                                      // Refresh
                                      const resList = await getLeadVisitesAction(selectedLead.id)
                                      if (resList.success && resList.visites) setLeadVisites(resList.visites)
                                      // Refresh lead lists to fetch updated gating states
                                      try {
                                        const resLeads = await getLeadInteractionsAction(selectedLead.id)
                                        if (resLeads.success) setInteractions(resLeads.interactions)
                                      } catch (e) {}
                                    }
                                  }}
                                  className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9px] font-bold cursor-pointer"
                                >
                                  Marquer Effectuée
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const rep = prompt("Motif de l'annulation :")
                                    if (!rep) return
                                    const res = await modifierVisiteAction({ id: vis.id, statut: 'annulee', commentaires: rep })
                                    if (res.error) toast.error(res.error)
                                    else {
                                      toast.success("Visite annulée.")
                                      const resList = await getLeadVisitesAction(selectedLead.id)
                                      if (resList.success && resList.visites) setLeadVisites(resList.visites)
                                    }
                                  }}
                                  className="flex-1 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[9px] font-bold cursor-pointer"
                                >
                                  Annuler
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}</div>

                {/* Note / Message */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-50 pb-2">Message initial ou notes</h4>
                  {selectedLead.message ? (
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedLead.message}</p>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Aucune note de message renseignée.</p>
                  )}
                </div>

                {/* Historique des interactions & Journal de suivi */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Journal de suivi & Échanges</h4>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold px-2 py-0.5 rounded-full uppercase">
                      {interactions.length} interaction{interactions.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Formulaire rapide pour log une interaction */}
                  <form onSubmit={handleCreateInteraction} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wide">Nouvel échange</span>
                      
                      <CustomSelect
                        value={newInteraction.type}
                        onChange={(val) => setNewInteraction(prev => ({ ...prev, type: val as any }))}
                        options={[
                          { value: "appel", label: "📞 Appel téléphonique" },
                          { value: "whatsapp", label: "💬 WhatsApp" },
                          { value: "email", label: "✉️ E-mail" },
                          { value: "note", label: "📝 Note interne" },
                        ]}
                        size="sm"
                        className="w-[170px]"
                      />
                    </div>

                    <textarea
                      rows={2}
                      required
                      placeholder="Résumé de l'échange..."
                      value={newInteraction.details}
                      onChange={(e) => setNewInteraction(prev => ({ ...prev, details: e.target.value }))}
                      className="w-full p-2.5 rounded-xl border border-slate-100 focus:border-emerald-500 outline-none text-xs text-slate-700 resize-none"
                    />

                    <button
                      type="submit"
                      disabled={submittingInteraction}
                      className="w-full h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {submittingInteraction ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <span>Enregistrer l'échange (+{newInteraction.type === 'appel' || newInteraction.type === 'whatsapp' ? '10' : '5'} pts)</span>
                      )}
                    </button>
                  </form>

                  {/* Timeline chronologique */}
                  <div className="space-y-3">
                    {loadingInteractions ? (
                      <div className="flex items-center justify-center py-6 text-slate-400 gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs">Chargement de l'historique...</span>
                      </div>
                    ) : interactions.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs italic bg-white rounded-2xl border border-slate-100">
                        Aucun échange n'a encore été enregistré pour ce prospect.
                      </div>
                    ) : (
                      <div className="relative pl-4 border-l-2 border-slate-200/60 ml-2 space-y-4 py-1">
                        {interactions.map((interaction) => {
                          const dateObj = new Date(interaction.createdAt)
                          const formattedDate = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ' à ' + dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                          
                          let icon = '📝'
                          let typeLabel = 'Note'
                          let bgBadge = 'bg-slate-100 text-slate-700'
                          
                          if (interaction.type === 'appel') {
                            icon = '📞'
                            typeLabel = 'Appel'
                            bgBadge = 'bg-blue-50 text-blue-700 border border-blue-100'
                          } else if (interaction.type === 'whatsapp') {
                            icon = '💬'
                            typeLabel = 'WhatsApp'
                            bgBadge = 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          } else if (interaction.type === 'email') {
                            icon = '✉️'
                            typeLabel = 'E-mail'
                            bgBadge = 'bg-amber-50 text-amber-700 border border-amber-100'
                          }

                          return (
                            <div key={interaction.id} className="relative space-y-1">
                              <div className="absolute -left-[23px] top-0 w-4 h-4 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-[8px] shadow-sm">
                                {icon}
                              </div>

                              <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${bgBadge}`}>
                                    {typeLabel}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-medium">
                                    {formattedDate}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                  {interaction.details}
                                </p>
                                <div className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                                  <span>Par :</span>
                                  <span className="text-slate-900">{interaction.agentName || "Agent"}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Pied de tiroir avec actions */}
              <div className="border-t border-slate-200/50 pt-4 flex gap-3 mt-6">
                <button
                  onClick={() => setLeadToDeleteId(selectedLead.id)}
                  className="flex-1 h-12 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Fermer
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmation de Suppression de Prestige (Shadcn Dialog) */}
      {(() => {
        const leadToConfirm = leadsList.find(l => l.id === leadToDeleteId)
        const prospectName = leadToConfirm ? `${leadToConfirm.prenom || ''} ${leadToConfirm.nom || ''}`.trim() : 'Ce prospect'
        
        return (
          <Dialog open={!!leadToDeleteId} onOpenChange={(isOpen) => !isOpen && setLeadToDeleteId(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangleIcon className="h-5 w-5" />
                  Supprimer le prospect
                </DialogTitle>
                <DialogDescription>
                  Vous êtes sur le point de supprimer le prospect <strong>{prospectName}</strong>. Cette action effectuera une suppression logique.
                </DialogDescription>
              </DialogHeader>

              {/* Radiographie d'impact */}
              <div className="py-4">
                {loadingImpact ? (
                  <div className="flex items-center justify-center py-4 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Analyse de l&apos;impact en cours...
                  </div>
                ) : leadImpact ? (
                  (() => {
                    const totalImpact = leadImpact.interactionsCount + (leadImpact.agentName ? 1 : 0) + (leadImpact.propertyName ? 1 : 0)
                    return (
                      <div className={`p-4 rounded-lg border ${totalImpact > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                        <h4 className={`font-semibold mb-3 text-sm ${totalImpact > 0 ? 'text-red-800' : 'text-gray-700'}`}>
                          <ShieldAlert className="h-4 w-4 inline mr-1" />
                          Radiographie d&apos;impact
                        </h4>
                        
                        {totalImpact === 0 ? (
                          <p className="text-sm text-gray-600">
                            Aucune donnée rattachée. La suppression se fera sans impact.
                          </p>
                        ) : (
                          <ul className="text-sm space-y-2 text-red-700">
                            {leadImpact.interactionsCount > 0 && (
                              <li className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                                <span><strong>{leadImpact.interactionsCount}</strong> échange(s) commercial(aux) supprimé(s)</span>
                              </li>
                            )}
                            {leadImpact.agentName && (
                              <li className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                                <span>Retiré du portefeuille de <strong>{leadImpact.agentName}</strong></span>
                              </li>
                            )}
                            {leadImpact.propertyName && (
                              <li className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                <span>Intérêt pour le bien <strong>{leadImpact.propertyName}</strong> archivé</span>
                              </li>
                            )}
                          </ul>
                        )}
                      </div>
                    )
                  })()
                ) : null}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setLeadToDeleteId(null)}>
                  Annuler
                </Button>
                <Button 
                  type="button" 
                  variant="destructive" 
                  disabled={actionLoadingId === leadToDeleteId}
                  onClick={confirmDeleteLead}
                >
                  {actionLoadingId === leadToDeleteId ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Suppression...
                    </>
                  ) : (
                    'Confirmer la suppression'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      })()}

      {/* Modal de planification rapide de visite */}
      <Dialog open={showAddVisitDrawer} onOpenChange={setShowAddVisitDrawer}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-extrabold text-sm tracking-tight">Planifier une Visite</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Programmez une visite pour ce prospect. Le bien intéressé est sélectionné par défaut.
            </DialogDescription>
          </DialogHeader>

          {selectedLead && selectedLead.bienInteresse ? (
            <form onSubmit={handleQuickCreateVisit} className="space-y-4">
              <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Bien ciblé</span>
                <span className="font-bold text-slate-900">
                  {biens.find(b => b.id === selectedLead.bienInteresse)?.titre || "Bien ciblé"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Date *</label>
                  <DatePicker
                    value={newVisit.dateVisite ? new Date(newVisit.dateVisite) : undefined}
                    onChange={(date) => {
                      if (date) {
                        const yyyy = date.getFullYear();
                        const mm = String(date.getMonth() + 1).padStart(2, '0');
                        const dd = String(date.getDate()).padStart(2, '0');
                        setNewVisit(prev => ({ ...prev, dateVisite: `${yyyy}-${mm}-${dd}` }));
                      } else {
                        setNewVisit(prev => ({ ...prev, dateVisite: '' }));
                      }
                    }}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Heure *</label>
                  <TimePicker
                    value={newVisit.timeVisite}
                    onChange={(time) => setNewVisit(prev => ({ ...prev, timeVisite: time }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Agent Accompagnateur</label>
                <CustomSelect
                  value={newVisit.agentId}
                  onChange={(val) => setNewVisit(prev => ({ ...prev, agentId: val }))}
                  options={[
                    { value: '', label: 'Aucun agent' },
                    ...agents.map(a => ({
                      value: a.id,
                      label: a.fullName || a.email
                    }))
                  ]}
                  className="w-full"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Notes / Consignes</label>
                <Textarea
                  rows={2}
                  placeholder="Notes particulières..."
                  value={newVisit.commentaires}
                  onChange={(e) => setNewVisit(prev => ({ ...prev, commentaires: e.target.value }))}
                  className="text-xs"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddVisitDrawer(false)}>
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={addingVisit || !isVisitFormValid} 
                  size="sm" 
                  className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingVisit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Planifier"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="py-4 text-center text-xs text-rose-600 bg-rose-50 rounded-xl p-4 border border-rose-200">
              Veuillez associer un bien d'intérêt à ce prospect dans sa fiche avant de planifier une visite.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {gatingLead && gatingTargetEtape && (
        <TransitionGatingModal
          isOpen={!!gatingLead}
          onClose={() => {
            setGatingLead(null)
            setGatingTargetEtape(null)
          }}
          leadId={gatingLead.id}
          leadNom={gatingLead.nom || gatingLead.prenom ? `${gatingLead.prenom || ''} ${gatingLead.nom || ''}`.trim() : 'Prospect Anonyme'}
          currentEtapeLabel={PIPELINE_ETAPES.find(e => e.code === gatingLead.etape)?.nom || gatingLead.etape || ''}
          targetEtapeLabel={PIPELINE_ETAPES.find(e => e.code === gatingTargetEtape)?.nom || gatingTargetEtape}
          targetEtapeCode={gatingTargetEtape}
          conditions={gatingConditions}
          peutForcer={peutForcerGating}
          onConfirm={handleConfirmGatedMove}
          onRefreshConditions={refreshGatingConditions}
        />
      )}

    </div>
  )
}
