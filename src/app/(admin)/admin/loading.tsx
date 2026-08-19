import React from "react"
import { Loader2 } from "lucide-react"

export default function AdminLoading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center space-y-4 p-8">
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-xs flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Chargement en cours...</h3>
        <p className="text-xs text-slate-500 font-medium">ImmOfika — Espace Administration & Promotion Agréée</p>
      </div>
    </div>
  )
}
