"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ShieldCheck, Award, FileCheck2, UserCheck } from "lucide-react"

interface AboutSectionProps {
  data?: any
}

export default function AboutSection({ data }: AboutSectionProps) {
  const tag = data?.tag || "À propos de nous"
  const title = data?.title || "ImmOfika — L'excellence immobilière à votre service"
  const description = data?.description || "Acteur majeur et promoteur immobilier agréé, ImmOfika offre une plateforme réplicable et sécurisée pour la gestion, la vente, la location et l'aménagement foncier avec titres ACD certifiés."

  const features = [
    { title: "Agrément Officiel d'État", description: "Entreprise certifiée pour l'aménagement foncier et la promotion immobilière.", icon: ShieldCheck },
    { title: "Titres Foncier ACD", description: "Toutes nos parcelles et programmes disposent de titres de propriété régularisés.", icon: FileCheck2 },
    { title: "Transparence & Sécurité", description: "Processus d'achat et de gestion transparents validés avec notaire.", icon: Award },
    { title: "Accompagnement Dédié", description: "Une équipe d'experts à l'écoute du premier contact jusqu'à la remise des clés.", icon: UserCheck }
  ]

  return (
    <section id="about" className="py-20 md:py-28 bg-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          
          {/* Gauche : visuel / stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white p-2">
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800" 
                alt="ImmOfika" 
                className="rounded-2xl w-full h-80 md:h-[400px] object-cover"
              />
            </div>
            {/* Flottant badge */}
            <div className="absolute -bottom-6 -right-4 bg-emerald-500 text-white p-6 rounded-3xl shadow-xl hidden sm:block">
              <span className="text-3xl font-extrabold block">100%</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">Biens Vérifiés & Sécurisés</span>
            </div>
          </motion.div>

          {/* Droite : contenu texte */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-100/70 px-3.5 py-1.5 rounded-full inline-block mb-3">
                {tag}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {title}
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                {description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {features.map((feat) => (
                <div key={feat.title} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <feat.icon className="w-6 h-6 text-emerald-500 mb-2" />
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{feat.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{feat.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
