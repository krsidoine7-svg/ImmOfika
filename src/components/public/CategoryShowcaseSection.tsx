'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Home,
  Building2,
  KeyRound,
  Trees,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  PlusCircle,
} from 'lucide-react'
import {
  MARKETPLACE_CATEGORIES,
  CategoryDefinition,
  MarketplaceBien,
} from '@/types/marketplace'
import MarketplacePropertyCard from '@/components/public/MarketplacePropertyCard'

interface CategoryShowcaseSectionProps {
  categoriesData: Record<string, MarketplaceBien[]>
}

const ICONS_MAP: Record<string, React.ElementType> = {
  Home,
  Building2,
  KeyRound,
  Trees,
}

export default function CategoryShowcaseSection({
  categoriesData = {},
}: CategoryShowcaseSectionProps) {
  const [selectedCatId, setSelectedCatId] = React.useState<string>(
    MARKETPLACE_CATEGORIES[0].id
  )

  const activeCategory =
    MARKETPLACE_CATEGORIES.find((c) => c.id === selectedCatId) ||
    MARKETPLACE_CATEGORIES[0]

  const activeBiens = categoriesData[activeCategory.id] || []

  return (
    <section id="annonces" className="relative py-16 md:py-24 bg-slate-50/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/80">
              <Sparkles className="h-3.5 w-3.5" />
              Marché Immobilier en Direct
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Explorez par catégorie
            </h2>
            <p className="text-sm text-slate-500 max-w-xl">
              Trouvez facilement votre futur logement, résidence de vacances ou parcelle sécurisée.
            </p>
          </div>

          <Link
            href="/biens"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            <span>Consulter l'ensemble du catalogue</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Barre d'onglets compacte / Pilules de catégories */}
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x">
          {MARKETPLACE_CATEGORIES.map((cat) => {
            const Icon = ICONS_MAP[cat.iconName] || Layers
            const isSelected = cat.id === selectedCatId
            const count = (categoriesData[cat.id] || []).length

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCatId(cat.id)}
                className={`snap-start flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/15 scale-[1.02]'
                    : 'bg-white text-slate-700 hover:bg-slate-100/80 border border-slate-200/80 shadow-xs'
                }`}
              >
                <div
                  className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span>{cat.title}</span>
                {count > 0 && (
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Sous-titre descriptif de la catégorie active */}
        <div className="mt-4 mb-6 flex items-center justify-between">
          <p className="text-xs sm:text-sm text-slate-600 font-medium italic">
            {activeCategory.subtitle}
          </p>

          <Link
            href={activeCategory.catalogUrl}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 shrink-0"
          >
            <span>Voir plus ({activeBiens.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Grille d'annonces (Compacte, max 6, carrousel tactile sur mobile) */}
        {activeBiens.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {activeBiens.slice(0, 6).map((bien) => (
              <MarketplacePropertyCard key={bien.id} bien={bien} />
            ))}
          </div>
        ) : (
          /* État vide soigné */
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <PlusCircle className="h-7 w-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Aucune annonce pour le moment dans « {activeCategory.title} »
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Soyez le premier à publier une annonce dans cette catégorie ou explorez les autres biens disponibles.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/client/confier"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                <span>Déposer un bien</span>
              </Link>
              <Link
                href="/biens"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                <span>Voir tout le catalogue</span>
              </Link>
            </div>
          </div>
        )}

        {/* Bouton "Voir plus" en bas de section */}
        {activeBiens.length > 0 && (
          <div className="mt-12 flex justify-center">
            <Link
              href={activeCategory.catalogUrl}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl font-bold bg-slate-900 hover:bg-emerald-600 text-white text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02]"
            >
              <span>Voir plus de {activeCategory.shortTitle.toLowerCase()}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
