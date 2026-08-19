'use client'

import React from 'react'
import { Star, MessageSquare, ShieldCheck, User } from 'lucide-react'

interface AvisItem {
  id: string
  note: number
  commentaire?: string | null
  createdAt: Date
  clientName?: string | null
  bienTitre?: string | null
}

interface AgentAvisSectionProps {
  avisList: AvisItem[]
  averageNote?: number
}

export function AgentAvisSection({ avisList, averageNote }: AgentAvisSectionProps) {
  const avg = averageNote || (avisList.length > 0 ? avisList.reduce((acc, a) => acc + a.note, 0) / avisList.length : 5)

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
      
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A84C]">Satisfaction Client</span>
          <h2 className="text-lg font-extrabold text-[#1A2A4A] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#C9A84C]" />
            <span>Avis Clients & Évaluations des Visites</span>
          </h2>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium block">Note Moyenne</span>
            <span className="text-lg font-black text-[#1A2A4A]">{avg.toFixed(1)} / 5</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  Math.round(avg) >= star ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* List of Reviews */}
      <div className="space-y-3">
        {avisList.map((avis) => (
          <div key={avis.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1A2A4A]/10 flex items-center justify-center text-[#1A2A4A] font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-[#1A2A4A]">{avis.clientName || 'Client Client'}</span>
                  {avis.bienTitre && <span className="text-[11px] text-slate-400 block font-light">Visite : {avis.bienTitre}</span>}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      avis.note >= s ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {avis.commentaire && (
              <p className="text-xs text-slate-600 font-light italic leading-relaxed pl-9">
                "{avis.commentaire}"
              </p>
            )}

            <span className="text-[9px] text-slate-400 block pl-9">
              Soumis le {new Date(avis.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
        ))}

        {avisList.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs font-light italic">
            Aucun avis client enregistré pour le moment.
          </div>
        )}
      </div>
    </div>
  )
}
