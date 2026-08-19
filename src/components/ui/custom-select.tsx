"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Check } from "lucide-react"

export interface CustomSelectOption {
  value: string
  label: string
  icon?: React.ReactNode
}

export interface CustomSelectProps {
  value: string
  onChange: (val: string) => void
  options: CustomSelectOption[]
  placeholder?: string
  triggerIcon?: React.ReactNode
  className?: string
  triggerClassName?: string
  alignRight?: boolean
  size?: 'sm' | 'md'
}

export function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Sélectionner...', 
  triggerIcon,
  className = '',
  triggerClassName = '',
  alignRight = false,
  size = 'md'
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={triggerClassName || `w-full bg-white hover:bg-slate-50 focus:outline-none flex items-center justify-between text-slate-900 transition-all cursor-pointer shadow-sm font-semibold border ${
          size === 'sm' 
            ? 'h-8 px-2.5 rounded-lg text-[10px] border-slate-200' 
            : 'h-10 px-4 rounded-xl text-xs border-slate-200'
        } ${isOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20' : ''}`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedOption?.icon ? (
            <span className="shrink-0">{selectedOption.icon}</span>
          ) : triggerIcon ? (
            <span className="shrink-0">{triggerIcon}</span>
          ) : null}
          <span className="truncate text-left text-slate-900 font-bold">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className={`absolute z-50 mt-1 w-full min-w-[200px] max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg focus:outline-none ${
              alignRight ? 'right-0' : 'left-0'
            }`}
          >
            {options.map((option) => {
              const isSelected = option.value === value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-left font-bold cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-emerald-50 text-emerald-700 font-extrabold' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {option.icon && <span className="shrink-0">{option.icon}</span>}
                  <span className="truncate flex-1 font-bold">{option.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
