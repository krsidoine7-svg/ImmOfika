"use client"

import * as React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DateRangePickerProps {
  value: DateRange | undefined
  onChange: (value: DateRange | undefined) => void
  placeholder?: string
  className?: string
  alignRight?: boolean
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Choisir une période",
  className,
  alignRight = false,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className={cn("relative", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          render={<div />}
          nativeButton={false}
          className={cn(
            "h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 focus:outline-none flex items-center justify-between text-xs text-slate-900 cursor-pointer transition-all shadow-sm font-semibold gap-2 min-w-[230px]",
            isOpen ? "border-emerald-500 ring-2 ring-emerald-500/20" : ""
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate text-left font-bold">
              {value?.from ? (
                value.to ? (
                  <>
                    {format(value.from, "dd MMM yyyy", { locale: fr })} -{" "}
                    {format(value.to, "dd MMM yyyy", { locale: fr })}
                  </>
                ) : (
                  format(value.from, "dd MMM yyyy", { locale: fr })
                )
              ) : (
                <span className="text-slate-400">{placeholder}</span>
              )}
            </span>
          </div>
          {value?.from && (
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
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            locale={fr}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
