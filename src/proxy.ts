import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Next.js 16 : export default ou export nommé "proxy"
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Routes admin → rediriger si non connecté
  if (pathname.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Routes client → rediriger si non connecté
  if (pathname.startsWith('/client') && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Si connecté et sur les pages d'auth ou d'alias -> rediriger vers le bon dashboard
  const isAuthPage = pathname === '/auth/login' || pathname === '/auth/register' || pathname === '/auth/forgot-password'
  const isAliasPage = pathname === '/mon-compte' || pathname === '/client'

  if (user && (isAuthPage || isAliasPage)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'client'
    const isAdminOrAgent = role === 'admin' || role === 'super_admin' || role === 'tech_super_admin' || role === 'agent'

    const targetUrl = isAdminOrAgent ? '/admin' : '/client/dashboard'
    return NextResponse.redirect(new URL(targetUrl, request.url))
  }

  return response
}

// Spécification de la config directement pour Next.js 16
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
