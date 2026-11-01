'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Bed,
  Maximize,
  MapPin,
  ArrowRight,
  Phone,
  MessageCircle,
  Building2,
  ShieldCheck,
  User,
  CheckCircle,
  Loader2,
  Send,
} from 'lucide-react'
import { MarketplaceBien, AdvertiserType } from '@/types/marketplace'
import { envoyerMessageContactAction } from '@/app/actions/contactActions'

interface MarketplacePropertyCardProps {
  bien: MarketplaceBien
  locationBadge?: string
}

function AdvertiserBadge({ type, name }: { type: AdvertiserType; name: string }) {
  if (type === 'promoteur') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <ShieldCheck className="h-3 w-3 text-emerald-600" />
        Promoteur Agréé
      </span>
    )
  }

  if (type === 'agence') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
        <Building2 className="h-3 w-3 text-blue-600" />
        Agence Agréée
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
      <User className="h-3 w-3 text-slate-500" />
      Particulier
    </span>
  )
}

export default function MarketplacePropertyCard({ bien, locationBadge }: MarketplacePropertyCardProps) {
  const [imgSrc, setImgSrc] = React.useState(bien.mainImageUrl)
  const [isContactOpen, setIsContactOpen] = React.useState(false)
  const [formData, setFormData] = React.useState({
    nom: '',
    telephone: '',
    message: `Bonjour, je suis intéressé par votre annonce : "${bien.titre}"`,
    website_hp: '',
  })
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const isLocation = bien.transaction === 'location'
  const isReserve = bien.statut === 'reserve'

  // Formatage du prix
  const formattedPrice = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(bien.prix)

  // Numéro WhatsApp cible (annonceur ou numéro officiel de la plateforme)
  const cleanPhone = (bien.advertiser.phone || '2250747631706').replace(/[^0-9]/g, '')
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Bonjour ImmOfika, je souhaite avoir des informations sur le bien "${bien.titre}" (Réf: ${bien.slug}) au prix de ${formattedPrice} FCFA.`
  )}`

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await envoyerMessageContactAction({
        nom: formData.nom,
        telephone: formData.telephone,
        message: formData.message,
        website_hp: formData.website_hp,
        source: 'site_web',
        bienInteresse: bien.id,
      })

      if (res?.error) {
        setError(res.error)
      } else {
        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="group relative h-full flex flex-col">
        <Card className="overflow-hidden border border-slate-200/80 bg-white rounded-3xl shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 flex-1 flex flex-col">
          <CardContent className="p-0 flex-1 flex flex-col">
            {/* Conteneur Image & Badges */}
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
              <Link href={`/biens/${bien.slug}`} className="block w-full h-full">
                <img
                  src={imgSrc}
                  alt={bien.titre}
                  onError={() =>
                    setImgSrc(
                      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800'
                    )
                  }
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </Link>

              {/* Gradient bas d'image */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

              {/* Badges en haut */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
                <div className="flex items-center gap-1.5 flex-wrap max-w-[70%]">
                  <Badge
                    className={`rounded-full px-3 py-1 text-[11px] font-bold shadow-md border-0 shrink-0 ${
                      isLocation ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {isLocation ? 'À Louer' : 'À Vendre'}
                  </Badge>

                  {locationBadge && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-extrabold shadow-md border border-white/10 shrink-0">
                      <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{locationBadge}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {bien.meuble && (
                    <Badge className="bg-amber-600 text-white rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow">
                      Meublé
                    </Badge>
                  )}
                  {isReserve && (
                    <Badge className="bg-orange-500 text-white rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow">
                      Réservé
                    </Badge>
                  )}
                </div>
              </div>

              {/* Prix en incrustation sur l'image */}
              <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
                <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-white font-extrabold text-sm sm:text-base shadow-lg border border-white/10 flex items-baseline gap-1">
                  <span>{formattedPrice} FCFA</span>
                  {isLocation && <span className="text-[10px] font-semibold text-slate-300">/mois</span>}
                </div>
              </div>
            </div>

            {/* Détails de l'Annonce */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                {/* Badge Type d'annonceur */}
                <div className="mb-2">
                  <AdvertiserBadge type={bien.advertiser.type} name={bien.advertiser.name} />
                </div>

                {/* Titre */}
                <Link href={`/biens/${bien.slug}`}>
                  <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-emerald-600 transition-colors">
                    {bien.titre}
                  </h3>
                </Link>

                {/* Localisation */}
                <div className="flex items-center text-slate-500 text-xs mt-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500 mr-1 shrink-0" />
                  <span className="truncate">
                    {bien.quartier ? `${bien.quartier}, ` : ''}
                    {bien.ville}
                  </span>
                </div>
              </div>

              {/* Caractéristiques */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  {bien.chambres !== null && bien.chambres !== undefined && bien.chambres > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Bed className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{bien.chambres} ch.</span>
                    </span>
                  )}
                  {bien.surface && bien.surface > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Maximize className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{bien.surface} m²</span>
                    </span>
                  )}
                </div>

                {/* Action Rapide "Contacter" */}
                <button
                  type="button"
                  onClick={() => setIsContactOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-emerald-50 hover:bg-emerald-500 text-emerald-700 hover:text-white text-xs transition-colors shadow-xs"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Contacter</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de contact rapide (Direct & Protégé) */}
      {isContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in-0 duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-5">
            {/* Bouton Fermer */}
            <button
              onClick={() => {
                setIsContactOpen(false)
                setSuccess(false)
                setError(null)
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                Mise en relation directe
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">Contacter l'annonceur</h3>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">Pour : {bien.titre}</p>
            </div>

            {success ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Message transmis !</h4>
                <p className="text-xs text-slate-500">
                  L'annonceur a reçu votre demande et vous recontactera sous peu.
                </p>
                <div className="pt-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Poursuivre sur WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <>
                {/* Options d'action immédiate */}
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-500/20"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>

                  {bien.advertiser.phone ? (
                    <a
                      href={`tel:${bien.advertiser.phone}`}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                    >
                      <Phone className="h-4 w-4 text-emerald-600" />
                      Appeler
                    </a>
                  ) : (
                    <Link
                      href={`/biens/${bien.slug}`}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                    >
                      <span>Fiche bien</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>

                <div className="relative flex items-center justify-center my-2">
                  <div className="border-t border-slate-100 w-full" />
                  <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Ou par message direct
                  </span>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium">
                    {error}
                  </div>
                )}

                {/* Formulaire léger avec anti-spam */}
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  {/* Honeypot invisible anti-robot */}
                  <div className="opacity-0 absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
                    <input
                      type="text"
                      name="website_hp"
                      value={formData.website_hp}
                      onChange={(e) => setFormData({ ...formData, website_hp: e.target.value })}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Votre nom</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Kouassi Michel"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="w-full h-10 px-3 mt-1 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Téléphone (WhatsApp)</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 07 00 00 00 00"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full h-10 px-3 mt-1 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Envoyer ma demande</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
