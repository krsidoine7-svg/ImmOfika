// src/components/shared/CookieConsent.tsx
"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cookie } from "lucide-react"
import { logCookieConsentAction } from "@/app/actions/analytics"

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
          className="fixed bottom-6 right-6 left-6 md:left-auto md:max-w-md z-50 bg-[#1A2A4A] text-white border border-[#C9A84C]/30 p-6 rounded-3xl shadow-2xl flex flex-col gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/25 flex items-center justify-center text-[#C9A84C] shrink-0">
              <Cookie className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-[#C9A84C]">Respect de votre vie privée</h4>
              <p className="text-xs text-gray-300 leading-relaxed font-medium">
                Favor Company International utilise des cookies pour optimiser les performances techniques, mémoriser vos préférences et analyser la navigation sur notre catalogue de promoteur immobilier agréé.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white hover:underline transition-all cursor-pointer"
            >
              Continuer sans accepter
            </button>
            <button
              onClick={handleAccept}
              className="bg-[#C9A84C] hover:bg-[#b8943d] active:scale-95 text-[#1A2A4A] font-extrabold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Accepter tout
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
