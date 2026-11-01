'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  SlidersHorizontal,
  MapPin,
  Ruler,
  BedDouble,
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  Map as MapIcon,
  Grid,
  Home,
  ShieldCheck,
  Building2,
  User,
  Phone,
  MessageCircle,
  ArrowUpDown,
  Check,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/public/Footer'
import BiensSearchBar from '@/components/biens/BiensSearchBar'
import {
  COMMUNES_ABIDJAN,
  TITRES_FONCIERS,
  TYPES_BIENS,
  PALIERS_PRIX_LOCATION,
  PALIERS_PRIX_VENTE,
} from '@/lib/constants/abidjan'

// Carte dynamique sans SSR (Leaflet)
const BiensMap = dynamic(() => import('@/components/biens/BiensMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[550px] rounded-2xl bg-slate-100 flex items-center justify-center animate-pulse">
      <div className="flex flex-col items-center gap-2">
        <MapPin className="w-8 h-8 text-emerald-500 animate-bounce" />
        <span className="text-xs font-semibold text-slate-500">Chargement de la carte d'Abidjan...</span>
      </div>
    </div>
  ),
})

// ─── Types ──────────────────────────────────────────────────────────────────

interface AdvertiserInfo {
  name: string
  type: 'agence' | 'promoteur' | 'particulier' | 'entreprise'
  phone?: string | null
  whatsapp?: string | null
  agrementNumero?: string | null
  verified?: boolean
  logoUrl?: string | null
}

interface Bien {
  id: string
  slug: string
  titre: string
  description?: string | null
  prix: string | number
  type: string
  transaction: string
  statut: string
  ville: string
  commune?: string | null
  quartier?: string | null
  surface?: string | number | null
  pieces?: number | null
  chambres?: number | null
  main_image_url?: string | null
  vues: number
  latitude?: string | number | null
  longitude?: string | number | null
  type_titre_propriete?: string | null
  preuve_propriete_url?: string | null
  advertiser?: AdvertiserInfo
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrix(prix: string | number, transaction: string): string {
  const n = typeof prix === 'string' ? parseFloat(prix) : prix
  const formatted = new Intl.NumberFormat('fr-CI').format(n) + ' FCFA'
  return transaction === 'location' ? formatted + '/mois' : formatted
}

function TitreFoncierBadge({ code }: { code?: string | null }) {
  if (!code) return null
  const titreInfo = TITRES_FONCIERS[code]
  if (!titreInfo) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border shadow-xs',
        titreInfo.colorClass
      )}
      title={titreInfo.description}
    >
      <ShieldCheck className="w-3 h-3 text-emerald-600" />
      {titreInfo.badgeLabel}
    </span>
  )
}

function AdvertiserBadge({ advertiser }: { advertiser?: AdvertiserInfo }) {
  if (!advertiser) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <User className="h-3 w-3 text-slate-500" />
        Particulier
      </span>
    )
  }

  if (advertiser.type === 'promoteur') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
        title={advertiser.agrementNumero ? `Agrément MCLU: ${advertiser.agrementNumero}` : 'Promoteur Agréé'}
      >
        <ShieldCheck className="h-3 w-3 text-emerald-600" />
        Promoteur Agréé
      </span>
    )
  }

  if (advertiser.type === 'agence') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
        <Building2 className="h-3 w-3 text-blue-600" />
        Agence Immobilière
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
      <User className="h-3 w-3 text-slate-500" />
      Particulier Vérifié
    </span>
  )
}

// ─── Composant Carte Bien Moderne (Norme Émeraude) ───────────────────────────

