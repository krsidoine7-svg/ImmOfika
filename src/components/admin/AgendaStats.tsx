"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Award, Compass, TrendingUp, UserCheck, CalendarDays } from "lucide-react"

interface KPIs {
  occupationRate: number
  occupiedHours: number
  totalWorkingHours: number
  totalHonorees: number
  totalAnnulees: number
  totalHoursField: number
}

interface AgendaStatsProps {
  kpis: KPIs
}

export default function AgendaStats({ kpis }: AgendaStatsProps) {
  const {
    occupationRate = 0,
    occupiedHours = 0,
    totalWorkingHours = 0,
    totalHonorees = 0,
    totalAnnulees = 0,
    totalHoursField = 0,
  } = kpis

  // Configuration de l'anneau de progression SVG
  const radius = 28
  const strokeWidth = 5.5
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (occupationRate / 100) * circumference

  // Total des visites traitées pour calculer la distribution
  const totalVisitsProcessed = totalHonorees + totalAnnulees
  const honoreesPercentage = totalVisitsProcessed > 0 ? (totalHonorees / totalVisitsProcessed) * 100 : 0
  const annuleesPercentage = totalVisitsProcessed > 0 ? (totalAnnulees / totalVisitsProcessed) * 100 : 0

  return (
    <motion.div 
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="grid grid-cols-1 md:grid-cols-3 gap-5"
    >
      {/* 1. Taux d'occupation */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center justify-between hover:shadow-md hover:border-slate-300 transition-all group duration-300">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taux d'occupation</span>
          </div>
          <div>
            <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {occupationRate}%
            </h4>
            <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
              De votre temps de travail réservé ce mois-ci.
            </p>
          </div>
          <div className="text-[9px] text-slate-400 font-medium">
            {occupiedHours}h occupées / {totalWorkingHours}h ouvrables
          </div>
        </div>

        {/* Anneau de progression émeraude */}
        <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Anneau d'arrière-plan */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="stroke-slate-100 fill-none"
              strokeWidth={strokeWidth}
            />
            {/* Anneau de progression */}
            <motion.circle
              cx="40"
              cy="40"
              r={radius}
              className="stroke-emerald-500 fill-none"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
              strokeLinecap="round"
            />
          </svg>
          {/* Texte au centre */}
          <div className="absolute text-[10px] font-black text-slate-900">
            {occupationRate}%
          </div>
        </div>
      </div>

      {/* 2. Visites Menées */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all duration-300 group">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300">
              <UserCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visites menées</span>
          </div>

          <div className="flex justify-between items-baseline">
            <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {totalHonorees} <span className="text-xs font-semibold text-slate-400">honorées</span>
            </h4>
            <div className="text-[10px] text-rose-500 font-bold bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg">
              {totalAnnulees} annulée{totalAnnulees > 1 ? 's' : ''}
            </div>
          </div>

          {/* Mini-barre de distribution */}
          <div className="space-y-1">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
              {totalVisitsProcessed > 0 ? (
                <>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${honoreesPercentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-emerald-500" 
                    title={`${totalHonorees} visites honorées (${Math.round(honoreesPercentage)}%)`}
                  />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${annuleesPercentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-rose-500" 
                    title={`${totalAnnulees} visites annulées (${Math.round(annuleesPercentage)}%)`}
                  />
                </>
              ) : (
                <div className="w-full h-full bg-slate-200" title="Aucune visite" />
              )}
            </div>
            <div className="flex justify-between text-[8px] text-slate-400 font-medium">
              <span>{Math.round(honoreesPercentage)}% honorées</span>
              <span>{Math.round(annuleesPercentage)}% annulées</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Temps sur le terrain */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center justify-between hover:shadow-md hover:border-slate-300 transition-all duration-300 group">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temps sur le terrain</span>
          </div>
          <div>
            <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {totalHoursField} {totalHoursField > 1 ? 'heures' : 'heure'}
            </h4>
            <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
              Temps physique cumulé de visites sur site.
            </p>
          </div>
          <div className="text-[9px] text-emerald-700 font-bold flex items-center gap-1">
            <Award className="w-3 h-3 stroke-[2.5]" />
            <span>Basé sur {totalHonorees} rdv honoré{totalHonorees > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Icone décorative */}
        <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-inner">
          <CalendarDays className="w-8 h-8 stroke-[1.25]" />
        </div>
      </div>
    </motion.div>
  )
}
