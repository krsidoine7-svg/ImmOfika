import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Fonction de validation stricte anti-Open Redirect
function getSafeRedirectPath(rawNext: string | null, defaultFallback: string = '/client/dashboard'): string {
  if (!rawNext) return defaultFallback
  const trimmed = rawNext.trim()
  // Interdire les URLs protocol-relative (//evil.com), les antislashs, et les protocoles complets
  if (
    trimmed.startsWith('//') ||
    trimmed.startsWith('\\') ||
    trimmed.includes('://') ||
    !trimmed.startsWith('/')
  ) {
    return defaultFallback
  }
  return trimmed
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next')
  const safeNext = getSafeRedirectPath(rawNext, '/client/dashboard')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Tenter de récupérer le profil de l'utilisateur
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, is_onboarded')
          .eq('id', user.id)
          .single()

        // Résilience : Si la ligne de profil est absente, création à la volée avec le rôle choisi
        if (profileError || !profile) {
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || null
          const avatarUrl = user.user_metadata?.avatar_url || null
          const userMetaRole = user.user_metadata?.role as string | undefined
          const chosenRole = ['client', 'proprietaire', 'agence', 'promoteur'].includes(userMetaRole || '')
            ? userMetaRole!
            : 'client'

          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email!,
              full_name: fullName,
              avatar_url: avatarUrl,
              role: chosenRole,
              is_onboarded: false,
            })
            .select('role, is_onboarded')
            .single()

          if (!insertError && newProfile) {
            profile = newProfile
            await supabase.from('user_roles').upsert({
              user_id: user.id,
              role_name: chosenRole,
            }, { onConflict: 'user_id,role_name' })
          }
        }

        const role = profile?.role as string | undefined
        const isOnboarded = profile?.is_onboarded ?? false

        // 1. Compte suspendu
        if (role === 'suspended') {
          return NextResponse.redirect(`${origin}/suspended`)
        }

        // 2. Gating Onboarding obligatoire pour tous les nouveaux comptes (sauf admin / agent)
        if (!isOnboarded && role !== 'admin' && role !== 'super_admin' && role !== 'agent') {
          return NextResponse.redirect(`${origin}/auth/onboarding`)
        }

        // 3. Staff Admin / Agent
        if (role && (role.includes('admin') || role === 'agent')) {
          return NextResponse.redirect(`${origin}/admin`)
        }

        // 4. Acteurs Bailleurs / Agences / Promoteurs
        if (role === 'proprietaire' || role === 'agence' || role === 'promoteur') {
          // Si une page précise était demandée (sauf la page d'accueil ou client standard), on la respecte
          if (rawNext && safeNext !== '/client/dashboard' && safeNext !== '/') {
            return NextResponse.redirect(`${origin}${safeNext}`)
          }
          return NextResponse.redirect(`${origin}/dashboard/bailleur`)
        }
      }
      return NextResponse.redirect(`${origin}${safeNext}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate user`)
}
