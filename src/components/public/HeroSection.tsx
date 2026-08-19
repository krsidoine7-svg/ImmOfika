"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ShieldCheck, CheckCircle2, Sparkles, Building } from "lucide-react"
import { Property } from "@/data/properties"
import FloatingSearchBar from "@/components/public/FloatingSearchBar"

interface HeroSectionProps {
  data?: any
  properties?: Property[]
}

export default function HeroSection({ data, properties = [] }: HeroSectionProps) {
  const title_p1 = data?.title_p1 || "Trouvez votre"
  const title_emerald = data?.title_emerald || "bien immobilier idéal"
  const title_p2 = data?.title_p2 || "en toute"
  const title_badge = data?.title_badge || "sérénité."
  const subtitle = data?.subtitle || "Immo Pro — La solution d'excellence pour l'achat, la vente et la gestion immobilière"
  const description = data?.description || "Accédez à un catalogue sélectionné de villas, appartements, duplex et terrains viabilisés avec titres de propriété vérifiés (ACD). Un accompagnement sur-mesure pour tous vos projets immobiliers."
  const cta1_label = data?.cta1_label || "Explorer le catalogue"
  const cta1_link = data?.cta1_link || "/biens"

  return (
    <section className="relative w-full pt-28 pb-16 md:pt-36 md:pb-24 bg-gradient-to-b from-emerald-50/40 via-white to-white overflow-hidden">
      {/* Cercles d'arrière-plan abstraits */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-teal-100/40 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          
          {/* Badge Supérieur */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-6 shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Promotion & Agence Immobilière Agréée</span>
          </motion.div>

          {/* Titre Principal */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.25] text-center"
          >
            {title_p1}{' '}
            <span className="text-emerald-500 font-extrabold">{title_emerald}</span>{' '}
            {title_p2}{' '}
            <span className="inline-block px-4 py-1 rounded-2xl bg-slate-900 text-white text-2xl sm:text-4xl md:text-5xl font-bold my-1">
              {title_badge}
            </span>
          </motion.h1>

          {/* Sous-titre */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed font-medium"
          >
            {description}
          </motion.p>

          {/* Boutons d'Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href={cta1_link}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:scale-[1.02] active:scale-98 group"
            >
              <span>{cta1_label}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="#services"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200 shadow-xs transition-all hover:border-slate-300"
            >
              <Building className="w-4 h-4 text-emerald-600" />
              <span>Nos Services & Offres</span>
            </Link>
          </motion.div>

          {/* Points Forts Épurés */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Titres de Propriété Vérifiés (ACD)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Visites en Présentiel & Virtuelles</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Contrats & Actes Notariés</span>
            </div>
          </motion.div>

        </div>

        {/* Barre de Recherche Flottante */}
        <div className="mt-12 max-w-5xl mx-auto">
          <React.Suspense fallback={<div className="h-20 w-full bg-slate-100 animate-pulse rounded-2xl" />}>
            <FloatingSearchBar properties={properties} />
          </React.Suspense>
        </div>

      </div>
    </section>
  )
}
