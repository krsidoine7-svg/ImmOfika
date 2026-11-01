import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { getDefaultDashboardForRole, canRoleAccessPath } from '@/lib/roles'

/**
 * Proxy Next.js 16 (remplace la convention middleware dépréciée)
 * Gère l'authentification Supabase au niveau réseau (Edge/Proxy),
 * le rafraîchissement des cookies de session, la protection des routes privées
 * et les redirections sécurisées anti-open-redirect.
 */
export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  // Récupérer l'utilisateur connecté de manière sécurisée
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const { pathname } = url

  // 1. Protection des routes privées : /admin, /client, /dashboard
  const isPrivateRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/client') ||
    pathname.startsWith('/dashboard')

  if (!user && (isPrivateRoute || pathname === '/auth/onboarding')) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('callbackUrl', pathname + url.search)
    return NextResponse.redirect(redirectUrl)
  }

  // 2. Redirection des utilisateurs déjà connectés loin des pages d'authentification
  const isAuthPage =
    (pathname === '/auth/login' ||
      pathname === '/auth/register' ||
      pathname === '/auth/forgot-password') &&
    !pathname.startsWith('/auth/callback') &&
    !pathname.startsWith('/auth/verify-otp') &&
    !pathname.startsWith('/auth/reset-password')

  const isAliasPage =
    pathname === '/compte' ||
    pathname === '/mon-compte' ||
    pathname === '/client'

  if (user && (isAuthPage || isAliasPage)) {
    // Vérifier le rôle de l'utilisateur pour le diriger vers son espace officiel
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_onboarded')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'client'
    const isOnboarded = profile?.is_onboarded ?? false

    if (!isOnboarded && role !== 'admin' && role !== 'super_admin' && role !== 'agent') {
      return NextResponse.redirect(new URL('/auth/onboarding', request.url))
    }

    const targetUrl = getDefaultDashboardForRole(role)
    return NextResponse.redirect(new URL(targetUrl, request.url))
  }

  // 3. Gestion de la page /auth/onboarding si déjà finalisé
  if (user && pathname === '/auth/onboarding') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_onboarded')
      .eq('id', user.id)
      .single()

    if (profile?.is_onboarded) {
      const targetUrl = getDefaultDashboardForRole(profile.role)
      return NextResponse.redirect(new URL(targetUrl, request.url))
    }
  }

  // 4. Contrôle d'accès par rôle et Gating Onboarding sur les routes privées
  if (user && isPrivateRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_onboarded')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'client'
    const isOnboarded = profile?.is_onboarded ?? false

    // Si le compte n'a pas complété son onboarding, redirection forcée
    if (!isOnboarded && role !== 'admin' && role !== 'super_admin' && role !== 'agent') {
      return NextResponse.redirect(new URL('/auth/onboarding', request.url))
    }

    if (!canRoleAccessPath(role, pathname)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Intercepte toutes les requêtes sauf :
     * - _next/static (fichiers compilés statiques)
     * - _next/image (optimisation d'images Next.js)
     * - favicon.ico (icône de favori)
     * - Fichiers statiques avec extension (.svg, .png, .jpg, .css, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|txt|xml)$).*)',
  ],
}
