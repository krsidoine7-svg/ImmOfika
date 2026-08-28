// src/components/shared/UpdateDetector.tsx
"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RefreshCw } from "lucide-react"
import { siteConfig } from "@/config/site"

export default function UpdateDetector() {
  const [hasUpdate, setHasUpdate] = React.useState(false)
  const currentHashRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    // Récupérer le hash du build au démarrage de l'app
    const fetchCurrentVersion = async () => {
      try {
        const res = await fetch("/api/version")
        const data = await res.json()
        if (data.hash) {
          if (!currentHashRef.current) {
            currentHashRef.current = data.hash
          } else if (currentHashRef.current !== data.hash) {
            setHasUpdate(true)
          }
        }
      } catch (err) {
        console.warn("Échec du contrôle de version :", err)
      }
    }

    // Vérifier immédiatement, puis toutes les 5 minutes
    fetchCurrentVersion()
    const interval = setInterval(fetchCurrentVersion, 5 * 60 * 1000)

    // Vérifier également quand l'onglet redevient visible (l'utilisateur revient sur le site)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchCurrentVersion()
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [])

  const reloadApp = () => {
    // Vider le cache du navigateur et forcer le reload
    if (typeof window !== "undefined") {
      window.location.reload()
    }
  }

  return (
    <AnimatePresence>
      {hasUpdate && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-6 z-50 bg-slate-900/95 backdrop-blur-md text-white border border-emerald-500/30 px-5 py-4 rounded-2xl shadow-2xl shadow-emerald-950/40 flex items-center gap-4 max-w-sm"
        >
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-bold text-emerald-400">Mise à jour disponible</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Une nouvelle version de {siteConfig.name} est prête pour améliorer votre expérience.
            </p>
          </div>
          <button 
            onClick={reloadApp}
            className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-white font-bold text-xs px-3 py-2 rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Actualiser
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

