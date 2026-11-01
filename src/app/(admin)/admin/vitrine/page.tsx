export const dynamic = 'force-dynamic'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { biens } from '@/lib/db/schema'
import { eq, isNull, and } from 'drizzle-orm'
import { getHomepageConfigsAction } from '@/app/actions/homepage'
import VitrineSettingsClient from '@/components/admin/VitrineSettingsClient'

export const metadata = {
  title: 'Ma Vitrine en Vedette — ImmOfika',
  description: 'Gérez votre vitrine professionnelle, vos coordonnées directes WhatsApp et vos programmes certifiés.',
}

export default async function AdminVitrinePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 1. Vérifier si le module est activé globalement par le Super Admin
  const homeConfigRes = await getHomepageConfigsAction()
  const featuredPartnersConfig = homeConfigRes.configs?.featured_partners || {}
  const moduleEnabled = featuredPartnersConfig.enabled !== false

  // 2. Récupérer le profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, role')
    .eq('id', user.id)
    .single()

  // 3. Récupérer les biens gérés par cet agent / promoteur
  const userBiens = await db
    .select({
      id: biens.id,
      titre: biens.titre,
      prix: biens.prix,
      ville: biens.ville,
      quartier: biens.quartier,
      statut: biens.statut,
    })
    .from(biens)
    .where(
      and(
        eq(biens.agentId, user.id),
        isNull(biens.deletedAt)
      )
    )
    .limit(12)

  return (
    <VitrineSettingsClient 
      moduleEnabled={moduleEnabled}
      user={{
        id: user.id,
        email: user.email || '',
        role: profile?.role || 'agent',
      }}
      profile={{
        fullName: profile?.full_name || '',
        phone: profile?.phone || '',
      }}
      biens={userBiens}
    />
  )
}

