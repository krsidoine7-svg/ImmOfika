"use client"

import * as React from "react"
import { DatePicker } from "@/components/ui/date-picker"
import { PeriodFilter, KPIParams } from "@/app/actions/kpis"
import { CalendarRange, Filter } from "lucide-react"

interface DashboardFiltersProps {
  filters: KPIParams
  onFiltersChange: (newFilters: KPIParams) => void
}

export default function DashboardFilters({ filters, onFiltersChange }: DashboardFiltersProps) {
  const presets: { value: PeriodFilter; label: string }[] = [
    { value: "cette_semaine", label: "Cette semaine" },
    { value: "ce_mois", label: "Ce mois" },
    { value: "ce_trimestre", label: "Ce trimestre" },
    { value: "annee", label: "Cette année" },
    { value: "tout", label: "Tout historique" },
  ]

  const handlePresetClick = (presetValue: PeriodFilter) => {
    if (presetValue === "custom") return
    onFiltersChange({
      period: presetValue,
      startDate: undefined,
      endDate: undefined,
    })
  }

  const handleCustomDateChange = (type: 'start' | 'end', date: Date | undefined) => {
    const dateStr = date ? date.toISOString().split('T')[0] : undefined
    onFiltersChange({
      ...filters,
      period: "custom",
      startDate: type === 'start' ? dateStr : filters.startDate,
      endDate: type === 'end' ? dateStr : filters.endDate,
    })
  }

  const startDateObj = filters.startDate ? new Date(filters.startDate) : undefined
  const endDateObj = filters.endDate ? new Date(filters.endDate) : undefined

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
          <Filter className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-slate-900">Filtres d&apos;activité</h4>
          <p className="text-[10px] text-slate-500 font-medium">Affiner les statistiques par période</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {presets.map((preset) => {
          const isActive = filters.period === preset.value
          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => handlePresetClick(preset.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {preset.label}
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => onFiltersChange({ ...filters, period: "custom" })}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
            filters.period === "custom"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
              : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          Période personnalisée
        </button>
      </div>

      {filters.period === "custom" && (
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:border-l sm:border-slate-200 sm:pl-4 transition-all duration-300">
          <CalendarRange className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          <div className="w-full sm:w-40">
            <DatePicker
              value={startDateObj}
              onChange={(date) => handleCustomDateChange('start', date)}
              placeholder="Date début"
            />
          </div>
          <span className="text-[10px] text-slate-400 font-bold">au</span>
          <div className="w-full sm:w-40">
            <DatePicker
              value={endDateObj}
              onChange={(date) => handleCustomDateChange('end', date)}
              placeholder="Date fin"
            />
          </div>
        </div>
      )}
    </div>
  )
}
