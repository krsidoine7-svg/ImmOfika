'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  Phone,
  MessageSquare,
  CheckCircle,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import PlanifierVisiteModal from '@/components/client/PlanifierVisiteModal'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BienImage {
  id: string
  url: string
  caption: string | null
  order: number
}

interface Bien {
  id: string
  slug: string
  titre: string
  description: string
  prix: string
  type: string
  transaction: string
  statut: string
  ville: string
  quartier: string | null
  adresse: string | null
  surface: string | null
  chambres: number | null
  salles_de_bain: number | null
  etages: number | null
  parking: boolean
  piscine: boolean
  jardin: boolean
  meuble: boolean
  gardiennage: boolean
  main_image_url: string | null
  video_url: string | null
  pdf_annexe_url: string | null
  vues: number
  agent_id: string | null
}

interface Props {
  bien: Bien
  images: BienImage[]
  isFavori: boolean
  isConnected: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrix(prix: string, transaction: string): string {
  const n = parseFloat(prix)
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
      <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-[#1A2A4A] to-[#2E4A7A] flex items-center justify-center">
        <span className="text-white/20 text-8xl">🏠</span>
      </div>
    )
  }

  return (
    <>
      {/* Image principale */}
      <div className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer" onClick={() => setLightbox(true)}>
        <img
          src={allImages[current].url}
          alt={allImages[current].caption ?? 'Photo du bien'}
          className="w-full h-full object-cover transition-all duration-500"
        />
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + allImages.length) % allImages.length) }}
              className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % allImages.length) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur text-white text-xs px-3 py-1 rounded-full">
              {current + 1} / {allImages.length}
            </div>
          </>
        )}
      </div>

      {/* Miniatures */}
      {allImages.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setCurrent(i)}
              className={cn(
                'flex-shrink-0 h-16 w-24 rounded-lg overflow-hidden border-2 transition-all',
                i === current ? 'border-[#C9A84C] opacity-100' : 'border-transparent opacity-60 hover:opacity-90'
              )}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <button className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
              <X className="h-5 w-5" />
            </button>
            <img
              src={allImages[current].url}
              alt=""
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + allImages.length) % allImages.length) }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % allImages.length) }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function BienDetailClient({ bien, images, isFavori: initialFavori, isConnected }: Props) {
  const [favori, setFavori] = React.useState(initialFavori)
  const [showReserveModal, setShowReserveModal] = React.useState(false)
  const [showVisiteModal, setShowVisiteModal] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggleFavori = async () => {
    if (!isConnected) {
      window.location.href = '/auth/login'
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
      setFavori(favori) // rollback
    }
  }

  const features = [
    { icon: Ruler, label: 'Surface', value: bien.surface ? `${parseFloat(bien.surface).toLocaleString('fr-CI')} m²` : null },
    { icon: BedDouble, label: 'Chambres', value: bien.chambres ? `${bien.chambres} chambre${bien.chambres > 1 ? 's' : ''}` : null },
    { icon: Bath, label: 'Salle de bain', value: bien.salles_de_bain ? `${bien.salles_de_bain} SDB` : null },
  ].filter((f) => f.value !== null)

  const amenities = [
    { icon: Car, label: 'Parking', active: bien.parking },
    { icon: Waves, label: 'Piscine', active: bien.piscine },
    { icon: Trees, label: 'Jardin', active: bien.jardin },
    { icon: Shield, label: 'Gardiennage', active: bien.gardiennage },
  ].filter((a) => a.active)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-[#C9A84C] transition-colors">Accueil</Link>
        <span>/</span>
        <Link href="/biens" className="hover:text-[#C9A84C] transition-colors">Biens</Link>
        <span>/</span>
        <span className="text-[#1A2A4A] font-medium truncate max-w-[200px]">{bien.titre}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Colonne gauche — Galerie + Description */}
        <div className="lg:col-span-2 space-y-8">

          {/* Galerie */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Galerie mainImage={bien.main_image_url} images={images} />
          </motion.div>

          {/* Titre + Statut */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="flex flex-wrap items-start gap-3 mb-4">
              <span className={cn('px-3 py-1 rounded-full text-xs font-semibold border capitalize', statutColors[bien.statut] ?? 'bg-gray-100 text-gray-700')}>
                {bien.statut}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                {bien.type}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 capitalize">
                {bien.transaction}
              </span>
              <span className="ml-auto flex items-center gap-1 text-xs text-slate-400">
                <Eye className="h-3.5 w-3.5" /> {bien.vues} vue{bien.vues > 1 ? 's' : ''}
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-3 leading-tight">
              {bien.titre}
            </h1>

            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span>{bien.adresse ? `${bien.adresse}, ` : ''}{bien.quartier ? `${bien.quartier}, ` : ''}{bien.ville}</span>
            </div>
          </motion.div>

          {/* Caractéristiques */}
          {features.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              {features.map((f) => (
                <div key={f.label} className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <f.icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">{f.label}</p>
                    <p className="text-sm font-bold text-slate-900">{f.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Description */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-slate-100"
          >
            <h2 className="text-lg font-bold text-slate-900 mb-4">Description</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">{bien.description}</p>
          </motion.div>

          {/* Équipements */}
          {amenities.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
              className="bg-white rounded-2xl p-6 border border-slate-100"
            >
              <h2 className="text-lg font-bold text-slate-900 mb-4">Équipements</h2>
              <div className="flex flex-wrap gap-3">
                {amenities.map((a) => (
                  <div key={a.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    {a.label}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Vidéo de présentation */}
          {bien.video_url && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.28 }}
              className="bg-white rounded-2xl p-6 border border-slate-100"
            >
              <h2 className="text-lg font-bold text-slate-900 mb-4">Vidéo de présentation</h2>
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black/5">
                <video 
                  src={bien.video_url} 
                  controls 
                  className="w-full h-full object-cover"
                  preload="metadata"
                >
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              </div>
            </motion.div>
          )}

          {/* Documents */}
          {bien.pdf_annexe_url && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-2xl p-6 border border-slate-100"
            >
              <h2 className="text-lg font-bold text-slate-900 mb-4">Documents</h2>
              <a
                href={bien.pdf_annexe_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100/70 transition-colors group"
              >
                <div className="h-10 w-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <Download className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Annexe technique</p>
                  <p className="text-xs text-slate-500">PDF · Télécharger</p>
                </div>
              </a>
            </motion.div>
          )}
        </div>

        {/* Colonne droite — Prix + Actions */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm sticky top-24"
          >
            {/* Prix */}
            <div className="mb-6">
              <p className="text-3xl font-extrabold text-emerald-600 mb-1">
                {formatPrix(bien.prix, bien.transaction)}
              </p>
              {bien.transaction === 'location' && (
                <p className="text-xs text-slate-400">Charges non incluses</p>
              )}
            </div>

            {/* CTA Principal */}
            {bien.statut === 'disponible' ? (
              <button
                onClick={() => {
                  if (!isConnected) {
                    window.location.href = '/auth/login?redirect=/biens/' + bien.slug
                    return
                  }
                  setShowReserveModal(true)
                }}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all shadow-md shadow-emerald-500/20 mb-3 cursor-pointer"
              >
                {isConnected ? '📋 Réserver ce bien' : '🔐 Connectez-vous pour réserver'}
              </button>
            ) : (
              <div className={cn('w-full py-3.5 rounded-xl text-center font-bold text-sm mb-3 border capitalize', statutColors[bien.statut])}>
                Ce bien est {bien.statut}
              </div>
            )}

            {/* Planifier une visite en self-service */}
            <button
              onClick={() => setShowVisiteModal(true)}
              className="w-full py-3 rounded-xl border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-bold text-sm transition-all mb-4 flex items-center justify-center gap-2 cursor-pointer"
            >
              📅 Planifier une visite physique
            </button>

            {/* Actions secondaires */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleToggleFavori}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all',
                  favori
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600'
                )}
              >
                <Heart className={cn('h-4 w-4', favori ? 'fill-red-500' : '')} />
                {favori ? 'Sauvegardé' : 'Favoris'}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 text-xs font-bold transition-all"
              >
                {copied ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
                {copied ? 'Copié !' : 'Partager'}
              </button>
            </div>

            {/* Contacter un agent */}
            <div className="border-t border-slate-100 pt-5">
              <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider font-extrabold">Contacter un conseiller</p>
              <a
                href="tel:+2252724000000"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white group transition-colors mb-2"
              >
                <Phone className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-bold text-slate-700 group-hover:text-white">+225 27 24 00 00 00</span>
              </a>
              <a
                href={`https://wa.me/2250700000000?text=Bonjour, je suis intéressé par le bien : ${bien.titre}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-500 group transition-colors"
              >
                <MessageSquare className="h-4 w-4 text-emerald-600 group-hover:text-white" />
                <span className="text-xs font-bold text-emerald-700 group-hover:text-white">WhatsApp ImmOfika</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal Réservation */}
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
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-[#1A2A4A] mb-2">Confirmer la réservation</h3>
              <p className="text-gray-500 text-sm mb-6">
                Vous êtes sur le point de réserver <strong>{bien.titre}</strong>. 
                Un acompte sera requis pour finaliser la réservation.
              </p>
              <div className="bg-[#F8F6F1] rounded-xl p-4 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Prix</span>
                  <span className="font-semibold text-[#1A2A4A]">{formatPrix(bien.prix, bien.transaction)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Durée réservation</span>
                  <span className="font-semibold text-[#1A2A4A]">3 mois max</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReserveModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:border-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <Link
                  href={`/client/reserver/${bien.slug}`}
                  className={cn(
                    buttonVariants(),
                    'flex-1 py-3 rounded-xl bg-[#C9A84C] hover:bg-[#b8943d] text-white text-sm font-medium text-center'
                  )}
                >
                  Continuer →
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
    </div>
  )
}
