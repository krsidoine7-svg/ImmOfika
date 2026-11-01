export const dynamic = 'force-dynamic'

import * as React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Logo from '@/components/shared/Logo'
import AdvertiserDashboardClient from '@/components/dashboard/AdvertiserDashboardClient'
import { getAdvertiserDashboardDataAction } from '@/app/actions/advertiserActions'

export const metadata = {
  title: 'Espace Annonceur & Partenaire — ImmOfika',
  description: 'Gérez votre parc immobilier, vos candidatures et votre organisation.',
}

export default async function BailleurDashboardPage() {
  const { data, error } = await getAdvertiserDashboardDataAction()

  if (error || !data) {
    redirect('/auth/login?redirect=/dashboard/bailleur')
  }

  const roleLabelMap: Record<string, string> = {
    proprietaire: 'Bailleur Propriétaire',
    agence: 'Agence Immobilière',
    promoteur: 'Promoteur Agréé MCLU',
    admin: 'Administrateur',
    super_admin: 'Direction Technique',
  }

  return (
    <main className="min-h-screen bg-slate-50/60 text-slate-900 pb-16">
      {/* Header Annonceur */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden sm:inline-block text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
              {roleLabelMap[data.user.role] || 'Espace Annonceur'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/biens"
              className="text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors hidden md:inline-block"
            >
              Voir la vitrine publique
            </Link>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 text-xs font-semibold text-slate-700">
              <span>{data.user.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Corps du Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <AdvertiserDashboardClient initialData={data} />
      </div>
    </main>
  )
}
