// src/components/shared/CookieConsent.tsx
"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cookie } from "lucide-react"
import { logCookieConsentAction } from "@/app/actions/analytics"
import { siteConfig } from "@/config/site"

export default function CookieConsent() {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    // Vérifier si le consentement a déjà été donné
    const consent = localStorage.getItem("favor_cookie_consent")
    if (!consent) {
      // Afficher le bandeau après un court délai (1.5s) pour une entrée fluide
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("favor_cookie_consent", "accepted")
    logCookieConsentAction("accepted").catch(console.error)
    window.dispatchEvent(new Event("cookie-consent-changed"))
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem("favor_cookie_consent", "declined")
    logCookieConsentAction("declined").catch(console.error)
    window.dispatchEvent(new Event("cookie-consent-changed"))
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-6 right-6 left-6 md:left-auto md:max-w-md z-50 bg-slate-900/95 backdrop-blur-md text-white border border-emerald-500/30 p-6 rounded-3xl shadow-2xl shadow-emerald-950/40 flex flex-col gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <Cookie className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-emerald-400">Respect de votre vie privée</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {siteConfig.name} utilise des cookies pour optimiser les performances techniques, mémoriser vos préférences et analyser la navigation sur notre catalogue de promoteur immobilier agréé.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:underline transition-all cursor-pointer"
            >
              Continuer sans accepter
            </button>
            <button
              onClick={handleAccept}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              Accepter tout
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

