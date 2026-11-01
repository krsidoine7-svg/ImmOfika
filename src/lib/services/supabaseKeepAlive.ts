import postgres from 'postgres'
import { createClient } from '@supabase/supabase-js'

export interface PingResult {
  id: string
  timestamp: string
  status: 'healthy' | 'degraded' | 'paused' | 'error'
  latencyMs: number
  database: {
    status: 'online' | 'error'
    latencyMs: number
    serverTime?: string
    version?: string
    error?: string
  }
  rest: {
    status: 'online' | 'error'
    latencyMs: number
    error?: string
  }
  auth: {
    status: 'online' | 'error'
    latencyMs: number
    error?: string
  }
  source: 'cron' | 'manual' | 'client' | 'webhook'
  message: string
}

export interface KeepAliveStats {
  totalPings: number
  successfulPings: number
  failedPings: number
  uptimePercentage: number
  avgLatencyMs: number
  lastPing?: PingResult
  status: 'healthy' | 'degraded' | 'paused' | 'error'
}

// Tampon en mémoire partagée pour conserver l'historique des pings récents
const globalForKeepAlive = globalThis as unknown as {
  __keepAliveHistory?: PingResult[]
}

const MAX_HISTORY = 50

function getHistory(): PingResult[] {
  if (!globalForKeepAlive.__keepAliveHistory) {
    globalForKeepAlive.__keepAliveHistory = []
  }
  return globalForKeepAlive.__keepAliveHistory
}

function addToHistory(result: PingResult) {
  const history = getHistory()
  history.unshift(result)
  if (history.length > MAX_HISTORY) {
    history.pop()
  }
}

/**
 * Nettoie la chaîne de connexion DATABASE_URL (retrait des guillemets éventuels)
 */
function getSanitizedDbUrl(): string {
  const raw = process.env.DATABASE_URL || ''
  return raw.replace(/^["']|["']$/g, '').trim()
}

/**
 * Exécute un ping direct complet sur Supabase :
 * 1. PostgreSQL Direct Query (SELECT 1 + NOW()) pour forcer le réveil et l'activité du compute
 * 2. Supabase PostgREST API (HEAD request sur profiles)
 * 3. Supabase Auth Service (/auth/v1/health ou getSession)
 */
export async function pingSupabase(source: 'cron' | 'manual' | 'client' | 'webhook' = 'manual'): Promise<PingResult> {
  const pingId = `ping_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const startedAt = Date.now()

  const result: PingResult = {
    id: pingId,
    timestamp: new Date().toISOString(),
    status: 'healthy',
    latencyMs: 0,
    database: { status: 'error', latencyMs: 0 },
    rest: { status: 'error', latencyMs: 0 },
    auth: { status: 'error', latencyMs: 0 },
    source,
    message: 'Test en cours...',
  }

  // 1. PING DIRECT POSTGRESQL (Réveil du moteur compute)
  const dbUrl = getSanitizedDbUrl()
  if (dbUrl) {
    const dbStart = Date.now()
    let sqlClient: postgres.Sql | null = null
    try {
      sqlClient = postgres(dbUrl, {
        max: 1,
        connect_timeout: 8,
        idle_timeout: 5,
        prepare: false,
      })
      const rows = await sqlClient`SELECT 1 as alive, NOW() as server_time, version() as pg_version`
      const dbDuration = Date.now() - dbStart
      result.database = {
        status: 'online',
        latencyMs: dbDuration,
        serverTime: rows[0]?.server_time ? new Date(rows[0].server_time).toISOString() : new Date().toISOString(),
        version: rows[0]?.pg_version ? String(rows[0].pg_version).split(' ')[0] : 'PostgreSQL',
      }
    } catch (err: any) {
      const dbDuration = Date.now() - dbStart
      result.database = {
        status: 'error',
        latencyMs: dbDuration,
        error: err.message || 'Échec de connexion PostgreSQL',
      }
    } finally {
      if (sqlClient) {
        try {
          await sqlClient.end({ timeout: 1 })
        } catch {
          // ignore cleanup error
        }
      }
    }
  } else {
    result.database = {
      status: 'error',
      latencyMs: 0,
      error: 'DATABASE_URL manquante',
    }
  }

  // 2. PING REST API SUPABASE (PostgREST)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (supabaseUrl && supabaseKey) {
    const restStart = Date.now()
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      })
      const { error: restError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })

      const restDuration = Date.now() - restStart
      if (restError && restError.code !== 'PGRST116') {
        result.rest = {
          status: 'error',
          latencyMs: restDuration,
          error: restError.message,
        }
      } else {
        result.rest = {
          status: 'online',
          latencyMs: restDuration,
        }
      }
    } catch (err: any) {
      result.rest = {
        status: 'error',
        latencyMs: Date.now() - restStart,
        error: err.message || 'Échec de requête REST',
      }
    }
  }

  // 3. PING AUTH SUPABASE
  if (supabaseUrl) {
    const authStart = Date.now()
    try {
      const authHealthUrl = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/health`
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)

      const res = await fetch(authHealthUrl, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      })
      clearTimeout(timeoutId)
      const authDuration = Date.now() - authStart

      if (res.ok) {
        result.auth = {
          status: 'online',
          latencyMs: authDuration,
        }
      } else {
        result.auth = {
          status: 'error',
          latencyMs: authDuration,
          error: `HTTP ${res.status}`,
        }
      }
    } catch (err: any) {
      result.auth = {
        status: 'error',
        latencyMs: Date.now() - authStart,
        error: err.message || 'Échec de vérification Auth',
      }
    }
  }

  // Calcul du temps global
  result.latencyMs = Date.now() - startedAt

  // Statut global consolidé
  const isDbUp = result.database.status === 'online'
  const isRestUp = result.rest.status === 'online'

  if (isDbUp && isRestUp) {
    if (result.latencyMs > 1500) {
      result.status = 'degraded'
      result.message = 'Supabase est actif mais présente une latence modérée.'
    } else {
      result.status = 'healthy'
      result.message = 'Supabase est 100% opérationnel — Activité base de données maintenue avec succès.'
    }
  } else if (!isDbUp && !isRestUp) {
    result.status = 'paused'
    result.message = 'Base de données potentiellement en veille ou arrêtée. Relance en cours.'
  } else {
    result.status = 'degraded'
    result.message = 'Connexion partielle à Supabase. Un des services requiert attention.'
  }

  addToHistory(result)
  return result
}

/**
 * Récupère l'historique et les statistiques d'uptime/latence
 */
export function getKeepAliveData(): {
  stats: KeepAliveStats
  history: PingResult[]
} {
  const history = getHistory()
  const total = history.length

  if (total === 0) {
    return {
      stats: {
        totalPings: 0,
        successfulPings: 0,
        failedPings: 0,
        uptimePercentage: 100,
        avgLatencyMs: 0,
        status: 'healthy',
      },
      history: [],
    }
  }

  const successful = history.filter((p) => p.status === 'healthy' || p.status === 'degraded').length
  const failed = total - successful
  const uptimePercentage = Math.round((successful / total) * 100)
  const sumLatency = history.reduce((acc, curr) => acc + curr.latencyMs, 0)
  const avgLatencyMs = Math.round(sumLatency / total)

  return {
    stats: {
      totalPings: total,
      successfulPings: successful,
      failedPings: failed,
      uptimePercentage,
      avgLatencyMs,
      lastPing: history[0],
      status: history[0]?.status || 'healthy',
    },
    history,
  }
}
