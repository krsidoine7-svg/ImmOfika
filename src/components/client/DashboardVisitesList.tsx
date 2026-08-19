"use client"

import * as React from "react"
import { Calendar, Clock, MapPin, User, Plus } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import PlanifierVisiteModal from "./PlanifierVisiteModal"
import { cn } from "@/lib/utils"

interface Visite {
  id: string
  dateVisite: Date
  statut: string
  commentaires: string | null
  bienTitre: string
  bienVille: string
  bienQuartier: string | null
  agentName: string | null
}

interface DashboardVisitesListProps {
  visites: Visite[]
}

const statusConfig: Record<string, { label: string; className: string }> = {
  planifiee: { label: "Planifiée", className: "bg-blue-50 text-blue-700 border-blue-200 font-bold" },
  confirmee: { label: "Confirmée", className: "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold" },
  effectuee: { label: "Effectuée", className: "bg-slate-100 text-slate-700 border-slate-200 font-bold" },
  annulee: { label: "Annulée", className: "bg-red-50 text-red-700 border-red-200 font-bold" },
  client_absent: { label: "Client Absent", className: "bg-amber-50 text-amber-700 border-amber-200 font-bold" },
}

export default function DashboardVisitesList({ visites }: DashboardVisitesListProps) {
  const [showModal, setShowModal] = React.useState(false)

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
      {/* Header section with scheduling action */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            Mes Visites de Biens
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Retrouvez vos rendez-vous de visite guidée ImmOfika.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-sm cursor-pointer shadow-emerald-500/20"
        >
          <Plus className="h-3.5 w-3.5" />
          Planifier
        </button>
      </div>

      {/* Visites List */}
      {visites.length === 0 ? (
        <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-700 font-bold text-sm mb-1">Aucune visite programmée.</p>
          <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto mb-4">
            Vous n&apos;avez pas encore réservé de visite pour nos terrains et projets immobiliers.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 py-2 px-5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-xs font-bold transition-all bg-white shadow-xs cursor-pointer"
          >
            Planifier une visite
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
          {visites.map((visite) => {
            const status = statusConfig[visite.statut] || { label: visite.statut, className: "bg-slate-100 text-slate-700 font-bold" }
            return (
              <div
                key={visite.id}
                className="p-4 rounded-2xl border border-slate-100 bg-emerald-50/20 hover:bg-white hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] border uppercase tracking-wider", status.className)}>
                      {status.label}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm leading-tight">
                      {visite.bienTitre}
                    </h4>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {format(new Date(visite.dateVisite), "EEEE d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {visite.bienQuartier ? `${visite.bienQuartier}, ` : ""}{visite.bienVille}
                    </span>
                  </div>

                  {visite.agentName && (
                    <p className="text-[11px] text-slate-700 font-medium flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      Accompagné par : <span className="text-emerald-700 font-bold">{visite.agentName}</span>
                    </p>
                  )}
                </div>

                {visite.commentaires && (
                  <div className="text-right sm:max-w-[200px] shrink-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Note visite</p>
                    <p className="text-xs text-slate-500 font-medium italic truncate">{visite.commentaires}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Global scheduling modal */}
      <PlanifierVisiteModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        isConnected={true}
      />
    </div>
  )
}
