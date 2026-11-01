import * as React from 'react'
import Link from 'next/link'
import { ShieldX, Home, LogIn, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Accès Non Autorisé (403) — ImmOfika',
  description: "Vous n'avez pas les autorisations nécessaires pour accéder à cette section.",
}

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-[#F8FBF9] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background subtle branding gradients */}
      <div className="absolute -left-40 -top-40 w-96 h-96 rounded-full bg-gradient-to-br from-[#10B981]/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -right-40 -bottom-40 w-96 h-96 rounded-full bg-gradient-to-br from-[#059669]/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-6 relative z-10">
        {/* Branding header */}
        <div className="space-y-1">
          <span className="text-xs font-bold tracking-[0.25em] text-[#10B981] uppercase block">
            ImmOfika — Sécurité & Contrôle
          </span>
          <div className="h-[2px] w-12 bg-[#10B981]/30 mx-auto" />
        </div>

        {/* 403 Card */}
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-900/5 p-6 sm:p-8 space-y-6 text-center">
          {/* Shield Icon */}
          <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 mx-auto">
            <ShieldX className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 rounded-full border border-amber-200">
              Code Erreur 403 — Refus d&apos;accès
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Zone Réservée
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              Votre compte actuel ne dispose pas des privilèges ou du rôle requis pour accéder à cette ressource.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-medium text-sm transition-all shadow-md shadow-emerald-500/20"
            >
              <Home className="w-4 h-4" />
              Retourner à l&apos;accueil
            </Link>

            <Link
              href="/auth/login"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-sm border border-gray-200 transition-all"
            >
              <LogIn className="w-4 h-4" />
              Changer de compte
            </Link>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur de droit, contactez l&apos;administration de la plateforme.
        </p>
      </div>
    </main>
  )
}
