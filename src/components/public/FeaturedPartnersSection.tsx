"use client"

import * as React from "react"
import { Phone, MessageCircle, ShieldCheck, MapPin, Building, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Partner {
  id?: string
  name: string
  type?: 'promoteur' | 'agence'
  agrement: string
  badge: string
  phone: string
  whatsapp: string
  whatsapp_message?: string
  communes: string
  active_biens_count: number
  logo?: string
  bio?: string
}

interface FeaturedPartnersSectionProps {
  data?: {
    enabled?: boolean
    tag?: string
    title?: string
    italic_word?: string
    description?: string
    partners?: Partner[]
  }
}

export default function FeaturedPartnersSection({ data }: FeaturedPartnersSectionProps) {
  if (data?.enabled === false) return null

  const tag = data?.tag || "Partenaires Officiels & Agréés"
  const title = data?.title || "Nos Promoteurs & Agences d'Élite en Vedette"
  const italicWord = data?.italic_word || "en Vedette"
  const description = data?.description || "Découvrez nos promoteurs certifiés et agences partenaires ImmOfika. Échangez directement par WhatsApp ou appel avec leurs conseillers dédiés."
  const partners = data?.partners || []

  if (partners.length === 0) return null

  // Découper le titre pour mettre en valeur le mot clé
  const titleParts = italicWord && title.includes(italicWord)
    ? title.split(italicWord)
    : [title]

  return (
    <section className="py-20 lg:py-28 bg-[#FBF9F5] border-t border-slate-200/60 relative overflow-hidden">
      {/* Halo décoratif subtil */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-100/30 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* En-tête de section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold uppercase tracking-wider shadow-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>{tag}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {titleParts.length > 1 ? (
              <>
                {titleParts[0]}
                <span className="text-emerald-600 font-extrabold italic">{italicWord}</span>
                {titleParts[1]}
              </>
            ) : (
              title
            )}
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {description}
          </p>
        </div>

        {/* Grille des cartes Promoteurs & Agences */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {partners.map((partner, idx) => {
            const cleanWhatsapp = (partner.whatsapp || "").replace(/[^0-9]/g, "")
            const defaultMsg = encodeURIComponent(partner.whatsapp_message || "Bonjour, je vous contacte depuis la plateforme ImmOfika au sujet de vos programmes immobiliers.")
            const whatsappLink = `https://wa.me/${cleanWhatsapp}?text=${defaultMsg}`
            const phoneLink = `tel:${partner.phone.replace(/\s+/g, '')}`

            return (
              <div 
                key={partner.id || idx}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between group relative"
              >
                {/* Badge Agréé & Type */}
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 border border-emerald-200 text-emerald-700 tracking-wide">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      {partner.badge || "Promoteur Agréé"}
                    </span>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                      {partner.type === 'agence' ? 'Agence' : 'Promoteur'}
                    </span>
                  </div>

                  {/* Identité Promoteur */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-14 w-14 rounded-2xl border border-slate-100 bg-slate-50/80 p-2 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                      <Image
                        src={partner.logo || "/logo-immo.svg"}
                        alt={partner.name}
                        width={48}
                        height={48}
                        className="h-full w-auto object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                        {partner.name}
                      </h3>
                      <p className="text-[11px] font-semibold text-slate-500 font-mono mt-0.5">
                        {partner.agrement}
                      </p>
                    </div>
                  </div>

                  {/* Bio courte */}
                  {partner.bio && (
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4">
                      {partner.bio}
                    </p>
                  )}

                  {/* Métriques & Communes */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100/80 mb-6 text-xs">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate font-semibold text-slate-700 text-[11px]">
                        {partner.communes || "Abidjan"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-slate-700 text-[11px]">
                        <strong className="text-slate-900 font-bold">{partner.active_biens_count || 1}</strong> bien(s) actif(s)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Directes : WhatsApp & Téléphone */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Bouton WhatsApp Vert */}
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs transition-all shadow-md shadow-emerald-500/15 cursor-pointer"
                    >
                      <MessageCircle className="h-4 w-4 shrink-0 fill-white" />
                      <span>WhatsApp</span>
                    </a>

                    {/* Bouton Appel Direct */}
                    <a
                      href={phoneLink}
                      className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-md shadow-slate-900/10 cursor-pointer"
                    >
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>Appeler</span>
                    </a>
                  </div>

                  {/* Lien Voir le catalogue de ce promoteur */}
                  <Link
                    href={`/biens?search=${encodeURIComponent(partner.name)}`}
                    className="flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors w-full"
                  >
                    <span>Voir tous leurs programmes certifiés</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

