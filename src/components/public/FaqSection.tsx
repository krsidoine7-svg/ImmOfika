"use client"

import * as React from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface FaqSectionProps {
  data?: any
}

export default function FaqSection({ data }: FaqSectionProps) {
  const tag = data?.tag || "Questions Fréquentes"
  const title = data?.title || "Tout ce que vous devez savoir sur vos projets"
  const description = data?.description || "Vous avez des questions sur l'achat, la vente ou la location ? Retrouvez nos réponses pour avancer en toute sérénité."

  const defaultFaqs = [
    {
      question: "Quels sont les frais et les prestations d'Immo Pro ?",
      answer: "En tant que plateforme et promoteur agréé, nos honoraires et frais d'accompagnement sont transparents. Ils incluent la vérification administrative, la sécurisation juridique et le suivi des visites."
    },
    {
      question: "Comment se passe l'estimation d'un bien ?",
      answer: "L'estimation est gratuite et sans engagement. Un expert évalue les caractéristiques techniques, la localisation et le marché pour fixer le juste prix."
    },
    {
      question: "Proposez-vous un service de gestion locative ?",
      answer: "Oui, nous proposons une gestion locative clé en main : sélection des locataires, rédaction des baux, état des lieux et suivi des loyers."
    },
    {
      question: "Quels sont les délais moyens pour trouver un acquéreur ?",
      answer: "Grâce à notre réseau et au ciblage d'acheteurs qualifiés, les biens soumis bénéficient d'une excellente visibilité et de visites rapides."
    }
  ]

  const items = data?.faqs || defaultFaqs

  return (
    <section id="faq" className="py-20 md:py-28 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          
          <div className="space-y-4 lg:sticky lg:top-32">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-100/70 px-3.5 py-1.5 rounded-full inline-block">
              {tag}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              {description}
            </p>
            
            <div className="pt-4">
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <p className="font-bold text-slate-900 text-sm mb-1">Besoin d'un renseignement personnalisé ?</p>
                <p className="text-xs text-slate-500 mb-3">Notre équipe de conseillers est à votre écoute.</p>
                <a href="#about" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
                  <span>Contacter un conseiller</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <Accordion className="w-full">
              {items.map((faq: any, index: number) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b border-slate-100 last:border-0 py-1">
                  <AccordionTrigger className="text-left text-sm sm:text-base font-bold text-slate-900 hover:text-emerald-600 hover:no-underline py-3">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="leading-relaxed text-xs sm:text-sm text-slate-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

        </div>
      </div>
    </section>
  )
}
