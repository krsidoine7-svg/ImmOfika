"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin } from "lucide-react"
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
    <footer className="bg-slate-900 text-white py-16 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        
        {/* Section Newsletter */}
        <div className="bg-slate-800/80 rounded-3xl p-8 md:p-12 border border-slate-700/50 mb-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl md:text-2xl font-bold text-white">
              Restez informé des opportunités immobilières
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Recevez en avant-première nos nouvelles annonces et opportunités d'investissement.
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
              className="px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 flex-1"
            />
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white text-sm shadow-md transition-all whitespace-nowrap"
            >
              {loading ? "Chargement..." : "S'abonner"}
            </button>
          </form>
        </div>

        {/* Grille Principale Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1 : Marque */}
          <div className="space-y-4">
            <Logo light />
            <p className="text-xs text-slate-400 leading-relaxed">
              {siteConfig.description}
            </p>
            <p className="text-xs font-semibold text-emerald-400">
              {siteConfig.company.legalStatus}
            </p>
          </div>

          {/* Col 2 : Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-300">
              <li><Link href="/" className="hover:text-emerald-400 transition-colors">Accueil</Link></li>
              <li><Link href="/biens" className="hover:text-emerald-400 transition-colors">Catalogue de biens</Link></li>
              <li><Link href="#services" className="hover:text-emerald-400 transition-colors">Nos Services</Link></li>
              <li><Link href="#about" className="hover:text-emerald-400 transition-colors">À propos</Link></li>
            </ul>
          </div>

          {/* Col 3 : Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Services</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-300">
              <li><Link href="/biens" className="hover:text-emerald-400 transition-colors">Vente & Acquisition</Link></li>
              <li><Link href="#services" className="hover:text-emerald-400 transition-colors">Gestion Locative</Link></li>
              <li><Link href="#services" className="hover:text-emerald-400 transition-colors">Promotion Immobilière</Link></li>
              <li><Link href="#services" className="hover:text-emerald-400 transition-colors">Terrains & Lotissement</Link></li>
            </ul>
          </div>

          {/* Col 4 : Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{siteConfig.company.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{siteConfig.company.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{siteConfig.company.email}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 {siteConfig.name}. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="/legal" className="hover:text-slate-400 transition-colors">Mentions Légales</Link>
            <Link href="/confidentiality" className="hover:text-slate-400 transition-colors">Confidentialité</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
