"use client"

import * as React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar as CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  value: Date | undefined
  onChange: (value: Date | undefined) => void
  placeholder?: string
  className?: string
  alignRight?: boolean
  required?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Sélectionner une date",
  className,
  alignRight = false,
  required = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

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
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate text-left font-bold">
              {value ? (
                format(value, "dd MMMM yyyy", { locale: fr })
              ) : (
                <span className="text-slate-450 font-normal">{placeholder}</span>
              )}
            </span>
          </div>
          {value && !required && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onChange(undefined)
              }}
              className="hover:bg-slate-100 p-0.5 rounded-full text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer focus:outline-none"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 rounded-2xl shadow-xl border border-slate-150 bg-white mt-1"
          align={alignRight ? "end" : "start"}
        >
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date)
              setIsOpen(false)
            }}
            locale={fr}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
