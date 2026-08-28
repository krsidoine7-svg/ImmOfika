"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Bed, Maximize, MapPin, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import { properties, Property, matchesProperty } from "@/data/properties"
import { useSearchParams } from "next/navigation"

interface BiensSectionProps {
  properties?: Property[]
}

function PropertyCard({ item }: { item: Property }) {
  return (
    <div className="group relative">
      <Card className="overflow-hidden border border-slate-100 bg-white rounded-3xl shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
        <CardContent className="p-0 relative">
          <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

            {/* Tag / Badge */}
            <div className="absolute top-4 left-4 z-10">
              <Badge className="bg-white/95 text-slate-900 rounded-full px-3 py-1 text-xs font-bold shadow-md border-0">
                {item.tag}
              </Badge>
            </div>

            {/* Infos Prix & Titre */}
            <div className="absolute bottom-4 left-4 right-4 text-white z-10 space-y-2">
              <div className="bg-emerald-500 px-3.5 py-1.5 rounded-xl text-white font-extrabold text-sm sm:text-base w-fit shadow-md">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                  maximumFractionDigits: 0
                }).format(item.price).replace("XOF", "FCFA")}
              </div>

              <h4 className="text-base sm:text-lg font-bold leading-tight line-clamp-1 group-hover:text-emerald-400 transition-colors">
                {item.title}
              </h4>

              <div className="flex items-center text-slate-300 text-xs">
                <MapPin className="h-3.5 w-3.5 mr-1 text-emerald-400 shrink-0" />
                <span className="truncate">{item.location}</span>
              </div>

              <div className="flex items-center gap-4 pt-2 border-t border-white/15 text-xs text-slate-300">
                {item.bedrooms && (
                  <div className="flex items-center gap-1.5">
                    <Bed className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{item.bedrooms} ch.</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Maximize className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{item.area} m²</span>
                </div>
              </div>
            </div>

            {/* Hover Link */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-900/40 backdrop-blur-[2px] z-20">
              <Link
                href={`/biens/${item.slug}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm shadow-lg transition-transform"
              >
                <span>Voir le bien</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BiensSection({ properties: externalProperties = [] }: BiensSectionProps) {
  const searchParams = useSearchParams()
  const location = searchParams.get("location") || ""
  const type = searchParams.get("type") || ""
  const budget = searchParams.get("budget") || ""

  const searchQuery = React.useMemo(() => ({ location, type, budget }), [location, type, budget])
  const currentProperties = externalProperties.length > 0 ? externalProperties : properties

  const filteredProperties = React.useMemo(() => {
    return currentProperties
      .filter(item => matchesProperty(item, searchQuery))
      .slice(0, 8)
  }, [searchQuery, currentProperties])

  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' })
    }
  }

  return (
    <section id="biens" className="relative py-20 md:py-28 bg-slate-50/50 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* En-tête de section */}
        <div className="flex flex-col items-center text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-100/70 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Catalogue à la Une
          </span>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Découvrez nos opportunités exclusives
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl font-medium">
            Des propriétés sélectionnées pour leur emplacement privilégié et leur sécurité juridique.
          </p>
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
