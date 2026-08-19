import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ClientSidebar from '@/components/client/ClientSidebar'
import ClientHeader from '@/components/client/ClientHeader'

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Récupérer le profil pour vérifier la suspension et charger les infos du header
  const { data: profile } = await supabase
    .from('profiles')
    .select('deleted_at, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  if (profile?.deleted_at) {
    redirect('/suspended')
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8F6F1]">
      <ClientSidebar />
      <div className="flex-1 min-h-screen overflow-x-hidden flex flex-col pt-16 lg:pt-0">
        <ClientHeader 
          userId={user.id}
          fullName={profile?.full_name || null} 
          email={user.email} 
          avatarUrl={profile?.avatar_url || null} 
        />
        <div className="flex-1 p-6 lg:p-10">
          {children}
        </div>
      </div>
    </div>
  )
}
