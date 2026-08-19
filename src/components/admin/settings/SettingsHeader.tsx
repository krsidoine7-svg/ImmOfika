"use client"

import { CheckCircle, Database, CloudLightning, Activity, ShieldCheck } from 'lucide-react'

export default function SettingsHeader() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {/* DB status */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Base de données</p>
            <p className="text-sm font-extrabold text-slate-900 mt-0.5">Supabase PostgreSQL</p>
          </div>
        </div>
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
      </div>

      {/* Paystack CI Gateway */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100">
            <CloudLightning className="h-5 w-5" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Passerelle de paiement</p>
            <p className="text-sm font-extrabold text-slate-900 mt-0.5">Paystack CI API</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-extrabold border border-indigo-100 uppercase tracking-wider">
          <Activity className="h-3 w-3 animate-pulse" /> Live
        </div>
      </div>

      {/* Security Engine */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Garde-barrière RLS</p>
            <p className="text-sm font-extrabold text-slate-900 mt-0.5">Conformité OHADA/RGPD</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
          <CheckCircle className="h-3 w-3" /> Actif
        </span>
      </div>
    </div>
  )
}
