// src/components/public/NearbyPropertiesSection.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  MapPin, 
  Navigation, 
  ChevronRight, 
  Sparkles, 
  Search, 
  X, 
  Check, 
  Loader2, 
  Compass, 
  ArrowUpRight 
} from "lucide-react"
import { COMMUNES_CI, CommuneInfo } from "@/config/communes"
import { getNearbyBiensAction, NearbyBienItem } from "@/app/actions/nearbyBiens"
import MarketplacePropertyCard from "@/components/public/MarketplacePropertyCard"

interface NearbyPropertiesSectionProps {
  initialBiens?: NearbyBienItem[]
  initialCommune?: CommuneInfo
}

const STORAGE_COMMUNE_KEY = "immofika_user_commune"
const STORAGE_COORDS_KEY = "immofika_user_coords"

// Communes en accès rapide sous forme de puces
const POPULAR_COMMUNES = ["cocody", "marcory", "yopougon", "plateau", "bingerville", "grand-bassam", "assinie"]

export default function NearbyPropertiesSection({
  initialBiens = [],
  initialCommune = COMMUNES_CI[0]
}: NearbyPropertiesSectionProps) {
  const [currentCommune, setCurrentCommune] = React.useState<CommuneInfo>(initialCommune)
  const [biensList, setBiensList] = React.useState<NearbyBienItem[]>(initialBiens)
  const [loading, setLoading] = React.useState(false)
  const [gpsDetecting, setGpsDetecting] = React.useState(false)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [searchCommuneQuery, setSearchCommuneQuery] = React.useState("")
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null)

  // 1. Initialisation au montage : vérification du localStorage ou tentative GPS
  React.useEffect(() => {
    try {
      const savedCommuneId = localStorage.getItem(STORAGE_COMMUNE_KEY)
      const savedCoords = localStorage.getItem(STORAGE_COORDS_KEY)

      if (savedCoords) {
        const coords = JSON.parse(savedCoords)
        if (coords.lat && coords.lng) {
          fetchBiensForPosition(coords.lat, coords.lng, false)
          return
        }
      }

      if (savedCommuneId && savedCommuneId !== initialCommune.id) {
        fetchBiensForCommune(savedCommuneId, false)
      } else if (initialBiens.length === 0) {
        fetchBiensForCommune(initialCommune.id, false)
      }
    } catch {
      // Ignorer si localStorage non dispo
    }
  }, [])

  // 2. Charger les biens pour une commune donnée
  const fetchBiensForCommune = async (communeId: string, showToast = true) => {
    setLoading(true)
    try {
      const res = await getNearbyBiensAction({ communeId, limit: 6 })
      if (res.success && res.commune) {
        setCurrentCommune(res.commune)
        setBiensList(res.biens)
        localStorage.setItem(STORAGE_COMMUNE_KEY, res.commune.id)
        if (showToast) {
          setFeedbackMessage(`Affichage des biens à ${res.commune.nom}`)
          setTimeout(() => setFeedbackMessage(null), 3500)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 3. Charger les biens par coordonnées GPS réelles
  const fetchBiensForPosition = async (lat: number, lng: number, showToast = true) => {
    setLoading(true)
    try {
      const res = await getNearbyBiensAction({ lat, lng, limit: 6 })
      if (res.success && res.commune) {
        setCurrentCommune(res.commune)
        setBiensList(res.biens)
        localStorage.setItem(STORAGE_COMMUNE_KEY, res.commune.id)
        localStorage.setItem(STORAGE_COORDS_KEY, JSON.stringify({ lat, lng }))
        if (showToast) {
          setFeedbackMessage(`Position détectée : vous êtes proche de ${res.commune.nom} !`)
          setTimeout(() => setFeedbackMessage(null), 4000)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setGpsDetecting(false)
    }
  }

  // 4. Déclencher la détection GPS du navigateur
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas prise en charge par votre navigateur.")
      return
    }

    setGpsDetecting(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        fetchBiensForPosition(latitude, longitude, true)
      },
      (err) => {
        console.warn("Échec GPS :", err)
        setGpsDetecting(false)
        setIsModalOpen(true) // Ouvre le sélecteur manuel en secours
        setFeedbackMessage("Accès GPS non autorisé. Choisissez votre commune ci-dessous :")
        setTimeout(() => setFeedbackMessage(null), 4000)
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  // Filtrage des communes dans la modale
  const filteredCommunes = COMMUNES_CI.filter((c) =>
    c.nom.toLowerCase().includes(searchCommuneQuery.toLowerCase()) ||
    c.quartiers.some((q) => q.toLowerCase().includes(searchCommuneQuery.toLowerCase()))
  )

  return (
    <section className="relative py-12 sm:py-16 bg-gradient-to-b from-white via-emerald-50/20 to-white overflow-hidden border-b border-slate-100">
      {/* Halo lumineux d'ambiance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-400/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* En-tête : Titre & Sélecteur de Localisation */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-bold tracking-wide mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>Géolocalisation & Proximité</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Biens disponibles <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700">près de chez vous</span>
            </h2>

            <p className="mt-2 text-sm text-slate-600 max-w-xl">
              Annonces immobilières situées dans votre secteur ou à quelques minutes de votre position actuelle.
            </p>
          </div>

          {/* Contrôles de détection et badge de commune active */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Badge de la commune actuelle */}
            <div className="flex items-center gap-2 bg-white border border-slate-200/80 rounded-2xl p-1.5 pl-3.5 shadow-sm hover:border-emerald-300 transition-all">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs text-slate-500">Commune :</span>
                <span className="text-xs font-black text-slate-900">{currentCommune.nom}</span>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                Changer
              </button>
            </div>

            {/* Bouton GPS Me géolocaliser */}
            <button
              onClick={handleDetectGPS}
              disabled={gpsDetecting}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {gpsDetecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Localisation en cours...</span>
                </>
              ) : (
                <>
                  <Compass className="w-3.5 h-3.5" />
                  <span>Me géolocaliser</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Message toast feedback */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>{feedbackMessage}</span>
              </div>
              <button onClick={() => setFeedbackMessage(null)} className="p-1 hover:bg-white/20 rounded-md">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Puces de communes populaires */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
            Secteurs rapides :
          </span>
          {POPULAR_COMMUNES.map((comId) => {
            const com = COMMUNES_CI.find((c) => c.id === comId)
            if (!com) return null
            const isActive = com.id === currentCommune.id
            return (
              <button
                key={com.id}
                onClick={() => fetchBiensForCommune(com.id, true)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-700 border border-slate-200/80 hover:border-emerald-300 hover:text-emerald-700"
                }`}
              >
                {com.nom}
              </button>
            )
          })}
        </div>

        {/* Grille d'annonces proches */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-3xl border border-slate-100 p-4 space-y-4 animate-pulse">
                  <div className="h-56 bg-slate-100 rounded-2xl" />
                  <div className="h-5 bg-slate-100 rounded-md w-3/4" />
                  <div className="h-4 bg-slate-100 rounded-md w-1/2" />
                  <div className="h-10 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : biensList.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {biensList.map((bien) => {
                  const locationBadgeText =
                    bien.distanceKm !== undefined
                      ? `~${bien.distanceKm} km`
                      : bien.isExactCommune
                      ? `À ${currentCommune.nom}`
                      : bien.communeNom

                  return (
                    <div key={bien.id} className="relative group">
                      <MarketplacePropertyCard
                        bien={bien}
                        locationBadge={locationBadgeText}
                      />
                    </div>
                  )
                })}
              </div>

              {/* Bouton Voir toutes les annonces de la commune */}
              <div className="text-center pt-2">
                <Link
                  href={`/biens?location=${encodeURIComponent(currentCommune.nom)}`}
                  className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50 text-emerald-800 border-2 border-emerald-500/30 hover:border-emerald-500 font-extrabold text-sm px-6 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                >
                  <span>Explorer toutes les annonces à {currentCommune.nom}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center space-y-4 max-w-lg mx-auto shadow-sm">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Aucune annonce directe à {currentCommune.nom}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Soyez le premier à publier une annonce dans ce secteur ou consultez les biens disponibles dans les communes voisines.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                >
                  Choisir une autre commune
                </button>
                <Link
                  href="/biens"
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all"
                >
                  Voir tout le catalogue
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Modal Sélecteur de Commune */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]"
            >
              {/* Entête Modal */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Choisissez votre commune</h3>
                    <p className="text-[11px] text-slate-500">Pour voir les annonces les plus proches de chez vous</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Champ de recherche */}
              <div className="p-4 border-b border-slate-100">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    value={searchCommuneQuery}
                    onChange={(e) => setSearchCommuneQuery(e.target.value)}
                    placeholder="Rechercher une commune ou quartier (ex: Riviera, Zone 4, Angré...)"
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {/* Liste des communes avec scroll */}
              <div className="p-4 overflow-y-auto space-y-1.5 flex-1 divide-y divide-slate-50">
                {filteredCommunes.map((com) => {
                  const isSelected = com.id === currentCommune.id
                  return (
                    <button
                      key={com.id}
                      onClick={() => {
                        fetchBiensForCommune(com.id, true)
                        setIsModalOpen(false)
                      }}
                      className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between group cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="space-y-0.5 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {com.nom}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                            {com.region}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {com.description || com.quartiers.slice(0, 4).join(", ")}
                        </p>
                      </div>

                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                      )}
                    </button>
                  )
                })}

                {filteredCommunes.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Aucune commune ne correspond à &quot;{searchCommuneQuery}&quot;
                  </div>
                )}
              </div>

              {/* Pied de modal avec bouton GPS */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    handleDetectGPS()
                  }}
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Utiliser ma position GPS exacte</span>
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
