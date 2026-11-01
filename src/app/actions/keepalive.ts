'use server'

import { pingSupabase, getKeepAliveData, PingResult, KeepAliveStats } from '@/lib/services/supabaseKeepAlive'
import { requireAdminAccess } from '@/lib/auth/permissions'

export interface KeepAliveResponse {
  success: boolean
  ping?: PingResult
  stats: KeepAliveStats
  history: PingResult[]
  error?: string
}

export async function triggerSupabasePingAction(): Promise<KeepAliveResponse> {
  await requireAdminAccess()

  try {
    const ping = await pingSupabase('manual')
    const { stats, history } = getKeepAliveData()
    return {
      success: true,
      ping,
      stats,
      history,
    }
  } catch (err: any) {
    const { stats, history } = getKeepAliveData()
    return {
      success: false,
      error: err.message || 'Erreur lors du ping Supabase',
      stats,
      history,
    }
  }
}

export async function getSupabaseHealthAction(): Promise<KeepAliveResponse> {
  await requireAdminAccess()

  try {
    const { stats, history } = getKeepAliveData()
    // Si aucun ping n'a encore été fait, en déclencher un automatiquement
    if (stats.totalPings === 0) {
      const ping = await pingSupabase('client')
      const updated = getKeepAliveData()
      return {
        success: true,
        ping,
        stats: updated.stats,
        history: updated.history,
      }
    }

    return {
      success: true,
      ping: history[0],
      stats,
      history,
    }
  } catch (err: any) {
    const { stats, history } = getKeepAliveData()
    return {
      success: false,
      error: err.message || 'Erreur de récupération des métriques',
      stats,
      history,
    }
  }
}
