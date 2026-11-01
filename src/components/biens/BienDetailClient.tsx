'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  Heart,
  MapPin,
  Ruler,
  BedDouble,
  Bath,
  Car,
  Waves,
  Trees,
  Shield,
  ShieldCheck,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  Phone,
  MessageSquare,
  CheckCircle,
  Building2,
  User,
  Home,
  FileCheck2,
  Lock,
  Flag,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import PlanifierVisiteModal from '@/components/client/PlanifierVisiteModal'
import SignalerBienModal from '@/components/biens/SignalerBienModal'
import { siteConfig } from '@/config/site'
import { TITRES_FONCIERS } from '@/lib/constants/abidjan'

// Mini carte dynamique
const BiensMap = dynamic(() => import('@/components/biens/BiensMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] rounded-2xl bg-slate-100 flex items-center justify-center animate-pulse">
      <div className="flex flex-col items-center gap-2">
        <MapPin className="w-6 h-6 text-emerald-500 animate-bounce" />
        <span className="text-xs font-semibold text-slate-500">Localisation GPS...</span>
      </div>
    </div>
  ),
})

// ─── Types ────────────────────────────────────────────────────────────────────

interface BienImage {
  id: string
  url: string
  caption: string | null
  order: number
}

interface OrganizationInfo {
  id: string
  name: string
  slug?: string
  type: 'agence' | 'promoteur'
  agrement_numero?: string | null
  logo_url?: string | null
  telephone?: string | null
  whatsapp?: string | null
  email?: string | null
  ville?: string | null
  commune?: string | null
  adresse?: string | null
  verified_at?: string | null
}

interface Bien {
  id: string
  slug: string
  titre: string
  description: string
  prix: string | number
  type: string
  transaction: string
  statut: string
  ville: string
  commune?: string | null
  quartier?: string | null
  adresse?: string | null
  surface?: string | number | null
  pieces?: number | null
  chambres?: number | null
  salles_de_bain?: number | null
  etages?: number | null
  parking?: boolean
  piscine?: boolean
  jardin?: boolean
  meuble?: boolean
  gardiennage?: boolean
  main_image_url: string | null
  video_url?: string | null
  pdf_annexe_url?: string | null
  vues: number
  agent_id?: string | null
  latitude?: string | number | null
  longitude?: string | number | null
  type_titre_propriete?: string | null
  preuve_propriete_url?: string | null
  is_programme_neuf?: boolean | null
  organization?: OrganizationInfo | null
}

