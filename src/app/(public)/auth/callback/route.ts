import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/client/dashboard'

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
          .select('role')
          .eq('id', user.id)
          .single()

        // Résilience : Si la ligne de profil est absente (délai de trigger Supabase ou absence de trigger), on la crée à la volée
        if (profileError || !profile) {
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || null
          const avatarUrl = user.user_metadata?.avatar_url || null

          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email!,
              full_name: fullName,
              avatar_url: avatarUrl,
              role: 'client'
            })
            .select('role')
            .single()

          if (!insertError && newProfile) {
            profile = newProfile
          }
        }

        if (profile && (profile.role.includes('admin') || profile.role === 'agent')) {
          return NextResponse.redirect(`${origin}/admin`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate user`)
}
