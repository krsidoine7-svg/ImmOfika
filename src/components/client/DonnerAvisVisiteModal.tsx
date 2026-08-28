'use client'

import React, { useState } from 'react'
import { Star, Sparkles, Send, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { soumettreAvisVisiteAction } from '@/app/actions/visiteAvis'

interface DonnerAvisVisiteModalProps {
  isOpen: boolean
  onClose: () => void
  visite: {
    id: string
    bienTitre?: string | null
    agentName?: string | null
  }
  clientId: string
}

export function DonnerAvisVisiteModal({ isOpen, onClose, visite, clientId }: DonnerAvisVisiteModalProps) {
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [commentaire, setCommentaire] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)
    try {
      const res = await soumettreAvisVisiteAction({
        visiteId: visite.id,
        clientId,
        note: rating,
        commentaire,
      })

      if (res.success) {
        toast.success(res.message)
        onClose()
      } else {
        toast.error(res.error || 'Erreur lors de la soumission de votre avis.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Une erreur est survenue.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border border-gray-100 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6">
        <DialogHeader className="space-y-2 border-b border-gray-100 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Votre Avis Compte — ImmOfika</span>
          </div>
          <DialogTitle className="text-xl font-extrabold text-[#1A2A4A]">
            Évaluer votre Visite & Conseiller
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-light">
            Partagez votre retour d'expérience sur la visite du bien {visite.bienTitre ? <strong>{visite.bienTitre}</strong> : ''}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating selector */}
          <div className="text-center space-y-2">
            <label className="block text-xs font-bold text-slate-700">Notez la prestation de l'agent :</label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-100 text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-[#C9A84C] block">
              {rating === 5 && '⭐⭐⭐⭐⭐ Excellent !'}
              {rating === 4 && '⭐⭐⭐⭐ Très Bien !'}
              {rating === 3 && '⭐⭐⭐ Satisfaisant'}
              {rating === 2 && '⭐⭐ À améliorer'}
              {rating === 1 && '⭐ Insatisfaisant'}
            </span>
          </div>

          {/* Comment textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#1A2A4A]">Votre commentaire détaillé :</label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Ponctualité, professionnalisme, conseils fonciers de l'agent..."
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C9A84C] outline-none min-h-[90px]"
            />
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed italic">
            Note : Les avis gratifiés de 4 et 5 étoiles sont automatiquement publiés dans les témoignages certifiés sur notre site officiel.
          </p>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#1A2A4A] hover:bg-[#111e36] text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C9A84C]" />
                  <span>Envoi de votre avis...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-[#C9A84C]" />
                  <span>Soumettre mon Évaluation</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