interface Props {
  bien: Bien
  images: BienImage[]
  isFavori: boolean
  isConnected: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrix(prix: string | number, transaction: string): string {
  const n = typeof prix === 'string' ? parseFloat(prix) : prix
  const formatted = new Intl.NumberFormat('fr-CI').format(n) + ' FCFA'
  return transaction === 'location' ? formatted + '/mois' : formatted
}

const statutColors: Record<string, string> = {
  disponible: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  reserve: 'bg-amber-100 text-amber-700 border-amber-200',
  vendu: 'bg-red-100 text-red-700 border-red-200',
  loue: 'bg-blue-100 text-blue-700 border-blue-200',
}

// ─── Galerie ──────────────────────────────────────────────────────────────────

function Galerie({ mainImage, images }: { mainImage: string | null; images: BienImage[] }) {
  const allImages = [
    ...(mainImage ? [{ id: 'main', url: mainImage, caption: null, order: -1 }] : []),
    ...images,
  ]
  const [current, setCurrent] = React.useState(0)
  const [lightbox, setLightbox] = React.useState(false)

  if (allImages.length === 0) {
    return (
      <div className="w-full h-80 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center">
        <Home className="w-16 h-16 text-white/30" />
      </div>
    )
  }

  const prev = () => setCurrent((c) => (c === 0 ? allImages.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === allImages.length - 1 ? 0 : c + 1))

  return (
    <>
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 aspect-[16/10] shadow-sm">
        <img
          src={allImages[current]?.url}
          alt={allImages[current]?.caption || 'Photo du bien'}
          className="w-full h-full object-cover cursor-pointer hover:scale-101 transition-transform duration-300"
          onClick={() => setLightbox(true)}
        />

        {allImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 transition-colors"
              aria-label="Photo précédente"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 transition-colors"
              aria-label="Photo suivante"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full font-bold">
              {current + 1} / {allImages.length}
            </div>
          </>
        )}
      </div>

      {/* Miniatures */}
      {allImages.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
          {allImages.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setCurrent(i)}
              className={cn(
                'relative h-16 w-24 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer',
                i === current ? 'border-emerald-500 scale-102' : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox plein écran */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <button
              type="button"
              onClick={() => setLightbox(false)}
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={allImages[current]?.url}
              alt=""
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Composant Principal ──────────────────────────────────────────────────────

export default function BienDetailClient({ bien, images, isFavori: initialFavori, isConnected }: Props) {
  const [favori, setFavori] = React.useState(initialFavori)
  const [showReserveModal, setShowReserveModal] = React.useState(false)
  const [showVisiteModal, setShowVisiteModal] = React.useState(false)
  const [showSignalerModal, setShowSignalerModal] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggleFavori = async () => {
    if (!isConnected) {
      window.location.href = `/auth/login?redirect=/biens/${bien.slug}`
      return
    }
    setFavori(!favori)
    try {
      await fetch('/api/favoris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bienId: bien.id }),
      })
    } catch {
      setFavori(favori)
    }
  }

  // Caractéristiques du bien
  const features = [
    {
      icon: Ruler,
      label: 'Surface',
      value: bien.surface ? `${Number(bien.surface).toLocaleString('fr-CI')} m²` : null,
    },
    {
      icon: Home,
      label: 'Pièces',
      value: bien.pieces ? `${bien.pieces} pièce${bien.pieces > 1 ? 's' : ''}` : null,
    },
    {
      icon: BedDouble,
      label: 'Chambres',
      value: bien.chambres ? `${bien.chambres} chambre${bien.chambres > 1 ? 's' : ''}` : null,
    },
    {
      icon: Bath,
      label: 'Salles de bain',
      value: bien.salles_de_bain ? `${bien.salles_de_bain} SDB` : null,
    },
  ].filter((f) => f.value !== null)

  const amenities = [
    { icon: Car, label: 'Parking privatif', active: bien.parking },
    { icon: Waves, label: 'Piscine', active: bien.piscine },
    { icon: Trees, label: 'Jardin / Cour', active: bien.jardin },
    { icon: Shield, label: 'Sécurité & Gardiennage 24/7', active: bien.gardiennage },
    { icon: Home, label: 'Entièrement Meublé', active: bien.meuble },
  ].filter((a) => a.active)

  // Titre foncier
  const titreInfo = bien.type_titre_propriete ? TITRES_FONCIERS[bien.type_titre_propriete] : null

  // Annonceur
  const org = bien.organization
  const advertiserName = org?.name || 'Particulier Propriétaire'
  const isPromoteur = org?.type === 'promoteur'
  const isAgence = org?.type === 'agence'
  const advertiserPhone = org?.telephone || siteConfig.company.phone
  const advertiserWhatsapp = org?.whatsapp || siteConfig.company.phone

  const cleanPhone = advertiserWhatsapp.replace(/[^0-9]/g, '')
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Bonjour, je suis intéressé par votre bien "${bien.titre}" (Réf: ${bien.slug}) au prix de ${formatPrix(
      bien.prix,
      bien.transaction
    )}.`
  )}`

  // Calcul Acompte légal
  const prixNum = typeof bien.prix === 'string' ? parseFloat(bien.prix) : bien.prix
  const acompteMontant =
    bien.transaction === 'location'
      ? Math.round(prixNum) // 1 mois de loyer
      : Math.round(prixNum * 0.1) // 10% légal en vente

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors font-medium">
          Accueil
        </Link>
        <span>/</span>
        <Link href="/biens" className="hover:text-emerald-600 transition-colors font-medium">
          Biens
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-[200px]">{bien.titre}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne gauche — Galerie + Détails + Sécurisation Foncière */}
        <div className="lg:col-span-2 space-y-8">
          {/* Galerie */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Galerie mainImage={bien.main_image_url} images={images} />
          </motion.div>

          {/* En-tête Titre + Badges Légaux */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className={cn('px-3 py-1 rounded-full text-xs font-bold border capitalize', statutColors[bien.statut] ?? 'bg-gray-100 text-gray-700')}>
                {bien.statut}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                {bien.type}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 capitalize">
                {bien.transaction === 'location' ? 'À Louer' : 'À Vendre'}
              </span>

              {titreInfo && (
                <span className={cn('inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold border', titreInfo.colorClass)}>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {titreInfo.badgeLabel}
                </span>
              )}

              <span className="ml-auto flex items-center gap-1 text-xs text-slate-400">
                <Eye className="h-3.5 w-3.5" /> {bien.vues} vue{bien.vues > 1 ? 's' : ''}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 leading-tight">
              {bien.titre}
            </h1>

            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                {bien.adresse ? `${bien.adresse}, ` : ''}
                {bien.quartier ? `${bien.quartier}, ` : ''}
                {bien.commune ? `${bien.commune}` : bien.ville}
              </span>
            </div>
          </motion.div>

          {/* Caractéristiques Clés */}
          {features.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              {features.map((f) => (
                <div key={f.label} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-3 shadow-2xs">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{f.label}</p>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">{f.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Encadré Sécurisation Foncière & Titre de Propriété (MCLU) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-3xl p-6 border border-emerald-200/80 shadow-2xs"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Sécurisation Juridique & Titre Foncier
                  </h3>
                  {titreInfo && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white">
                      Garantie {titreInfo.garantieNiveau}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {titreInfo
                    ? `${titreInfo.label} — ${titreInfo.description}`
                    : 'Bien immobilier soumis aux contrôles juridiques préalables de la plateforme ImmOfika selon les règles de conformité OHADA et MCLU.'}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Acte authentique notarié et contrôle d&apos;authenticité assuré avant tout décaissement.</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs"
          >
            <h2 className="text-base font-bold text-slate-900 mb-3">Description du bien</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">{bien.description}</p>
          </motion.div>

          {/* Équipements & Commodités */}
          {amenities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs"
            >
              <h2 className="text-base font-bold text-slate-900 mb-3">Commodités & Équipements</h2>
              <div className="flex flex-wrap gap-2.5">
                {amenities.map((a) => (
                  <div
                    key={a.label}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-xs font-bold"
                  >
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{a.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Localisation Interactive */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Emplacement à Abidjan</h2>
              <span className="text-xs text-slate-500 font-medium">
                📍 {bien.quartier ? `${bien.quartier}, ` : ''}{bien.commune || bien.ville}
              </span>
            </div>
            <BiensMap
              biens={[
                {
                  id: bien.id,
                  slug: bien.slug,
                  titre: bien.titre,
                  prix: bien.prix,
                  transaction: bien.transaction,
                  type: bien.type,
                  ville: bien.ville,
                  quartier: bien.quartier,
                  latitude: bien.latitude,
                  longitude: bien.longitude,
                  main_image_url: bien.main_image_url,
                  type_titre_propriete: bien.type_titre_propriete,
                },
              ]}
              heightClass="h-[320px]"
            />
          </motion.div>

          {/* Vidéo de présentation */}
          {bien.video_url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs"
            >
              <h2 className="text-base font-bold text-slate-900 mb-3">Visite Vidéo</h2>
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/5">
                <video src={bien.video_url} controls className="w-full h-full object-cover" preload="metadata">
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              </div>
            </motion.div>
          )}

          {/* Documents & Annexe */}
          {bien.pdf_annexe_url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs"
            >
              <h2 className="text-base font-bold text-slate-900 mb-3">Fiche & Documents Techniques</h2>
              <a
                href={bien.pdf_annexe_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100/70 transition-colors group"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Dossier technique & plans</p>
                  <p className="text-xs text-slate-500">Document PDF certifié</p>
                </div>
              </a>
            </motion.div>
          )}
        </div>

        {/* Colonne droite — Prix + Réservation Acompte Légal + Contact Annonceur */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky top-24 space-y-5"
          >
            {/* Prix */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {bien.transaction === 'location' ? 'Loyer mensuel' : 'Prix de vente'}
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {formatPrix(bien.prix, bien.transaction)}
              </p>
              {bien.transaction === 'location' && (
                <p className="text-[11px] text-slate-400 mt-0.5">Charges locatives selon contrat</p>
              )}
            </div>

            {/* Encart Acompte de Réservation Légal */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 font-semibold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  Acompte légal de réservation :
                </span>
                <span className="font-extrabold text-emerald-700">
                  {new Intl.NumberFormat('fr-CI').format(acompteMontant)} FCFA
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                {bien.transaction === 'location'
                  ? 'Équivalent à 1 mois de caution séquestré en compte certifié.'
                  : 'Acompte légal de 10% consigné jusqu\'à la signature notariée.'}
              </p>
            </div>

            {/* CTA Réservation en Ligne */}
            {bien.statut === 'disponible' ? (
              <button
                type="button"
                onClick={() => {
                  if (!isConnected) {
                    window.location.href = `/auth/login?redirect=/biens/${bien.slug}`
                    return
                  }
                  setShowReserveModal(true)
                }}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Réserver avec acompte légal</span>
              </button>
            ) : (
              <div
                className={cn(
                  'w-full py-3 rounded-2xl text-center font-bold text-xs sm:text-sm border capitalize',
                  statutColors[bien.statut]
                )}
              >
                Ce bien est {bien.statut}
              </div>
            )}

            {/* Bouton Visite Physique */}
            <button
              type="button"
              onClick={() => setShowVisiteModal(true)}
              className="w-full py-3 rounded-2xl border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              📅 Planifier une visite physique
            </button>

            {/* Partage & Favoris */}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handleToggleFavori}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer',
                  favori
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600'
                )}
              >
                <Heart className={cn('h-3.5 w-3.5', favori ? 'fill-red-500' : '')} />
                <span>{favori ? 'Sauvegardé' : 'Favoris'}</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 text-xs font-bold transition-all cursor-pointer"
              >
                {copied ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copié !' : 'Partager'}</span>
              </button>
            </div>

            {/* Bouton Signalement Anti-Fraude */}
            <button
              type="button"
              onClick={() => setShowSignalerModal(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold text-slate-400 hover:text-red-500 hover:bg-red-50/50 rounded-xl transition-all cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Signaler un abus ou faux titre foncier</span>
            </button>

            {/* Encart Annonceur Certifié */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">
                  Annonceur vérifié
                </span>
                {isPromoteur && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Promoteur Agréé
                  </span>
                )}
                {isAgence && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                    Agence Agréée
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 font-extrabold text-sm border border-slate-200 shrink-0">
                  {org?.logo_url ? (
                    <img src={org.logo_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                  ) : isPromoteur ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  ) : isAgence ? (
                    <Building2 className="w-5 h-5 text-blue-600" />
                  ) : (
                    <User className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                    {advertiserName}
                  </h4>
                  {org?.agrement_numero && (
                    <p className="text-[10px] text-slate-500 font-semibold truncate">
                      Agrément MCLU : {org.agrement_numero}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact direct WhatsApp & Téléphone */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`tel:${advertiserPhone.replace(/\s+/g, '')}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 text-xs font-bold transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Appeler</span>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-700 text-xs font-bold transition-colors border border-emerald-200"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal Confirmation de Réservation */}
      <AnimatePresence>
        {showReserveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowReserveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-1">
                Réservation avec Séquestre Légal
              </h3>
              <p className="text-slate-500 text-xs mb-5">
                Vous êtes sur le point de réserver l&apos;annonce <strong>{bien.titre}</strong>.
                Un acompte légal sécurisé est requis pour verrouiller le bien et engager la procédure notariée.
              </p>

              <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-2.5 border border-slate-200">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Montant total du bien</span>
                  <span className="font-extrabold text-slate-900">{formatPrix(bien.prix, bien.transaction)}</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-slate-200">
                  <span className="text-emerald-700 font-bold">Acompte d&apos;engagement requis</span>
                  <span className="font-extrabold text-emerald-700 text-sm">
                    {new Intl.NumberFormat('fr-CI').format(acompteMontant)} FCFA
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  Paiement sécurisé via Mobile Money (Wave, Orange, MTN) ou Carte Bancaire.
                </p>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowReserveModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <Link
                  href={`/client/reserver/${bien.slug}`}
                  className={cn(
                    buttonVariants(),
                    'flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold text-center shadow-lg shadow-emerald-500/20'
                  )}
                >
                  Procéder au paiement →
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Planifier Visite */}
      <PlanifierVisiteModal
        isOpen={showVisiteModal}
        onClose={() => setShowVisiteModal(false)}
        bienId={bien.id}
        bienTitre={bien.titre}
        isConnected={isConnected}
      />

      {/* Modal Signalement Anti-Fraude */}
      <SignalerBienModal
        isOpen={showSignalerModal}
        onClose={() => setShowSignalerModal(false)}
        bienId={bien.id}
        bienTitre={bien.titre}
      />
    </div>
  )
}
