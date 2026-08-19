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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  // Protect /admin and /client routes
  if (
    !user &&
    (url.pathname.startsWith('/admin') || url.pathname.startsWith('/client'))
  ) {
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages (except callback/verify logic)
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

  // Redirection des alias /mon-compte et /client vers le tableau de bord client officiel
  if (url.pathname === '/mon-compte' || url.pathname === '/client') {
    url.pathname = '/client/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
