import * as React from "react"
import { getAgentAgendaVisitesAction, getAgentKPIsAction } from "@/app/actions/disponibilites"
import AgendaSettingsForm from "@/components/admin/AgendaSettingsForm"
import AgendaStats from "@/components/admin/AgendaStats"
import { Calendar, MapPin, User, Clock, FileText } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export const metadata = {
  title: "Mon Agenda - ImmOfika",
  description: "Gérez votre calendrier professionnel, vos indisponibilités et votre synchronisation Google Calendar ImmOfika."
}

export default async function AgendaPage() {
  const [resVisites, resKPIs] = await Promise.all([
    getAgentAgendaVisitesAction(),
    getAgentKPIsAction()
  ])
  
  const visitesList = resVisites.success && resVisites.visites ? resVisites.visites : []
  const kpis = resKPIs.success && resKPIs.kpis ? resKPIs.kpis : {
    occupationRate: 0,
    occupiedHours: 0,
    totalWorkingHours: 0,
    totalHonorees: 0,
    totalAnnulees: 0,
    totalHoursField: 0
  }

  return (
    <div className="space-y-8 py-2">
      {/* En-tête de page */}
      <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-5">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Mon Agenda & Synchronisation</h1>
        <p className="text-xs text-slate-500 font-medium">
          Pilotez votre emploi du temps, gérez vos indisponibilités et connectez votre Google Calendar personnel.
        </p>
      </div>

      {/* Synthèse des KPIs de l'agent */}
      <AgendaStats kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Colonne gauche/milieu : Réglages et Absences */}
        <div className="lg:col-span-2 space-y-6">
          <AgendaSettingsForm />
        </div>

        {/* Colonne droite : Prochains Rendez-vous / Visites assignées */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Vos Prochaines Visites</h3>
          </div>

          {visitesList.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl text-slate-400">
              <Calendar className="h-8 w-8 stroke-[1.5] text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold">Aucune visite programmée pour vous.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
              {visitesList.map((visite: any) => {
                const date = new Date(visite.dateVisite)
                
                return (
                  <div 
                    key={visite.id} 
                    className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2.5 hover:shadow-xs transition-all border-l-4 border-l-emerald-500"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        {format(date, "eee d MMMM", { locale: fr })}
                      </span>
                      <span className="text-[10px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {format(date, "HH'h'mm")}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="font-extrabold text-slate-900 line-clamp-1">{visite.bienTitre}</div>
                      
                      <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{visite.bienVille}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{visite.clientName || "Visiteur anonyme"}</span>
                      </div>

                      {visite.commentaires && (
                        <div className="flex items-start gap-1.5 text-slate-400 font-medium italic mt-1 bg-white border border-slate-100 rounded-lg p-2">
                          <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <p className="line-clamp-2 leading-relaxed text-[10px]">{visite.commentaires}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
