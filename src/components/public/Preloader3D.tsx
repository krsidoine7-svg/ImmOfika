"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"

interface Preloader3DProps {
  onComplete?: () => void
  duration?: number // duration in ms, default 2800ms
}

export default function Preloader3D({ onComplete, duration = 2800 }: Preloader3DProps) {
  const [progress, setProgress] = React.useState(0)
  const [isDone, setIsDone] = React.useState(false)

  React.useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const currentProgress = Math.min(Math.round((elapsed / duration) * 100), 100)
      setProgress(currentProgress)

      if (elapsed >= duration) {
        clearInterval(interval)
        setTimeout(() => {
          setIsDone(true)
          if (onComplete) onComplete()
        }, 250)
      }
    }, 20)

    return () => clearInterval(interval)
  }, [duration, onComplete])

  if (isDone) return null

  return (
    <AnimatePresence>
      <motion.div
        key="preloader-overlay"
        initial={{ opacity: 1 }}
        exit={{ 
          opacity: 0, 
          scale: 1.05,
          filter: "blur(12px)",
          transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
        }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white text-slate-900 select-none overflow-hidden"
      >
        {/* Cercles de lumière arrière-plan 3D animés */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.75, 0.4],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-emerald-200/60 rounded-full blur-[130px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1.3, 1, 1.3],
              opacity: [0.35, 0.65, 0.35],
              rotate: [0, -90, 0]
            }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-32 -right-32 w-[550px] h-[550px] bg-teal-100/70 rounded-full blur-[130px]" 
          />
          <motion.div 
            animate={{
              scale: [0.9, 1.2, 0.9],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-400/25 rounded-full blur-[100px]" 
          />
        </div>

        {/* Bloc Central 3D (Logo + Phrase + Barre de progression) */}
        <div className="flex flex-col items-center justify-center z-10 px-4 text-center">
          
          {/* Logo 3D FLOTTANT ET ANIMÉ CONTINUELLEMENT */}
          <div className="perspective-1000 mb-8 relative">
            {/* Carte du Logo en Lévitation 3D Flottante */}
            <motion.div
              initial={{ rotateX: 45, rotateY: -30, scale: 0.6, opacity: 0 }}
              animate={{ 
                rotateX: [25, -15, 20, 0],
                rotateY: [-25, 20, -15, 0],
                y: [-8, 8, -8], // Flottaison continue haut/bas
                scale: 1,
                opacity: 1
              }}
              transition={{ 
                rotateX: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
                rotateY: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 0.8, ease: "easeOut" },
                opacity: { duration: 0.6 }
              }}
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-700 p-[3px] shadow-2xl shadow-emerald-500/50"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Reflet d'arrière-plan */}
              <div className="w-full h-full bg-white rounded-[21px] flex items-center justify-center relative overflow-hidden shadow-inner">
                
                {/* Rayon lumineux tournant en continu */}
                <motion.div
                  animate={{ x: ["-150%", "250%"] }}
                  transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 0.3 }}
                  className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/90 to-transparent transform -skew-x-12"
                />

                {/* SVG Icône Maison 3D animée en pulsation */}
                <motion.div 
                  animate={{ 
                    scale: [1, 1.12, 1],
                    rotate: [0, 3, -3, 0]
                  }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-8 h-8 sm:w-9 sm:h-9 filter drop-shadow-md"
                  >
                    <path d="M3 10l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <path d="M9 22V12h6v10" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>

            {/* Ombre portée dynamique sous le logo qui réagit au mouvement y */}
            <motion.div 
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-emerald-600/35 blur-md rounded-full" 
            />
          </div>

          {/* Slogan officiel propre sans guillemets ni drapeau */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg sm:text-2xl font-extrabold text-slate-800 tracking-tight max-w-md leading-snug"
          >
            <span>Ton chez-toi garanti, zéro palabre !</span>
          </motion.div>

          {/* Sous-titre de chargement */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-2 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-slate-400"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
            <span>Chargement des opportunités exclusives...</span>
          </motion.div>

          {/* Barre de Progression & Pourcentage (Remontée sous le slogan) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-8 w-full max-w-xs sm:max-w-md px-2"
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Initialisation des données</span>
              </span>
              <span className="font-mono text-emerald-600 font-extrabold text-sm">{progress}%</span>
            </div>

            {/* Fond de la barre */}
            <div className="w-full h-2.5 rounded-full bg-slate-100 p-0.5 overflow-hidden border border-slate-200/80 shadow-inner relative">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-600 rounded-full relative"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              >
                {/* Lueur d'extrémité balayante */}
                <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/90 blur-[2px] rounded-full" />
              </motion.div>
            </div>
          </motion.div>
        </div>

      </motion.div>
    </AnimatePresence>
  )
}
