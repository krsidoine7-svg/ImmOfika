"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Bed, Maximize, MapPin, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import { Property, matchesProperty } from "@/data/properties"
import { useSearchParams } from "next/navigation"

interface BiensSectionProps {
  properties?: Property[]
}

function PropertyCard({ item }: { item: Property }) {
  const [imgSrc, setImgSrc] = React.useState(item.image)
  const isVente = item.type === "Vente"
  const isReserve = item.trend === "reserve"

  return (
    <Link
      href={`/biens/${item.slug}`}
      className="group block relative focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-3xl"
    >
      <Card className="overflow-hidden border border-slate-100 bg-white rounded-3xl shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group-hover:-translate-y-1">
        <CardContent className="p-0 relative">
          <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
            <img
              src={imgSrc}
              alt={item.title}
              onError={() =>
                setImgSrc(
                  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800"
                )
              }
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />

            {/* Badges en haut */}
            <div className="absolute top-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between gap-2">
              <Badge
                className={`rounded-full px-3 py-1 text-xs font-bold shadow-md border-0 ${
                  isVente ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                }`}
              >
                {isVente ? 'À Vendre' : 'À Louer'}
              </Badge>

              {isReserve && (
                <Badge className="bg-amber-500 text-white rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow">
                  Réservé
                </Badge>
              )}
            </div>

            {/* Informations en bas */}
            <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium mb-1 drop-shadow-sm">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{item.location}</span>
              </div>

              <h4 className="font-bold text-base leading-tight mb-2 line-clamp-2 drop-shadow-md group-hover:text-emerald-300 transition-colors">
                {item.title}
              </h4>

              <div className="text-xl font-extrabold text-white tracking-tight drop-shadow-md mb-3">
                {item.price ? `${item.price.toLocaleString('fr-FR')} FCFA` : 'Prix sur demande'}
                {item.type === "Location" && <span className="text-xs text-slate-300 font-normal"> /mois</span>}
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-300 pt-2 border-t border-white/20">
                {item.bedrooms && (
                  <div className="flex items-center gap-1.5">
                    <Bed className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{item.bedrooms} ch.</span>
                  </div>
                )}
                {item.area && (
                  <div className="flex items-center gap-1.5">
                    <Maximize className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{item.area} m²</span>
                  </div>
                )}
              </div>
            </div>

            {/* Hover Link Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-950/40 backdrop-blur-[2px] z-20">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm shadow-xl transition-transform transform group-hover:scale-105">
                <span>Voir le bien</span>
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function BiensSection({ properties: externalProperties = [] }: BiensSectionProps) {
  const searchParams = useSearchParams()
  const location = searchParams.get("location") || ""
  const type = searchParams.get("type") || ""
  const budget = searchParams.get("budget") || ""

  const searchQuery = React.useMemo(() => ({ location, type, budget }), [location, type, budget])
  const currentProperties = externalProperties

  const filteredProperties = React.useMemo(() => {
    return currentProperties
      .filter(item => matchesProperty(item, searchQuery))
      .slice(0, 8)
  }, [searchQuery, currentProperties])

  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' })
    }
  }

  return (
    <section className="py-20 bg-slate-50/50">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/60 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Biens d&apos;Exception</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Nos dernières opportunités
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-xl">
              Une sélection rigoureuse de biens immobiliers avec sécurité juridique garantie et accompagnement personnalisé.
            </p>
          </div>
        </div>

        {filteredProperties.length > 0 ? (
          <div className="relative max-w-6xl mx-auto">
            {/* Flèches */}
            <button
              type="button"
              onClick={scrollLeft}
              className="absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white text-slate-700 border border-slate-200 shadow-md flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all cursor-pointer hidden md:flex"
              aria-label="Gauche"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={scrollRight}
              className="absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white text-slate-700 border border-slate-200 shadow-md flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all cursor-pointer hidden md:flex"
              aria-label="Droite"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Scroll Horizontal */}
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-6 pb-6 pt-2 snap-x snap-mandatory scrollbar-none scroll-smooth"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {filteredProperties.map((item) => (
                <div
                  key={item.slug}
                  className="w-[260px] sm:w-[300px] md:w-[320px] shrink-0 snap-start"
                >
                  <PropertyCard item={item} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 max-w-lg mx-auto p-6">
            <p className="text-slate-600 font-medium">Aucun bien ne correspond exactement à vos filtres.</p>
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Link
            href="/biens"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white text-sm shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            <span>Voir tout le catalogue</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  )
}
