'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserIcon, 
  FlameIcon, 
  Globe, 
  MessageCircle, 
  PhoneCall, 
  Share2, 
  Users, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  Layers,
  MessageSquareIcon
} from 'lucide-react'
import { PIPELINE_ETAPES, PipelineEtapeCode } from '@/constants/pipeline'

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
  email: string | null
  telephone: string
  source: string
  statut: string
  etape: PipelineEtapeCode
  score: number
  bienInteresse?: string | null
  agentId: string | null
  message: string | null
  visiteConfirmee: boolean
  offreValidee: boolean
  engagementSigne: boolean
  createdAt: Date | string
}

interface KanbanPipelineProps {
  leads: Lead[]
  agents: Profile[]
  biens: Bien[]
  onLeadMove: (leadId: string, newEtape: PipelineEtapeCode) => void
  onSelectLead: (lead: Lead) => void
}

const sourceIcons: Record<string, React.ReactNode> = {
  site_web: <Globe className="w-3 h-3 text-emerald-600" />,
  whatsapp: <MessageCircle className="w-3 h-3 text-emerald-500" />,
  appel: <PhoneCall className="w-3 h-3 text-blue-500" />,
  reseaux_sociaux: <Share2 className="w-3 h-3 text-indigo-500" />,
  referral: <Users className="w-3 h-3 text-purple-500" />,
}

const sourceLabels: Record<string, string> = {
  site_web: 'Site Web',
  whatsapp: 'WhatsApp',
  appel: 'Appel direct',
  reseaux_sociaux: 'Réseaux',
  referral: 'Recommandation',
}

