// src/components/public/MarketplaceShowcaseSection.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Navigation,
  Compass,
  MapPin,
  Home,
  Building2,
  KeyRound,
  Trees,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Search,
  X,
  Check,
  Loader2,
  PlusCircle,
} from "lucide-react"
import {
  MARKETPLACE_CATEGORIES,
  CategoryDefinition,
  MarketplaceBien,
} from "@/types/marketplace"
import { COMMUNES_CI, CommuneInfo } from "@/config/communes"
import { getNearbyBiensAction, NearbyBienItem } from "@/app/actions/nearbyBiens"
import MarketplacePropertyCard from "@/components/public/MarketplacePropertyCard"

interface MarketplaceShowcaseSectionProps {
  categoriesData: Record<string, MarketplaceBien[]>
  initialNearbyBiens?: NearbyBienItem[]
  initialCommune?: CommuneInfo
}

const STORAGE_COMMUNE_KEY = "immofika_user_commune"
const STORAGE_COORDS_KEY = "immofika_user_coords"

const POPULAR_COMMUNES = [
  "cocody",
  "marcory",
  "yopougon",
  "plateau",
  "bingerville",
  "grand-bassam",
  "assinie",
]

const ICONS_MAP: Record<string, React.ElementType> = {
  Home,
  Building2,
  KeyRound,
  Trees,
}

