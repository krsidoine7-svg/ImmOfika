"use client"

import * as React from "react"
import { 
  sauvegarderCalendrierAction, 
  getCalendrierAgentAction,
  ajouterIndisponibiliteAction,
  supprimerIndisponibiliteAction,
  getIndisponibilitesAgentAction,
  forcerSynchronisationCalendrierAction
} from "@/app/actions/disponibilites"
import { Calendar, Link2, Plus, Trash2, ShieldAlert, CheckCircle, Loader2, RefreshCw, AlertTriangle, Users } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"
import { motion, AnimatePresence } from "framer-motion"

export default function AgendaSettingsForm() {
  // Config iCal State
  const [icalUrl, setIcalUrl] = React.useState<string>("")
  const [loadingCal, setLoadingCal] = React.useState<boolean>(false)
  const [lastSyncedAt, setLastSyncedAt] = React.useState<string | null>(null)
  const [refreshingCal, setRefreshingCal] = React.useState<boolean>(false)
  
  // Absence Form State
  const [titre, setTitre] = React.useState<string>("")
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined)
  const [startTime, setStartTime] = React.useState<string>("")
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined)
  const [endTime, setEndTime] = React.useState<string>("")
  const [submittingAbsence, setSubmittingAbsence] = React.useState<boolean>(false)
  
  // Deletion Confirm Modal State
  const [absenceToDelete, setAbsenceToDelete] = React.useState<string | null>(null)
  const [deletingAbsence, setDeletingAbsence] = React.useState<boolean>(false)

  // Global State
  const [indisponibilites, setIndisponibilites] = React.useState<any[]>([])
  const [loadingList, setLoadingList] = React.useState<boolean>(false)
  const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Charger les données existantes
  const chargerDonnees = React.useCallback(async () => {
    setLoadingList(true)
    try {
      // 1. Calendrier iCal
      const resCal = await getCalendrierAgentAction()
      if (resCal.success && resCal.calendrier) {
        setIcalUrl(resCal.calendrier.icalUrl)
        setLastSyncedAt(resCal.calendrier.lastSyncedAt ? resCal.calendrier.lastSyncedAt.toString() : null)
      }
      
      // 2. Indisponibilités locales
      const resInd = await getIndisponibilitesAgentAction()
      if (resInd.success && resInd.indisponibilites) {
        setIndisponibilites(resInd.indisponibilites)
      }
    } catch (err) {
      console.error("Erreur de chargement des réglages d'agenda:", err)
    } finally {
      setLoadingList(false)
    }
  }, [])

  React.useEffect(() => {
    chargerDonnees()
  }, [chargerDonnees])

  // Sauvegarder le lien iCal
  const handleSaveIcal = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingCal(true)
    setMessage(null)

    try {
      const res = await sauvegarderCalendrierAction(icalUrl.trim())
      if (res.success) {
        setMessage({ type: 'success', text: "Lien Google Calendar synchronisé avec succès !" })
        // Mettre à jour lastSyncedAt
        const resCal = await getCalendrierAgentAction()
        if (resCal.success && resCal.calendrier) {
          setLastSyncedAt(resCal.calendrier.lastSyncedAt ? resCal.calendrier.lastSyncedAt.toString() : null)
        }
      } else {
        setMessage({ type: 'error', text: res.error || "Une erreur est survenue." })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Une erreur inconnue s'est produite." })
    } finally {
      setLoadingCal(false)
    }
  }

  // Forcer la synchronisation manuelle
  const handleForceSync = async () => {
    setRefreshingCal(true)
    setMessage(null)

    try {
      const res = await forcerSynchronisationCalendrierAction()
      if (res.success && res.lastSyncedAt) {
        setLastSyncedAt(res.lastSyncedAt)
        setMessage({ type: 'success', text: "Synchronisation de votre agenda effectuée !" })
      } else {
        setMessage({ type: 'error', text: res.error || "Une erreur est survenue." })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Une erreur s'est produite lors de la synchronisation." })
    } finally {
      setRefreshingCal(false)
    }
  }

  // Ajouter une absence
  const handleAddAbsence = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titre || !startDate || !startTime || !endDate || !endTime) return
    setSubmittingAbsence(true)
    setMessage(null)

    try {
      // Combiner date et heure de début
      const [startH, startM] = startTime.split(":")
      const fullStart = new Date(startDate)
      fullStart.setHours(parseInt(startH, 10), parseInt(startM, 10), 0, 0)

      // Combiner date et heure de fin
      const [endH, endM] = endTime.split(":")
      const fullEnd = new Date(endDate)
      fullEnd.setHours(parseInt(endH, 10), parseInt(endM, 10), 0, 0)

      const res = await ajouterIndisponibiliteAction({
        titre: titre.trim(),
        dateDebut: fullStart.toISOString(),
        dateFin: fullEnd.toISOString()
      })

      if (res.success) {
        setTitre("")
        setStartDate(undefined)
        setStartTime("")
        setEndDate(undefined)
        setEndTime("")
        setMessage({ type: 'success', text: "Absence planifiée avec succès !" })
        // Recharger la liste
        const resList = await getIndisponibilitesAgentAction()
        if (resList.success && resList.indisponibilites) {
          setIndisponibilites(resList.indisponibilites)
        }
      } else {
        setMessage({ type: 'error', text: res.error || "Une erreur est survenue." })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Une erreur s'est produite." })
    } finally {
      setSubmittingAbsence(false)
    }
  }

  // Déclencher l'ouverture de la modal de confirmation
  const handleDeleteClick = (id: string) => {
    setAbsenceToDelete(id)
  }

  // Valider et exécuter la suppression réelle
  const confirmerDeleteAbsence = async () => {
    if (!absenceToDelete) return
    setDeletingAbsence(true)
    setMessage(null)

    try {
      const res = await supprimerIndisponibiliteAction(absenceToDelete)
      if (res.success) {
        setIndisponibilites(prev => prev.filter(item => item.id !== absenceToDelete))
        setMessage({ type: 'success', text: "Période d'indisponibilité supprimée." })
      } else {
        setMessage({ type: 'error', text: res.error || "Une erreur est survenue lors de la suppression." })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Une erreur s'est produite." })
    } finally {
      setDeletingAbsence(false)
      setAbsenceToDelete(null)
    }
  }

  const selectedAbsence = indisponibilites.find(item => item.id === absenceToDelete)

  return (
    <div className="space-y-6 max-w-4xl">


      {/* Alertes messages */}
      {message && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs font-semibold shadow-xs ${
          message.type === 'success' 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <p className="leading-relaxed">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Section A : Synchronisation Google Agenda */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Link2 className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Synchronisation Google Calendar</h3>
            </div>
            
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Collez ici l'**adresse secrète au format iCal** de votre agenda Google pour y importer vos indisponibilités et réunions privées en temps réel.
            </p>

            <form onSubmit={handleSaveIcal} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Adresse secrète iCal (.ics)</label>
                 <input
                   type="url"
                   required
                   value={icalUrl}
                   onChange={(e) => setIcalUrl(e.target.value)}
                   placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
                   className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-slate-900"
                 />
               </div>

               {/* Indicateur de statut de synchronisation premium */}
               {icalUrl && (
                 <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold select-none">
                   <div className="flex items-center gap-2">
                     {/* Point lumineux pulsant */}
                     <div className="relative flex h-2 w-2">
                       {refreshingCal ? (
                         <>
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                         </>
                       ) : lastSyncedAt ? (
                         <>
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                         </>
                       ) : (
                         <>
                           <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-300"></span>
                         </>
                       )}
                     </div>
                     <span className="text-slate-900 text-[10px] uppercase tracking-wider">
                       {refreshingCal 
                         ? "Synchronisation..." 
                         : lastSyncedAt 
                           ? `Synchro : ${format(new Date(lastSyncedAt), "d MMMM 'à' HH'h'mm", { locale: fr })}`
                           : "Non synchronisé"
                       }
                     </span>
                   </div>

                   {lastSyncedAt && (
                     <button
                       type="button"
                       disabled={refreshingCal || loadingCal}
                       onClick={handleForceSync}
                       title="Forcer la synchronisation manuelle"
                       className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50 select-none flex items-center justify-center"
                     >
                       <RefreshCw className={`h-3.5 w-3.5 ${refreshingCal ? "animate-spin text-emerald-600" : ""}`} />
                     </button>
                   )}
                 </div>
               )}

               <button
                 type="submit"
                 disabled={loadingCal || refreshingCal}
                 className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
               >
                {loadingCal ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Sauvegarder & Synchroniser
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-6 text-[10px] text-gray-500 leading-relaxed font-medium space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1">💡 Comment trouver ce lien ?</h4>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Ouvrez <strong>Google Calendar</strong> sur ordinateur.</li>
              <li>Dans le menu de gauche, cliquez sur les 3 points à côté de votre agenda &rarr; <em>Paramètres et partage</em>.</li>
              <li>Faites défiler tout en bas jusqu'à la section <em>Intégrer l'agenda</em>.</li>
              <li>Copiez le lien nommé <strong>"Adresse secrète au format iCal"</strong>.</li>
            </ol>
          </div>
        </div>

        {/* Section B : Déclarer une indisponibilité locale */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
            <Calendar className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Déclarer une absence locale</h3>
          </div>

          <form onSubmit={handleAddAbsence} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Motif / Titre</label>
              <input
                type="text"
                required
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="ex: Rendez-vous médical, Congé annuel..."
                className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-slate-900"
              />
            </div>

            <div className="space-y-4">
              {/* Date/Heure de début */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Début de l'absence</label>
                <div className="grid grid-cols-2 gap-2">
                  <DatePicker
                    value={startDate}
                    onChange={setStartDate}
                    required
                    placeholder="Choisir le jour"
                  />
                  <TimePicker
                    value={startTime}
                    onChange={setStartTime}
                    required
                    placeholder="Choisir l'heure"
                  />
                </div>
              </div>

              {/* Date/Heure de fin */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fin de l'absence</label>
                <div className="grid grid-cols-2 gap-2">
                  <DatePicker
                    value={endDate}
                    onChange={setEndDate}
                    required
                    placeholder="Choisir le jour"
                  />
                  <TimePicker
                    value={endTime}
                    onChange={setEndTime}
                    required
                    placeholder="Choisir l'heure"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingAbsence}
              className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
            >
              {submittingAbsence ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Planification...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Ajouter l'indisponibilité
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Liste des indisponibilités déclarées */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Vos Indisponibilités locales déclarées</h3>
          </div>
          <button 
            onClick={chargerDonnees} 
            title="Recharger la liste"
            className="p-1 rounded-full hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loadingList ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loadingList && indisponibilites.length === 0 ? (
          <div className="text-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mx-auto" />
            <p className="text-xs text-gray-500 font-semibold mt-2">Chargement de la liste...</p>
          </div>
        ) : indisponibilites.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400">
            <Calendar className="h-8 w-8 stroke-[1.5] text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold">Aucune absence locale planifiée pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-gray-400 uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Motif</th>
                  <th className="py-3 px-4">Date de début</th>
                  <th className="py-3 px-4">Date de fin</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-semibold text-slate-900">
                {indisponibilites.map((item) => {
                  const start = new Date(item.dateDebut)
                  const end = new Date(item.dateFin)

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="py-3 px-4 font-bold text-gray-700">{item.titre}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {format(start, "d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {format(end, "d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteClick(item.id)}
                          title="Supprimer cette indisponibilité"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression de prestige */}
      <AnimatePresence>
        {absenceToDelete && selectedAbsence && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop avec flou */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAbsenceToDelete(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Boîte de dialogue */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden z-10 border border-slate-200 text-slate-900"
            >
              {/* En-tête alerte premium */}
              <div className="px-6 pt-6 pb-4 flex items-start gap-4 border-b border-slate-100 bg-slate-50/40 text-left">
                <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-rose-500 shrink-0 shadow-sm shadow-rose-100/50">
                  <AlertTriangle className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="text-base font-extrabold text-slate-900 tracking-tight">Supprimer l'indisponibilité ?</h4>
                  <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                    Cette action est définitive et affectera immédiatement la planification des visites en temps réel.
                  </p>
                </div>
              </div>

              {/* Contenu / Cartographie d'impact */}
              <div className="px-6 py-5 space-y-5 text-left">
                {/* Indisponibilité ciblée */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-50/30 border border-slate-200/80 border-l-4 border-l-emerald-500 rounded-2xl p-4.5 space-y-2 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Absence ciblée</p>
                  <h5 className="text-sm font-extrabold text-slate-900 leading-snug tracking-tight">{selectedAbsence.titre}</h5>
                  <p className="text-xs font-semibold text-emerald-700">
                    Du {format(new Date(selectedAbsence.dateDebut), "dd MMMM yyyy 'à' HH'h'mm", { locale: fr })} au {format(new Date(selectedAbsence.dateFin), "dd MMMM yyyy 'à' HH'h'mm", { locale: fr })}
                  </p>
                </div>

                {/* Grille d'impact */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cartographie d'impact de la suppression</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Clients & Visiteurs */}
                    <div className="bg-white hover:bg-slate-50/20 border border-slate-150 rounded-2xl p-3 space-y-1 shadow-sm transition-all duration-200 group">
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 bg-emerald-50 border border-emerald-100 rounded-md flex items-center justify-center text-emerald-600">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 group-hover:text-emerald-600 transition-colors uppercase tracking-wider">Clients / Visiteurs</span>
                      </div>
                      <p className="text-xs font-extrabold text-slate-900 leading-snug">
                        Créneaux libérés
                      </p>
                      <p className="text-[10px] text-gray-500 leading-normal font-medium">
                        La plage horaire redevient disponible à la réservation sur le site public.
                      </p>
                    </div>

                    {/* Visites existantes */}
                    <div className="bg-white hover:bg-slate-50/20 border border-slate-150 rounded-2xl p-3 space-y-1 shadow-sm transition-all duration-200 group">
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 bg-indigo-50 border border-indigo-100 rounded-md flex items-center justify-center text-indigo-500">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 group-hover:text-indigo-500 transition-colors uppercase tracking-wider">Agenda de Visites</span>
                      </div>
                      <p className="text-xs font-extrabold text-slate-900 leading-snug">
                        Intégrité préservée
                      </p>
                      <p className="text-[10px] text-gray-500 leading-normal font-medium">
                        Vos visites déjà planifiées et confirmées sur cette période restent inchangées.
                      </p>
                    </div>

                    {/* Google Agenda */}
                    <div className="bg-white hover:bg-slate-50/20 border border-slate-150 rounded-2xl p-3 space-y-1 shadow-sm transition-all duration-200 group">
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 bg-emerald-50 border border-emerald-100 rounded-md flex items-center justify-center text-emerald-600">
                          <RefreshCw className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 group-hover:text-emerald-600 transition-colors uppercase tracking-wider">Sync Google Calendar</span>
                      </div>
                      <p className="text-xs font-extrabold text-slate-900 leading-snug">
                        Aucune altération
                      </p>
                      <p className="text-[10px] text-gray-500 leading-normal font-medium">
                        Les blocages et réunions synchronisés depuis votre flux iCal Google restent intacts.
                      </p>
                    </div>

                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAbsenceToDelete(null)}
                  disabled={deletingAbsence}
                  className="h-10 px-4 border border-slate-200 hover:border-slate-400 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50 select-none shadow-sm"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirmerDeleteAbsence}
                  disabled={deletingAbsence}
                  className="h-10 px-5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold rounded-xl text-xs transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 select-none active:scale-[0.98]"
                >
                  {deletingAbsence ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3.5 w-3.5 stroke-[2.5px]" />
                      Oui, supprimer
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
