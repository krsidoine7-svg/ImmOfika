import * as React from 'react'

export default function BiensLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Barre de navigation espace réservé */}
      <div className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100" />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Titre et en-tête */}
        <div className="space-y-3">
          <div className="h-4 w-36 bg-emerald-100 rounded-full animate-pulse" />
          <div className="h-8 sm:h-10 w-72 sm:w-96 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-4 w-60 sm:w-80 bg-slate-100 rounded-lg animate-pulse" />
        </div>

        {/* Barre de recherche squelette */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="h-12 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-12 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-12 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-12 bg-emerald-200 rounded-2xl animate-pulse" />
        </div>

        {/* Chips de filtres */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 w-24 sm:w-28 bg-slate-200 rounded-xl shrink-0 animate-pulse" />
          ))}
        </div>

        {/* Grille de cartes squelettes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm flex flex-col"
            >
              {/* Image squelette avec effet de brillance */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 animate-pulse">
                <div className="absolute top-3 left-3 h-6 w-20 bg-white/70 rounded-full" />
                <div className="absolute top-3 right-3 h-8 w-8 bg-white/70 rounded-full" />
              </div>

              {/* Corps de la carte */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="h-6 w-32 bg-emerald-100 rounded-lg animate-pulse" />
                  <div className="h-5 w-full bg-slate-200 rounded-md animate-pulse" />
                  <div className="h-4 w-2/3 bg-slate-100 rounded-md animate-pulse" />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex gap-3">
                    <div className="h-4 w-14 bg-slate-100 rounded animate-pulse" />
                    <div className="h-4 w-14 bg-slate-100 rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-24 bg-slate-200 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