export default function KanbanPipeline({ 
  leads, 
  agents, 
  biens, 
  onLeadMove, 
  onSelectLead 
}: KanbanPipelineProps) {
  const [draggedLeadId, setDraggedLeadId] = React.useState<string | null>(null)
  const [activeColumn, setActiveColumn] = React.useState<string | null>(null)

  // 1. Gérer le début du drag
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId)
    setDraggedLeadId(leadId)
  }

  // 2. Gérer la fin du drag
  const handleDragEnd = () => {
    setDraggedLeadId(null)
    setActiveColumn(null)
  }

  // 3. Permettre le drop sur la colonne
  const handleDragOver = (e: React.DragEvent, columnCode: string) => {
    e.preventDefault()
    if (activeColumn !== columnCode) {
      setActiveColumn(columnCode)
    }
  }

  // 4. Quitter la colonne pendant le drag
  const handleDragLeave = () => {
    // Ne pas vider instantanément pour éviter les clignotements sur les éléments enfants,
    // mais géré par le dragOver
  }

  // 5. Gérer le drop réel
  const handleDrop = (e: React.DragEvent, targetColumnCode: PipelineEtapeCode) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('text/plain')
    if (leadId) {
      onLeadMove(leadId, targetColumnCode)
    }
    setDraggedLeadId(null)
    setActiveColumn(null)
  }

  // Déplacement manuel (pour mobile / boutons rapides)
  const handleMoveStep = (leadId: string, currentEtape: string, direction: 'left' | 'right') => {
    const currentIndex = PIPELINE_ETAPES.findIndex(e => e.code === currentEtape)
    if (currentIndex === -1) return

    let nextIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1
    if (nextIndex >= 0 && nextIndex < PIPELINE_ETAPES.length) {
      onLeadMove(leadId, PIPELINE_ETAPES[nextIndex].code as PipelineEtapeCode)
    }
  }

  return (
    <div className="w-full overflow-x-auto pb-6 select-none scrollbar-thin scrollbar-thumb-slate-200">
      <div className="flex gap-4 min-w-[1600px] h-[calc(100vh-290px)] min-h-[500px]">
        {PIPELINE_ETAPES.map((etape) => {
          const columnLeads = leads.filter(l => l.etape === etape.code)
          const isOver = activeColumn === etape.code

          return (
            <div
              key={etape.code}
              onDragOver={(e) => handleDragOver(e, etape.code)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, etape.code as PipelineEtapeCode)}
              className={`flex-1 flex flex-col rounded-2xl border transition-all duration-200 bg-slate-50/50 p-3 h-full overflow-hidden ${
                isOver 
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-inner scale-[1.01]' 
                  : 'border-slate-100'
              }`}
            >
              {/* En-tête de colonne */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 shrink-0">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: etape.couleur }} 
                  />
                  <h3 className="font-bold text-slate-900 text-xs tracking-tight truncate max-w-[120px]">
                    {etape.nom}
                  </h3>
                </div>
                <span className="text-[10px] font-black bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full shadow-sm">
                  {columnLeads.length}
                </span>
              </div>

              {/* Conteneur de cartes (Scrollable) */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                <AnimatePresence initial={false}>
                  {columnLeads.map((lead) => {
                    const assignedAgent = agents.find((a) => a.id === lead.agentId)
                    const associatedProperty = biens.find((b) => b.id === lead.bienInteresse)
                    const isCardDragged = draggedLeadId === lead.id

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white rounded-xl border p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-slate-300 transition-all relative group/card ${
                          isCardDragged ? 'opacity-30 border-dashed border-slate-300 shadow-none' : 'border-slate-150'
                        }`}
                      >
                        {/* Barre de priorité / score discrète sur le bord gauche */}
                        <div 
                          className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-md ${
                            lead.score >= 80 ? 'bg-emerald-500' :
                            lead.score >= 50 ? 'bg-teal-500' : 'bg-slate-300'
                          }`}
                        />

                        {/* Contenu principal */}
                        <div className="pl-2 space-y-2.5">
                          {/* En-tête : Nom */}
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-bold text-slate-900 text-xs hover:text-emerald-600 cursor-pointer transition-colors break-words max-w-[140px]" onClick={() => onSelectLead(lead)}>
                              {lead.nom || lead.prenom ? `${lead.prenom || ''} ${lead.nom || ''}`.trim() : 'Prospect Anonyme'}
                            </span>
                            <div className="flex items-center shrink-0">
                              <span className="text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-1 py-0.2 rounded-md flex items-center gap-0.5">
                                <FlameIcon className="w-2.5 h-2.5 shrink-0 fill-amber-500 text-amber-500" />
                                {lead.score}
                              </span>
                            </div>
                          </div>

                          {/* Contact rapide */}
                          <div className="text-[10px] text-slate-400 font-medium space-y-0.5">
                            <div className="truncate">{lead.telephone}</div>
                            {lead.email && <div className="truncate">{lead.email}</div>}
                          </div>

                          {/* Infos Bien & Source */}
                          <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-100">
                            {/* Source */}
                            <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-md px-1.5 py-0.5 shrink-0">
                              {sourceIcons[lead.source]}
                              <span className="text-[9px] font-semibold text-slate-500">
                                {sourceLabels[lead.source] || lead.source}
                              </span>
                            </div>

                            {/* Bien intéressé */}
                            {associatedProperty && (
                              <div className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md truncate max-w-[100px]" title={associatedProperty.titre}>
                                {associatedProperty.titre}
                              </div>
                            )}
                          </div>

                          {/* Agent Affecté & Boutons d'action */}
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold truncate max-w-[120px]">
                              <UserIcon className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">
                                {assignedAgent ? (assignedAgent.fullName || assignedAgent.email) : 'Non attribué'}
                              </span>
                            </div>

                            {/* Détails rapide */}
                            <button
                              onClick={() => onSelectLead(lead)}
                              className="w-6 h-6 rounded-md bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 flex items-center justify-center transition-all cursor-pointer shadow-sm border border-slate-200/50 hover:border-emerald-200"
                              title="Ouvrir les détails"
                            >
                              <MessageSquareIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Overlay au survol : contrôles rapides pour mobile/tactile */}
                        <div className="absolute right-2 top-2 hidden group-hover/card:flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg p-0.5 border shadow-sm transition-all">
                          <button
                            disabled={etape.ordre === 1}
                            onClick={() => handleMoveStep(lead.id, lead.etape, 'left')}
                            className="w-5 h-5 rounded hover:bg-slate-100 flex items-center justify-center text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={etape.ordre === PIPELINE_ETAPES.length}
                            onClick={() => handleMoveStep(lead.id, lead.etape, 'right')}
                            className="w-5 h-5 rounded hover:bg-slate-100 flex items-center justify-center text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    )
                  })}
                </AnimatePresence>

                {columnLeads.length === 0 && (
                  <div className="h-28 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[10px] text-slate-400 font-semibold italic text-center p-4">
                    Aucun prospect à cette étape
                  </div>
                )}
              </div>

            </div>
          )
        })}
      </div>
    </div>
  )
}
