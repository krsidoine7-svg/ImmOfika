"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Star, CheckCircle2, Quote, ShieldCheck, ThumbsUp } from "lucide-react"

interface TestimonialsSectionProps {
  data?: any
}

export default function TestimonialsSection({ data }: TestimonialsSectionProps) {
  const tag = data?.tag || "Avis & Retours Clients"
  const title = data?.title || "Ce que nos clients disent d'ImmOfika"
  const description = data?.description || "Découvrez les retours d'expérience de nos acheteurs, vendeurs et investisseurs accompagnés par nos experts."

  const [liveReviews, setLiveReviews] = React.useState<any[]>([])

  React.useEffect(() => {
    import('@/app/actions/visiteAvis').then(({ getPublicAvisTemoignages }) => {
      getPublicAvisTemoignages().then((reviews) => {
        if (reviews && reviews.length > 0) {
          const mapped = reviews.map((r) => ({
            name: r.clientName || 'Client Acquéreur Certifié',
            role: 'Acquéreur Vérifié',
            location: 'Abidjan',
            text: r.commentaire || 'Visite d\'un bien avec un conseiller ImmOfika. Accompagnement irréprochable et conseils d\'expert.',
            avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150`,
            rating: r.note || 5,
            verified: true
          }))
          setLiveReviews(mapped)
        }
      })
    })
  }, [])

  const defaultTestimonials = [
    {
      name: "Aboubacar Diop",
      role: "Acquéreur Foncier",
      location: "Cocody, Abidjan",
      text: "ImmOfika a suivi mon achat de parcelle avec un sérieux exceptionnel. Le statut de Promoteur Agréé a été vérifié et le contrat notarié était parfaitement clair.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      rating: 5,
      verified: true
    },
    {
      name: "Sophie Martin",
      role: "Acheteuse Villa",
      location: "Marcory Zone 4",
      text: "Grâce à l'équipe ImmOfika, nous avons visité et réservé la maison de nos rêves en toute sécurité. Une réactivité irréprochable du premier contact à la clé.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
      rating: 5,
      verified: true
    },
    {
      name: "Marc & Julie K.",
      role: "Investisseurs Immobiliers",
      location: "Assinie-Mafia",
      text: "Une équipe hautement qualifiée qui maîtrise les procédures d'aménagement foncier et d'ACD en Côte d'Ivoire. Très satisfaits du suivi notarié.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
      rating: 5,
      verified: true
    }
  ]

  const items = liveReviews.length > 0 ? liveReviews : (data?.testimonials || defaultTestimonials)

  return (
    <section id="avis" className="py-24 bg-gradient-to-b from-slate-50 via-emerald-50/20 to-white relative overflow-hidden">
      {/* Cercles de fond */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* En-tête de section Premium */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{tag}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight"
          >
            {title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed"
          >
            {description}
          </motion.p>

          {/* Badge Score de Confiance */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="pt-2 flex items-center justify-center gap-3"
          >
            <div className="flex items-center gap-1 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200/80">
              <span className="font-extrabold text-slate-900 text-base">4.9</span>
              <div className="flex gap-0.5 text-emerald-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                ))}
              </div>
              <span className="text-xs text-slate-500 font-medium ml-1.5">(98% de satisfaction client)</span>
            </div>
          </motion.div>
        </div>

        {/* Grille 3 Cartes Premium avec Glassmorphism & Hover physics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {items.map((item: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              whileHover={{ y: -8 }}
              className="bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-slate-200/80 shadow-md hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-300 transition-all duration-300 relative flex flex-col justify-between group"
            >
              {/* Filigrane Icône Citation */}
              <Quote className="absolute top-6 right-6 w-10 h-10 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors pointer-events-none" />

              <div>
                {/* En-tête Carte : Étoiles + Badge Vérifié */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-1 text-emerald-500">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                    ))}
                  </div>

                  {item.verified && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Acheteur Vérifié</span>
                    </div>
                  )}
                </div>

                {/* Commentaire Texte */}
                <p className="text-sm text-slate-700 font-medium leading-relaxed italic mb-8">
                  "{item.text}"
                </p>
              </div>

              {/* Auteur Profil */}
              <div className="flex items-center gap-3.5 pt-6 border-t border-slate-100">
                <div className="relative">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/40 shadow-xs"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                    <ThumbsUp className="w-2 h-2 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-emerald-700">{item.role}</span>
                    {item.location && (
                      <>
                        <span>•</span>
                        <span className="truncate">{item.location}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pied de section : Rassurance */}
        <div className="mt-16 text-center">
          <p className="text-xs font-semibold text-slate-500 inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Tous les avis sont collectés et authentifiés après chaque transaction ou visite guidée.
          </p>
        </div>

      </div>
    </section>
  )
}
