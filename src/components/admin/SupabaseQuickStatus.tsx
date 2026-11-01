"use client"

import * as React from "react"
import Link from "next/link"
import { Activity, RefreshCw, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react"
import { triggerSupabasePingAction } from "@/app/actions/keepalive"

export default function SupabaseQuickStatus() {
  const [status, setStatus] = React.useState<"idle" | "loading" | "healthy" | "degraded" | "error">("healthy")
  const [latency, setLatency] = React.useState<number | null>(null)
  const [lastCheckTime, setLastCheckTime] = React.useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const runPing = React.useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true)
    try {
      const res = await triggerSupabasePingAction()
      if (res.success && res.ping) {
        setStatus(res.ping.status === "paused" ? "error" : res.ping.status)
        setLatency(res.ping.latencyMs)
        setLastCheckTime(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }))
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  // Auto-ping initial et périodique toutes les 10 minutes (600 000 ms)
  React.useEffect(() => {
    runPing(true)

    const interval = setInterval(() => {
      runPing(true)
    }, 10 * 60 * 1000)

    return () => clearInterval(interval)
  }, [runPing])

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md px-4 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              status === "healthy" ? "bg-emerald-400" : status === "degraded" ? "bg-amber-400" : "bg-rose-400"
            }`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              status === "healthy" ? "bg-emerald-500" : status === "degraded" ? "bg-amber-500" : "bg-rose-500"
            }`} />
          </span>

          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            Supabase Base de Données :
          </span>

          <span className={`px-2 py-0.5 font-bold uppercase tracking-wider text-[10px] rounded-sm border ${
            status === "healthy"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
              : status === "degraded"
              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400"
              : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400"
          }`}>
            {status === "healthy" ? "En Ligne" : status === "degraded" ? "Latence" : "En Veille"}
          </span>
        </div>

        {latency !== null && (
          <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] hidden sm:inline">
            Latence : <strong className="text-slate-700 dark:text-slate-300">{latency} ms</strong>
          </span>
        )}

        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium hidden md:inline bg-emerald-50/60 dark:bg-emerald-950/20 px-2 py-0.5 rounded-sm border border-emerald-100 dark:border-emerald-900/40">
          Anti-Veille Actif (Ping chaque 2 jours)
        </span>
      </div>

      <div className="flex items-center gap-3">
        {lastCheckTime && (
          <span className="text-slate-400 text-[10px] hidden lg:inline">
            Dernier test : {lastCheckTime}
          </span>
        )}

        <button
          onClick={() => runPing(false)}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-slate-900 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-sm font-semibold text-[11px] transition-colors cursor-pointer border border-slate-300 dark:border-zinc-700 disabled:opacity-50"
          title="Exécuter un ping maintenant"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
          <span>Tester</span>
        </button>

        <Link
          href="/admin/systeme"
          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold hover:underline text-[11px]"
        >
          <span>Monitoring complet</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </Link>
      </div>
    </div>
  )
}
