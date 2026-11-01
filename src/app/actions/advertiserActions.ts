'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'
import { biens, organizations, organizationMembers, profiles, reservations, dossiersCandidats } from '@/lib/db/schema'
import { eq, and, isNull, desc, inArray, or } from 'drizzle-orm'
import { assertCan } from '@/lib/auth/permissions'
import { z } from 'zod'

// ─── Types & Schémas ─────────────────────────────────────────────────────────

export interface AdvertiserDashboardData {
  user: {
    id: string
    email?: string | null
    role: string
    fullName?: string | null
  }
  organization: {
    id: string
    name: string
    type: 'agence' | 'promoteur'
    rccm?: string | null
    ncc?: string | null
    agrementNumero?: string | null
    logoUrl?: string | null
    telephone?: string | null
    whatsapp?: string | null
    commune?: string | null
    verifiedAt?: Date | null
  } | null
  isGerant: boolean
  members: Array<{
    id: string
    userId: string
    fullName: string | null
    email: string | null
    roleInOrg: string
    assignedAt: Date
  }>
  kpis: {
    totalBiens: number
    biensValides: number
    biensEnAttente: number
    biensRejetes: number
    totalVues: number
    totalCandidatures: number
    reservationsActives: number
  }
  biens: Array<{
    id: string
    slug: string
    titre: string
    prix: string
    transaction: string
    type: string
    statut: string
    statutModeration: string
    motifRejet?: string | null
    typeTitrePropriete?: string | null
    ville: string
    commune?: string | null
    quartier?: string | null
    vues: number
    mainImageUrl?: string | null
    createdAt: Date
  }>
  candidatures: Array<{
    id: string
    bienId: string
    bienTitre: string
    bienSlug: string
    clientNom: string
    clientEmail: string
    clientPhone?: string | null
    statutReservation: string
    dateReservation: Date
    dossier?: {
      typeProjet: string
      profession?: string | null
      employeur?: string | null
      revenuMensuel?: string | null
      statut: string
      completude: number
    } | null
  }>
}

const InviterMembreSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  roleInOrg: z.enum(['gerant', 'negociateur', 'assistant']).default('negociateur'),
})

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function getAdvertiserDashboardDataAction(): Promise<{ data?: AdvertiserDashboardData; error?: string }> {
  try {
    // Vérification RBAC
    const user = await assertCan('bien:create')

    // 1. Récupérer le profil complet de l'utilisateur avec son organisation éventuelle
    const [userProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)

    const orgId = userProfile?.organizationId

    let orgData: AdvertiserDashboardData['organization'] = null
    let isGerant = false
    let membersList: AdvertiserDashboardData['members'] = []

    if (orgId) {
      const [foundOrg] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, orgId))
        .limit(1)

      if (foundOrg) {
        orgData = {
          id: foundOrg.id,
          name: foundOrg.name,
          type: foundOrg.type as 'agence' | 'promoteur',
          rccm: foundOrg.rccm,
          ncc: foundOrg.ncc,
          agrementNumero: foundOrg.agrementNumero,
          logoUrl: foundOrg.logoUrl,
          telephone: foundOrg.telephone,
          whatsapp: foundOrg.whatsapp,
          commune: foundOrg.commune,
          verifiedAt: foundOrg.verifiedAt,
        }

        // Vérifier si gérant
        const [membership] = await db
          .select()
          .from(organizationMembers)
          .where(and(eq(organizationMembers.organizationId, orgId), eq(organizationMembers.userId, user.id)))
          .limit(1)

        isGerant = membership?.roleInOrg === 'gerant' || user.role === 'admin' || user.role === 'super_admin'

        // Récupérer les membres de l'organisation
        const rawMembers = await db
          .select({
            id: organizationMembers.id,
            userId: organizationMembers.userId,
            fullName: profiles.fullName,
            email: profiles.email,
            roleInOrg: organizationMembers.roleInOrg,
            assignedAt: organizationMembers.assignedAt,
          })
          .from(organizationMembers)
          .innerJoin(profiles, eq(organizationMembers.userId, profiles.id))
          .where(eq(organizationMembers.organizationId, orgId))

        membersList = rawMembers
      }
    }

    // 2. Récupérer les biens appartenant à l'utilisateur ou à son organisation
    const conditions = orgId
      ? or(eq(biens.ownerId, user.id), eq(biens.organizationId, orgId))
      : eq(biens.ownerId, user.id)

    const mesBiens = await db
      .select()
      .from(biens)
      .where(and(conditions, isNull(biens.deletedAt)))
      .orderBy(desc(biens.createdAt))

    const totalBiens = mesBiens.length
    const biensValides = mesBiens.filter((b) => b.statutModeration === 'valide').length
    const biensEnAttente = mesBiens.filter((b) => b.statutModeration === 'en_attente').length
    const biensRejetes = mesBiens.filter((b) => b.statutModeration === 'rejete').length
    const totalVues = mesBiens.reduce((acc, curr) => acc + (curr.vues || 0), 0)

    // 3. Récupérer les candidatures / réservations sur ces biens
    const mesBiensIds = mesBiens.map((b) => b.id)
    let candidaturesList: AdvertiserDashboardData['candidatures'] = []

    if (mesBiensIds.length > 0) {
      const rawReservations = await db
        .select({
          id: reservations.id,
          bienId: reservations.bienId,
          clientId: reservations.clientId,
          statut: reservations.statut,
          dateExpiration: reservations.dateExpiration,
          clientNom: profiles.fullName,
          clientEmail: profiles.email,
          clientPhone: profiles.phone,
        })
        .from(reservations)
        .innerJoin(profiles, eq(reservations.clientId, profiles.id))
        .where(inArray(reservations.bienId, mesBiensIds))
        .orderBy(desc(reservations.dateExpiration))

      // Récupérer les dossiers candidats des clients ayant postulé
      const clientIds = [...new Set(rawReservations.map((r) => r.clientId))]
      const dossiersMap = new Map<string, any>()

      if (clientIds.length > 0) {
        const dossiers = await db
          .select()
          .from(dossiersCandidats)
          .where(inArray(dossiersCandidats.userId, clientIds))

        dossiers.forEach((d) => dossiersMap.set(d.userId, d))
      }

      candidaturesList = rawReservations.map((r) => {
        const bienAssocie = mesBiens.find((b) => b.id === r.bienId)
        const d = dossiersMap.get(r.clientId)
        return {
          id: r.id,
          bienId: r.bienId,
          bienTitre: bienAssocie?.titre || 'Bien immobilier',
          bienSlug: bienAssocie?.slug || '',
          clientNom: r.clientNom || 'Client Anonyme',
          clientEmail: r.clientEmail || '',
          clientPhone: r.clientPhone,
          statutReservation: r.statut,
          dateReservation: r.dateExpiration,
          dossier: d
            ? {
                typeProjet: d.typeProjet,
                profession: d.profession,
                employeur: d.employeur,
                revenuMensuel: d.revenuMensuel,
                statut: d.statut,
                completude: 80, // Score calculé
              }
            : null,
        }
      })
    }

    const reservationsActives = candidaturesList.filter(
      (c) => c.statutReservation === 'en_attente' || c.statutReservation === 'confirme'
    ).length

    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: userProfile?.fullName,
        },
        organization: orgData,
        isGerant,
        members: membersList,
        kpis: {
          totalBiens,
          biensValides,
          biensEnAttente,
          biensRejetes,
          totalVues,
          totalCandidatures: candidaturesList.length,
          reservationsActives,
        },
        biens: mesBiens.map((b) => ({
          id: b.id,
          slug: b.slug,
          titre: b.titre,
          prix: b.prix,
          transaction: b.transaction,
          type: b.type,
          statut: b.statut,
          statutModeration: b.statutModeration,
          motifRejet: b.motifRejet,
          typeTitrePropriete: b.typeTitrePropriete,
          ville: b.ville,
          quartier: b.quartier,
          vues: b.vues,
          mainImageUrl: b.mainImageUrl,
          createdAt: b.createdAt,
        })),
        candidatures: candidaturesList,
      },
    }
  } catch (err: any) {
    return { error: err.message || 'Impossible de charger le tableau de bord annonceur.' }
  }
}

export async function inviterMembreOrganisationAction(formData: z.infer<typeof InviterMembreSchema>) {
  try {
    const parsed = InviterMembreSchema.parse(formData)
    const user = await assertCan('bien:create')

    const [userProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)

    const orgId = userProfile?.organizationId
    if (!orgId) {
      return { error: 'Vous devez appartenir à une organisation pour inviter des collaborateurs.' }
    }

    // Trouver le compte par email
    const [targetProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, parsed.email))
      .limit(1)

    if (!targetProfile) {
      return {
        error: `Aucun compte utilisateur trouvé avec l e-mail ${parsed.email}. Veuillez demander à votre collaborateur de créer son compte au préalable.`,
      }
    }

    // Rattacher à l'organisation
    await db
      .insert(organizationMembers)
      .values({
        organizationId: orgId,
        userId: targetProfile.id,
        roleInOrg: parsed.roleInOrg,
      })
      .onConflictDoUpdate({
        target: [organizationMembers.organizationId, organizationMembers.userId],
        set: { roleInOrg: parsed.roleInOrg },
      })

    // Mettre à jour profiles.organization_id
    await db
      .update(profiles)
      .set({ organizationId: orgId })
      .where(eq(profiles.id, targetProfile.id))

    return { success: true, message: `Collaborateur ${targetProfile.fullName || parsed.email} rattaché avec succès.` }
  } catch (err: any) {
    return { error: err.message || 'Erreur lors du rattachement du collaborateur.' }
  }
}

