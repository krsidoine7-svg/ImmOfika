import React from "react"
import { Loader2 } from "lucide-react"

export default function ClientLoading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center space-y-4 p-8">
      <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-100 shadow-xs flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Chargement de votre espace...</h3>
        <p className="text-xs text-slate-400 font-medium">ImmOfika — Espace Client</p>
      </div>
    </div>
  )
}
