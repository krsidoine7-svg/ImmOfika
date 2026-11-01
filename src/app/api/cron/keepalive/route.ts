import { NextRequest, NextResponse } from 'next/server'
import { pingSupabase, getKeepAliveData } from '@/lib/services/supabaseKeepAlive'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Optionnel : vérification du secret CRON si configuré
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const isVercelCron = request.headers.get('user-agent')?.includes('vercel-cron')
    const source = isVercelCron ? 'cron' : 'webhook'
    const pingResult = await pingSupabase(source)
    const data = getKeepAliveData()

    return NextResponse.json({
      success: true,
      keepAlive: 'active',
      timestamp: pingResult.timestamp,
      latencyMs: pingResult.latencyMs,
      database: pingResult.database.status,
      rest: pingResult.rest.status,
      auth: pingResult.auth.status,
      stats: data.stats,
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Échec du keep-alive Supabase',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
