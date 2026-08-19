import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import ProfileSettingsClient from '@/components/shared/ProfileSettingsClient'

export const metadata = {
  title: 'Mon Profil — Administration ImmOfika',
  description: 'Gérez vos informations de compte administrateur ou agent ImmOfika.',
}

export default async function AdminProfilPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      <Link 
        href="/admin" 
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Retour au tableau de bord
      </Link>

      <ProfileSettingsClient 
        user={{ id: user.id, email: user.email || '' }}
        profile={{
          full_name: profile?.full_name || '',
          phone: profile?.phone || '',
          avatar_url: profile?.avatar_url || '',
          role: profile?.role || 'admin',
        }}
        redirectPathAfterDelete="/suspended"
        allowEmailChange={true}
      />
    </div>
  )
}
