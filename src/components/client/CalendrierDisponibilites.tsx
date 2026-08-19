"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { getDisponibilitesAction } from "@/app/actions/disponibilites"
import { Clock, Calendar as CalendarIcon, Loader2, Ban, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { motion, AnimatePresence } from "framer-motion"

interface CalendrierDisponibilitesProps {
  selectedDate: Date | undefined
  onSelect: (date: Date | undefined) => void
  selectedTime: string
  onTimeSelect: (time: string) => void
  bienId: string
}

const CRENEAUX_HORAIRES = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00"
]

export default function CalendrierDisponibilites({
  selectedDate,
  onSelect,
  selectedTime,
  onTimeSelect,
  bienId
}: CalendrierDisponibilitesProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date())
  const [indisponibles, setIndisponibles] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)

  // Charger les indisponibilités pour le mois affiché
  const chargerIndisponibilites = React.useCallback(async (date: Date) => {
    if (!bienId) return
    setLoading(true)
    const moisStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    try {
      const res = await getDisponibilitesAction(moisStr, bienId)
      if (res.success && res.indisponibles) {
        setIndisponibles(res.indisponibles)
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des créneaux indisponibles :", err)
    } finally {
      setLoading(false)
    }
  }, [bienId])

  React.useEffect(() => {
    chargerIndisponibilites(currentMonth)
  }, [currentMonth, chargerIndisponibilites])

  // Déterminer si un jour spécifique est entièrement indisponible ou passé
  const isDayDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (date < today) return true
    if (date.getDay() === 0) return true

    const dateIso = date.toISOString().split('T')[0]
    const creneauxOccupesJour = indisponibles.filter(item => item.startsWith(dateIso))
    
    return creneauxOccupesJour.length >= CRENEAUX_HORAIRES.length
  }

  // Calculer l'état de chaque créneau pour la date sélectionnée
  const creneauxEtat = React.useMemo(() => {
    if (!selectedDate) return []

    const dateIso = selectedDate.toISOString().split('T')[0]
    const todayStr = new Date().toISOString().split('T')[0]
    const nowHour = new Date().getHours()

    return CRENEAUX_HORAIRES.map(heure => {
      const creneauFull = `${dateIso} ${heure}`
      const isReserved = indisponibles.includes(creneauFull)
      
      let isPast = false
      if (dateIso === todayStr) {
        const [h] = heure.split(':').map(Number)
        if (h <= nowHour) isPast = true
      }

      const disponible = !isReserved && !isPast
      return {
        heure,
        disponible,
        raison: isReserved ? "Déjà réservé" : isPast ? "Heure passée" : null
      }
    })
  }, [selectedDate, indisponibles])

  return (
    <div className="space-y-4">
      {/* Légende rapide */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" />
          Occupé / Passé
        </span>
        {loading && (
          <span className="flex items-center gap-1 text-emerald-600 font-bold">
            <Loader2 className="w-3 h-3 animate-spin" /> Mise à jour...
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Partie 1 : Calendrier interactif */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col items-center justify-center">
          <div className="w-full flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Date de la visite</h4>
          </div>
          
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              onSelect(date)
              onTimeSelect("")
            }}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            disabled={isDayDisabled}
            locale={fr}
            className="p-0 border-0 bg-transparent"
          />
        </div>

        {/* Partie 2 : Créneaux horaires */}
        <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 min-h-[300px] flex flex-col">
          <div className="w-full flex items-center gap-2 border-b border-slate-200 pb-2 mb-3">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">2. Créneau Horaire</h4>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {!selectedDate ? (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-center py-12 px-2 text-slate-400 flex flex-col items-center justify-center gap-2"
                >
                  <CalendarIcon className="h-8 w-8 text-slate-300 stroke-[1.5]" />
                  <p className="text-xs font-medium max-w-[180px] leading-relaxed">
                    Veuillez d&apos;abord sélectionner un jour disponible dans le calendrier.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg py-1.5 px-3 inline-block shadow-xs">
                    📅 {format(selectedDate, "eeee d MMMM yyyy", { locale: fr })}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {creneauxEtat.map(({ heure, disponible, raison }) => {
                      const estSelectionne = selectedTime === heure
                      
                      return (
                        <button
                          key={heure}
                          type="button"
                          disabled={!disponible}
                          onClick={() => onTimeSelect(heure)}
                          title={!disponible ? (raison === "Heure passée" ? "Créneau déjà passé" : "Créneau déjà réservé") : `Choisir ${heure}`}
                          className={`
                            h-10 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-between border cursor-pointer select-none
                            ${estSelectionne 
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-sm" 
                              : disponible 
                                ? "bg-white text-slate-800 border-slate-200 hover:border-emerald-500 hover:text-emerald-600" 
                                : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50"
                            }
                          `}
                        >
                          <span>{heure}</span>
                          {!disponible ? (
                            <Ban className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          ) : estSelectionne ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
