"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"

const regions = [
  "Lagunes (Abidjan)",
  "Gbêkê (Bouaké)",
  "Bas-Sassandra (San-Pédro)",
  "Haut-Sassandra (Daloa)",
  "Poro (Korhogo)",
  "Lacs (Yamoussoukro)"
]

const hashString = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

const getVisitorRegion = (visitorId: string) => {
  const idx = hashString(visitorId) % regions.length
  return regions[idx]
}

// Buffer d'événements persistant en mémoire client (SPA)
let pendingEvents: any[] = []

// Fonction globale pour envoyer immédiatement les événements en attente
const flushEventsToServer = async () => {
  if (pendingEvents.length === 0) return
  
  const batch = [...pendingEvents]
  pendingEvents = [] // Vider pour éviter les doubles envois

  try {
    const response = await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(batch),
      keepalive: true
    })
    
    if (!response.ok) {
      // Ré-injecter au début en cas de retour d'erreur
      pendingEvents = [...batch, ...pendingEvents]
    }
  } catch (err) {
    // Ré-injecter en cas de timeout réseau
    pendingEvents = [...batch, ...pendingEvents]
  }
}

// Envoi synchrone de secours lors de la fermeture de la page
const flushSyncOnClose = () => {
  if (pendingEvents.length === 0) return
  
  const payload = JSON.stringify(pendingEvents)
  pendingEvents = []

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics", payload)
  } else {
    // Fallback synchrone classique
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true
    }).catch(() => {})
  }
}

export default function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  React.useEffect(() => {
    if (typeof window === "undefined") return

    // 1. Initialiser les IDs de session et visiteur
    let visitorId = localStorage.getItem("favor_visitor_id")
    if (!visitorId) {
      visitorId = "vis_" + Math.random().toString(36).substring(2, 15)
      localStorage.setItem("favor_visitor_id", visitorId)
    }

    let sessionId = sessionStorage.getItem("favor_session_id")
    if (!sessionId) {
      sessionId = "ses_" + Math.random().toString(36).substring(2, 15)
      sessionStorage.setItem("favor_session_id", sessionId)
    }

    // Déterminer le terminal
    const width = window.innerWidth
    const device = width < 768 ? "mobile" : width < 1024 ? "tablette" : "ordinateur"

    // Déterminer la région stable
    const region = getVisitorRegion(visitorId)

    // Déterminer le navigateur
    const userAgent = navigator.userAgent
    let browser = "Autre"
    if (userAgent.indexOf("Chrome") > -1) browser = "Chrome"
    else if (userAgent.indexOf("Safari") > -1) browser = "Safari"
    else if (userAgent.indexOf("Firefox") > -1) browser = "Firefox"
    else if (userAgent.indexOf("Edge") > -1) browser = "Edge"

    const startTime = Date.now()
    const searchString = searchParams?.toString()
    const currentPath = pathname + (searchString ? "?" + searchString : "")

    // Déterminer les étapes d'onboarding
    let onboardingStep: string | null = null
    if (pathname === "/auth/register") {
      onboardingStep = "visite_inscription"
    } else if (pathname === "/auth/verify-otp") {
      onboardingStep = "attente_otp"
    } else if (pathname === "/client/dashboard") {
      const referrer = document.referrer
      if (referrer.includes("verify-otp") || referrer.includes("register")) {
        onboardingStep = "compte_cree"
      }
    } else if (pathname.startsWith("/biens/") && pathname !== "/biens") {
      onboardingStep = "fiche_bien"
    } else if (pathname.startsWith("/client/reserver/")) {
      onboardingStep = "page_formulaire"
    } else if (pathname.startsWith("/paiement")) {
      onboardingStep = "validation_reservation"
    }

    // Enregistrer un événement dans le buffer
    const bufferEvent = (type: string, path: string, eventDuration: number) => {
      pendingEvents.push({
        visitorId,
        sessionId,
        eventType: type,
        path,
        details: {
          device,
          region,
          browser,
          stepName: onboardingStep || undefined
        },
        duration: eventDuration,
        createdAt: new Date().toISOString()
      })
    }

    // Enregistrer la vue de page
    bufferEvent(onboardingStep ? "onboarding_step" : "page_view", currentPath, 0)

    // Lancer l'envoi périodique toutes les 15 secondes
    const intervalId = setInterval(flushEventsToServer, 15000)

    // Listener pour la fermeture de la page
    window.addEventListener("beforeunload", flushSyncOnClose)

    // Nettoyage au changement de route Next.js
    return () => {
      clearInterval(intervalId)
      window.removeEventListener("beforeunload", flushSyncOnClose)

      const duration = Math.round((Date.now() - startTime) / 1000)
      if (duration > 0) {
        bufferEvent("page_duration", currentPath, duration)
      }
      
      // Flush asynchrone lors du changement de route
      flushEventsToServer()
    }
  }, [pathname, searchParams])

  return null
}
