import { NextRequest, NextResponse } from 'next/server'
import { pingSupabase, getKeepAliveData } from '@/lib/services/supabaseKeepAlive'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shouldPing = searchParams.get('ping') === 'true'

    if (shouldPing) {
      const pingResult = await pingSupabase('client')
      const data = getKeepAliveData()
      return NextResponse.json({
        success: true,
        ping: pingResult,
        stats: data.stats,
        history: data.history.slice(0, 20),
      })
    }

    const data = getKeepAliveData()
    return NextResponse.json({
      success: true,
      stats: data.stats,
      history: data.history.slice(0, 20),
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Erreur lors de la vérification de santé Supabase',
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const pingResult = await pingSupabase('manual')
    const data = getKeepAliveData()
    return NextResponse.json({
      success: true,
      ping: pingResult,
      stats: data.stats,
      history: data.history.slice(0, 20),
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Erreur lors du ping Supabase',
      },
      { status: 500 }
    )
  }
}
