"use client"

import * as React from "react"
import { submitBienConfieAction } from "@/app/actions/client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, Send } from "lucide-react"

interface CustomSelectProps {
  name: string
  options: { value: string; label: string }[]
  value: string
  onChange: (val: string) => void
  required?: boolean
}

function CustomSelect({ name, options, value, onChange, required }: CustomSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedOption = options.find(o => o.value === value)

  return (
    <div className="relative w-full" ref={containerRef}>
      <input type="hidden" name={name} value={value} required={required} />
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-white text-slate-800 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:border-transparent font-medium transition-all text-left h-[46px]"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : "Sélectionner..."}</span>
        <svg className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-250 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <ul className="absolute z-50 mt-1.5 w-full bg-white border border-slate-100/80 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-slate-50 transition-colors ${
                  opt.value === value ? "text-[#B8860B] bg-[#B8860B]/5" : "text-slate-700"
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function ConfierFormClient() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [typeService, setTypeService] = React.useState("Lotissement & Aménagement Foncier")
  const [titreFoncier, setTitreFoncier] = React.useState("true")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    
    try {
      await submitBienConfieAction(formData)
      toast.success("Votre demande a bien été enregistrée. Un agent vous contactera sous 24h.")
      form.reset()
      setTypeService("Lotissement & Aménagement Foncier")
      setTitreFoncier("true")
    } catch (err: any) {
      toast.error("Erreur lors de la soumission : " + (err.message || String(err)))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Type de Service souhaité</label>
        <CustomSelect
          name="typeService"
          value={typeService}
          onChange={setTypeService}
          options={[
            { value: "Lotissement & Aménagement Foncier", label: "Lotissement & Aménagement Foncier" },
            { value: "Construction & Promotion", label: "Construction & Promotion" },
            { value: "Gestion Locative Premium", label: "Gestion Locative Premium" },
            { value: "Intermédiation de Vente", label: "Intermédiation de Vente" }
          ]}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Ville</label>
          <input 
            type="text" 
            name="ville"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:border-transparent font-medium"
            placeholder="Ex: Abidjan"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Quartier</label>
          <input 
            type="text" 
            name="quartier"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:border-transparent font-medium"
            placeholder="Ex: Cocody"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Surface (m²)</label>
          <input 
            type="number" 
            name="surface"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:border-transparent font-medium"
            placeholder="Ex: 500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Titre Foncier disponible ?</label>
          <CustomSelect
            name="titreFoncier"
            value={titreFoncier}
            onChange={setTitreFoncier}
            options={[
              { value: "true", label: "Oui (ACD, Titre Foncier)" },
              { value: "false", label: "Non / En cours de traitement" }
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Budget estimé (FCFA)</label>
          <input 
            type="number" 
            name="budget"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:border-transparent font-medium"
            placeholder="Ex: 15000000"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Téléphone de contact</label>
          <input 
            type="tel" 
            name="telephone"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:border-transparent font-medium"
            placeholder="Ex: +225 07..."
          />
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full py-6 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs flex items-center justify-center gap-2 mt-2"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
        ) : (
          <Send className="h-4 w-4 text-emerald-400" />
        )}
        Confier mon bien à ImmOfika
      </Button>
    </form>
  )
}
