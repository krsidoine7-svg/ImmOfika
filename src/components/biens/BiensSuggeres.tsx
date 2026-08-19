'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Ruler, BedDouble } from 'lucide-react'
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
          <p className="text-xs text-[#C9A84C] uppercase tracking-widest font-semibold mb-1">
            Vous pourriez aussi aimer
          </p>
          <h2 className="text-2xl font-bold text-[#1A2A4A]">Biens similaires</h2>
        </div>
        <Link
          href="/biens"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'rounded-full text-[#1A2A4A] border-[#1A2A4A] hover:bg-[#1A2A4A] hover:text-white')}
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
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <Link href={`/biens/${bien.slug}`} className="block relative aspect-[4/3] overflow-hidden">
              {bien.main_image_url ? (
                 
                <img
                  src={bien.main_image_url}
                  alt={bien.titre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1A2A4A] to-[#2E4A7A] flex items-center justify-center">
                  <span className="text-white/20 text-5xl">🏠</span>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#C9A84C] text-white capitalize">
                  {bien.type}
                </span>
              </div>
            </Link>

            <div className="p-5">
              <h3 className="font-semibold text-[#1A2A4A] line-clamp-2 mb-3 group-hover:text-[#C9A84C] transition-colors">
                <Link href={`/biens/${bien.slug}`}>{bien.titre}</Link>
              </h3>

              <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                {bien.surface && (
                  <span className="flex items-center gap-1">
                    <Ruler className="h-3 w-3" />
                    {parseFloat(bien.surface).toLocaleString('fr-CI')} m²
                  </span>
                )}
                {bien.chambres && (
                  <span className="flex items-center gap-1">
                    <BedDouble className="h-3 w-3" />
                    {bien.chambres} ch.
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {bien.ville}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <p className="font-bold text-[#C9A84C] text-base">
                  {formatPrix(bien.prix, bien.transaction)}
                </p>
                <Link
                  href={`/biens/${bien.slug}`}
                  className={cn(
                    buttonVariants({ size: 'sm' }),
                    'bg-[#1A2A4A] hover:bg-[#C9A84C] text-white text-xs rounded-full px-3 transition-colors'
                  )}
                >
                  Voir →
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
