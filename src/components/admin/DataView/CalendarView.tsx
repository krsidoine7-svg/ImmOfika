"use client"

import * as React from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns"
import { fr } from "date-fns/locale"

interface CalendarViewProps {
  data: Record<string, any>[]
  dateField?: string
}

export function CalendarView({ data, dateField = "createdAt" }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getItemDate = (item: Record<string, any>): Date | null => {
    const raw = item[dateField] || item.created_at || item.createdAt
    if (!raw) return null
    const parsed = new Date(raw)
    return isNaN(parsed.getTime()) ? null : parsed
  }

  const selectedDayItems = React.useMemo(() => {
    if (!selectedDate) return []
    return data.filter((item) => {
      const d = getItemDate(item)
      return d && isSameDay(d, selectedDate)
    })
  }, [data, selectedDate, dateField])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      {/* Grille du Calendrier */}
      <div className="lg:col-span-2 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-900 flex flex-col h-full shadow-sm">
        {/* Navigation Mois */}
        <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100 dark:border-zinc-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white capitalize flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-emerald-600" />
            {format(currentMonth, "MMMM yyyy", { locale: fr })}
          </h3>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 mb-2">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Grille des jours */}
        <div className="grid grid-cols-7 gap-1 flex-1">
          {daysInMonth.map((day) => {
            const dayItems = data.filter((item) => {
              const d = getItemDate(item)
              return d && isSameDay(d, day)
            })

            const isSelected = selectedDate && isSameDay(day, selectedDate)

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all min-h-[60px] ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20"
                    : isSameMonth(day, currentMonth)
                    ? "border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60"
                    : "border-transparent text-slate-300 opacity-40"
                }`}
              >
                <span className="font-bold text-xs">{format(day, "d")}</span>
                {dayItems.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[9px] w-fit">
                    {dayItems.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Panneau latéral des éléments du jour sélectionné */}
      <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-900 flex flex-col h-full shadow-sm">
        <h4 className="font-bold text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-zinc-800 mb-3">
          Événements du {selectedDate ? format(selectedDate, "dd MMMM yyyy", { locale: fr }) : "Sélectionner un jour"}
        </h4>

        <div className="flex-1 overflow-y-auto space-y-3">
          {selectedDayItems.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs space-y-1.5"
            >
              <p className="font-bold text-slate-900 dark:text-white">
                {item.titre || item.nom || item.numero || "Enregistrement"}
              </p>
              {item.prix && (
                <p className="font-semibold text-emerald-600">
                  {Number(item.prix).toLocaleString("fr-FR")} FCFA
                </p>
              )}
              {item.ville && (
                <p className="text-slate-500 text-[11px] flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-emerald-600" />
                  {item.ville}
                </p>
              )}
            </div>
          ))}

          {selectedDayItems.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400 italic">
              Aucun élément pour cette date.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
