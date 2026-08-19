import * as React from 'react'
import { ShieldAlert, PhoneCall, Mail, LogOut, ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const metadata = {
  title: 'Espace Restreint — Favor Company International',
  description: 'Votre compte a été temporairement suspendu par la direction administrative.',
}

export default async function SuspendedPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  
  let targetDashboard = '/client/dashboard'
  let suspensionReason: string | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, suspension_reason')
      .eq('id', user.id)
      .single()

    if (profile) {
      suspensionReason = profile.suspension_reason || null
      if (profile.role) {
        const role = profile.role as string
        if (role.includes('admin') || role === 'agent') {
          targetDashboard = '/admin'
        }
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F6F1] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      
      {/* Background subtle branding gradients */}
      <div className="absolute -left-40 -top-40 w-96 h-96 rounded-full bg-gradient-to-br from-[#1A2A4A]/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -right-40 -bottom-40 w-96 h-96 rounded-full bg-gradient-to-br from-[#C9A84C]/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        
        {/* Branding header */}
        <div className="space-y-2">
          <span className="text-sm font-bold tracking-[0.2em] text-[#C9A84C] uppercase block">
            Favor Company International
          </span>
          <div className="h-[1px] w-12 bg-[#C9A84C]/40 mx-auto" />
        </div>

        {/* Premium Suspension Card */}
        <div className="bg-white rounded-3xl border border-rose-100 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden transition-all duration-300 hover:shadow-rose-100/40">
          
          {/* Top warning shield element */}
          <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#1A2A4A] tracking-tight">
              Espace Client Restreint
            </h1>
            <p className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-200/50 px-3 py-1 rounded-full w-fit mx-auto uppercase tracking-wide">
              Compte Temporairement Suspendu
            </p>
          </div>

          {suspensionReason ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-left text-xs font-medium space-y-1">
              <span className="font-bold uppercase tracking-wider text-[10px] block text-rose-600">Motif de la suspension :</span>
              <p className="leading-relaxed">{suspensionReason}</p>
            </div>
          ) : (
            <p className="text-slate-500 font-normal text-xs sm:text-sm leading-relaxed text-center px-2">
              Pour des raisons de conformité réglementaire ou de gestion de dossier administratif, l&apos;accès à votre espace privé a été temporairement restreint.
            </p>
          )}

          <div className="bg-[#F8F6F1] rounded-2xl p-4 text-left border border-slate-100/50 space-y-3.5">
            <h3 className="font-extrabold text-[#1A2A4A] text-xs uppercase tracking-wide">
              Comment régulariser votre situation ?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-light">
              Veuillez prendre contact directement avec nos conseillers clientèle par téléphone ou par e-mail afin de réactiver votre accès dans les plus brefs délais.
            </p>
          </div>

          {/* Action Contacts Buttons */}
          <div className="space-y-3 pt-2">
            
            {/* Access Dashboard / Refresh button */}
            <a
              href={targetDashboard}
              className="flex items-center justify-center gap-3 w-full h-12 rounded-xl bg-[#C9A84C] hover:bg-[#b8943d] text-white font-bold text-xs sm:text-sm transition-all shadow-lg hover:shadow-[#C9A84C]/25 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 rotate-180 text-white" />
              <span>Accéder à mon Espace (Actualiser)</span>
            </a>

            {/* Call button */}
            <a
              href="tel:+2252724370155"
              className="flex items-center justify-center gap-3 w-full h-12 rounded-xl bg-[#1A2A4A] hover:bg-[#111e36] text-white font-bold text-xs sm:text-sm transition-all shadow-lg hover:shadow-[#1A2A4A]/20 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#C9A84C]" />
              <span>Contacter par Téléphone (+225)</span>
            </a>

            {/* Email button */}
            <a
              href="mailto:support@favorcompany.ci"
              className="flex items-center justify-center gap-3 w-full h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#1A2A4A] font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm"
            >
              <Mail className="w-4 h-4 text-slate-400" />
              <span>Envoyer un E-mail au Support</span>
            </a>

          </div>

        </div>

        {/* Premium Logout Footer */}
        <div className="space-y-4 pt-2">
          
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Se déconnecter de ce compte</span>
            </button>
          </form>

          <div>
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#C9A84C] hover:underline uppercase tracking-wider"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Retour à l&apos;accueil public</span>
            </a>
          </div>

        </div>

      </div>
    </main>
  )
}
