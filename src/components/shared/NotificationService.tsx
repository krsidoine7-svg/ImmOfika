"use client"

import * as React from "react"
import { toast } from "sonner"
import { saveSubscriptionAction } from "@/app/actions/push"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function NotificationService() {
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  const subscribeUserToPush = async (registration: ServiceWorkerRegistration) => {
    try {
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        return
      }

      if (vapidPublicKey.startsWith("{{")) {
        console.log("[Push Notification] Clés VAPID non configurées dans .env.local.")
        return
      }

      // S'assurer que le Service Worker est actif avant d'appeler pushManager.subscribe
      if (!registration.active) {
        console.log("[Push Notification] Service Worker non actif immédiatement. Attente de l'activation...")
        try {
          const readyReg = await navigator.serviceWorker.ready
          if (readyReg.active) {
            registration = readyReg
          } else {
            console.warn("[Push Notification] Aucun Service Worker actif disponible.")
            return
          }
        } catch (e) {
          console.warn("[Push Notification] Attente service worker ready échouée:", e)
          return
        }
      }

      const convertedKey = urlBase64ToUint8Array(vapidPublicKey)
      
      let subscription
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey
        })
      } catch (subErr: any) {
        if (subErr?.name === "AbortError" || subErr?.message?.includes("no active Service Worker")) {
          console.warn("[Push Notification] Service Worker en cours d'installation, souscription reportée :", subErr.message)
          return
        }

        console.warn("[Push Notification] Clé VAPID différente détectée, réinitialisation de l'abonnement :", subErr)
        const oldSubscription = await registration.pushManager.getSubscription()
        if (oldSubscription) {
          await oldSubscription.unsubscribe()
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey
        })
      }

      if (subscription) {
        console.log("[Push Notification] Abonnement Push obtenu avec succès")
        const res = await saveSubscriptionAction(subscription.toJSON())
        if (res.success) {
          console.log("[Push Notification] Abonnement enregistré sur le serveur.")
        }
      }
    } catch (error) {
      console.error("[Push Notification] Erreur lors de la souscription :", error)
    }
  }

  React.useEffect(() => {
    audioRef.current = new Audio("/sounds/notification.wav")

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Attendre que le SW soit enregistré ET actif
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => navigator.serviceWorker.ready)
        .then((registration) => {
          console.log("Service Worker actif et prêt, scope: ", registration.scope)
          if (Notification.permission === "granted") {
            subscribeUserToPush(registration)
          }
        })
        .catch((err) => {
          console.warn("Échec d'enregistrement du Service Worker :", err)
        })
    }

    const requestNotificationPermission = async () => {
      if (typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator) {
        if (Notification.permission === "default") {
          const permission = await Notification.requestPermission()
          if (permission === "granted") {
            navigator.serviceWorker.ready.then((registration) => {
              subscribeUserToPush(registration)
            })
          }
        } else if (Notification.permission === "granted") {
          navigator.serviceWorker.ready.then((registration) => {
            subscribeUserToPush(registration)
          })
        }
      }
    }

    requestNotificationPermission()
  }, [])

  const triggerLocalNotification = (title: string, message: string, url?: string) => {
    const playChime = () => {
      try {
        const audio = new Audio("/sounds/notification.wav")
        audio.play().catch(() => {})
      } catch (e) {}
    }

    playChime()
    setTimeout(playChime, 3000)

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body: message,
          icon: "/logo-favor.jpeg",
          badge: "/logo-favor.jpeg",
          data: { url: url || "/admin/dashboard" }
        })
      } catch (e) {
        console.warn("Échec d'affichage de la notification système native :", e)
      }
    }

    toast.custom((t) => (
      <div className="w-full max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-start gap-3 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-md">
          IP
        </div>
        <div className="flex-1 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
            Immo Pro
          </span>
          <h4 className="text-xs font-bold tracking-tight text-white">{title}</h4>
          <p className="text-[11px] text-slate-300 font-medium leading-snug">{message}</p>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t)
                if (url) window.location.href = url
              }}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] rounded-lg transition-all shadow-xs cursor-pointer"
            >
              Consulter
            </button>
            <button
              type="button"
              onClick={() => toast.dismiss(t)}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-[11px] rounded-lg transition-all cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    ), { duration: 6000 })
  }

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).triggerLocalNotification = triggerLocalNotification
    }
  }, [])

  return null
}
