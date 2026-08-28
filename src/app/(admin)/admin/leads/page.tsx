import * as React from 'react'
import { db } from '@/lib/db/index'
import { leads, profiles, biens } from '@/lib/db/schema'
import { desc, isNull, and, eq, inArray } from 'drizzle-orm'
import { requirePermission } from '@/lib/auth/permissions'
import LeadsManagerClient from '@/components/admin/LeadsManagerClient'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const metadata = {
  title: 'Gestion des Leads - Admin ImmOfika',
}

export default async function AdminLeadsPage() {
  // 1. Sécuriser l'accès à la page (Permission view:leads)
  await requirePermission('view:leads')

  // Récupérer le rôle de l'utilisateur connecté pour le filtrage personnalisé
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  let isManager = false
  if (user) {
    const [profile] = await db
      .select({ role: profiles.role })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)
    
    isManager = profile?.role === 'admin' || profile?.role === 'super_admin' || profile?.role === 'admin_manager'
  }

  const leadConditions = [isNull(leads.deletedAt)]
  if (!isManager && user) {
    leadConditions.push(eq(leads.agentId, user.id))
  }

  // 2. Récupérer les prospects
  const fetchedLeads = await db
    .select({
      id: leads.id,
      nom: leads.nom,
      prenom: leads.prenom,
      email: leads.email,
      telephone: leads.telephone,
      source: leads.source,
      statut: leads.statut,
      etape: leads.etape,
      score: leads.score,
      bienInteresse: leads.bienInteresse,
      agentId: leads.agentId,
      message: leads.message,
      visiteConfirmee: leads.visiteConfirmee,
      offreValidee: leads.offreValidee,
      engagementSigne: leads.engagementSigne,
      createdAt: leads.createdAt,
    })
    .from(leads)
    .where(and(...leadConditions))
    .orderBy(desc(leads.createdAt))

  // 3. Récupérer la liste des agents immobiliers actifs
  const activeAgents = await db
    .select({
      id: profiles.id,
      fullName: profiles.fullName,
      email: profiles.email,
      role: profiles.role,
    })
    .from(profiles)
    .where(
      and(
        inArray(profiles.role, ['agent', 'admin_agent']),
        isNull(profiles.deletedAt)
      )
    )

  // 4. Récupérer la liste des biens pour l'association
  const activeBiens = await db
    .select({
      id: biens.id,
      titre: biens.titre,
      ville: biens.ville,
    })
    .from(biens)
    .where(isNull(biens.deletedAt))

  return (
    <LeadsManagerClient
      leads={fetchedLeads as any}
      agents={activeAgents}
      biens={activeBiens}
    />
  )
}
