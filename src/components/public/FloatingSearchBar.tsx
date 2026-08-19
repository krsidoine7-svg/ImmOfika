"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, MapPin, Home, DollarSign, SlidersHorizontal, ChevronDown, Check } from "lucide-react"
import { Property, matchesProperty } from "@/data/properties"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

interface FloatingSearchBarProps {
  properties: Property[]
}

// Types de biens disponibles
const PROPERTY_TYPES = [
  { value: "", label: "Tous les types" },
  { value: "villa", label: "Villa de Prestige" },
  { value: "penthouse", label: "Penthouse" },
  { value: "appartement", label: "Appartement" },
  { value: "duplex", label: "Duplex" },
  { value: "terrain", label: "Terrain / Parcelles" },
]

// Budgets disponibles
const BUDGETS = [
  { value: "", label: "Indifférent" },
  { value: "50m", label: "Jusqu'à 50M FCFA" },
  { value: "150m", label: "Jusqu'à 150M FCFA" },
  { value: "300m", label: "Jusqu'à 300M FCFA" },
  { value: "500m", label: "500M FCFA et +" },
]

// Quartiers suggérés
const SUGGESTED_LOCATIONS = [
  "Cocody (Riviera, Golf, Ambassades)",
  "Marcory (Zone 4, Bietry)",
  "Assinie-Mafia (Lagune / Mer)",
  "Plateau (Business District)",
]

export default function FloatingSearchBar({ properties = [] }: FloatingSearchBarProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [showLocations, setShowLocations] = React.useState(false)
  const [showTypes, setShowTypes] = React.useState(false)
  const [showBudgets, setShowBudgets] = React.useState(false)

  const containerRef = React.useRef<HTMLDivElement>(null)

  const location = searchParams.get("location") || ""
  const type = searchParams.get("type") || ""
  const budget = searchParams.get("budget") || ""

  const [localLocation, setLocalLocation] = React.useState(location)

  const updateQueryParam = React.useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, router, pathname])

  React.useEffect(() => {
    setLocalLocation(location)
  }, [location])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const currentUrlLoc = searchParams.get("location") || ""
      if (localLocation !== currentUrlLoc) {
        updateQueryParam("location", localLocation)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [localLocation, searchParams, updateQueryParam])

  const setType = (val: string) => updateQueryParam("type", val)
  const setBudget = (val: string) => updateQueryParam("budget", val)

  const searchQuery = React.useMemo(() => ({ location, type, budget }), [location, type, budget])

  const matchingCount = React.useMemo(() => {
    return properties.filter(item => matchesProperty(item, searchQuery)).length
  }, [properties, searchQuery])

  const handleSearchClick = () => {
    const params = new URLSearchParams(searchParams.toString())
    router.push(`/biens?${params.toString()}`)
  }

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowLocations(false)
        setShowTypes(false)
        setShowBudgets(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative z-30 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-white rounded-2xl sm:rounded-full border border-slate-200 p-3 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-2.5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full flex-1 items-center px-2">
          
          {/* Localisation */}
          <div className="relative flex items-center gap-2.5 p-2 bg-slate-50 sm:bg-transparent rounded-xl sm:rounded-none sm:border-r border-slate-100 group">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="flex-1 flex flex-col">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Localisation</span>
              <input
                type="text"
                placeholder="Où cherchez-vous ?"
                value={localLocation}
                onFocus={() => {
                  setShowLocations(true)
                  setShowTypes(false)
                  setShowBudgets(false)
                }}
                onChange={(e) => setLocalLocation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateQueryParam("location", localLocation)
                    setShowLocations(false)
                    handleSearchClick()
                  }
                }}
                className="text-xs font-bold text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none w-full"
              />
            </div>

            {/* Dropdown Localisations */}
            <AnimatePresence>
              {showLocations && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 top-full mt-2 w-full sm:w-[260px] bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50"
                >
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest px-3 py-1.5 border-b border-slate-100">Quartiers Recommandés</p>
                  {SUGGESTED_LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        setLocalLocation(loc)
                        updateQueryParam("location", loc)
                        setShowLocations(false)
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-between mt-1"
                    >
                      <span>{loc}</span>
                      {localLocation === loc && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Type de Bien */}
          <div 
            className="relative flex items-center gap-2.5 p-2 bg-slate-50 sm:bg-transparent rounded-xl sm:rounded-none sm:border-r border-slate-100 group cursor-pointer"
            onClick={() => {
              setShowTypes(!showTypes)
              setShowLocations(false)
              setShowBudgets(false)
            }}
          >
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
              <Home className="h-4 w-4" />
            </div>
            <div className="flex-1 flex flex-col select-none overflow-hidden">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider truncate">Type de bien</span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 truncate">
                  {PROPERTY_TYPES.find((t) => t.value === type)?.label || "Tous les types"}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${showTypes ? "rotate-180" : ""}`} />
              </div>
            </div>

            {/* Dropdown Types */}
            <AnimatePresence>
              {showTypes && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={(e) => {
                        e.stopPropagation()
                        setType(t.value)
                        setShowTypes(false)
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-between mt-1"
                    >
                      <span>{t.label}</span>
                      {type === t.value && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Budget */}
          <div 
            className="relative flex items-center gap-2.5 p-2 bg-slate-50 sm:bg-transparent rounded-xl sm:rounded-none group cursor-pointer"
            onClick={() => {
              setShowBudgets(!showBudgets)
              setShowLocations(false)
              setShowTypes(false)
            }}
          >
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
              <DollarSign className="h-4 w-4" />
            </div>
            <div className="flex-1 flex flex-col select-none overflow-hidden">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider truncate">Budget Max</span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 truncate">
                  {BUDGETS.find((b) => b.value === budget)?.label || "Indifférent"}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${showBudgets ? "rotate-180" : ""}`} />
              </div>
            </div>

            {/* Dropdown Budgets */}
            <AnimatePresence>
              {showBudgets && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50"
                >
                  {BUDGETS.map((b) => (
                    <button
                      key={b.value}
                      onClick={(e) => {
                        e.stopPropagation()
                        setBudget(b.value)
                        setShowBudgets(false)
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-between mt-1"
                    >
                      <span>{b.label}</span>
                      {budget === b.value && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Bouton de Recherche */}
        <button
          onClick={handleSearchClick}
          className="w-full md:w-auto h-11 px-7 rounded-xl sm:rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all shrink-0 cursor-pointer"
        >
          <Search className="h-4 w-4" />
          <span>Rechercher ({matchingCount})</span>
        </button>

      </motion.div>
    </div>
  )
}
