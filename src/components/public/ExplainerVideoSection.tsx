"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Shield, Compass, Hammer, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExplainerVideoSectionProps {
  data?: any
}

export default function ExplainerVideoSection({ data }: ExplainerVideoSectionProps) {
  // Désactivé par défaut selon la demande utilisateur
  const enabled = data?.enabled === true
  if (!enabled) return null

  const tag = data?.tag || "Présentation Immo Pro"
  const title = data?.title || "Découvrez notre expertise en action."
  const description = data?.description || "En tant que Promoteur Immobilier Agréé, Immo Pro s'engage à vous offrir des projets d'aménagement foncier et de construction d'exception."

  return (
    <section id="explainer-video" className="py-20 bg-white">
      <div className="container mx-auto px-4 text-center">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{tag}</span>
        <h2 className="text-3xl font-extrabold text-slate-900 mt-2">{title}</h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto mt-3">{description}</p>
      </div>
    </section>
  )
}
