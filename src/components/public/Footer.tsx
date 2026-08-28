"use client"

import * as React from "react"
import Link from "next/link"
import { Mail, Phone, MapPin, MessageSquare, Globe, Share2 } from "lucide-react"
import Logo from "@/components/shared/Logo"
import { siteConfig } from "@/config/site"
import { subscribeToNewsletter } from "@/app/actions/newsletter"

interface FooterProps {
  data?: any
}

export default function Footer({ data }: FooterProps) {
  const [emailState, setEmailState] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [status, setStatus] = React.useState<{ type: 'success' | 'error', message: string } | null>(null)

  const newsletterTitle = data?.newsletter_title || "Restez informé des opportunités immobilières"
  const newsletterDesc = data?.newsletter_description || "Recevez en avant-première nos nouvelles annonces et opportunités d'investissement."
  const brandDesc = data?.description || siteConfig.description
  const brandTagline = data?.tagline || siteConfig.company.legalStatus

  const contactAddress = data?.address || siteConfig.company.address
  const contactAddressLink = data?.address_link || null
  const whatsappNumber = data?.whatsapp_number || null
  const whatsappLink = data?.whatsapp_link || null
  const phoneFixe = data?.phone_fixe || null
  const phoneMobile = data?.phone_mobile || null
  const contactEmail = data?.email || siteConfig.company.email

  const facebookLink = data?.facebook_link || null
  const instagramLink = data?.instagram_link || null
  const linkedinLink = data?.linkedin_link || null
  const youtubeLink = data?.youtube_link || null

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailState) return

    setLoading(true)
    setStatus(null)

    try {
      const res = await subscribeToNewsletter(emailState)
      if (res.success) {
        setStatus({ type: 'success', message: res.message || "Inscription réussie !" })
        setEmailState("")
      } else {
        setStatus({ type: 'error', message: res.error || "Une erreur est survenue." })
      }
    } catch {
      setStatus({ type: 'error', message: "Impossible de s'abonner pour le moment." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="bg-[#F7F4EF] text-slate-900 py-16 relative overflow-hidden border-t border-amber-200/40">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Section Newsletter */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-amber-900/5 mb-16 flex flex-col lg:flex-row items-center justify-between gap-8 border border-amber-100">
          <div className="space-y-2 max-w-xl text-center lg:text-left">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {newsletterTitle}
            </h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              {newsletterDesc}
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto min-w-[320px]">
            <input
              type="email"
              required
              disabled={loading}
              value={emailState}
              onChange={(e) => setEmailState(e.target.value)}
              placeholder="Votre adresse email"
              className="px-4 py-3 rounded-xl bg-slate-50 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-200 border border-slate-200 flex-1 shadow-inner"
            />
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl font-extrabold bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-sm shadow-md shadow-emerald-700/20 transition-all whitespace-nowrap cursor-pointer"
            >
              {loading ? "Chargement..." : "S'abonner"}
            </button>
          </form>
        </div>

        {/* Grille Principale Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1 : Marque & Réseaux */}
          <div className="space-y-4">
            <Logo />
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {brandDesc}
            </p>
            <p className="text-xs font-bold text-emerald-700 tracking-wide uppercase">
              {brandTagline}
            </p>

            {/* Réseaux Sociaux */}
            {(facebookLink || instagramLink || linkedinLink || youtubeLink) && (
              <div className="flex items-center gap-3 pt-2">
                {facebookLink && (
                  <a href={facebookLink} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white text-slate-700 hover:text-emerald-600 hover:shadow-md transition-all">
                    <Share2 className="w-4 h-4" />
                  </a>
                )}
                {instagramLink && (
                  <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white text-slate-700 hover:text-emerald-600 hover:shadow-md transition-all">
                    <Share2 className="w-4 h-4" />
                  </a>
                )}
                {linkedinLink && (
                  <a href={linkedinLink} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white text-slate-700 hover:text-emerald-600 hover:shadow-md transition-all">
                    <Share2 className="w-4 h-4" />
                  </a>
                )}
                {youtubeLink && (
                  <a href={youtubeLink} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white text-slate-700 hover:text-emerald-600 hover:shadow-md transition-all">
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Col 2 : Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Navigation</h4>
            <ul className="space-y-2 text-xs font-bold text-slate-700">
              <li><Link href="/" className="hover:text-emerald-700 transition-colors">Accueil</Link></li>
              <li><Link href="/biens" className="hover:text-emerald-700 transition-colors">Catalogue de biens</Link></li>
              <li><Link href="#services" className="hover:text-emerald-700 transition-colors">Nos Services</Link></li>
              <li><Link href="#about" className="hover:text-emerald-700 transition-colors">À propos</Link></li>
            </ul>
          </div>

          {/* Col 3 : Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Services</h4>
            <ul className="space-y-2 text-xs font-bold text-slate-700">
              <li><Link href="/biens" className="hover:text-emerald-700 transition-colors">Vente & Acquisition</Link></li>
              <li><Link href="#services" className="hover:text-emerald-700 transition-colors">Gestion Locative</Link></li>
              <li><Link href="#services" className="hover:text-emerald-700 transition-colors">Promotion Immobilière</Link></li>
              <li><Link href="#services" className="hover:text-emerald-700 transition-colors">Terrains & Lotissement</Link></li>
            </ul>
          </div>

          {/* Col 4 : Coordonnées du Promoteur */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Contact Promoteur</h4>
            <ul className="space-y-2.5 text-xs text-slate-700 font-semibold">
              {/* Adresse */}
              {contactAddress && (
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  {contactAddressLink ? (
                    <a href={contactAddressLink} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-700 underline transition-colors">
                      {contactAddress}
                    </a>
                  ) : (
                    <span>{contactAddress}</span>
                  )}
                </li>
              )}

              {/* Téléphone WhatsApp */}
              {whatsappNumber && (
                <li className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  {whatsappLink ? (
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-700 transition-colors">
                      WhatsApp : {whatsappNumber}
                    </a>
                  ) : (
                    <span>WhatsApp : {whatsappNumber}</span>
                  )}
                </li>
              )}

              {/* Téléphone Mobile */}
              {phoneMobile && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <a href={`tel:${phoneMobile.replace(/\s+/g, '')}`} className="hover:text-emerald-700 transition-colors">
                    {phoneMobile}
                  </a>
                </li>
              )}

              {/* Téléphone Fixe */}
              {phoneFixe && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <a href={`tel:${phoneFixe.replace(/\s+/g, '')}`} className="hover:text-emerald-700 transition-colors">
                    {phoneFixe}
                  </a>
                </li>
              )}

              {/* Fallback si aucun tel n'est spécifié */}
              {!phoneMobile && !phoneFixe && !whatsappNumber && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{siteConfig.company.phone}</span>
                </li>
              )}

              {/* Email */}
              {contactEmail && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                  <a href={`mailto:${contactEmail}`} className="hover:text-emerald-700 transition-colors">
                    {contactEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-300/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-semibold">
          <p>© 2026 {siteConfig.name}. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="/legal" className="hover:text-slate-800 transition-colors">Mentions Légales</Link>
            <Link href="/confidentiality" className="hover:text-slate-800 transition-colors">Confidentialité</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
