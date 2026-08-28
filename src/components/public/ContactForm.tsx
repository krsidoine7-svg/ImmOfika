'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Mail, MapPin, CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { creerLeadAction } from '@/app/actions/leads'

interface ContactFormProps {
  bien?: {
    id: string
    titre: string
    prix: string
    transaction: string
    ville: string
    mainImageUrl: string | null
  } | null
}

export default function ContactForm({ bien }: ContactFormProps) {
  const [formData, setFormData] = React.useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    message: '',
  })

  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await creerLeadAction({
        ...formData,
        source: 'site_web',
        bienInteresse: bien?.id || undefined,
      })

      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setFormData({ nom: '', prenom: '', email: '', telephone: '', message: '' })
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'envoi de votre message.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16 md:py-24 bg-[#F8F6F1]">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Infos de Contact & Bien Intéressé */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-xs font-bold text-[#C9A84C] uppercase tracking-[0.2em]">Restons en contact</span>
              <h2 className="text-3xl font-extrabold text-[#1A2A4A] mt-2 leading-tight">
                Nous sommes à votre <span className="text-[#C9A84C] italic">écoute</span>
              </h2>
              <p className="text-slate-500 mt-4 text-sm leading-relaxed">
                Une question sur nos services, un bien immobilier à nous confier, ou un projet d'acquisition à Abidjan ? Nos conseillers sont à votre entière disposition.
              </p>
            </div>

            {/* Carte du Bien d'intérêt si présent */}
            {bien && (
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md flex gap-4 items-center">
                {bien.mainImageUrl && (
                  <img
                    src={bien.mainImageUrl}
                    alt={bien.titre}
                    className="w-20 h-20 object-cover rounded-xl border border-slate-50"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-wider">Bien sélectionné</span>
                  <h4 className="text-sm font-bold text-[#1A2A4A] truncate mt-0.5">{bien.titre}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{bien.ville} · {bien.transaction === 'vente' ? 'Vente' : 'Location'}</p>
                  <p className="text-xs font-bold text-[#C9A84C] mt-1">
                    {new Intl.NumberFormat('fr-CI').format(parseFloat(bien.prix))} FCFA
                  </p>
                </div>
              </div>
            )}

            {/* Coordonnées physiques */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-[#C9A84C]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1A2A4A]">Téléphone</h4>
                  <p className="text-xs text-slate-500 mt-1">Notre standard général :</p>
                  <a href="tel:+2252724370155" className="text-sm font-bold text-[#1A2A4A] hover:text-[#C9A84C] transition-colors block mt-0.5">
                    +225 27 24 37 01 55
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#C9A84C]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Adresse E-mail</h4>
                  <p className="text-xs text-slate-500 mt-1">Écrivez à notre équipe :</p>
                  <a href="mailto:contact@immofika.ci" className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors block mt-0.5">
                    contact@immofika.ci
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Siège Social</h4>
                  <p className="text-xs text-slate-500 mt-1">ImmOfika :</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 leading-relaxed">
                    Abidjan, Côte d'Ivoire
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de Contact */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-xl relative overflow-hidden">
              
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12 flex flex-col items-center justify-center space-y-6"
                  >
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center shadow-inner shadow-emerald-500/10">
                      <CheckCircle className="w-12 h-12 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-slate-900">Message envoyé avec succès !</h3>
                      <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                        Merci pour votre confiance. Un conseiller ImmOfika va analyser votre demande et vous recontacter sous 24 heures.
                      </p>
                    </div>
                    <button
                      onClick={() => setSuccess(false)}
                      className="mt-4 px-6 py-3 rounded-full bg-[#1A2A4A] text-white hover:bg-[#C9A84C] text-xs font-bold transition-all shadow-md"
                    >
                      Envoyer un autre message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="border-b border-slate-100 pb-4 mb-4">
                      <h3 className="text-xl font-bold text-[#1A2A4A]">Formulaire de contact</h3>
                      <p className="text-slate-400 text-xs mt-1">Tous les champs marqués d'une étoile (*) sont obligatoires.</p>
                    </div>

                    {error && (
                      <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium leading-relaxed">
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="prenom" className="text-xs font-bold text-[#1A2A4A]">Prénom</label>
                        <input
                          id="prenom"
                          name="prenom"
                          type="text"
                          value={formData.prenom}
                          onChange={handleChange}
                          placeholder="Ex: Jean-Baptiste"
                          className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/15 outline-none transition-all text-sm text-[#1A2A4A] placeholder-slate-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="nom" className="text-xs font-bold text-[#1A2A4A]">Nom de famille</label>
                        <input
                          id="nom"
                          name="nom"
                          type="text"
                          value={formData.nom}
                          onChange={handleChange}
                          placeholder="Ex: Koffi"
                          className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/15 outline-none transition-all text-sm text-[#1A2A4A] placeholder-slate-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="telephone" className="text-xs font-bold text-[#1A2A4A]">Numéro de téléphone *</label>
                      <input
                        id="telephone"
                        name="telephone"
                        type="tel"
                        required
                        value={formData.telephone}
                        onChange={handleChange}
                        placeholder="Ex: +225 07 07 07 07 07"
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/15 outline-none transition-all text-sm text-[#1A2A4A] placeholder-slate-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-xs font-bold text-[#1A2A4A]">Adresse E-mail</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Ex: contact@exemple.com"
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/15 outline-none transition-all text-sm text-[#1A2A4A] placeholder-slate-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-xs font-bold text-[#1A2A4A]">Votre message ou projet d'acquisition</label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Détaillez votre projet immobilier..."
                        className="w-full p-4 rounded-xl border border-slate-200 focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/15 outline-none transition-all text-sm text-[#1A2A4A] placeholder-slate-400 resize-none min-h-[120px]"
                      />
                    </div>

                    <button
                      id="submit-contact"
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 bg-[#1A2A4A] hover:bg-[#C9A84C] text-white font-bold text-sm rounded-xl transition-all duration-300 shadow-xl hover:shadow-[#C9A84C]/25 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer group"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Traitement en cours...</span>
                        </>
                      ) : (
                        <>
                          <span>Envoyer ma demande</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
