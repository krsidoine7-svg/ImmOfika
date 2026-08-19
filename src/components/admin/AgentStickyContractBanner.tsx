'use client'

import React, { useEffect, useState } from 'react'
import { AlertTriangle, FileText, ArrowRight, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UploadContratModal } from '@/components/admin/UploadContratModal'

interface ReservationPendingContract {
  id: string
  clientName: string
  clientEmail: string
  bienTitre: string
  montantPaye: number
}

interface AgentStickyContractBannerProps {
  pendingReservations: ReservationPendingContract[]
}

export function AgentStickyContractBanner({ pendingReservations }: AgentStickyContractBannerProps) {
  const [activeReservation, setActiveReservation] = useState<ReservationPendingContract | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dismissedIds, setDismissedIds] = useState<string[]>([])

  const currentPending = pendingReservations.find((r) => !dismissedIds.includes(r.id))

  if (!currentPending) return null

  const formatAmount = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num).replace(/[\u202F\u00A0]/g, ' ') + ' FCFA'
  }

  const handleOpenModal = () => {
    setActiveReservation(currentPending)
    setIsModalOpen(true)
  }

  return (
    <>
      {/* Sticky Banner Component */}
      <div className="w-full bg-gradient-to-r from-[#1A2A4A] via-[#2A3B5C] to-[#1A2A4A] border-b-2 border-[#C9A84C] text-white p-4 shadow-xl relative z-40 animate-in slide-in-from-top duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#C9A84C]/20 border border-[#C9A84C]/50 rounded-xl text-[#C9A84C] animate-pulse">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#C9A84C]">
                  Promoteur Immobilier Agréé — Action Requise Urgent
                </span>
              </div>
              <p className="text-sm font-medium text-slate-100 mt-0.5">
                Le client <strong className="text-white font-bold">{currentPending.clientName}</strong> ({currentPending.clientEmail}) a réglé l'acompte de{' '}
                <strong className="text-[#C9A84C]">{formatAmount(currentPending.montantPaye)}</strong> pour le bien{' '}
                <strong className="text-white">{currentPending.bienTitre}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              onClick={handleOpenModal}
              className="bg-[#C9A84C] hover:bg-[#b8973d] text-[#1A2A4A] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Générer et Transmettre le Contrat</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <button
              onClick={() => setDismissedIds((prev) => [...prev, currentPending.id])}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Masquer temporairement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Modal d'édition de contrat pré-sélectionnée */}
      {activeReservation && (
        <UploadContratModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setActiveReservation(null)
          }}
          reservation={{
            id: activeReservation.id,
            bienTitre: activeReservation.bienTitre,
            clientName: activeReservation.clientName,
            clientEmail: activeReservation.clientEmail,
          }}
        />
      )}
    </>
  )
}
