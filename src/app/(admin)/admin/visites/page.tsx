import * as React from 'react'
import { db } from '@/lib/db/index'
import { visites, profiles, biens, leads } from '@/lib/db/schema'
import { desc, isNull, and, eq, inArray } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { requirePermission } from '@/lib/auth/permissions'
import VisitesManagerClient from '@/components/admin/VisitesManagerClient'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const metadata = {
  title: 'Planification & Gestion des Visites - Admin ImmOfika',
}

export default async function AdminVisitesPage() {
  // 1. Sécuriser l'accès
  await requirePermission('view:visites')

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

  // Aliases pour les jointures multiples de profils
  const clientProfile = alias(profiles, 'client_profile')
  const agentProfile = alias(profiles, 'agent_profile')

  const visitConditions = [isNull(visites.deletedAt)]
  if (!isManager && user) {
    visitConditions.push(eq(visites.agentId, user.id))
  }

  // 2. Récupérer toutes les visites correspondantes
  const fetchedVisites = await db
    .select({
      id: visites.id,
      leadId: visites.leadId,
      clientId: visites.clientId,
      bienId: visites.bienId,
      agentId: visites.agentId,
      dateVisite: visites.dateVisite,
      statut: visites.statut,
      commentaires: visites.commentaires,
      createdAt: visites.createdAt,
      bien: {
        id: biens.id,
        titre: biens.titre,
        ville: biens.ville,
      },
      agent: {
        id: agentProfile.id,
        fullName: agentProfile.fullName,
        email: agentProfile.email,
      },
      client: {
        id: clientProfile.id,
        fullName: clientProfile.fullName,
        email: clientProfile.email,
        phone: clientProfile.phone,
      },
      lead: {
        id: leads.id,
        nom: leads.nom,
        prenom: leads.prenom,
        telephone: leads.telephone,
        email: leads.email,
      }
    })
    .from(visites)
    .innerJoin(biens, eq(visites.bienId, biens.id))
    .leftJoin(agentProfile, eq(visites.agentId, agentProfile.id))
    .leftJoin(clientProfile, eq(visites.clientId, clientProfile.id))
    .leftJoin(leads, eq(visites.leadId, leads.id))
    .where(and(...visitConditions))
    .orderBy(desc(visites.dateVisite))

  // 3. Récupérer les agents actifs
  const activeAgents = await db
    .select({
      id: profiles.id,
      fullName: profiles.fullName,
      email: profiles.email,
    })
    .from(profiles)
    .where(
      and(
        inArray(profiles.role, ['agent', 'admin_agent']),
        isNull(profiles.deletedAt)
      )
    )
    .orderBy(profiles.fullName)

  // 4. Récupérer les clients actifs (pour lier directement une visite à un client existant)
  const activeClients = await db
    .select({
      id: profiles.id,
      fullName: profiles.fullName,
      email: profiles.email,
    })
    .from(profiles)
    .where(
      and(
        eq(profiles.role, 'client'),
        isNull(profiles.deletedAt)
      )
    )
    .orderBy(profiles.fullName)

  // 5. Récupérer les leads non convertis ni perdus (pour lier une visite à un lead actif)
  const activeLeads = await db
    .select({
      id: leads.id,
      nom: leads.nom,
      prenom: leads.prenom,
      telephone: leads.telephone,
    })
    .from(leads)
    .where(
      and(
        isNull(leads.deletedAt),
        eq(leads.statut, 'nouveau')
      )
    )
    .orderBy(leads.nom)

  // 6. Récupérer tous les biens disponibles
  const activeBiens = await db
    .select({
      id: biens.id,
      titre: biens.titre,
      ville: biens.ville,
    })
    .from(biens)
    .where(
      and(
        eq(biens.statut, 'disponible'),
        isNull(biens.deletedAt)
      )
    )
    .orderBy(biens.titre)

  return (
    <VisitesManagerClient
      initialVisites={fetchedVisites as any}
      agents={activeAgents}
      clients={activeClients}
      leads={activeLeads as any}
      biens={activeBiens}
    />
  )
}
