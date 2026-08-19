"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  Building2, 
  Key, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  LucideIcon 
} from "lucide-react"

const defaultServices = [
  {
    icon: Building2,
    tag: "Achat & Vente",
    title: "Vente & Acquisition Immobilière",
    desc: "Un catalogue exclusif de maisons, villas, appartements et terrains vérifiés administrativement avec ACD et titres de propriété certifiés.",
  },
  {
    icon: Key,
    tag: "Location",
    title: "Gestion Locative sur-Mesure",
    desc: "Mise en location, sélection rigoureuse des locataires, gestion des loyers et suivi technique transparent de votre patrimoine.",
  },
  {
    icon: Layers,
    tag: "Promotion & Foncier",
    title: "Promotion Immobilière & Aménagement",
    desc: "Projets de construction, lotissement stratégique, viabilisation de parcelles et accompagnement foncier d'expert agréé par l'État.",
  }
]

interface ServicesSectionProps {
  data?: any
}

export default function ServicesSection({ data }: ServicesSectionProps) {
  const tag = data?.tag || "Nos Offres & Solutions"
  const title = data?.title || "Une gamme complète pour tous vos projets immobiliers."
  const description = data?.description || "Immo Pro propose aux particuliers, investisseurs et agences un accompagnement clé en main pour valoriser, acquérir et gérer vos biens en toute sécurité."

  return (
    <section id="services" className="py-20 md:py-28 bg-white relative">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* En-tête de section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3.5 py-1.5 rounded-full inline-block"
          >
            {tag}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            {title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium"
          >
            {description}
          </motion.p>
        </div>

        {/* Grille 3-Colonnes Réplicable */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {defaultServices.map((svc, idx) => (
            <motion.div
              key={svc.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-slate-50/70 hover:bg-white rounded-3xl p-8 border border-slate-100 hover:border-emerald-200 shadow-xs hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-6 shadow-sm shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                  <svc.icon className="w-6 h-6" />
                </div>
                
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 block mb-2">
                  {svc.tag}
                </span>

                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
                  {svc.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {svc.desc}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200/60 flex items-center text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
                <span>En savoir plus</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
