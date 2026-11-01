import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // 1. Protection stricte des routes privées : /admin, /client et /dashboard
  const isPrivateRoute =
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/client') ||
    url.pathname.startsWith('/dashboard')

  if (!user && isPrivateRoute) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('callbackUrl', url.pathname + url.search)
    return NextResponse.redirect(redirectUrl)
  }

  // 2. Redirection des utilisateurs déjà connectés loin des pages d'authentification
  if (
    user &&
    url.pathname.startsWith('/auth') &&
    !url.pathname.startsWith('/auth/callback') &&
    !url.pathname.startsWith('/auth/verify-otp') &&
    !url.pathname.startsWith('/auth/reset-password')
  ) {
    url.pathname = '/client/dashboard'
    return NextResponse.redirect(url)
  }

  // 3. Redirection des alias /compte, /mon-compte et /client vers le tableau de bord client officiel
  if (url.pathname === '/compte' || url.pathname === '/mon-compte' || url.pathname === '/client') {
    url.pathname = '/client/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