function BienCard({ bien, index }: { bien: Bien; index: number }) {
  const [isFavori, setIsFavori] = React.useState(false)

  const statutColor =
    {
      disponible: 'bg-emerald-500',
      reserve: 'bg-amber-500',
      vendu: 'bg-red-500',
      loue: 'bg-blue-500',
    }[bien.statut] ?? 'bg-gray-500'

  const rawPhone = bien.advertiser?.phone || bien.advertiser?.whatsapp || '2250747631706'
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '')
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Bonjour, je suis intéressé par l'annonce "${bien.titre}" (Réf: ${bien.slug}) au prix de ${formatPrix(
      bien.prix,
      bien.transaction
    )}.`
  )}`

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      className="group relative bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Conteneur Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <Link href={`/biens/${bien.slug}`} className="block w-full h-full">
            {bien.main_image_url ? (
              <img
                src={bien.main_image_url}
                alt={bien.titre}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center">
                <Home className="w-14 h-14 text-white/30" />
              </div>
            )}
          </Link>

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

          {/* Badges en haut */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={cn(
                  'px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-xs capitalize',
                  bien.transaction === 'location' ? 'bg-blue-600' : 'bg-emerald-600'
                )}
              >
                {bien.transaction === 'location' ? 'À Louer' : 'À Vendre'}
              </span>
              <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold text-white capitalize shadow-xs', statutColor)}>
                {bien.statut}
              </span>
            </div>

            {/* Bouton Favori */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                setIsFavori(!isFavori)
              }}
              className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors cursor-pointer"
              aria-label="Ajouter aux favoris"
            >
              <Heart
                className={cn(
                  'h-4 w-4 transition-colors',
                  isFavori ? 'fill-red-500 text-red-500' : 'text-slate-400'
                )}
              />
            </button>
          </div>

          {/* Titre Foncier en incrustation haute gauche */}
          {bien.type_titre_propriete && (
            <div className="absolute top-12 left-3 z-10">
              <TitreFoncierBadge code={bien.type_titre_propriete} />
            </div>
          )}

          {/* Prix en incrustation basse */}
          <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
            <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-white font-extrabold text-sm shadow-md border border-white/10 flex items-baseline gap-1">
              <span>{formatPrix(bien.prix, bien.transaction)}</span>
            </div>
          </div>
        </div>

        {/* Détails */}
        <div className="p-4 sm:p-5">
          {/* Annonceur + Type de bien */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] text-emerald-700 uppercase tracking-wider font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md">
              {bien.type}
            </span>
            <AdvertiserBadge advertiser={bien.advertiser} />
          </div>

          {/* Titre */}
          <h2 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors">
            <Link href={`/biens/${bien.slug}`}>{bien.titre}</Link>
          </h2>

          {/* Localisation */}
          <div className="flex items-center text-xs text-slate-500 mb-3 font-medium">
            <MapPin className="h-3.5 w-3.5 text-emerald-500 mr-1 shrink-0" />
            <span className="truncate">
              {bien.quartier ? `${bien.quartier}, ` : ''}
              {bien.commune ? `${bien.commune}` : bien.ville}
            </span>
          </div>

          {/* Caractéristiques */}
          <div className="flex items-center gap-3 text-xs text-slate-600 pt-3 border-t border-slate-100">
            {bien.surface && (
              <span className="flex items-center gap-1">
                <Ruler className="h-3.5 w-3.5 text-emerald-600" />
                {Number(bien.surface).toLocaleString('fr-CI')} m²
              </span>
            )}
            {bien.pieces && (
              <span className="flex items-center gap-1">
                <Home className="h-3.5 w-3.5 text-emerald-600" />
                {bien.pieces} pièces
              </span>
            )}
            {bien.chambres && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5 text-emerald-600" />
                {bien.chambres} ch.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Barre d'Actions Directes */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 flex items-center gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-emerald-200"
          title="Contacter sur WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>WhatsApp</span>
        </a>
        <Link
          href={`/biens/${bien.slug}`}
          className={cn(
            buttonVariants({ size: 'sm' }),
            'flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl py-2 px-3 transition-all shadow-xs'
          )}
        >
          Voir le bien
        </Link>
      </div>
    </motion.article>
  )
}

// ─── Page Principale Catalogue ───────────────────────────────────────────────

