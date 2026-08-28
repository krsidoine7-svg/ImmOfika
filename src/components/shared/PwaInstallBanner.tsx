"use client"

import React from "react"
import { Download, X, Sparkles, Share, PlusSquare, Smartphone } from "lucide-react"
import { siteConfig } from "@/config/site"

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null)
  const [isVisible, setIsVisible] = React.useState(false)
  const [isIOS, setIsIOS] = React.useState(false)
  const [showIOSGuide, setShowIOSGuide] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === "undefined") return

    // Ne rien afficher si l'app est déjà ouverte en mode Standalone (App installée)
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches || 
      (window.navigator as any).standalone === true

    if (isStandalone) return

    // Vérifier si l'utilisateur a masqué l'invitation récemment
    const dismissedAt = localStorage.getItem("immofika_pwa_dismissed_time")
    if (dismissedAt) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60)
      // Ne ré-afficher qu'après 48 heures si masqué
      if (hoursSinceDismissed < 48) return
    }

    // Détection iOS / Safari
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIphoneOrIpad = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream
    
    if (isIphoneOrIpad) {
      setIsIOS(true)
      // Afficher l'invitation iOS après 3 secondes
      const timer = setTimeout(() => setIsVisible(true), 3000)
      return () => clearTimeout(timer)
    }

    // Détection Android / Chrome / Windows / Mac
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsVisible(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Fallback pour mobile Android si l'évènement prend du temps
    const fallbackTimer = setTimeout(() => {
      if (/android|mobile/.test(userAgent)) {
        setIsVisible(true)
      }
    }, 4000)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      clearTimeout(fallbackTimer)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(!showIOSGuide)
      return
    }

    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setIsVisible(false)
      }
      setDeferredPrompt(null)
    } else {
      // Fallback d'aide à l'installation si prompt non supporté
      alert("Pour installer l'application sur votre écran d'accueil :\n1. Ouvrez le menu de votre navigateur (⋮)\n2. Appuyez sur 'Installer l'application' ou 'Ajouter à l'écran d'accueil'.")
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem("immofika_pwa_dismissed_time", Date.now().toString())
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-xl text-white p-4 sm:p-5 rounded-3xl shadow-2xl shadow-emerald-950/40 border border-emerald-500/30 flex flex-col gap-3 relative overflow-hidden">
        {/* Halo lumineux émeraude */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-emerald-500/25 shrink-0">
              Im
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                <Sparkles className="w-3 h-3" /> Application Officielle
              </div>
              <h4 className="text-sm font-extrabold tracking-tight text-white">
                Installer {siteConfig.name}
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 font-medium leading-relaxed">
          Accédez à vos parcelles, contrats et reçus de paiement en 1 clic directement depuis votre écran d&apos;accueil.
        </p>

        {/* Instructions spécifiques iOS Safari */}
        {isIOS && showIOSGuide && (
          <div className="bg-slate-800/90 rounded-2xl p-3.5 border border-emerald-500/20 text-xs text-slate-200 space-y-2 animate-in fade-in duration-200">
            <p className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" /> Procédure d&apos;installation sur iPhone / iPad :
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-300 font-medium">
              <li>Appuyez sur le bouton <strong>Partager</strong> <Share className="inline w-3 h-3 text-emerald-400" /> au bas de Safari.</li>
              <li>Faites défiler puis choisissez <strong>Sur l&apos;écran d&apos;accueil</strong> <PlusSquare className="inline w-3 h-3 text-emerald-400" />.</li>
              <li>Appuyez sur <strong>Ajouter</strong> en haut à droite.</li>
            </ol>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isIOS ? (
              <>
                <Share className="w-3.5 h-3.5" /> Voir la méthode iPhone
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" /> Installer l&apos;App
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="py-2.5 px-3.5 bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  )
}
