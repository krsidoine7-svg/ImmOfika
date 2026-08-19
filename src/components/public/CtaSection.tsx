"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, PhoneCall, Building2 } from "lucide-react"

interface CtaSectionProps {
  data?: any
}

export default function CtaSection({ data }: CtaSectionProps) {
  const tag = data?.tag || "Contactez Immo Pro"
  const title = data?.title || "Prêt à concrétiser votre projet immobilier ?"
  const description = data?.description || "Bénéficiez de l'accompagnement d'experts agréés pour l'achat, la vente ou la mise en gestion de vos biens."
  const button_label = data?.button_label || "Explorer nos biens disponibles"
  const button_link = data?.button_link || "/biens"

  return (
    <section className="py-20 md:py-24 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white relative overflow-hidden">
      {/* Motifs décoratifs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center space-y-6"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            {tag}
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            {title}
          </h2>

          <p className="text-base sm:text-lg text-emerald-50 font-medium leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={button_link}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-sm sm:text-base shadow-xl transition-all hover:scale-105 group"
            >
              <span>{button_label}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="#about"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-emerald-600/60 hover:bg-emerald-600 text-white font-bold text-sm sm:text-base border border-white/20 backdrop-blur-md transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Contacter un Conseiller</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
