'use client'

import React, { useState } from 'react'
import { Calendar as CalendarIcon, Clock, Sparkles, CheckCircle2, Loader2, MapPin } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { planifierVisiteAction } from '@/app/actions/visiteAvis'

interface PlanifierVisiteModalProps {
  isOpen: boolean
  onClose: () => void
  bien: {
    id: string
    titre: string
    ville: string
    quartier?: string | null
  }
  clientId: string
}

export function PlanifierVisiteModal({ isOpen, onClose, bien, clientId }: PlanifierVisiteModalProps) {
  const [dateVisite, setDateVisite] = useState('')
  const [plageHoraire, setPlageHoraire] = useState<'matin' | 'apres_midi'>('matin')
  const [commentaires, setCommentaires] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!dateVisite) {
      toast.error('Veuillez sélectionner la date de votre visite.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await planifierVisiteAction({
        bienId: bien.id,
        clientId,
        dateVisite,
        plageHoraire,
        commentaires,
      })

      if (res.success) {
        toast.success(res.message)
        onClose()
      } else {
        toast.error(res.error || 'Erreur lors de la réservation.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Une erreur est survenue.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate min date (tomorrow)
  const [tomorrowStr] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border border-gray-100 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6">
        <DialogHeader className="space-y-2 border-b border-gray-100 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#C9A84C] text-xs font-bold w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Promoteur Immobilier Agréé — Visite Guidée sur le Terrain</span>
          </div>
          <DialogTitle className="text-xl font-extrabold text-[#1A2A4A]">
            Planifier une Visite du Bien
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-light">
            Choisissez le jour et votre plage horaire préférentielle pour être accompagné par notre conseiller agréé.
          </DialogDescription>
        </DialogHeader>

        {/* Bien info preview */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
          <span className="font-bold text-[#1A2A4A] block text-sm">{bien.titre}</span>
          <span className="text-slate-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#C9A84C]" />
            {bien.quartier ? `${bien.quartier}, ` : ''}{bien.ville}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#1A2A4A] flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-[#C9A84C]" />
              <span>Choisir le Jour de la Visite :</span>
            </label>
            <input
              type="date"
              min={tomorrowStr}
              value={dateVisite}
              onChange={(e) => setDateVisite(e.target.value)}
              required
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C9A84C] outline-none font-medium"
            />
          </div>

          {/* Time Slot Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#1A2A4A] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#C9A84C]" />
              <span>Choisir la Plage Horaire :</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPlageHoraire('matin')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  plageHoraire === 'matin'
                    ? 'border-[#1A2A4A] bg-[#1A2A4A] text-white shadow-md'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <span>Matinée</span>
                <span className="text-[10px] font-normal opacity-80">09h00 — 12h00</span>
              </button>

              <button
                type="button"
                onClick={() => setPlageHoraire('apres_midi')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  plageHoraire === 'apres_midi'
                    ? 'border-[#1A2A4A] bg-[#1A2A4A] text-white shadow-md'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <span>Après-midi</span>
                <span className="text-[10px] font-normal opacity-80">14h00 — 18h00</span>
              </button>
            </div>
          </div>

          {/* Optional notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Commentaires ou besoins particuliers (optionnel) :</label>
            <textarea
              value={commentaires}
              onChange={(e) => setCommentaires(e.target.value)}
              placeholder="Ex: Souhaite la présence de l'ingénieur travaux..."
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C9A84C] outline-none min-h-[70px]"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#1A2A4A] hover:bg-[#111e36] text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C9A84C]" />
                  <span>Enregistrement de la visite...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />
                  <span>Confirmer & Réserver le Créneau</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
