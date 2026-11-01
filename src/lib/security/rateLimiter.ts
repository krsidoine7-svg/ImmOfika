/**
 * Rate Limiter intelligent pour ImmOfika
 * Supporte Upstash Redis si configuré en production, avec repli automatique (fallback)
 * sur un cache glissant en mémoire vive (in-memory sliding window).
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

// Cache mémoire local
const memoryStore = new Map<string, RateLimitRecord>()

// Nettoyage régulier des entrées expirées (toutes les 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of memoryStore.entries()) {
      if (now > record.resetTime) {
        memoryStore.delete(key)
      }
    }
  }, 5 * 60 * 1000).unref?.()
}

export interface RateLimitOptions {
  limit?: number       // Nombre maximum de requêtes
  windowSeconds?: number // Fenêtre en secondes
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): Promise<RateLimitResult> {
  const limit = options.limit || 5
  const windowSeconds = options.windowSeconds || 600 // 10 minutes par défaut
  const windowMs = windowSeconds * 1000
  const now = Date.now()

  // 1. Si Upstash Redis est configuré dans l'environnement, l'utiliser
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Redis } = await import('@upstash/redis')
      const { Ratelimit } = await import('@upstash/ratelimit')

      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })

      const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
        prefix: 'immofika:ratelimit',
      })

      const res = await ratelimit.limit(identifier)
      return {
        success: res.success,
        remaining: res.remaining,
        reset: Math.ceil(res.reset / 1000),
      }
    } catch (err) {
      console.warn('[RateLimiter] Erreur Upstash Redis, bascule sur la mémoire locale:', err)
    }
  }

  // 2. Repli en mémoire vive (Sliding Window in-memory)
  const key = `ratelimit:${identifier}`
  const existing = memoryStore.get(key)

  if (!existing || now > existing.resetTime) {
    memoryStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    })
    return {
      success: true,
      remaining: limit - 1,
      reset: Math.ceil((now + windowMs) / 1000),
    }
  }

  if (existing.count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: Math.ceil(existing.resetTime / 1000),
    }
  }

  existing.count += 1
  return {
    success: true,
    remaining: limit - existing.count,
    reset: Math.ceil(existing.resetTime / 1000),
  }
}
