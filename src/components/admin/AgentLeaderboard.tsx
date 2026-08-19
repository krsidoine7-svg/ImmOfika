"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Award, 
  Trophy, 
  User, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal,
  UserCheck,
  Compass,
  CalendarDays
} from "lucide-react"
import { CustomSelect } from "@/components/ui/custom-select"

interface AgentPerf {
  agentId: string
  nom: string
  email: string
  avatar: string | null
  leadsAssignes: number
  visitesEffectuees: number
  ventesCloses: number
  tauxConversion: number
  occupationRate: number
  occupiedHours: number
  totalWorkingHours: number
  totalHonorees: number
  totalAnnulees: number
  totalHoursField: number
}

interface AgentLeaderboardProps {
  performance: AgentPerf[]
}

type SortOption = "conversion" | "occupation" | "fieldHours" | "closes"

export default function AgentLeaderboard({ performance }: AgentLeaderboardProps) {
  const [sortBy, setSortBy] = React.useState<SortOption>("conversion")
  const [expandedAgentId, setExpandedAgentId] = React.useState<string | null>(null)

  const sortedAgents = [...performance].sort((a, b) => {
    switch (sortBy) {
      case "occupation":
        if (b.occupationRate !== a.occupationRate) {
          return b.occupationRate - a.occupationRate
        }
        return b.tauxConversion - a.tauxConversion
      case "fieldHours":
        if (b.totalHoursField !== a.totalHoursField) {
          return b.totalHoursField - a.totalHoursField
        }
        return b.tauxConversion - a.tauxConversion
      case "closes":
        if (b.ventesCloses !== a.ventesCloses) {
          return b.ventesCloses - a.ventesCloses
        }
        return b.tauxConversion - a.tauxConversion
      case "conversion":
      default:
        if (b.tauxConversion !== a.tauxConversion) {
          return b.tauxConversion - a.tauxConversion
        }
        return b.ventesCloses - a.ventesCloses
    }
  })

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-all duration-300">
      {/* Header with sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <Trophy className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">Performance des Agents</h4>
            <p className="text-[10px] text-slate-500 font-medium">Classement d&apos;efficacité et indicateurs d&apos;activité</p>
          </div>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto min-w-[180px]">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <CustomSelect
            size="sm"
            value={sortBy}
            onChange={(val) => setSortBy(val as SortOption)}
            options={[
              { value: 'conversion', label: 'Taux de conversion' },
              { value: 'occupation', label: "Taux d'occupation" },
              { value: 'fieldHours', label: 'Temps sur le terrain' },
              { value: 'closes', label: 'Ventes closées' },
            ]}
          />
        </div>
      </div>

      <div className="space-y-3">
        {sortedAgents.length > 0 ? (
          sortedAgents.map((agent, index) => {
            const isTop1 = index === 0
            const isTop2 = index === 1
            const isTop3 = index === 2
            const isExpanded = expandedAgentId === agent.agentId

            let badgeBg = "bg-slate-100 text-slate-500"
            let badgeIcon = null

            if (isTop1) {
              badgeBg = "bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold"
              badgeIcon = <Trophy className="w-3 h-3 text-emerald-600" />
            } else if (isTop2) {
              badgeBg = "bg-slate-100 text-slate-700 border border-slate-200 font-bold"
              badgeIcon = <Award className="w-3 h-3 text-slate-400" />
            } else if (isTop3) {
              badgeBg = "bg-slate-50 text-slate-600 border border-slate-200 font-bold"
              badgeIcon = <Award className="w-3 h-3 text-slate-400" />
            }

            const totalVisitsProcessed = agent.totalHonorees + agent.totalAnnulees
            const honoreesPercentage = totalVisitsProcessed > 0 ? (agent.totalHonorees / totalVisitsProcessed) * 100 : 0
            const annuleesPercentage = totalVisitsProcessed > 0 ? (agent.totalAnnulees / totalVisitsProcessed) * 100 : 0

            const radius = 22
            const strokeWidth = 4
            const circumference = 2 * Math.PI * radius
            const strokeDashoffset = circumference - (agent.occupationRate / 100) * circumference

            return (
              <motion.div
                key={agent.agentId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className={`flex flex-col p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  isExpanded
                    ? 'border-emerald-500 bg-emerald-50/10 shadow-xs'
                    : isTop1 
                      ? 'bg-emerald-50/30 border-emerald-100/60 hover:border-emerald-200 hover:shadow-xs' 
                      : 'bg-slate-50/40 border-slate-100 hover:border-slate-200 hover:shadow-xs'
                }`}
                onClick={() => setExpandedAgentId(isExpanded ? null : agent.agentId)}
              >
                {/* Main row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {/* Rank position */}
                    <div className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${badgeBg} gap-0.5`}>
                      {badgeIcon || (index + 1)}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 overflow-hidden shrink-0">
                      {agent.avatar ? (
                        <img src={agent.avatar} alt={agent.nom} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4.5 h-4.5 stroke-[1.5]" />
                      )}
                    </div>

                    {/* Name & Email */}
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{agent.nom}</h5>
                      <p className="text-[10px] text-slate-400 font-medium">{agent.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
                    {/* Quick Stats */}
                    <div className="flex gap-4 text-center">
                      <div>
                        <div className="text-xs font-black text-slate-900">{agent.leadsAssignes}</div>
                        <div className="text-[8px] uppercase font-bold tracking-wider text-slate-400">Leads</div>
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">{agent.visitesEffectuees}</div>
                        <div className="text-[8px] uppercase font-bold tracking-wider text-slate-400">Visites</div>
                      </div>
                      <div>
                        <div className="text-xs font-black text-emerald-600">{agent.ventesCloses}</div>
                        <div className="text-[8px] uppercase font-bold tracking-wider text-slate-400">Closes</div>
                      </div>
                    </div>

                    {/* Conversion Rate */}
                    <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                      <div>
                        <div className="text-xs font-black text-slate-900 flex items-center gap-0.5 justify-end">
                          <TrendingUp className="w-3 h-3 text-emerald-600" />
                          <span>{agent.tauxConversion}%</span>
                        </div>
                        <div className="text-[8px] font-bold uppercase tracking-wider text-slate-400 text-right">Conversion</div>
                      </div>
                      <div className="text-slate-400 hover:text-slate-900 transition-colors shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Collapsible accordion */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      onClick={(e) => e.stopPropagation()}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
                        {/* 1. Occupation rate */}
                        <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 flex items-center justify-between group/kpi hover:bg-white transition-all duration-300">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 group-hover/kpi:scale-105 transition-transform duration-300">
                                <TrendingUp className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Taux d&apos;occupation</span>
                            </div>
                            <div>
                              <h5 className="text-base font-black text-slate-900 tracking-tight">
                                {agent.occupationRate}%
                              </h5>
                              <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
                                Heures de travail réservées.
                              </p>
                            </div>
                            <div className="text-[8px] text-slate-400 font-medium">
                              {agent.occupiedHours}h occupées / {agent.totalWorkingHours}h ouvrables
                            </div>
                          </div>

                          {/* Progress Ring */}
                          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="32"
                                cy="32"
                                r={radius}
                                className="stroke-slate-100 fill-none"
                                strokeWidth={strokeWidth}
                              />
                              <motion.circle
                                cx="32"
                                cy="32"
                                r={radius}
                                className="stroke-emerald-500 fill-none"
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute text-[9px] font-black text-slate-900">
                              {agent.occupationRate}%
                            </div>
                          </div>
                        </div>

                        {/* 2. Visits Conducted */}
                        <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 flex flex-col justify-between group/kpi hover:bg-white transition-all duration-300">
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 group-hover/kpi:scale-105 transition-transform duration-300">
                                <UserCheck className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Visites menées</span>
                            </div>

                            <div className="flex justify-between items-baseline">
                              <h5 className="text-base font-black text-slate-900 tracking-tight">
                                {agent.totalHonorees} <span className="text-[10px] font-semibold text-slate-400">honorées</span>
                              </h5>
                              <div className="text-[8px] text-red-600 font-bold bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-md">
                                {agent.totalAnnulees} annulée{agent.totalAnnulees > 1 ? 's' : ''}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                                {totalVisitsProcessed > 0 ? (
                                  <>
                                    <div 
                                      className="h-full bg-emerald-500" 
                                      style={{ width: `${honoreesPercentage}%` }}
                                    />
                                    <div 
                                      className="h-full bg-rose-500" 
                                      style={{ width: `${annuleesPercentage}%` }}
                                    />
                                  </>
                                ) : (
                                  <div className="w-full h-full bg-slate-200" />
                                )}
                              </div>
                              <div className="flex justify-between text-[7px] text-slate-400 font-medium">
                                <span>{Math.round(honoreesPercentage)}% hon.</span>
                                <span>{Math.round(annuleesPercentage)}% ann.</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 3. Field Time */}
                        <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 flex items-center justify-between group/kpi hover:bg-white transition-all duration-300">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 group-hover/kpi:scale-105 transition-transform duration-300">
                                <Compass className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Temps sur terrain</span>
                            </div>
                            <div>
                              <h5 className="text-base font-black text-slate-900 tracking-tight">
                                {agent.totalHoursField} {agent.totalHoursField > 1 ? 'heures' : 'heure'}
                              </h5>
                              <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
                                Visites physiques cumulées.
                              </p>
                            </div>
                            <div className="text-[8px] text-emerald-600 font-bold flex items-center gap-0.5">
                              <Award className="w-2.5 h-2.5 stroke-[2.5]" />
                              <span>Basé sur {agent.totalHonorees} rdv</span>
                            </div>
                          </div>

                          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 group-hover/kpi:bg-emerald-500 group-hover/kpi:text-white transition-all duration-300 border border-emerald-100">
                            <CalendarDays className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        ) : (
          <div className="h-32 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium">
            Aucun agent n&apos;est enregistré pour l&apos;instant.
          </div>
        )}
      </div>
    </div>
  )
}
