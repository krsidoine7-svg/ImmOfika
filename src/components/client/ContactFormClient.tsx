"use client"

import * as React from "react"
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
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-white text-slate-800 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-semibold transition-all text-left h-[46px]"
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

export default function ContactFormClient() {
  const [object, setObject] = React.useState("Question sur mon paiement")
  const [message, setMessage] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      toast.error("Veuillez saisir votre message")
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success("Votre message a bien été transmis à votre conseiller !")
      setMessage("")
      setObject("Question sur mon paiement")
    }, 800)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Objet de la demande</label>
        <CustomSelect
          value={object}
          onChange={setObject}
          options={[
            { value: "Question sur mon paiement", label: "Question sur mon paiement" },
            { value: "Compléter mon dossier KYC", label: "Compléter mon dossier KYC" },
            { value: "Planifier une visite terrain", label: "Planifier une visite terrain" },
            { value: "Autre demande générale", label: "Autre demande générale" }
          ]}
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Message</label>
        <textarea 
          rows={4} 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
          placeholder="Décrivez votre préoccupation..."
          required
        ></textarea>
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full py-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 mt-2 shadow-md shadow-emerald-500/20 cursor-pointer"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin text-white" />
        ) : (
          <Send className="h-4 w-4 text-white" />
        )}
        Envoyer ma demande
      </Button>
    </form>
  )
}
