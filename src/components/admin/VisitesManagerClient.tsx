'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon, 
  SearchIcon, 
  FilterIcon, 
  TrashIcon, 
  UserIcon, 
  CalendarIcon, 
  ClockIcon,
  MapPinIcon,
  XIcon, 
  Loader2, 
  CheckIcon,
  Layers,
  MessageSquareIcon,
  ShieldAlert,
  AlertTriangleIcon,
  BuildingIcon
} from 'lucide-react'
import { 
  creerVisiteAction, 
  modifierVisiteAction, 
  supprimerVisiteAction,
  getVisiteImpactAction
} from '@/app/actions/visites'
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

type VisiteStatut = 'planifiee' | 'confirmee' | 'effectuee' | 'annulee' | 'client_absent'

interface Profile {
  id: string
  fullName: string | null
  email: string
}

interface Bien {
  id: string
  titre: string
  ville: string
}

interface Lead {
  id: string
  nom: string | null
  prenom: string | null
  telephone: string
}

interface Visite {
  id: string
  leadId: string | null
  clientId: string | null
  bienId: string
  agentId: string | null
  dateVisite: string | Date
  statut: VisiteStatut
  commentaires: string | null
  createdAt: string | Date
  bien: {
    id: string
    titre: string
    ville: string
  }
  agent: {
    id: string
    fullName: string | null
    email: string
  } | null
  client: {
    id: string
    fullName: string | null
    email: string
    phone: string | null
  } | null
  lead: {
    id: string
    nom: string | null
    prenom: string | null
    telephone: string
    email: string | null
  } | null
}

interface VisitesManagerClientProps {
  initialVisites: Visite[]
  agents: Profile[]
  clients: Profile[]
  leads: Lead[]
  biens: Bien[]
}

const statutColors: Record<VisiteStatut, string> = {
  planifiee: 'bg-blue-50 border border-blue-200 text-blue-700',
  confirmee: 'bg-indigo-50 border border-indigo-200 text-indigo-700',
  effectuee: 'bg-emerald-50 border border-emerald-200 text-emerald-700',
  annulee: 'bg-rose-50 border border-rose-200 text-rose-700',
  client_absent: 'bg-amber-50 border border-amber-200 text-amber-700',
}

const statutLabels: Record<VisiteStatut, string> = {
  planifiee: 'Planifiée',
  confirmee: 'Confirmée',
  effectuee: 'Effectuée',
  annulee: 'Annulée',
  client_absent: 'Client Absent',
}

