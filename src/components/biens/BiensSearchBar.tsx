'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Home, DollarSign, ChevronDown, Check } from 'lucide-react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

// Types de biens en adéquation avec la DB
const PROPERTY_TYPES = [
  { value: '', label: 'Tous les types' },
  { value: 'villa', label: 'Villa' },
  { value: 'appartement', label: 'Appartement' },
  { value: 'terrain', label: 'Terrain / Foncier' },
  { value: 'bureau', label: 'Bureau' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'entrepot', label: 'Entrepôt' },
]

// Budgets en adéquation avec la DB (en FCFA)
const BUDGETS = [
  { value: '', label: 'Indifférent' },
  { value: '50000000', label: "Jusqu'à 50M FCFA" },
  { value: '150000000', label: "Jusqu'à 150M FCFA" },
  { value: '300000000', label: "Jusqu'à 300M FCFA" },
  { value: '500000000', label: "Jusqu'à 500M FCFA" },
]

const SUGGESTED_LOCATIONS = [
  'Cocody',
  'Marcory',
  'Assinie',
  'Bingerville',
  'Plateau',
]

interface BiensSearchBarProps {
  totalCount: number
  loading: boolean
}

export default function BiensSearchBar({ totalCount, loading }: BiensSearchBarProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [showLocations, setShowLocations] = React.useState(false)
  const [showTypes, setShowTypes] = React.useState(false)
  const [showBudgets, setShowBudgets] = React.useState(false)

  const containerRef = React.useRef<HTMLDivElement>(null)

  const search = searchParams.get('search') || ''
  const type = searchParams.get('type') || ''
  const prixMax = searchParams.get('prixMax') || ''

  const [localSearch, setLocalSearch] = React.useState(search)

  React.useEffect(() => {
    setLocalSearch(search)
  }, [search])

  const updateFilters = React.useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    params.delete('page') // Reset page when filtering
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, router, pathname])

  const handleSearchSubmit = () => {
    updateFilters({ search: localSearch })
  }

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowLocations(false)
        setShowTypes(false)
        setShowBudgets(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative z-30 w-full max-w-[956px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-white rounded-[24px] border border-slate-100 p-4 shadow-[0_20px_50px_-15px_rgba(16,185,129,0.1)] flex flex-col gap-3"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
          {/* 1. Recherche / Localisation */}
          <div className="relative flex items-center gap-2.5 px-3 py-1.5 border-b md:border-b-0 md:border-r border-slate-100 group">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform duration-200">
              <MapPin className="h-4.5 w-4.5 text-emerald-600" />
            </div>
            <div className="flex-1 flex flex-col min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Localisation / Mot-clé</span>
              <input
                type="text"
                placeholder="Ex: Cocody, Villa, Piscine..."
                value={localSearch}
                onFocus={() => {
                  setShowLocations(true)
                  setShowTypes(false)
                  setShowBudgets(false)
                }}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit()
                    setShowLocations(false)
                  }
                }}
                className="text-xs md:text-sm font-bold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none w-full cursor-text"
              />
            </div>

            {/* Dropdown Suggestions */}
            <AnimatePresence>
              {showLocations && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 top-full mt-2 w-full md:w-[250px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50"
                >
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest px-2.5 py-1.5">Suggestions</p>
                  {SUGGESTED_LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        setLocalSearch(loc)
                        updateFilters({ search: loc })
                        setShowLocations(false)
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-between"
                    >
                      <span>{loc}</span>
                      {localSearch === loc && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Type de Bien */}
          <div
            className="relative flex items-center gap-2.5 px-3 py-1.5 border-b md:border-b-0 md:border-r border-slate-100 group cursor-pointer"
            onClick={() => {
              setShowTypes(!showTypes)
              setShowLocations(false)
              setShowBudgets(false)
            }}
          >
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform duration-200">
              <Home className="h-4.5 w-4.5 text-emerald-600" />
            </div>
            <div className="flex-1 flex flex-col select-none min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Type de Bien</span>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-bold text-slate-900 truncate">
                  {PROPERTY_TYPES.find((t) => t.value === type)?.label || 'Tous les types'}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${showTypes ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Dropdown Types */}
            <AnimatePresence>
              {showTypes && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateFilters({ type: t.value })
                        setShowTypes(false)
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-between"
                    >
                      <span>{t.label}</span>
                      {type === t.value && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Budget Max */}
          <div
            className="relative flex items-center gap-2.5 px-3 py-1.5 border-b md:border-b-0 md:border-r border-slate-100 group cursor-pointer"
            onClick={() => {
              setShowBudgets(!showBudgets)
              setShowLocations(false)
              setShowTypes(false)
            }}
          >
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform duration-200">
              <DollarSign className="h-4.5 w-4.5 text-emerald-600" />
            </div>
            <div className="flex-1 flex flex-col select-none min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Budget Max</span>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-bold text-slate-900 truncate">
                  {BUDGETS.find((b) => b.value === prixMax)?.label || 'Indifférent'}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${showBudgets ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Dropdown Budget */}
            <AnimatePresence>
              {showBudgets && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50"
                >
                  {BUDGETS.map((b) => (
                    <button
                      key={b.value}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateFilters({ prixMax: b.value })
                        setShowBudgets(false)
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-between"
                    >
                      <span>{b.label}</span>
                      {prixMax === b.value && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. Action Button */}
          <div className="flex items-center w-full">
            <button
              onClick={handleSearchSubmit}
              disabled={loading}
              className="w-full h-11 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 text-white flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer text-xs md:text-sm"
            >
              <Search className="h-4 w-4" />
              <span>
                {loading ? 'Recherche...' : `Rechercher (${totalCount})`}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