export default function MarketplaceShowcaseSection({
  categoriesData = {},
  initialNearbyBiens = [],
  initialCommune = COMMUNES_CI[0],
}: MarketplaceShowcaseSectionProps) {
  // Onglet actif : 'all' pour voir toutes les catégories, 'near-me' pour la géolocalisation, ou ID de catégorie
  const [activeTab, setActiveTab] = React.useState<string>("all")

  // États Géolocalisation
  const [currentCommune, setCurrentCommune] = React.useState<CommuneInfo>(initialCommune)
  const [nearbyBiens, setNearbyBiens] = React.useState<NearbyBienItem[]>(initialNearbyBiens)
  const [loadingNearby, setLoadingNearby] = React.useState(false)
  const [gpsDetecting, setGpsDetecting] = React.useState(false)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [searchCommuneQuery, setSearchCommuneQuery] = React.useState("")
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null)

  // 1. Initialisation : vérifier localStorage
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
      } else if (initialNearbyBiens.length === 0) {
        fetchBiensForCommune(initialCommune.id, false)
      }
    } catch {
      // Pas de localStorage
    }
  }, [])

  // 2. Charger les annonces pour une commune
  const fetchBiensForCommune = async (communeId: string, showToast = true) => {
    setLoadingNearby(true)
    try {
      const res = await getNearbyBiensAction({ communeId, limit: 6 })
      if (res.success && res.commune) {
        setCurrentCommune(res.commune)
        setNearbyBiens(res.biens)
        localStorage.setItem(STORAGE_COMMUNE_KEY, res.commune.id)
        if (showToast) {
          setFeedbackMessage(`Affichage des biens proches de ${res.commune.nom}`)
          setTimeout(() => setFeedbackMessage(null), 3500)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingNearby(false)
    }
  }

  // 3. Charger les annonces par coordonnées GPS
  const fetchBiensForPosition = async (lat: number, lng: number, showToast = true) => {
    setLoadingNearby(true)
    try {
      const res = await getNearbyBiensAction({ lat, lng, limit: 6 })
      if (res.success && res.commune) {
        setCurrentCommune(res.commune)
        setNearbyBiens(res.biens)
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
      setLoadingNearby(false)
      setGpsDetecting(false)
    }
  }

  // 4. Détecter GPS
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
        setIsModalOpen(true)
        setFeedbackMessage("Accès GPS non autorisé. Choisissez votre commune ci-dessous :")
        setTimeout(() => setFeedbackMessage(null), 4000)
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  // Filtrage dans la modale
  const filteredCommunes = COMMUNES_CI.filter(
    (c) =>
      c.nom.toLowerCase().includes(searchCommuneQuery.toLowerCase()) ||
      c.quartiers.some((q) => q.toLowerCase().includes(searchCommuneQuery.toLowerCase()))
  )

  // Données de l'onglet actif
  const isAllTab = activeTab === "all"
  const isNearMeTab = activeTab === "near-me"
  const currentCategory = MARKETPLACE_CATEGORIES.find((c) => c.id === activeTab)

  const displayedBiens: MarketplaceBien[] = isNearMeTab
    ? nearbyBiens
    : currentCategory
    ? categoriesData[currentCategory.id] || []
    : []

  const activeCatalogUrl = isNearMeTab
    ? `/biens?location=${encodeURIComponent(currentCommune.nom)}`
    : currentCategory?.catalogUrl || "/biens"

  const activeSubtitle = isAllTab
    ? "Explorez notre sélection de biens certifiés classés par univers immobilier."
    : isNearMeTab
    ? `Annonces immobilières sélectionnées dans votre secteur (${currentCommune.nom}) ou à proximité immédiate.`
    : currentCategory?.subtitle || "Explorez les meilleures opportunités certifiées."

  return (
    <section id="annonces" className="relative py-16 md:py-24 bg-gradient-to-b from-white via-slate-50/70 to-white overflow-hidden border-b border-slate-100">
      {/* Halo lumineux de fond */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[400px] bg-emerald-400/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ============================================================ */}
        {/* EN-TÊTE UNIFIÉ : Titre, Slogan & Contrôle de Géolocalisation */}
        {/* ============================================================ */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-100">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100/90 border border-emerald-200/60 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Vitrine & Marché Immobilier en Direct
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Annonces & Produits <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700">en Côte d&apos;Ivoire</span>
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
              {activeSubtitle}
            </p>
          </div>

          {/* Contrôles de Localisation Intégrés */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Badge de la commune active */}
            <div className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-2xl p-1.5 pl-3.5 shadow-sm hover:border-emerald-300 transition-all">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs text-slate-500">Commune :</span>
                <span className="text-xs font-black text-slate-900">{currentCommune.nom}</span>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                Changer
              </button>
            </div>

            {/* Bouton GPS Me géolocaliser */}
            <button
              type="button"
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

        {/* Feedback toast */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>{feedbackMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackMessage(null)}
                className="p-1 hover:bg-white/20 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================ */}
        {/* BARRE D'ONGLETS UNIFIÉE : Toutes + Près de vous + 4 Catégories */}
        {/* ============================================================ */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {/* Onglet 0 : Toutes les catégories */}
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === "all"
                ? "bg-slate-900 text-white shadow-lg shadow-slate-950/20 scale-[1.02]"
                : "bg-white text-slate-600 border border-slate-200/80 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/30"
            }`}
          >
            <Sparkles className={`h-4 w-4 ${activeTab === "all" ? "text-emerald-400" : "text-slate-400"}`} />
            <span>Toutes les catégories</span>
          </button>

          {/* Onglet 1 : Près de chez vous */}
          <button
            type="button"
            onClick={() => setActiveTab("near-me")}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === "near-me"
                ? "bg-slate-900 text-white shadow-lg shadow-slate-950/20 scale-[1.02]"
                : "bg-white text-slate-600 border border-slate-200/80 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/30"
            }`}
          >
            <Navigation className={`h-4 w-4 ${activeTab === "near-me" ? "text-emerald-400" : "text-slate-400"}`} />
            <span>Près de vous</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === "near-me"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {currentCommune.nom}
            </span>
          </button>

          {/* Onglets Catégories Produits */}
          {MARKETPLACE_CATEGORIES.map((category) => {
            const Icon = ICONS_MAP[category.iconName] || Home
            const isSelected = activeTab === category.id
            const count = (categoriesData[category.id] || []).length

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveTab(category.id)}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-950/20 scale-[1.02]"
                    : "bg-white text-slate-600 border border-slate-200/80 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/30"
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? "text-emerald-400" : "text-slate-400"}`} />
                <span>{category.title}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      isSelected
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Puces de communes rapides si on est sur l'onglet Près de chez vous */}
        {isNearMeTab && (
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wider">
              Communes rapides :
            </span>
            {POPULAR_COMMUNES.map((comId) => {
              const com = COMMUNES_CI.find((c) => c.id === comId)
              if (!com) return null
              const isActive = com.id === currentCommune.id
              return (
                <button
                  key={com.id}
                  type="button"
                  onClick={() => fetchBiensForCommune(com.id, true)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white text-slate-700 border border-slate-200/80 hover:border-emerald-300 hover:text-emerald-700"
                  }`}
                >
                  {com.nom}
                </button>
              )
            })}
          </div>
        )}

        {/* ============================================================ */}
        {/* GRILLE DES BIENS & ANNONCES                                  */}
        {/* ============================================================ */}
        <div className="mt-10">
          {/* CAS 1 : VUE TOUTES LES CATÉGORIES (Chaque catégorie a son bloc avec 3 à 6 annonces) */}
          {isAllTab ? (
            <div className="space-y-16">
              {MARKETPLACE_CATEGORIES.map((category) => {
                const Icon = ICONS_MAP[category.iconName] || Home
                const catBiens = (categoriesData[category.id] || []).slice(0, 6)
                if (catBiens.length === 0) return null

                return (
                  <div key={category.id} className="space-y-6">
                    {/* En-tête de catégorie */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            {category.title}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {category.subtitle}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={category.catalogUrl}
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 hover:text-emerald-700 transition-colors group"
                      >
                        <span>Voir tout ({catBiens.length})</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                    {/* Grille 3 à 6 annonces */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {catBiens.map((bien) => (
                        <div key={bien.id} className="relative group">
                          <MarketplacePropertyCard bien={bien} />
                        </div>
                      ))}
                    </div>

                    {/* Bouton Voir plus dédié */}
                    <div className="flex justify-center pt-2">
                      <Link
                        href={category.catalogUrl}
                        className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-emerald-300 font-extrabold text-xs px-6 py-3 rounded-2xl shadow-sm transition-all group"
                      >
                        <span>Voir plus de « {category.title} »</span>
                        <ArrowRight className="h-3.5 w-3.5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : isNearMeTab && loadingNearby ? (
            /* CAS 2 : CHARGEMENT GÉOLOCALISÉ */
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
          ) : displayedBiens.length > 0 ? (
            /* CAS 3 : ONGLET UNIQUE SÉLECTIONNÉ */
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedBiens.map((bien) => {
                  const nearbyItem = isNearMeTab ? (bien as NearbyBienItem) : null
                  const locationBadgeText = nearbyItem
                    ? nearbyItem.distanceKm !== undefined
                      ? `~${nearbyItem.distanceKm} km`
                      : nearbyItem.isExactCommune
                      ? `À ${currentCommune.nom}`
                      : nearbyItem.communeNom
                    : undefined

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

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Link
                  href={activeCatalogUrl}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm px-8 py-4 rounded-2xl shadow-xl shadow-slate-900/10 transition-all transform active:scale-95 group"
                >
                  <span>
                    {isNearMeTab
                      ? `Explorer toutes les annonces à ${currentCommune.nom}`
                      : `Voir plus de « ${currentCategory?.title} »`}
                  </span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/biens/publier"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-sm px-6 py-4 rounded-2xl transition-all"
                >
                  <PlusCircle className="h-4 w-4 text-emerald-600" />
                  <span>Publier une annonce ici</span>
                </Link>
              </div>
            </div>
          ) : (
            /* CAS 4 : AUCUN RÉSULTAT */
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {isNearMeTab
                  ? `Aucune annonce immédiate à ${currentCommune.nom}`
                  : `Aucune annonce dans « ${currentCategory?.title} »`}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Soyez le premier annonceur à publier dans cette catégorie ou explorez les autres secteurs disponibles.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href="/biens/publier"
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                >
                  Déposer une annonce
                </Link>
                <Link
                  href="/biens"
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all"
                >
                  Voir tout le catalogue
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ============================================================ */}
      {/* MODAL SÉLECTEUR DE COMMUNE                                   */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Choisissez votre commune</h3>
                    <p className="text-[11px] text-slate-500">Pour voir les annonces au plus près de vous</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

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

              <div className="p-4 overflow-y-auto space-y-1.5 flex-1 divide-y divide-slate-50">
                {filteredCommunes.map((com) => {
                  const isSelected = com.id === currentCommune.id
                  return (
                    <button
                      key={com.id}
                      type="button"
                      onClick={() => {
                        fetchBiensForCommune(com.id, true)
                        setIsModalOpen(false)
                        setActiveTab("near-me")
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
                        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
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

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setActiveTab("near-me")
                    handleDetectGPS()
                  }}
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Utiliser ma position GPS exacte</span>
                </button>
                <button
                  type="button"
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
