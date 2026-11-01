'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  MapPin,
  Home,
  DollarSign,
  ChevronDown,
  Check,
  ShieldCheck,
  Building2,
  X,
} from 'lucide-react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  COMMUNES_ABIDJAN,
  TITRES_FONCIERS,
  TYPES_BIENS,
  PALIERS_PRIX_LOCATION,
  PALIERS_PRIX_VENTE,
} from '@/lib/constants/abidjan'

interface BiensSearchBarProps {
  totalCount: number
  loading: boolean
}

export default function BiensSearchBar({ totalCount, loading }: BiensSearchBarProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [showCommunes, setShowCommunes] = React.useState(false)
  const [showTypes, setShowTypes] = React.useState(false)
  const [showBudgets, setShowBudgets] = React.useState(false)
  const [showTitres, setShowTitres] = React.useState(false)

  const containerRef = React.useRef<HTMLDivElement>(null)

  const search = searchParams.get('search') || ''
  const commune = searchParams.get('commune') || ''
  const type = searchParams.get('type') || ''
  const transaction = searchParams.get('transaction') || ''
  const prixMax = searchParams.get('prixMax') || ''
  const typeTitrePropriete = searchParams.get('typeTitrePropriete') || ''

  const [localSearch, setLocalSearch] = React.useState(search)

  React.useEffect(() => {
    setLocalSearch(search)
  }, [search])

  const updateFilters = React.useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })
      params.delete('page') // Reset page on filter
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  const handleSearchSubmit = () => {
    updateFilters({ search: localSearch })
  }

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowCommunes(false)
        setShowTypes(false)
        setShowBudgets(false)
        setShowTitres(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentBudgets =
    transaction === 'location' ? PALIERS_PRIX_LOCATION : PALIERS_PRIX_VENTE

  return (
    <div ref={containerRef} className="relative z-30 w-full max-w-[1020px] mx-auto">
      {/* ─── Onglets de transaction (Acheter / Louer / Tout) ──────────────── */}
      <div className="flex items-center gap-2 mb-2 px-2">
        <button
          type="button"
          onClick={() => updateFilters({ transaction: '' })}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            !transaction
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'bg-emerald-800/40 text-white/90 hover:bg-emerald-800/60'
          }`}
        >
          Tous les projets
        </button>
        <button
          type="button"
          onClick={() => updateFilters({ transaction: 'vente' })}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            transaction === 'vente'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'bg-emerald-800/40 text-white/90 hover:bg-emerald-800/60'
          }`}
        >
          Acheter
        </button>
        <button
          type="button"
          onClick={() => updateFilters({ transaction: 'location' })}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            transaction === 'location'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'bg-emerald-800/40 text-white/90 hover:bg-emerald-800/60'
          }`}
        >
          Louer
        </button>

        {/* Titre Garanti Toggle Rapide */}
        <button
          type="button"
          onClick={() =>
            updateFilters({
              typeTitrePropriete: typeTitrePropriete === 'has_titre' ? '' : 'has_titre',
            })
          }
          className={`ml-auto hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            typeTitrePropriete === 'has_titre'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'bg-emerald-800/40 text-emerald-100 hover:bg-emerald-800/60'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Titres Garantis (ACD / CMP)</span>
        </button>
      </div>

      {/* ─── Barre de Recherche Multicritères ────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-white rounded-[24px] border border-slate-100 p-3 sm:p-4 shadow-[0_20px_50px_-15px_rgba(16,185,129,0.15)] flex flex-col gap-3"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          {/* 1. Commune d'Abidjan */}
          <div
            className="relative flex items-center gap-2.5 px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-slate-100 group cursor-pointer"
            onClick={() => {
              setShowCommunes(!showCommunes)
              setShowTypes(false)
              setShowBudgets(false)
              setShowTitres(false)
            }}
          >
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform duration-200">
              <MapPin className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1 flex flex-col select-none min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Commune Abidjan
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {commune
                    ? COMMUNES_ABIDJAN.find((c) => c.nom.toLowerCase() === commune.toLowerCase())?.nom || commune
                    : 'Toutes les communes'}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                    showCommunes ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>

            {/* Dropdown Communes */}
            <AnimatePresence>
              {showCommunes && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 top-full mt-2 w-64 max-h-72 overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2.5 py-1.5">
                    Communes d&apos;Abidjan
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      updateFilters({ commune: '' })
                      setShowCommunes(false)
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-between"
                  >
                    <span>Toutes les communes</span>
                    {!commune && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                  </button>
                  {COMMUNES_ABIDJAN.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        updateFilters({ commune: c.nom })
                        setShowCommunes(false)
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-between"
                    >
                      <div>
                        <span>{c.nom}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5 font-normal">
                          ({c.quartiers.length} quartiers)
                        </span>
                      </div>
                      {commune.toLowerCase() === c.nom.toLowerCase() && (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Type de Bien */}
          <div
            className="relative flex items-center gap-2.5 px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-slate-100 group cursor-pointer"
            onClick={() => {
              setShowTypes(!showTypes)
              setShowCommunes(false)
              setShowBudgets(false)
              setShowTitres(false)
            }}
          >
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform duration-200">
              <Home className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1 flex flex-col select-none min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Type de Bien
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {TYPES_BIENS.find((t) => t.value === type)?.label || 'Tous les types'}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                    showTypes ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>

            {/* Dropdown Types */}
            <AnimatePresence>
              {showTypes && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      updateFilters({ type: '' })
                      setShowTypes(false)
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-between"
                  >
                    <span>Tous les types</span>
                    {!type && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                  </button>
                  {TYPES_BIENS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => {
                        updateFilters({ type: t.value })
                        setShowTypes(false)
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-between"
                    >
                      <span>{t.label}</span>
                      {type === t.value && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Titre Foncier */}
          <div
            className="relative flex items-center gap-2.5 px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-slate-100 group cursor-pointer"
            onClick={() => {
              setShowTitres(!showTitres)
              setShowCommunes(false)
              setShowTypes(false)
              setShowBudgets(false)
            }}
          >
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1 flex flex-col select-none min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Titre Foncier
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {typeTitrePropriete === 'has_titre'
                    ? 'Titres Garantis'
                    : TITRES_FONCIERS[typeTitrePropriete]?.badgeLabel || 'Tous titres'}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                    showTitres ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>

            {/* Dropdown Titres */}
            <AnimatePresence>
              {showTitres && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2.5 py-1.5">
                    Sécurisation Foncière (MCLU)
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      updateFilters({ typeTitrePropriete: '' })
                      setShowTitres(false)
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-between"
                  >
                    <span>Tous les titres</span>
                    {!typeTitrePropriete && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateFilters({ typeTitrePropriete: 'has_titre' })
                      setShowTitres(false)
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all flex items-center justify-between"
                  >
                    <span>Tous Titres Garantis (ACD / CMP)</span>
                    {typeTitrePropriete === 'has_titre' && (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    )}
                  </button>
                  {Object.values(TITRES_FONCIERS).map((tf) => (
                    <button
                      key={tf.code}
                      type="button"
                      onClick={() => {
                        updateFilters({ typeTitrePropriete: tf.code })
                        setShowTitres(false)
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-between"
                    >
                      <span>{tf.label}</span>
                      {typeTitrePropriete === tf.code && (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. Budget Max */}
          <div
            className="relative flex items-center gap-2.5 px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-slate-100 group cursor-pointer"
            onClick={() => {
              setShowBudgets(!showBudgets)
              setShowCommunes(false)
              setShowTypes(false)
              setShowTitres(false)
            }}
          >
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform duration-200">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1 flex flex-col select-none min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                Budget Max
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {currentBudgets.find((b) => b.value === prixMax)?.label || 'Indifférent'}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                    showBudgets ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>

            {/* Dropdown Budget */}
            <AnimatePresence>
              {showBudgets && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  {currentBudgets.map((b) => (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => {
                        updateFilters({ prixMax: b.value })
                        setShowBudgets(false)
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-between"
                    >
                      <span>{b.label}</span>
                      {prixMax === b.value && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 5. Bouton Rechercher */}
          <div className="flex items-center w-full">
            <button
              type="button"
              onClick={handleSearchSubmit}
              disabled={loading}
              className="w-full h-11 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 text-white flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer text-xs md:text-sm"
            >
              <Search className="h-4 w-4" />
              <span>{loading ? 'Recherche...' : `Voir (${totalCount})`}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
