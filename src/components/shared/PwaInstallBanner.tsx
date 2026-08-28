"use client"

import React from "react"
import { Download, X, Sparkles } from "lucide-react"
import { siteConfig } from "@/config/site"

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null)
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    // Ne pas afficher si déjà installé en mode standalone
    if (typeof window !== "undefined") {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone
      if (isStandalone) return

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e)
        // Vérifier si l'utilisateur n'a pas fermé le bandeau récemment
        const dismissed = localStorage.getItem("favor_pwa_dismissed")
        if (!dismissed) {
          setIsVisible(true)
        }
      }

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      }
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      console.log("[PWA] Installation acceptée par l'utilisateur.")
    }
    setDeferredPrompt(null)
    setIsVisible(false)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem("favor_pwa_dismissed", "true")
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 sm:p-5 rounded-3xl shadow-2xl border border-emerald-500/30 flex items-start gap-3.5 relative overflow-hidden">
        {/* Halo décoratif */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-sm shrink-0 mt-0.5">
          {siteConfig.name.substring(0, 2)}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Application Web (PWA)
            </span>
          </div>
          <h4 className="text-xs font-extrabold tracking-tight">Installer {siteConfig.name}</h4>
          <p className="text-[11px] text-slate-300 font-medium leading-snug">
            Accédez à vos parcelles, reçus et suivi de dossier directement depuis votre écran d&apos;accueil.
          </p>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Installer
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Plus tard
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

