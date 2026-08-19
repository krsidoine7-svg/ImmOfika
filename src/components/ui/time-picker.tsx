"use client"

import * as React from "react"
import { Clock as ClockIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface TimePickerProps {
  value: string // Format "HH:MM"
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  alignRight?: boolean
  required?: boolean
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Choisir l'heure",
  className,
  alignRight = false,
  required = false,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  // Extraire heures et minutes de la valeur "HH:MM"
  const [selectedHour, setSelectedHour] = React.useState<string>("")
  const [selectedMinute, setSelectedMinute] = React.useState<string>("")

  React.useEffect(() => {
    if (value && value.includes(":")) {
      const [h, m] = value.split(":")
      setSelectedHour(h)
      setSelectedMinute(m)
    } else {
      setSelectedHour("")
      setSelectedMinute("")
    }
  }, [value, isOpen])

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"))

  const handleSelectHour = (hour: string) => {
    setSelectedHour(hour)
    const newTime = `${hour}:${selectedMinute || "00"}`
    onChange(newTime)
  }

  const handleSelectMinute = (minute: string) => {
    setSelectedMinute(minute)
    const newTime = `${selectedHour || "12"}:${minute}`
    onChange(newTime)
    setIsOpen(false) // Fermer dès que les minutes sont choisies
  }

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          render={<div />}
          nativeButton={false}
          className={cn(
            "h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 focus:outline-none flex items-center justify-between text-xs text-slate-900 cursor-pointer transition-all shadow-sm font-semibold gap-2 w-full",
            isOpen ? "border-emerald-500 ring-2 ring-emerald-500/20" : ""
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <ClockIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate text-left font-bold">
              {value ? (
                value
              ) : (
                <span className="text-slate-400 font-normal">{placeholder}</span>
              )}
            </span>
          </div>
          {value && !required && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onChange("")
              }}
              className="hover:bg-slate-100 p-0.5 rounded-full text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer focus:outline-none"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </PopoverTrigger>
        <PopoverContent
          className="p-3 rounded-2xl shadow-xl border border-slate-150 bg-white mt-1 w-64"
          align={alignRight ? "end" : "start"}
        >
          <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500">Heure</span>
            <span className="text-xs font-bold text-slate-500">Minutes</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 h-44">
            {/* Colonne des Heures */}
            <div className="overflow-y-auto pr-1 space-y-0.5 scrollbar-thin select-none">
              {hours.map((h) => {
                const isSelected = selectedHour === h
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleSelectHour(h)}
                    className={cn(
                      "w-full text-center py-1.5 text-xs rounded-lg transition-all font-semibold cursor-pointer",
                      isSelected
                        ? "bg-slate-900 text-emerald-400 font-bold"
                        : "hover:bg-slate-50 text-slate-800"
                    )}
                  >
                    {h} h
                  </button>
                )
              })}
            </div>

            {/* Colonne des Minutes */}
            <div className="overflow-y-auto pr-1 space-y-0.5 scrollbar-thin select-none border-l border-slate-100 pl-2">
              {minutes.map((m) => {
                const isSelected = selectedMinute === m
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSelectMinute(m)}
                    disabled={!selectedHour}
                    className={cn(
                      "w-full text-center py-1.5 text-xs rounded-lg transition-all font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
                      isSelected
                        ? "bg-emerald-600 text-white font-bold"
                        : "hover:bg-slate-50 text-slate-800"
                    )}
                  >
                    {m} min
                  </button>
                )
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