export default function VisitesManagerClient({
  initialVisites,
  agents,
  clients,
  leads,
  biens,
}: VisitesManagerClientProps) {
  const [visitesList, setVisitesList] = React.useState<Visite[]>(initialVisites)
  
  // Filtres
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('')
  const [agentFilter, setAgentFilter] = React.useState('')
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)

  // Modals et tiroirs
  const [showAddModal, setShowAddModal] = React.useState(false)
  const [addingVisite, setAddingVisite] = React.useState(false)
  const [selectedVisite, setSelectedVisite] = React.useState<Visite | null>(null)
  
  // Type de lien de la visite (Lead ou Client direct)
  const [linkType, setLinkType] = React.useState<'lead' | 'client'>('lead')

  // Formulaire d'ajout
  const [newVisite, setNewVisite] = React.useState({
    leadId: '',
    clientId: '',
    bienId: '',
    agentId: '',
    dateVisite: '',
    timeVisite: '10:00',
    commentaires: '',
  })

  // Validation du formulaire de planification
  const isFormValid = React.useMemo(() => {
    const hasClientOrLead = linkType === 'lead' ? !!newVisite.leadId : !!newVisite.clientId
    return (
      hasClientOrLead &&
      !!newVisite.bienId &&
      !!newVisite.agentId &&
      !!newVisite.dateVisite &&
      !!newVisite.timeVisite
    )
  }, [newVisite, linkType])

  // Suppression
  const [visiteToDeleteId, setVisiteToDeleteId] = React.useState<string | null>(null)
  const [loadingImpact, setLoadingImpact] = React.useState(false)
  const [visiteImpact, setVisiteImpact] = React.useState<any | null>(null)
  const [deletingVisite, setDeletingVisite] = React.useState(false)

  // Rapport de visite (clôture)
  const [closingReport, setClosingReport] = React.useState('')
  const [closingStatus, setClosingStatus] = React.useState<VisiteStatut>('effectuee')
  const [updatingStatus, setUpdatingStatus] = React.useState(false)

  // Charger la radiographie d'impact
  React.useEffect(() => {
    if (visiteToDeleteId) {
      const fetchImpact = async () => {
        setLoadingImpact(true)
        try {
          const res = await getVisiteImpactAction(visiteToDeleteId)
          if (res.success && res.impact) {
            setVisiteImpact(res.impact)
          }
        } catch (e) {
          console.error(e)
        } finally {
          setLoadingImpact(false)
        }
      }
      fetchImpact()
    } else {
      setVisiteImpact(null)
    }
  }, [visiteToDeleteId])

  // Filtrage et Tri
  const filteredVisites = React.useMemo(() => {
    return visitesList
      .filter((v) => {
        const leadName = v.lead ? `${v.lead.prenom || ''} ${v.lead.nom || ''}`.toLowerCase() : ''
        const clientName = v.client?.fullName?.toLowerCase() || ''
        const searchStr = `${leadName} ${clientName} ${v.bien.titre} ${v.agent?.fullName || ''}`.toLowerCase()
        
        const matchesSearch = searchStr.includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === '' || v.statut === statusFilter
        const matchesAgent = agentFilter === '' || v.agentId === agentFilter
        
        const visitDate = new Date(v.dateVisite)
        const matchesDate = !dateRange?.from || !dateRange?.to || (
          visitDate >= dateRange.from && visitDate <= dateRange.to
        )
        
        return matchesSearch && matchesStatus && matchesAgent && matchesDate
      })
      .sort((a, b) => new Date(b.dateVisite).getTime() - new Date(a.dateVisite).getTime())
  }, [visitesList, searchTerm, statusFilter, agentFilter, dateRange])

  // 1. Planifier la visite (Soumission)
  const handleCreateVisite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVisite.bienId) {
      toast.error('Veuillez sélectionner un bien immobilier.')
      return
    }
    if (!newVisite.dateVisite) {
      toast.error('Veuillez indiquer la date de visite.')
      return
    }
    if (linkType === 'lead' && !newVisite.leadId) {
      toast.error('Veuillez sélectionner un prospect.')
      return
    }
    if (linkType === 'client' && !newVisite.clientId) {
      toast.error('Veuillez sélectionner un client.')
      return
    }

    setAddingVisite(true)
    try {
      const combinedDateTime = `${newVisite.dateVisite}T${newVisite.timeVisite}:00`
      const payload = {
        bienId: newVisite.bienId,
        agentId: newVisite.agentId || null,
        dateVisite: combinedDateTime,
        statut: 'planifiee' as const,
        commentaires: newVisite.commentaires || null,
        leadId: linkType === 'lead' ? newVisite.leadId : null,
        clientId: linkType === 'client' ? newVisite.clientId : null,
      }

      const res = await creerVisiteAction(payload)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Visite planifiée avec succès !')
        
        // Optimistic append / fetch fresh details
        const selectedBien = biens.find(b => b.id === newVisite.bienId)
        const selectedAgent = agents.find(a => a.id === newVisite.agentId)
        const selectedLead = leads.find(l => l.id === newVisite.leadId)
        const selectedClient = clients.find(c => c.id === newVisite.clientId)

        const appended: Visite = {
          id: res.visiteId!,
          leadId: linkType === 'lead' ? newVisite.leadId : null,
          clientId: linkType === 'client' ? newVisite.clientId : null,
          bienId: newVisite.bienId,
          agentId: newVisite.agentId || null,
          dateVisite: new Date(combinedDateTime),
          statut: 'planifiee',
          commentaires: newVisite.commentaires || null,
          createdAt: new Date(),
          bien: {
            id: newVisite.bienId,
            titre: selectedBien?.titre || 'Bien',
            ville: selectedBien?.ville || '',
          },
          agent: selectedAgent ? {
            id: selectedAgent.id,
            fullName: selectedAgent.fullName,
            email: selectedAgent.email,
          } : null,
          client: selectedClient ? {
            id: selectedClient.id,
            fullName: selectedClient.fullName,
            email: selectedClient.email,
            phone: null,
          } : null,
          lead: selectedLead ? {
            id: selectedLead.id,
            nom: selectedLead.nom,
            prenom: selectedLead.prenom,
            telephone: selectedLead.telephone,
            email: null,
          } : null,
        }

        setVisitesList(prev => [appended, ...prev])
        setShowAddModal(false)
        setNewVisite({
          leadId: '',
          clientId: '',
          bienId: '',
          agentId: '',
          dateVisite: '',
          timeVisite: '10:00',
          commentaires: '',
        })
      }
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la planification.')
    } finally {
      setAddingVisite(false)
    }
  }

  // 2. Mettre à jour le statut (Clôture de visite)
  const handleUpdateStatus = async (statut: VisiteStatut) => {
    if (!selectedVisite) return
    setUpdatingStatus(true)

    try {
      const res = await modifierVisiteAction({
        id: selectedVisite.id,
        statut,
        commentaires: closingReport || selectedVisite.commentaires,
      })

      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`Visite marquée comme ${statutLabels[statut]} !`)
        
        // Mettre à jour la liste locale
        setVisitesList(prev => 
          prev.map(v => v.id === selectedVisite.id ? { 
            ...v, 
            statut, 
            commentaires: closingReport || v.commentaires 
          } : v)
        )
        
        setSelectedVisite(prev => prev ? { 
          ...prev, 
          statut, 
          commentaires: closingReport || prev.commentaires 
        } : null)
        
        setClosingReport('')
      }
    } catch (err: any) {
      toast.error(err.message || 'Erreur de mise à jour.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  // 3. Confirmer la suppression
  const confirmDeleteVisite = async () => {
    if (!visiteToDeleteId) return
    setDeletingVisite(true)

    try {
      const res = await supprimerVisiteAction(visiteToDeleteId)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Visite supprimée avec succès.')
        setVisitesList(prev => prev.filter(v => v.id !== visiteToDeleteId))
        if (selectedVisite?.id === visiteToDeleteId) {
          setSelectedVisite(null)
        }
        setVisiteToDeleteId(null)
      }
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de la suppression.')
    } finally {
      setDeletingVisite(false)
    }
  }

  // Options filtres
  const statusOptions = [
    { value: '', label: 'Tous les statuts', icon: <Layers className="w-3.5 h-3.5 text-slate-400" /> },
    { value: 'planifiee', label: 'Planifiée', icon: <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" /> },
    { value: 'confirmee', label: 'Confirmée', icon: <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" /> },
    { value: 'effectuee', label: 'Effectuée', icon: <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> },
    { value: 'annulee', label: 'Annulée', icon: <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" /> },
    { value: 'client_absent', label: 'Client Absent', icon: <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" /> },
  ]

  const agentOptions = [
    { value: '', label: 'Tous les agents', icon: <UserIcon className="w-3.5 h-3.5 text-slate-400" /> },
    ...agents.map(a => ({
      value: a.id,
      label: a.fullName || a.email,
      icon: <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
    }))
  ]

  return (
    <div className="space-y-6">
      
      {/* Header Premium */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Planification des Visites</h1>
          <p className="text-xs text-slate-500 mt-1">Organisez et suivez les visites physiques de vos biens immobiliers sur site.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="h-11 bg-emerald-500 hover:bg-emerald-600 text-white px-5 rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <PlusIcon className="w-4 h-4" />
          Planifier une visite
        </button>
      </div>

      {/* Barre de Filtres */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          
          {/* Recherche */}
          <div className="relative lg:col-span-2">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un prospect, agent, bien..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-100 focus:border-emerald-500 outline-none text-xs text-slate-700 placeholder-slate-400 transition-all bg-slate-50/50"
            />
          </div>

          {/* Statut */}
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            className="w-full"
          />

          {/* Agent */}
          <CustomSelect
            value={agentFilter}
            onChange={setAgentFilter}
            options={agentOptions}
            className="w-full"
          />

          {/* Date range picker */}
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            className="w-full"
          />

        </div>

        {/* Clear Filters indicator */}
        {(searchTerm || statusFilter || agentFilter || dateRange) && (
          <div className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-xl text-xs">
            <span className="text-slate-500 font-medium">Filtres actifs</span>
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('')
                setAgentFilter('')
                setDateRange(undefined)
              }}
              className="text-emerald-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Réinitialiser les filtres
              <XIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Grille des Visites */}
      {filteredVisites.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
          <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-sm font-extrabold text-slate-900">Aucune visite trouvée</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Aucun rendez-vous de visite ne correspond à vos filtres actuels ou n'a encore été créé.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVisites.map((visite) => {
            const dateObj = new Date(visite.dateVisite)
            const formattedDate = dateObj.toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
            const formattedTime = dateObj.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })

            const entityName = visite.lead 
              ? `${visite.lead.prenom || ''} ${visite.lead.nom || ''}`.trim()
              : visite.client?.fullName || 'Client Anonyme'

            return (
              <motion.div
                layout
                key={visite.id}
                onClick={() => setSelectedVisite(visite)}
                className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${statutColors[visite.statut]}`}>
                      {statutLabels[visite.statut]}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5 text-slate-300" />
                      {formattedTime}
                    </span>
                  </div>

                  {/* Client / Lead name */}
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 tracking-tight">{entityName}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{visite.lead ? 'Prospect CRM' : 'Client direct'}</p>
                  </div>

                  {/* Property Info */}
                  <div className="flex items-start gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
                    <BuildingIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-700">{visite.bien.titre}</p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5">
                        <MapPinIcon className="w-3 h-3 text-emerald-600" />
                        {visite.bien.ville}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer card */}
                <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between text-xs">
                  {/* Agent */}
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium truncate max-w-[120px]">
                      {visite.agent?.fullName || 'Non assigné'}
                    </span>
                  </div>

                  {/* Relative date label */}
                  <span className="text-[10px] text-emerald-600 font-bold capitalize">
                    {formattedDate.split(' ')[0]} {dateObj.getDate()} {formattedDate.split(' ')[2]}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Tiroir de Détails d'une Visite */}
      <AnimatePresence>
        {selectedVisite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex justify-end"
          >
            {/* Background clic */}
            <div className="absolute inset-0" onClick={() => setSelectedVisite(null)} />

            {/* Panel tiroir */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="relative w-full max-w-lg bg-slate-50 h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between border-l border-slate-100"
            >
              <div className="space-y-6">
                
                {/* En-tête Tiroir */}
                <div className="flex items-center justify-between border-b border-slate-200/50 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fiche de visite</span>
                    <h2 className="text-base font-extrabold text-slate-900 tracking-tight mt-0.5">
                      {selectedVisite.lead ? `${selectedVisite.lead.prenom || ''} ${selectedVisite.lead.nom || ''}`.trim() : selectedVisite.client?.fullName}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedVisite(null)}
                    className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center transition-all cursor-pointer"
                  >
                    <XIcon className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                {/* Détails Date & Heure */}
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm space-y-3.5">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-50 pb-2">Planification</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Date :</span>
                      <strong className="text-slate-700 capitalize">
                        {new Date(selectedVisite.dateVisite).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Heure :</span>
                      <strong className="text-slate-700">
                        {new Date(selectedVisite.dateVisite).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Bien immobilier visé */}
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-50 pb-2">Bien immobilier</h4>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <BuildingIcon className="w-5 h-5" />
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-slate-800">{selectedVisite.bien.titre}</p>
                      <p className="text-slate-400 flex items-center gap-0.5 mt-0.5">
                        <MapPinIcon className="w-3.5 h-3.5 text-emerald-600" />
                        {selectedVisite.bien.ville}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Statut actuel */}
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-50 pb-2">Statut et Agent</h4>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase ${statutColors[selectedVisite.statut]}`}>
                      {statutLabels[selectedVisite.statut]}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Agent en charge :</span>
                      <strong className="text-slate-700">{selectedVisite.agent?.fullName || 'Non affecté'}</strong>
                    </div>
                  </div>
                </div>

                {/* Commentaires planifiés */}
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-50 pb-2">Commentaires / Instructions</h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {selectedVisite.commentaires || "Aucune consigne ou commentaire particulier."}
                  </p>
                </div>

                {/* Clôturer / Changer de statut */}
                {selectedVisite.statut !== 'effectuee' && selectedVisite.statut !== 'annulee' && (
                  <div className="bg-white rounded-xl p-5 border border-emerald-100 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-50 pb-2">Clôturer ou mettre à jour la visite</h4>
                    
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Compte-rendu client</span>
                      <textarea
                        rows={3}
                        placeholder="Consignez les remarques du client, points positifs, négatifs ou demandes particulières..."
                        value={closingReport}
                        onChange={(e) => setClosingReport(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-100 focus:border-emerald-500 outline-none text-xs text-slate-700 resize-none bg-slate-50/50"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleUpdateStatus('effectuee')}
                        disabled={updatingStatus}
                        className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        Visite Effectuée
                      </button>
                      <button
                        onClick={() => handleUpdateStatus('client_absent')}
                        disabled={updatingStatus}
                        className="h-10 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        Client Absent
                      </button>
                      <button
                        onClick={() => handleUpdateStatus('annulee')}
                        disabled={updatingStatus}
                        className="h-10 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        Annuler Visite
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Pied de tiroir avec actions */}
              <div className="border-t border-slate-200/50 pt-4 flex gap-3 mt-6">
                <button
                  onClick={() => setVisiteToDeleteId(selectedVisite.id)}
                  className="flex-1 h-12 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer"
                >
                  Supprimer la visite
                </button>
                <button
                  onClick={() => setSelectedVisite(null)}
                  className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Fermer
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Planification de Visite (Dialog) */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-extrabold text-base tracking-tight">Planifier une Visite</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Renseignez les détails pour affecter un agent et bloquer un créneau horaire.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateVisite} className="space-y-4">
            
            {/* Type de lien */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Type de Clientèle</label>
              <div className="flex gap-2 bg-slate-50 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setLinkType('lead')
                    setNewVisite(prev => ({ ...prev, clientId: '' }))
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${linkType === 'lead' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  Prospect CRM (Lead)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLinkType('client')
                    setNewVisite(prev => ({ ...prev, leadId: '' }))
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${linkType === 'client' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  Client Officiel (Base)
                </button>
              </div>
            </div>

            {/* Select Lead ou Client */}
            {linkType === 'lead' ? (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sélectionner le Prospect *</label>
                <CustomSelect
                  value={newVisite.leadId}
                  onChange={(val) => setNewVisite(prev => ({ ...prev, leadId: val }))}
                  options={[
                    { value: '', label: 'Sélectionner un prospect...' },
                    ...leads.map(l => ({
                      value: l.id,
                      label: `${l.prenom || ''} ${l.nom || ''} (${l.telephone})`
                    }))
                  ]}
                  className="w-full"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sélectionner le Client *</label>
                <CustomSelect
                  value={newVisite.clientId}
                  onChange={(val) => setNewVisite(prev => ({ ...prev, clientId: val }))}
                  options={[
                    { value: '', label: 'Sélectionner un client...' },
                    ...clients.map(c => ({
                      value: c.id,
                      label: c.fullName || c.email
                    }))
                  ]}
                  className="w-full"
                />
              </div>
            )}

            {/* Select Bien */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Bien Immobilier à visiter *</label>
              <CustomSelect
                value={newVisite.bienId}
                onChange={(val) => setNewVisite(prev => ({ ...prev, bienId: val }))}
                options={[
                  { value: '', label: 'Sélectionner un bien immobilier...' },
                  ...biens.map(b => ({
                    value: b.id,
                    label: `${b.titre} (${b.ville})`
                  }))
                ]}
                className="w-full"
              />
            </div>

            {/* Date & Heure */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Date *</label>
                <DatePicker
                  value={newVisite.dateVisite ? new Date(newVisite.dateVisite) : undefined}
                  onChange={(date) => {
                    if (date) {
                      const yyyy = date.getFullYear();
                      const mm = String(date.getMonth() + 1).padStart(2, '0');
                      const dd = String(date.getDate()).padStart(2, '0');
                      setNewVisite(prev => ({ ...prev, dateVisite: `${yyyy}-${mm}-${dd}` }));
                    } else {
                      setNewVisite(prev => ({ ...prev, dateVisite: '' }));
                    }
                  }}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Heure *</label>
                <TimePicker
                  value={newVisite.timeVisite}
                  onChange={(time) => setNewVisite(prev => ({ ...prev, timeVisite: time }))}
                  required
                />
              </div>
            </div>

            {/* Select Agent */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Agent Accompagnateur</label>
              <CustomSelect
                value={newVisite.agentId}
                onChange={(val) => setNewVisite(prev => ({ ...prev, agentId: val }))}
                options={[
                  { value: '', label: 'Aucun agent assigné' },
                  ...agents.map(a => ({
                    value: a.id,
                    label: a.fullName || a.email
                  }))
                ]}
                className="w-full"
              />
            </div>

            {/* Commentaires */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Notes & Consignes</label>
              <Textarea
                rows={2}
                placeholder="Consignes particulières (ex: clé à récupérer au bureau, heure limite)..."
                value={newVisite.commentaires}
                onChange={(e) => setNewVisite(prev => ({ ...prev, commentaires: e.target.value }))}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={addingVisite || !isFormValid} 
                className="bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {addingVisite ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    Enregistrement...
                  </>
                ) : (
                  'Planifier la visite'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmation de Suppression de Prestige */}
      <Dialog open={!!visiteToDeleteId} onOpenChange={(isOpen) => !isOpen && setVisiteToDeleteId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangleIcon className="h-5 w-5" />
              Supprimer la visite
            </DialogTitle>
            <DialogDescription className="text-xs">
              Vous êtes sur le point d'annuler et de supprimer cette visite. Cette opération effectuera une suppression logique.
            </DialogDescription>
          </DialogHeader>

          {/* Radiographie d'impact */}
          <div className="py-2">
            {loadingImpact ? (
              <div className="flex items-center justify-center py-4 text-muted-foreground text-xs">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Analyse de l'impact en cours...
              </div>
            ) : visiteImpact ? (
              <div className="p-4 rounded-xl border bg-red-50 border-red-200">
                <h4 className="font-bold mb-2 text-xs text-red-800 flex items-center gap-1">
                  <ShieldAlert className="h-4 w-4" />
                  Impact de la suppression
                </h4>
                <ul className="text-[11px] space-y-1.5 text-red-700">
                  <li>• Visite planifiée pour le bien <strong>{visiteImpact.bienTitre}</strong> annulée.</li>
                  {visiteImpact.leadImpactInfo && (
                    <li>• Impact direct sur le prospect <strong>{visiteImpact.leadImpactInfo.prospectName}</strong> (actuellement à l'étape <strong>{visiteImpact.leadImpactInfo.etapeActuelle}</strong>).</li>
                  )}
                </ul>
              </div>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setVisiteToDeleteId(null)}>
              Annuler
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              disabled={deletingVisite}
              onClick={confirmDeleteVisite}
            >
              {deletingVisite ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Suppression...
                </>
              ) : (
                'Confirmer la suppression'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
