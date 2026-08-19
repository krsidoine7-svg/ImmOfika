'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Ruler,
  BedDouble,
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  Map as MapIcon,
  Home,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/public/Footer'
import BiensSearchBar from '@/components/biens/BiensSearchBar'



// ─── Types ──────────────────────────────────────────────────────────────────

interface Bien {
  id: string
  slug: string
  titre: string
  prix: string
  type: string
  transaction: string
  statut: string
  ville: string
  quartier: string | null
  surface: string | null
  chambres: number | null
  main_image_url: string | null
  vues: number
  latitude: string | null
  longitude: string | null
}

interface BienCardProps {
  bien: Bien
  index: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrix(prix: string, transaction: string): string {
  const n = parseFloat(prix)
  const formatted = new Intl.NumberFormat('fr-CI').format(n) + ' FCFA'
  return transaction === 'location' ? formatted + '/mois' : formatted
}

const TYPES = ['terrain', 'villa', 'appartement', 'bureau', 'commerce', 'entrepôt']
const VILLES = ['Abidjan', 'Bingerville', 'Anyama', 'Grand-Bassam', 'Bouaké', 'San-Pédro']
const TRANSACTIONS = ['vente', 'location']

// ─── Composant Carte Bien ────────────────────────────────────────────────────

function BienCard({ bien, index }: BienCardProps) {
  const [isFavori, setIsFavori] = React.useState(false)

  const statutColor = {
    disponible: 'bg-emerald-500',
    reserve: 'bg-amber-500',
    vendu: 'bg-red-500',
    loue: 'bg-blue-500',
  }[bien.statut] ?? 'bg-gray-500'

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: 'easeOut' }}
      className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <Link href={`/biens/${bien.slug}`} className="block relative overflow-hidden aspect-[4/3]">
        {bien.main_image_url ? (
           
          <img
            src={bien.main_image_url}
            alt={bien.titre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1A2A4A] to-[#2E4A7A] flex items-center justify-center">
            <Home className="w-16 h-16 text-white/30" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white capitalize shadow-xs">
            {bien.transaction}
          </span>
          <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold text-white capitalize shadow-xs', statutColor)}>
            {bien.statut}
          </span>
        </div>

        {/* Favori */}
        <button
          onClick={(e) => {
            e.preventDefault()
            setIsFavori(!isFavori)
          }}
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white transition-colors"
          aria-label="Ajouter aux favoris"
        >
          <Heart
            className={cn('h-4 w-4 transition-colors', isFavori ? 'fill-emerald-500 text-emerald-500' : 'text-gray-400')}
          />
        </button>
      </Link>

      {/* Infos */}
      <div className="p-5">
        <p className="text-xs text-emerald-600 uppercase tracking-wide font-extrabold capitalize mb-1">
          {bien.type}
        </p>
        <h2 className="text-base font-bold text-slate-900 line-clamp-2 mb-3 group-hover:text-emerald-600 transition-colors">
          <Link href={`/biens/${bien.slug}`}>{bien.titre}</Link>
        </h2>

        {/* Caractéristiques */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 font-medium">
          {bien.surface && (
            <span className="flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5 text-emerald-500" />
              {parseFloat(bien.surface).toLocaleString('fr-CI')} m²
            </span>
          )}
          {bien.chambres && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5 text-emerald-500" />
              {bien.chambres} ch.
            </span>
          )}
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-emerald-500" />
            {bien.quartier ? `${bien.quartier}, ` : ''}{bien.ville}
          </span>
        </div>

        {/* Prix + CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <p className="text-base font-extrabold text-emerald-600">
            {formatPrix(bien.prix, bien.transaction)}
          </p>
          <Link
            href={`/biens/${bien.slug}`}
            className={cn(
              buttonVariants({ size: 'sm' }),
              'bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl px-4 transition-all shadow-xs'
            )}
          >
            Voir le bien
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

function CataloguePage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [biens, setBiens] = React.useState<Bien[]>([])
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [showFilters, setShowFilters] = React.useState(false)

  // Filtres depuis URL
  const page = Number(searchParams.get('page') ?? 1)
  const search = searchParams.get('search') ?? ''
  const type = searchParams.get('type') ?? ''
  const transaction = searchParams.get('transaction') ?? ''
  const ville = searchParams.get('ville') ?? ''
  const prixMax = searchParams.get('prixMax') ?? ''
  const prixMin = searchParams.get('prixMin') ?? ''
  const statut = searchParams.get('statut') ?? ''
  const quartier = searchParams.get('quartier') ?? ''
  const surfaceMin = searchParams.get('surfaceMin') ?? ''

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
        if (ville) params.set('ville', ville)
        if (prixMax) params.set('prixMax', prixMax)
        if (prixMin) params.set('prixMin', prixMin)
        if (statut) params.set('statut', statut)
        if (quartier) params.set('quartier', quartier)
        if (surfaceMin) params.set('surfaceMin', surfaceMin)
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
  }, [search, type, transaction, ville, prixMax, prixMin, statut, quartier, surfaceMin, page])

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

  const hasActiveFilters = type || transaction || ville || prixMax || prixMin || statut || quartier || surfaceMin || search

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50/50 pt-20">

        {/* En-tête */}
        <section className="bg-gradient-to-b from-emerald-500 to-emerald-700 py-16 px-4 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3"
            >
              Catalogue des <span className="text-emerald-200">Biens Immobiliers</span>
            </motion.h1>
            <p className="text-emerald-100 text-sm md:text-base font-medium mb-8 max-w-xl mx-auto">
              Découvrez nos propriétés vérifiées et sécurisées d&apos;ImmOfika
            </p>

            {/* Barre de recherche */}
            <div className="mt-6 max-w-[956px] mx-auto pointer-events-auto">
              <BiensSearchBar totalCount={total} loading={loading} />
            </div>
          </div>
        </section>

        {/* Filtres + Résultats */}
        <section className="max-w-7xl mx-auto px-4 py-8">

          {/* Barre de filtres */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#1A2A4A] text-[#1A2A4A] text-sm font-medium hover:bg-[#1A2A4A] hover:text-white transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtres
              {hasActiveFilters && (
                <span className="h-5 w-5 rounded-full bg-[#C9A84C] text-white text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </button>


            {/* Filtres rapides */}
            {TRANSACTIONS.map((t) => (
              <button
                key={t}
                onClick={() => updateFilter('transaction', transaction === t ? '' : t)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors',
                  transaction === t
                    ? 'bg-[#C9A84C] text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#C9A84C]'
                )}
              >
                {t}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 rounded-full text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="h-3.5 w-3.5" /> Réinitialiser
              </button>
            )}

            <span className="ml-auto text-sm text-gray-500">
              {loading ? '...' : `${total} bien${total > 1 ? 's' : ''} trouvé${total > 1 ? 's' : ''}`}
            </span>
          </div>

          {/* Panneau filtres avancés */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="bg-white rounded-2xl p-6 border border-gray-100 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Statut</label>
                    <select
                      value={statut}
                      onChange={(e) => updateFilter('statut', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C9A84C]"
                    >
                      <option value="">Tous</option>
                      <option value="disponible">Disponible</option>
                      <option value="reserve">Réservé</option>
                      <option value="vendu">Vendu</option>
                      <option value="loue">Loué</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Type</label>
                    <select
                      value={type}
                      onChange={(e) => updateFilter('type', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm capitalize outline-none focus:ring-2 focus:ring-[#C9A84C]"
                    >
                      <option value="">Tous</option>
                      {TYPES.map((t) => (
                        <option key={t} value={t} className="capitalize">{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Ville</label>
                    <select
                      value={ville}
                      onChange={(e) => updateFilter('ville', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C9A84C]"
                    >
                      <option value="">Toutes</option>
                      {VILLES.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Quartier / Zone</label>
                    <input
                      type="text"
                      placeholder="Ex: Cocody..."
                      value={quartier}
                      onChange={(e) => updateFilter('quartier', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C9A84C]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Surface min. (m²)</label>
                    <input
                      type="number"
                      placeholder="Ex: 200"
                      value={surfaceMin}
                      onChange={(e) => updateFilter('surfaceMin', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C9A84C]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Prix min (FCFA)</label>
                    <input
                      type="number"
                      placeholder="Ex: 10000000"
                      value={prixMin}
                      onChange={(e) => updateFilter('prixMin', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C9A84C]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Prix max (FCFA)</label>
                    <select
                      value={prixMax}
                      onChange={(e) => updateFilter('prixMax', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C9A84C]"
                    >
                      <option value="">Sans limite</option>
                      <option value="20000000">20 000 000</option>
                      <option value="50000000">50 000 000</option>
                      <option value="100000000">100 000 000</option>
                      <option value="200000000">200 000 000</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="w-full py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-red-300 hover:text-red-500 transition-colors"
                    >
                      Réinitialiser tout
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grille de biens */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-12 transition-all duration-300">
              {loading ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                      <div className="aspect-[4/3] bg-gray-200" />
                      <div className="p-5 space-y-3">
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : biens.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center">
                  <Home className="w-12 h-12 text-slate-300 mb-4" />
                  <h3 className="text-xl font-semibold text-[#1A2A4A] mb-2">Aucun bien trouvé</h3>
                  <p className="text-gray-500 mb-6">Modifiez vos filtres pour voir plus de résultats.</p>
                  <button
                    onClick={clearFilters}
                    className={cn(buttonVariants(), 'bg-[#C9A84C] hover:bg-[#b8943d] text-white rounded-full')}
                  >
                    Voir tous les biens
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
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-[#1A2A4A] text-[#1A2A4A] hover:bg-[#1A2A4A] hover:text-white'
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="text-sm text-gray-600">
                    Page <strong>{page}</strong> sur <strong>{totalPages}</strong>
                  </span>

                  <button
                    disabled={page >= totalPages}
                    onClick={() => updateFilter('page', String(page + 1))}
                    className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center border transition-colors',
                      page >= totalPages
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-[#1A2A4A] text-[#1A2A4A] hover:bg-[#1A2A4A] hover:text-white'
                    )}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>


          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default function Catalogue() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#F8F6F1] flex flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-[#C9A84C]/30 border-t-[#C9A84C] animate-spin" />
        <span className="text-sm font-semibold text-[#1A2A4A]">Chargement du catalogue d'exception...</span>
      </div>
    }>
      <CataloguePage />
    </React.Suspense>
  )
}
