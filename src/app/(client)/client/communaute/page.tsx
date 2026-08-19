import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Users, Lock, Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Communauté Privée — ImmOfika',
  description: 'Rejoignez le réseau des propriétaires et investisseurs ImmOfika.',
}

export default async function CommunautePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <main className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 bg-white min-h-screen relative overflow-hidden flex flex-col justify-center">
      {/* Decorative blurred backgrounds */}
      <div className="absolute right-0 top-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto text-center space-y-6">
        <div className="mx-auto h-20 w-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center relative shadow-sm border border-emerald-100">
          <Users className="h-10 w-10 text-emerald-600" />
          <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center border border-white shadow-sm">
            <Lock className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 tracking-wider uppercase inline-block">
            Section en développement
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Club Privé ImmOfika
          </h1>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Un espace exclusif d&apos;échanges et de co-investissement destiné aux acquéreurs et partenaires d&apos;ImmOfika International.
          </p>
        </div>

        <div className="border border-slate-100 rounded-3xl p-6 bg-slate-50 text-xs text-slate-600 leading-relaxed text-left space-y-3">
          <p className="font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            Au programme de la communauté :
          </p>
          <ul className="space-y-1.5 list-disc list-inside font-medium">
            <li>Mise en relation directe entre propriétaires immobiliers.</li>
            <li>Opportunités de co-investissement sur des lotissements de grande envergure.</li>
            <li>Partage d&apos;expérience sur l&apos;aménagement foncier en Côte d&apos;Ivoire.</li>
            <li>Accès privilégié à des conseils de notaires et d&apos;experts du foncier.</li>
          </ul>
        </div>

        <p className="text-[11px] text-slate-500 font-semibold">
          Vous serez notifié par e-mail dès l&apos;ouverture des accès bêta de notre club d&apos;investisseurs.
        </p>
      </div>
    </main>
  )
}
