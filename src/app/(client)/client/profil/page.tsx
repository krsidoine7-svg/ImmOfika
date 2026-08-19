import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProfileSettingsClient from '@/components/shared/ProfileSettingsClient'

export const metadata = {
  title: 'Mon Profil — ImmOfika',
}

export default async function ProfilPage() {
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
    <main className="min-h-screen bg-white p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">
        <ProfileSettingsClient 
          user={{ id: user.id, email: user.email || '' }}
          profile={{
            full_name: profile?.full_name || '',
            phone: profile?.phone || '',
            avatar_url: profile?.avatar_url || '',
            role: profile?.role || 'client',
            kyc_doc_url: profile?.kyc_doc_url || '',
            kyc_doc_type: profile?.kyc_doc_type || '',
            kyc_status: profile?.kyc_status || 'none',
          }}
          redirectPathAfterDelete="/suspended"
          allowEmailChange={true}
        />
      </div>
    </main>
  )
}
