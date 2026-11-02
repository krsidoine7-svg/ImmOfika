'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[AdminError]', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
        Une erreur est survenue dans l'espace administration
      </h2>
      <p className="text-sm text-slate-500 max-w-md mb-6">
        {error?.message || "Le tableau de bord n'a pas pu charger correctement. Vérifiez votre connexion ou réessayez."}
      </p>

      {error?.digest && (
        <div className="text-xs font-mono text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg mb-6">
          Digest ID : {error.digest}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors"
        >
          <Home className="w-4 h-4" />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}
