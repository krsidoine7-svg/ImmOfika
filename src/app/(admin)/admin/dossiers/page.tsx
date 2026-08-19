import * as React from 'react'
import { db } from '@/lib/db/index'
import { dossiers, taches, profiles, biens } from '@/lib/db/schema'
import { desc, isNull, and, eq } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { requirePermission } from '@/lib/auth/permissions'
import DossiersManagerClient from '@/components/admin/DossiersManagerClient'

export const metadata = {
  title: 'Suivi des Dossiers & Tâches - Admin Favor Company',
}

export default async function AdminDossiersPage() {
  // 1. Sécuriser l'accès à la page (Permission view:dossiers)
  await requirePermission('view:dossiers')

  // Aliases pour faire des jointures multiples sur la même table profiles (client et agent)
  const clientProfile = alias(profiles, 'client_profile')
  const agentProfile = alias(profiles, 'agent_profile')

  // 2. Récupérer tous les dossiers non supprimés avec jointures
  const fetchedDossiers = await db
    .select({
      id: dossiers.id,
      titre: dossiers.titre,
      description: dossiers.description,
      statut: dossiers.statut,
      progression: dossiers.progression,
      priorite: dossiers.priorite,
      deadline: dossiers.deadline,
      createdAt: dossiers.createdAt,
      client: {
        id: clientProfile.id,
        fullName: clientProfile.fullName,
        email: clientProfile.email,
        phone: clientProfile.phone,
      },
      agent: {
        id: agentProfile.id,
        fullName: agentProfile.fullName,
        email: agentProfile.email,
      },
      bien: {
        id: biens.id,
        titre: biens.titre,
        slug: biens.slug,
        ville: biens.ville,
      }
    })
    .from(dossiers)
    .innerJoin(clientProfile, eq(dossiers.clientId, clientProfile.id))
    .leftJoin(agentProfile, eq(dossiers.agentId, agentProfile.id))
    .leftJoin(biens, eq(dossiers.bienId, biens.id))
    .where(isNull(dossiers.deletedAt))
    .orderBy(desc(dossiers.createdAt))

  // 3. Récupérer toutes les tâches non supprimées
  const fetchedTaches = await db
    .select({
      id: taches.id,
      dossierId: taches.dossierId,
      titre: taches.titre,
      description: taches.description,
      statut: taches.statut,
      priorite: taches.priorite,
      deadline: taches.deadline,
      bloqueCommentaire: taches.bloqueCommentaire,
      assignee: {
        id: profiles.id,
        fullName: profiles.fullName,
        email: profiles.email,
      }
    })
    .from(taches)
    .leftJoin(profiles, eq(taches.assigneeId, profiles.id))
    .where(isNull(taches.deletedAt))
    .orderBy(taches.createdAt)

  // 4. Récupérer tous les clients (rôle 'client')
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

  // 5. Récupérer les agents actifs (rôle 'agent')
  const activeAgents = await db
    .select({
      id: profiles.id,
      fullName: profiles.fullName,
      email: profiles.email,
    })
    .from(profiles)
    .where(
      and(
        eq(profiles.role, 'agent'),
        isNull(profiles.deletedAt)
      )
    )
    .orderBy(profiles.fullName)

  // 6. Récupérer tous les biens immobiliers
  const activeBiens = await db
    .select({
      id: biens.id,
      titre: biens.titre,
      ville: biens.ville,
    })
    .from(biens)
    .where(isNull(biens.deletedAt))
    .orderBy(biens.titre)

  return (
    <DossiersManagerClient
      dossiers={fetchedDossiers as any}
      taches={fetchedTaches as any}
      clients={activeClients}
      agents={activeAgents}
      biens={activeBiens}
    />
  )
}