function CataloguePage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [biens, setBiens] = React.useState<Bien[]>([])
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [showFilters, setShowFilters] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<'grid' | 'map'>('grid')

  // Filtres depuis URL
  const page = Number(searchParams.get('page') ?? 1)
  const search = searchParams.get('search') ?? ''
  const type = searchParams.get('type') ?? ''
  const transaction = searchParams.get('transaction') ?? ''
  const commune = searchParams.get('commune') ?? ''
  const quartier = searchParams.get('quartier') ?? ''
  const prixMax = searchParams.get('prixMax') ?? ''
  const prixMin = searchParams.get('prixMin') ?? ''
  const statut = searchParams.get('statut') ?? ''
  const surfaceMin = searchParams.get('surfaceMin') ?? ''
  const piecesMin = searchParams.get('piecesMin') ?? ''
  const typeTitrePropriete = searchParams.get('typeTitrePropriete') ?? ''
  const sort = searchParams.get('sort') ?? 'recent'

  const limit = 12
  const totalPages = Math.ceil(total / limit)

  // Charger les biens via API
  React.useEffect(() => {
    const fetchBiens = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (type) params.set('type', type)
        if (transaction) params.set('transaction', transaction)
        if (commune) params.set('commune', commune)
        if (quartier) params.set('quartier', quartier)
        if (prixMax) params.set('prixMax', prixMax)
        if (prixMin) params.set('prixMin', prixMin)
        if (statut) params.set('statut', statut)
        if (surfaceMin) params.set('surfaceMin', surfaceMin)
        if (piecesMin) params.set('piecesMin', piecesMin)
        if (typeTitrePropriete) params.set('typeTitrePropriete', typeTitrePropriete)
        if (sort) params.set('sort', sort)
        params.set('page', String(page))

        const res = await fetch(`/api/biens?${params.toString()}`)
        const data = await res.json()
        setBiens(data.biens ?? [])
        setTotal(data.total ?? 0)
      } catch {
        setBiens([])
      } finally {
        setLoading(false)
      }
    }
    fetchBiens()
  }, [
    search,
    type,
    transaction,
    commune,
    quartier,
    prixMax,
    prixMin,
    statut,
    surfaceMin,
    piecesMin,
    typeTitrePropriete,
    sort,
    page,
  ])

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key !== 'page') {
      params.delete('page')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  function clearFilters() {
    router.push(pathname)
  }

  const hasActiveFilters =
    type ||
    transaction ||
    commune ||
    quartier ||
    prixMax ||
    prixMin ||
    statut ||
    surfaceMin ||
    piecesMin ||
    typeTitrePropriete ||
    search

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50/50 pt-20">
        {/* En-tête avec Charte Émeraude Officielle */}
        <section className="bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-900 py-14 px-4 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-bold mb-4 border border-emerald-400/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Plateforme Immobilière & Promotion Agréée Abidjan</span>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3"
            >
              Catalogue des <span className="text-emerald-300">Biens Immobiliers</span>
            </motion.h1>
            <p className="text-emerald-100/90 text-sm md:text-base font-medium mb-8 max-w-xl mx-auto">
              Villas, appartements, terrains avec ACD et programmes neufs certifiés à Abidjan.
            </p>

            {/* Barre de recherche avec Communes d'Abidjan & Titres */}
            <div className="mt-4 max-w-[1020px] mx-auto pointer-events-auto">
              <BiensSearchBar totalCount={total} loading={loading} />
            </div>
          </div>
        </section>

        {/* Pilules Communes Phares d'Abidjan */}
        <section className="bg-white border-b border-slate-200 py-3 px-4 shadow-2xs">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Communes :
            </span>
            <button
              type="button"
              onClick={() => updateFilter('commune', '')}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0',
                !commune
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              Toutes
            </button>
            {COMMUNES_ABIDJAN.slice(0, 10).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() =>
                  updateFilter('commune', commune.toLowerCase() === c.nom.toLowerCase() ? '' : c.nom)
                }
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0',
                  commune.toLowerCase() === c.nom.toLowerCase()
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {c.nom}
              </button>
            ))}
          </div>
        </section>

        {/* Barre de Contrôles & Filtres Avancés */}
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-800 text-xs font-bold hover:border-emerald-500 hover:text-emerald-600 transition-colors shadow-2xs cursor-pointer"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-600" />
                <span>Filtres avancés</span>
                {hasActiveFilters && (
                  <span className="h-4 w-4 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">
                    !
                  </span>
                )}
              </button>

              {/* Sélecteur de Tri */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-2xs text-xs font-bold text-slate-700">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="recent">Plus récents</option>
                  <option value="prix_asc">Prix croissant</option>
                  <option value="prix_desc">Prix décroissant</option>
                  <option value="surface_desc">Plus grande surface</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <X className="h-3.5 w-3.5" /> Réinitialiser
                </button>
              )}
            </div>

            {/* Bascule Grille / Carte */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-full shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all',
                  viewMode === 'grid'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grille</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all',
                  viewMode === 'map'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Carte</span>
              </button>
            </div>
          </div>

          {/* Panneau de filtres avancés */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="bg-white rounded-2xl p-5 border border-slate-200 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 shadow-sm">
                  {/* Pièces min */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                      Pièces min.
                    </label>
                    <select
                      value={piecesMin}
                      onChange={(e) => updateFilter('piecesMin', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="">Indifférent</option>
                      <option value="1">1 pièce et +</option>
                      <option value="2">2 pièces et +</option>
                      <option value="3">3 pièces et +</option>
                      <option value="4">4 pièces et +</option>
                      <option value="5">5 pièces et +</option>
                    </select>
                  </div>

                  {/* Surface min */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                      Surface min. (m²)
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 150"
                      value={surfaceMin}
                      onChange={(e) => updateFilter('surfaceMin', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Titre foncier */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                      Titre de Propriété
                    </label>
                    <select
                      value={typeTitrePropriete}
                      onChange={(e) => updateFilter('typeTitrePropriete', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="">Tous les titres</option>
                      <option value="has_titre">Tous Titres Garantis (ACD / CMP)</option>
                      <option value="acd">ACD (Arrêté Concession Définitive)</option>
                      <option value="cmp">CMP (Mutation de Propriété)</option>
                      <option value="titre_foncier">Titre Foncier</option>
                      <option value="bail_emphyteotique">Bail Emphytéotique</option>
                    </select>
                  </div>

                  {/* Prix min */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                      Prix min (FCFA)
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 10000000"
                      value={prixMin}
                      onChange={(e) => updateFilter('prixMin', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Statut */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                      Statut
                    </label>
                    <select
                      value={statut}
                      onChange={(e) => updateFilter('statut', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500 bg-white"
                    >
                      <option value="">Tous statuts</option>
                      <option value="disponible">Disponible</option>
                      <option value="reserve">Réservé</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Affichage des Résultats (Grille ou Carte) */}
          {viewMode === 'map' ? (
            <div className="space-y-6">
              <BiensMap biens={biens} heightClass="h-[600px]" />
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {biens.map((bien, index) => (
                  <BienCard key={bien.id} bien={bien} index={index} />
                ))}
              </div>
            </div>
          ) : (
            <div>
              {loading ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-3xl overflow-hidden animate-pulse border border-slate-100">
                      <div className="aspect-[4/3] bg-slate-200" />
                      <div className="p-5 space-y-3">
                        <div className="h-3 bg-slate-200 rounded w-1/4" />
                        <div className="h-5 bg-slate-200 rounded w-3/4" />
                        <div className="h-4 bg-slate-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : biens.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 flex flex-col items-center justify-center shadow-xs">
                  <Home className="w-12 h-12 text-slate-300 mb-3" />
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Aucun bien trouvé</h3>
                  <p className="text-slate-500 text-xs mb-5">
                    Modifiez vos critères ou votre commune pour découvrir nos offres vérifiées.
                  </p>
                  <button
                    onClick={clearFilters}
                    className={cn(buttonVariants({ size: 'sm' }), 'bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-xs font-bold')}
                  >
                    Voir tous les biens d'Abidjan
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {biens.map((bien, index) => (
                    <BienCard key={bien.id} bien={bien} index={index} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-12">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateFilter('page', String(page - 1))}
                    className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center border transition-colors',
                      page <= 1
                        ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                        : 'border-slate-300 text-slate-700 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="text-xs font-bold text-slate-600">
                    Page <strong>{page}</strong> sur <strong>{totalPages}</strong> ({total} biens)
                  </span>

                  <button
                    disabled={page >= totalPages}
                    onClick={() => updateFilter('page', String(page + 1))}
                    className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center border transition-colors',
                      page >= totalPages
                        ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                        : 'border-slate-300 text-slate-700 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
                    )}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}

export default function Catalogue() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <span className="text-xs font-bold text-slate-700">Chargement de la marketplace ImmOfika...</span>
        </div>
      }
    >
      <CataloguePage />
    </React.Suspense>
  )
}
