"use client"

import * as React from "react"
import { submitSuggestionAction } from "@/app/actions/client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, Send } from "lucide-react"

interface CustomSelectProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (val: string) => void
}

function CustomSelect({ options, value, onChange }: CustomSelectProps) {
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
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white text-slate-800 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-semibold transition-all text-left h-[46px]"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : "Sélectionner..."}</span>
        <svg className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <ul className="absolute z-50 mt-1.5 w-full bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-emerald-50 transition-colors ${
                  opt.value === value ? "text-emerald-700 bg-emerald-50/80" : "text-slate-700"
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

export default function SuggestionFormClient() {
  const [category, setCategory] = React.useState("Amélioration Espace Client")
  const [message, setMessage] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      toast.error("Veuillez saisir votre message")
      return
    }

    setIsSubmitting(true)
    try {
      await submitSuggestionAction(category, message)
      toast.success("Suggestion soumise avec succès !")
      setMessage("")
      setCategory("Amélioration Espace Client")
    } catch (err: any) {
      toast.error("Erreur lors de la soumission : " + (err.message || String(err)))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Catégorie</label>
        <CustomSelect
          value={category}
          onChange={setCategory}
          options={[
            { value: "Amélioration Espace Client", label: "Amélioration Espace Client" },
            { value: "Problème de Paiement", label: "Problème de Paiement" },
            { value: "Question Juridique & Contrat", label: "Question Juridique & Contrat" },
            { value: "Avis & Recommandations", label: "Avis & Recommandations" },
            { value: "Autre", label: "Autre" }
          ]}
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Votre suggestion / message</label>
        <textarea 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5} 
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium bg-white"
          placeholder="Décrivez votre suggestion en détail..."
          maxLength={1000}
        ></textarea>
        <p className="text-[10px] text-slate-400 text-right mt-1">{message.length}/1000 caractères</p>
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full py-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin text-white" />
        ) : (
          <Send className="h-4 w-4 text-white" />
        )}
        Soumettre ma suggestion
      </Button>
    </form>
  )
}
