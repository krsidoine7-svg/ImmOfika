'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Ruler, BedDouble, ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BienSuggere {
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
}

function formatPrix(prix: string, transaction: string) {
  const n = parseFloat(prix)
  const f = new Intl.NumberFormat('fr-CI').format(n) + ' FCFA'
  return transaction === 'location' ? f + '/mois' : f
}

export default function BiensSuggeres({ biens }: { biens: BienSuggere[] }) {
  if (!biens.length) return null

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-emerald-600 uppercase tracking-widest font-extrabold mb-1">
            Vous pourriez aussi aimer
          </p>
          <h2 className="text-2xl font-bold text-slate-900">Biens similaires</h2>
        </div>
        <Link
          href="/biens"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'rounded-full text-slate-900 border-slate-300 hover:bg-slate-900 hover:text-white font-bold transition-all')}
        >
          Voir tout →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {biens.map((bien, index) => (
          <motion.article
            key={bien.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300"
          >
            <Link href={`/biens/${bien.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-slate-100">
              {bien.main_image_url ? (
                <img
                  src={bien.main_image_url}
                  alt={bien.titre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                  <span className="text-white/20 text-5xl">🏠</span>
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

              <div className="absolute top-3 left-3 z-10 flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500 text-white capitalize shadow-md">
                  {bien.type}
                </span>
                {bien.transaction && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-900 capitalize shadow-sm">
                    {bien.transaction}
                  </span>
                )}
              </div>
            </Link>

            <div className="p-5 space-y-3">
              <h3 className="font-bold text-slate-900 text-base line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
                <Link href={`/biens/${bien.slug}`}>{bien.titre}</Link>
              </h3>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
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
                  {bien.ville}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <p className="font-black text-emerald-600 text-base">
                  {formatPrix(bien.prix, bien.transaction)}
                </p>
                <Link
                  href={`/biens/${bien.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                >
                  <span>Voir</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
