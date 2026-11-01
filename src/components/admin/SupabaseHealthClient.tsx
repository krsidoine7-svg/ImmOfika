"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Activity, 
  Database, 
  Zap, 
  RefreshCw, 
  ShieldCheck, 
  Server, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Copy, 
  Check, 
  Wifi, 
  Radio, 
  Key, 
  HelpCircle,
  ExternalLink
} from "lucide-react"
import { triggerSupabasePingAction, getSupabaseHealthAction, KeepAliveResponse } from "@/app/actions/keepalive"
import { PingResult, KeepAliveStats } from "@/lib/services/supabaseKeepAlive"
import { toast } from "sonner"

interface SupabaseHealthClientProps {
  initialData: KeepAliveResponse
  appUrl?: string
}

export default function SupabaseHealthClient({ initialData, appUrl }: SupabaseHealthClientProps) {
  const [stats, setStats] = React.useState<KeepAliveStats>(initialData.stats)
  const [history, setHistory] = React.useState<PingResult[]>(initialData.history || [])
  const [latestPing, setLatestPing] = React.useState<PingResult | undefined>(initialData.ping)
  const [isPinging, setIsPinging] = React.useState(false)
  const [copiedUrl, setCopiedUrl] = React.useState(false)

  // Configuration de l'intervalle client (en minutes) : 2880 min = 48 heures (2 jours) par défaut
  const [intervalMinutes, setIntervalMinutes] = React.useState<number>(2880)
  const [autoPingEnabled, setAutoPingEnabled] = React.useState<boolean>(true)
  const [secondsRemaining, setSecondsRemaining] = React.useState<number>(2880 * 60)

  // Détection de l'environnement et gestion du domaine (Production vs Local)
  const rawBaseUrl = appUrl || (typeof window !== "undefined" ? window.location.origin : "https://immofika.ci")
  const isLocalEnv = rawBaseUrl.includes("localhost") || rawBaseUrl.includes("127.0.0.1")
  
  const [selectedEnv, setSelectedEnv] = React.useState<"prod" | "local">(isLocalEnv ? "prod" : "local")
  const [productionDomain, setProductionDomain] = React.useState<string>("https://immofika-psi.vercel.app")

  const currentBase = selectedEnv === "prod" ? productionDomain : rawBaseUrl
  const webhookUrl = `${currentBase.replace(/\/$/, "")}/api/cron/keepalive`

  // Initialisation avec persistance localStorage
  React.useEffect(() => {
    try {
      const savedInterval = localStorage.getItem("immofika_keepalive_interval")
      const savedLastPing = localStorage.getItem("immofika_keepalive_last_ping")
      const intervalVal = savedInterval ? parseInt(savedInterval, 10) : 2880
      setIntervalMinutes(intervalVal)

      if (savedLastPing) {
        const elapsedSec = Math.floor((Date.now() - parseInt(savedLastPing, 10)) / 1000)
        const totalSec = intervalVal * 60
        const rem = Math.max(0, totalSec - elapsedSec)
        setSecondsRemaining(rem)
      } else {
        setSecondsRemaining(intervalVal * 60)
      }
    } catch {
      // ignore SSR or localStorage access restriction
    }
  }, [])

  // Fonction pour déclencher un ping
  const handlePing = React.useCallback(async (isAuto = false) => {
    setIsPinging(true)
    try {
      const res = await triggerSupabasePingAction()
      if (res.success && res.ping) {
        setLatestPing(res.ping)
        setStats(res.stats)
        setHistory(res.history)
        try {
          localStorage.setItem("immofika_keepalive_last_ping", Date.now().toString())
        } catch {}

        if (!isAuto) {
          toast.success(`Ping réussi en ${res.ping.latencyMs} ms ! Supabase est actif.`)
        }
      } else {
        toast.error(res.error || "Échec du ping Supabase.")
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur de connexion au serveur.")
    } finally {
      setIsPinging(false)
      setSecondsRemaining(intervalMinutes * 60)
    }
  }, [intervalMinutes])

  // Compte à rebours et déclencheur d'auto-ping
  React.useEffect(() => {
    if (!autoPingEnabled) return

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          handlePing(true)
          return intervalMinutes * 60
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [autoPingEnabled, intervalMinutes, handlePing])

  // Changement d'intervalle
  const handleIntervalChange = (minutes: number) => {
    setIntervalMinutes(minutes)
    setSecondsRemaining(minutes * 60)
    try {
      localStorage.setItem("immofika_keepalive_interval", minutes.toString())
      localStorage.setItem("immofika_keepalive_last_ping", Date.now().toString())
    } catch {}

    const label = minutes >= 1440 ? `${minutes / 1440} jour(s)` : minutes >= 60 ? `${minutes / 60} heure(s)` : `${minutes} minute(s)`
    toast.info(`Fréquence ajustée : Ping automatique chaque ${label}.`)
  }

  // Copie de l'URL du webhook
  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl)
    setCopiedUrl(true)
    toast.success("URL webhook Keep-Alive copiée dans le presse-papier !")
    setTimeout(() => setCopiedUrl(false), 2500)
  }

  // Formatage propre du compte à rebours (jours, heures, minutes, secondes)
  const formatCountdown = (totalSeconds: number) => {
    if (totalSeconds <= 0) return "00:00"

    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    if (days > 0) {
      return `${days}j ${hours.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`
    }
    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`
    }
    return `${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`
  }

  const isHealthy = latestPing?.status === "healthy"
  const isDegraded = latestPing?.status === "degraded"
  const isPaused = latestPing?.status === "paused" || latestPing?.status === "error"

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. EN-TÊTE PRINCIPAL : Statut en direct et Action rapide */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isHealthy ? "bg-emerald-400" : isDegraded ? "bg-amber-400" : "bg-rose-400"
                }`} />
                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                  isHealthy ? "bg-emerald-500" : isDegraded ? "bg-amber-500" : "bg-rose-500"
                }`} />
              </span>

              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {isHealthy && "Supabase 100% Opérationnel"}
                {isDegraded && "Supabase Actif — Latence Modérée"}
                {isPaused && "Supabase en Pause ou Inaccessible"}
                {!latestPing && "État Supabase en Attente"}
              </h1>

              <span className={`px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-sm border ${
                isHealthy 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                  : isDegraded
                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
                  : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800"
              }`}>
                {isHealthy ? "En Ligne" : isDegraded ? "Dégradé" : "Interruption"}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Maintien actif automatisé <strong>anti-mise en veille</strong> pour Supabase (Formule Gratuite). 
              Des requêtes légères PostgreSQL et REST sont exécutées périodiquement pour garantir que la base ne s&apos;endorme jamais et que les connexions restent instantanées.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => handlePing(false)}
              disabled={isPinging}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-md shadow-sm transition-all duration-150 disabled:opacity-50 cursor-pointer border border-emerald-700"
            >
              <RefreshCw className={`w-4 h-4 ${isPinging ? "animate-spin" : ""}`} />
              <span>{isPinging ? "Ping en cours..." : "Tester la connexion maintenant"}</span>
            </button>

            <button
              onClick={() => setAutoPingEnabled(!autoPingEnabled)}
              className={`inline-flex items-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-semibold rounded-md border transition-colors cursor-pointer ${
                autoPingEnabled 
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 dark:bg-zinc-800 dark:text-slate-200 dark:border-zinc-700"
                  : "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800"
              }`}
            >
              <Radio className={`w-4 h-4 ${autoPingEnabled ? "text-emerald-600 animate-pulse" : "text-rose-500"}`} />
              <span>{autoPingEnabled ? "Keep-Alive Actif" : "Keep-Alive Suspendu"}</span>
            </button>
          </div>
        </div>

        {/* Barre d'état secondaire & compte à rebours */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Dernière vérification :{" "}
              <strong>
                {latestPing?.timestamp 
                  ? new Date(latestPing.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                  : "Aucune"}
              </strong>
            </span>
          </div>

          {autoPingEnabled && (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-sm border border-emerald-200 dark:border-emerald-900/60 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
              <span>Prochain ping automatique dans : <strong>{formatCountdown(secondsRemaining)}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* 2. LES 4 COMPOSANTS MÉTRIQUES (Carrés & Bordures fines) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Carte 1 : PostgreSQL Engine */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md p-4 shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Moteur PostgreSQL
            </span>
            <div className="p-1.5 bg-slate-100 dark:bg-zinc-800 rounded-sm border border-slate-200 dark:border-zinc-700">
              <Database className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {latestPing?.database.status === "online" ? "Connecté" : "Erreur"}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm border ${
                latestPing?.database.status === "online"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400"
              }`}>
                {latestPing?.database.latencyMs ?? 0} ms
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Requête SQL <code className="bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px]">SELECT 1</code> exécutée avec succès sur le pooler.
            </p>
          </div>
        </div>

        {/* Carte 2 : Latence Réseau Globale */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md p-4 shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Latence Aller-Retour
            </span>
            <div className="p-1.5 bg-slate-100 dark:bg-zinc-800 rounded-sm border border-slate-200 dark:border-zinc-700">
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {latestPing?.latencyMs ?? 0} <span className="text-xs font-semibold text-slate-400">ms</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm border bg-slate-50 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-slate-300 dark:border-zinc-700">
                Moyenne : {stats.avgLatencyMs} ms
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {latestPing && latestPing.latencyMs < 100
                ? "Excellente réactivité du serveur Supabase."
                : "Temps de réponse acceptable pour l'Afrique de l'Ouest / Europe."}
            </p>
          </div>
        </div>

        {/* Carte 3 : PostgREST API */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md p-4 shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              API PostgREST
            </span>
            <div className="p-1.5 bg-slate-100 dark:bg-zinc-800 rounded-sm border border-slate-200 dark:border-zinc-700">
              <Server className="w-4 h-4 text-indigo-500" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {latestPing?.rest.status === "online" ? "Opérationnel" : "Erreur"}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
                HTTP 200
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Endpoints REST et requêtes de données Next.js prêts et actifs.
            </p>
          </div>
        </div>

        {/* Carte 4 : Service Authentification */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md p-4 shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Service Auth (GoTrue)
            </span>
            <div className="p-1.5 bg-slate-100 dark:bg-zinc-800 rounded-sm border border-slate-200 dark:border-zinc-700">
              <Key className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {latestPing?.auth.status === "online" ? "Actif" : "En attente"}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
                Prêt
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Connexions admin, inscriptions clients et sessions fonctionnelles.
            </p>
          </div>
        </div>
      </div>

      {/* 3. CONFIGURATION DE LA FRÉQUENCE DU KEEP-ALIVE */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Fréquence du Ping Keep-Alive
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Choisissez l&apos;intervalle d&apos;interrogation automatique pour garder le serveur actif pendant vos sessions de travail.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "Chaque 2 jours (Conseillé)", value: 2880 },
              { label: "Chaque 24h (1 jour)", value: 1440 },
              { label: "Chaque 12 heures", value: 720 },
              { label: "Chaque 1 heure", value: 60 },
              { label: "10 min (Test)", value: 10 },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleIntervalChange(option.value)}
                className={`px-3 py-1.5 text-xs font-bold rounded-sm border transition-all cursor-pointer ${
                  intervalMinutes === option.value
                    ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                    : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300 dark:bg-zinc-800 dark:text-slate-200 dark:border-zinc-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-sm border border-slate-200/80 dark:border-zinc-700/60">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Total Pings Session</span>
            <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{stats.totalPings}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-sm border border-slate-200/80 dark:border-zinc-700/60">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Taux de Disponibilité</span>
            <span className="text-lg font-black text-emerald-600 font-mono">{stats.uptimePercentage}%</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-sm border border-slate-200/80 dark:border-zinc-700/60">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Statut Anti-Veille</span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Actif (Protection Inactivité 7j)
            </span>
          </div>
        </div>
      </div>

      {/* 4. HISTORIQUE DES DERNIERS PINGS */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Journal des Pings & Réponses
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Historique des 15 dernières requêtes de maintien de vie exécutées sur votre instance.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {history.length} enregistrement{history.length > 1 ? "s" : ""}
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-sm">
            <Activity className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aucun ping enregistré pour le moment. Cliquez sur &laquo; Tester la connexion maintenant &raquo; pour lancer le premier test.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Statut</th>
                  <th className="py-2.5 px-3">Horodatage</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Latence Totale</th>
                  <th className="py-2.5 px-3">PostgreSQL</th>
                  <th className="py-2.5 px-3">PostgREST</th>
                  <th className="py-2.5 px-3">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-mono">
                {history.slice(0, 15).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                        item.status === "healthy"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : item.status === "degraded"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                      }`}>
                        {item.status === "healthy" && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {item.status === "degraded" && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        {item.status === "paused" && <XCircle className="w-3 h-3 text-rose-600" />}
                        {item.status === "healthy" ? "200 OK" : item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                      {new Date(item.timestamp).toLocaleTimeString("fr-FR")}
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">
                        {item.source === "cron" ? "Cron Vercel" : item.source === "client" ? "Auto-Client" : "Manuel"}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                      {item.latencyMs} ms
                    </td>
                    <td className="py-2 px-3">
                      <span className={item.database.status === "online" ? "text-emerald-600 font-semibold" : "text-rose-600"}>
                        {item.database.status === "online" ? `${item.database.latencyMs} ms` : "Erreur"}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={item.rest.status === "online" ? "text-emerald-600 font-semibold" : "text-rose-600"}>
                        {item.rest.status === "online" ? `${item.rest.latencyMs} ms` : "Erreur"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-500 dark:text-slate-400 font-sans text-[11px] truncate max-w-[200px]">
                      {item.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. GUIDE PERMANENT : AUTOMATISATION 24H/24 MÊME NAVIGATEUR FERMÉ */}
      <div className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-md p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-sm shrink-0 border border-emerald-200 dark:border-emerald-800">
            <Radio className="w-5 h-5" />
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Protection Permanente 24h/24 (Même si aucun navigateur n&apos;est ouvert)
                </h4>
                {isLocalEnv && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400">
                    Détecté en Local ({rawBaseUrl})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Ce dashboard effectue le ping tant qu&apos;un administrateur a la page ouverte. Pour assurer un maintien <strong>100% garanti même la nuit et les week-ends sans visite</strong>, vous pouvez coller cette URL webhook dans un planificateur externe gratuit.
              </p>
            </div>

            {/* Sélecteur Mode Production Vercel vs Localhost */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedEnv("prod")}
                className={`px-3 py-1.5 text-xs font-bold rounded-sm border transition-all cursor-pointer ${
                  selectedEnv === "prod"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs dark:bg-white dark:text-slate-900"
                    : "bg-white text-slate-600 border-slate-300 dark:bg-zinc-800 dark:text-slate-300"
                }`}
              >
                🌐 URL Production (Vercel / En Ligne)
              </button>
              <button
                type="button"
                onClick={() => setSelectedEnv("local")}
                className={`px-3 py-1.5 text-xs font-bold rounded-sm border transition-all cursor-pointer ${
                  selectedEnv === "local"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs dark:bg-white dark:text-slate-900"
                    : "bg-white text-slate-600 border-slate-300 dark:bg-zinc-800 dark:text-slate-300"
                }`}
              >
                💻 URL Locale (Test sur votre machine)
              </button>
            </div>

            {/* Champ URL Webhook */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3 py-2 rounded-sm font-mono text-xs text-slate-800 dark:text-slate-200 truncate select-all">
                  {webhookUrl}
                </div>
                <button
                  onClick={handleCopyWebhook}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-sm transition-colors cursor-pointer shrink-0 border border-emerald-700 shadow-xs"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? "Copié !" : "Copier l'URL Webhook"}</span>
                </button>
              </div>

              {selectedEnv === "prod" && (
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>Domaine Vercel / Prod :</span>
                  <input
                    type="text"
                    value={productionDomain}
                    onChange={(e) => setProductionDomain(e.target.value)}
                    className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2 py-0.5 rounded-sm font-mono text-[11px] w-64 text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                    placeholder="https://votre-app.vercel.app"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
