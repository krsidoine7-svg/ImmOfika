'use server'

import { db } from "@/lib/db/index"
import { visites, profiles, biens, agentCalendriers, agentIndisponibilites } from "@/lib/db/schema"
import { eq, and, isNull, desc, count, between, or, inArray } from "drizzle-orm"
import { requirePermission } from "@/lib/auth/permissions"
import { revalidatePath } from "next/cache"
import { z } from 'zod'

const visiteSchema = z.object({
  leadId: z.string().optional().nullable(),
  clientId: z.string().uuid("Client invalide").optional().nullable(),
  bienId: z.string().uuid("Bien immobilier requis"),
  agentId: z.string().uuid("Agent requis").optional().nullable(),
  dateVisite: z.string().min(1, "Date de visite requise"),
  statut: z.enum(['planifiee', 'confirmee', 'effectuee', 'annulee', 'client_absent']).default('planifiee'),
  commentaires: z.string().optional().nullable(),
})

const modifyVisiteSchema = visiteSchema.partial().extend({
  id: z.string().uuid("ID de visite requis"),
})

// 1. Créer une visite
export async function creerVisiteAction(input: z.infer<typeof visiteSchema>) {
  await requirePermission('manage:visites')

  const parsed = visiteSchema.safeParse(input)
  if (!parsed.success) {
    return {
      error: 'Données invalides : ' + parsed.error.issues.map(i => i.message).join(', ')
    }
  }

  const { clientId, bienId, agentId, dateVisite, statut, commentaires } = parsed.data

  try {
    const formattedDate = new Date(dateVisite)
    
    // Insérer la visite
    const [inserted] = await db
      .insert(visites)
      .values({
        clientId: clientId || null,
        bienId,
        agentId: agentId || null,
        dateVisite: formattedDate,
        statut,
        commentaires: commentaires || null,
      })
      .returning()

    if (!inserted) {
      return { error: "Erreur lors de la planification de la visite." }
    }

    // Récupérer les détails du bien pour le journal
    const [bien] = await db
      .select({ titre: biens.titre })
      .from(biens)
      .where(eq(biens.id, bienId))
      .limit(1)
    const bienTitre = bien?.titre || "le bien"

    // Envoyer les notifications (in-app pour l'agent, email pour le client)
    try {
      let clientEmail = ""
      let clientName = "Client"

      if (clientId) {
        const [profile] = await db
          .select({ fullName: profiles.fullName, email: profiles.email })
          .from(profiles)
          .where(eq(profiles.id, clientId))
          .limit(1)
        if (profile) {
          clientEmail = profile.email || ""
          clientName = profile.fullName || "Client"
        }
      }

      let agentName = "Non assigné"
      if (agentId) {
        const [agent] = await db
          .select({ fullName: profiles.fullName })
          .from(profiles)
          .where(eq(profiles.id, agentId))
          .limit(1)
        if (agent) {
          agentName = agent.fullName || "Non assigné"
        }
      }

      const { notifierEvenementAction } = await import("@/lib/notifications/service")
      await notifierEvenementAction('VISITE_PLANIFIEE', {
        clientEmail: clientEmail || null,
        clientName,
        agentName,
        bienTitre,
        dateVisite: formattedDate.toISOString(),
      })
    } catch (notifErr) {
      console.error("Erreur d'envoi de notification (non bloquante):", notifErr)
    }

    revalidatePath('/admin/visites')
    return { success: true, visite: inserted, visiteId: inserted.id }
  } catch (err: any) {
    console.error("Erreur creerVisiteAction:", err)
    return { error: err.message || "Impossible de planifier la visite." }
  }
}

// 2. Modifier une visite
export async function modifierVisiteAction(input: z.infer<typeof modifyVisiteSchema>) {
  await requirePermission('manage:visites')

  const parsed = modifyVisiteSchema.safeParse(input)
  if (!parsed.success) {
    return {
      error: 'Données invalides : ' + parsed.error.issues.map(i => i.message).join(', ')
    }
  }

  const { id, clientId, bienId, agentId, dateVisite, statut, commentaires } = parsed.data

  try {
    const [current] = await db
      .select()
      .from(visites)
      .where(eq(visites.id, id))
      .limit(1)

    if (!current) {
      return { error: "Visite introuvable." }
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    }
    if (bienId !== undefined) updateData.bienId = bienId
    if (agentId !== undefined) updateData.agentId = agentId || null
    if (dateVisite !== undefined) updateData.dateVisite = new Date(dateVisite)
    if (statut !== undefined) updateData.statut = statut
    if (commentaires !== undefined) updateData.commentaires = commentaires || null
    if (clientId !== undefined) updateData.clientId = clientId || null

    await db
      .update(visites)
      .set(updateData)
      .where(eq(visites.id, id))

    // Déclencher le service de notifications si clôture
    if (statut && ['effectuee', 'annulee', 'client_absent'].includes(statut)) {
      try {
        let clientName = "Client"
        const finalClientId = clientId !== undefined ? clientId : current.clientId
        const finalBienId = bienId !== undefined ? bienId : current.bienId

        if (finalClientId) {
          const [profile] = await db
            .select({ fullName: profiles.fullName })
            .from(profiles)
            .where(eq(profiles.id, finalClientId))
            .limit(1)
          if (profile) clientName = profile.fullName || "Client"
        }

        const [bien] = await db
          .select({ titre: biens.titre })
          .from(biens)
          .where(eq(biens.id, finalBienId))
          .limit(1)
        const bienTitre = bien?.titre || "le bien"

        const { notifierEvenementAction } = await import("@/lib/notifications/service")
        await notifierEvenementAction('VISITE_CLOTUREE', {
          clientName,
          bienTitre,
          statut
        })
      } catch (notifErr) {
        console.error("Erreur notification cloture visite:", notifErr)
      }
    }

    revalidatePath('/admin/visites')
    return { success: true }
  } catch (err: any) {
    console.error("Erreur modification visite:", err)
    return { error: err.message || "Erreur lors de la mise à jour." }
  }
}

// 3. Supprimer une visite (Soft delete)
export async function supprimerVisiteAction(id: string) {
  await requirePermission('manage:visites')

  if (!id) return { error: "ID de visite requis." }

  try {
    await db
      .update(visites)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(visites.id, id))

    revalidatePath('/admin/visites')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || "Erreur lors de la suppression." }
  }
}

// 4. Récupérer les visites avec filtres
export async function getVisitesAction(filters: {
  agentId?: string
  statut?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}) {
  await requirePermission('view:visites')

  try {
    const results = await db
      .select({
        id: visites.id,
        clientId: visites.clientId,
        bienId: visites.bienId,
        agentId: visites.agentId,
        dateVisite: visites.dateVisite,
        statut: visites.statut,
        commentaires: visites.commentaires,
        createdAt: visites.createdAt,
        bienTitre: biens.titre,
        bienVille: biens.ville,
        agentName: profiles.fullName,
        clientName: profiles.fullName,
        profilePhone: profiles.phone,
      })
      .from(visites)
      .innerJoin(biens, eq(visites.bienId, biens.id))
      .leftJoin(profiles, eq(visites.agentId, profiles.id))
      .where(isNull(visites.deletedAt))
      .orderBy(desc(visites.dateVisite))

    const filtered = results.filter(row => {
      if (filters.agentId && row.agentId !== filters.agentId) return false
      if (filters.statut && row.statut !== filters.statut) return false
      if (filters.dateFrom && new Date(row.dateVisite) < new Date(filters.dateFrom)) return false
      if (filters.dateTo && new Date(row.dateVisite) > new Date(filters.dateTo)) return false

      if (filters.search) {
        const s = filters.search.toLowerCase()
        const clientName = row.clientName?.toLowerCase() || ''
        const phone = row.profilePhone || ''
        const property = row.bienTitre.toLowerCase()
        if (!clientName.includes(s) && !phone.includes(s) && !property.includes(s)) {
          return false
        }
      }

      return true
    })

    return { success: true, visites: filtered }
  } catch (err: any) {
    console.error("Erreur getVisites:", err)
    return { error: err.message || "Erreur de chargement des visites." }
  }
}

// 5. Visites pour compatibilité
export async function getLeadVisitesAction(_leadId: string) {
  return { success: true, visites: [] }
}

// 6. Impact de la visite
export async function getVisiteImpactAction(_visiteId: string) {
  return { success: true, impact: null, leadImpactInfo: null }
}

// 7. Changer le statut d'une visite
export async function changerStatutVisiteAction(id: string, statut: 'planifiee' | 'confirmee' | 'effectuee' | 'annulee' | 'client_absent') {
  return modifierVisiteAction({ id, statut })
}

// 8. Visites de l'agenda de l'agent
export async function getAgentVisitesCalendrierAction(agentId?: string) {
  await requirePermission('view:visites')

  try {
    const conditions = [isNull(visites.deletedAt)]
    if (agentId) {
      conditions.push(eq(visites.agentId, agentId))
    }

    const rows = await db
      .select({
        id: visites.id,
        dateVisite: visites.dateVisite,
        plageHoraire: visites.plageHoraire,
        statut: visites.statut,
        commentaires: visites.commentaires,
        bienTitre: biens.titre,
        bienVille: biens.ville,
        clientName: profiles.fullName,
      })
      .from(visites)
      .innerJoin(biens, eq(visites.bienId, biens.id))
      .leftJoin(profiles, eq(visites.clientId, profiles.id))
      .where(and(...conditions))
      .orderBy(visites.dateVisite)

    return { success: true, visites: rows }
  } catch (err: any) {
    return { error: err.message || "Impossible de récupérer les créneaux d'agenda." }
  }
}

// 9. Demande publique de visite (Prise de rendez-vous directe)
export async function demanderVisitePubliqueAction(input: {
  bienId: string
  dateVisite: string
  nom?: string
  prenom?: string
  email?: string
  telephone: string
  commentaires?: string
}) {
  const { bienId, dateVisite, nom, prenom, email, telephone, commentaires } = input

  try {
    const formattedDate = new Date(dateVisite)

    // Vérifier l'existence du bien
    const [bien] = await db
      .select({ titre: biens.titre, agentId: biens.agentId })
      .from(biens)
      .where(eq(biens.id, bienId))
      .limit(1)

    if (!bien) {
      return { error: "Bien immobilier introuvable." }
    }
    const bienTitre = bien.titre

    const { createClient } = await import('@/utils/supabase/server')
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    let clientId: string | null = null
    let clientEmail = email || ""
    let clientName = `${prenom || ''} ${nom || ''}`.trim() || "Visiteur"

    if (user) {
      clientId = user.id
      const [profile] = await db
        .select({ fullName: profiles.fullName, email: profiles.email })
        .from(profiles)
        .where(eq(profiles.id, user.id))
        .limit(1)
      if (profile) {
        clientEmail = profile.email || clientEmail
        clientName = profile.fullName || clientName
      }
    }

    const noteCommentaire = `Demandeur: ${clientName} (Tél: ${telephone}${clientEmail ? ', Email: ' + clientEmail : ''})${commentaires ? ' — ' + commentaires : ''}`

    const [inserted] = await db
      .insert(visites)
      .values({
        clientId: clientId || null,
        bienId,
        agentId: bien.agentId || null,
        dateVisite: formattedDate,
        statut: 'planifiee',
        commentaires: noteCommentaire,
      })
      .returning()

    if (!inserted) {
      return { error: "Erreur lors de l'enregistrement de la visite." }
    }

    // Notifications
    try {
      const { notifierEvenementAction } = await import("@/lib/notifications/service")
      await notifierEvenementAction('VISITE_PLANIFIEE', {
        clientEmail: clientEmail || null,
        clientName,
        bienTitre,
        dateVisite: formattedDate.toISOString(),
      })
    } catch (notifErr) {
      console.error("Erreur notification visite publique:", notifErr)
    }

    revalidatePath('/admin/visites')
    return { success: true, visiteId: inserted.id }
  } catch (err: any) {
    console.error("Erreur demanderVisitePubliqueAction:", err)
    return { error: err.message || "Une erreur technique est survenue." }
  }
}

// Fonctions de compatibilité pour la prise de rendez-vous client
export async function getBiensDisponiblesAction() {
  try {
    const rows = await db
      .select({
        id: biens.id,
        titre: biens.titre,
        slug: biens.slug,
        ville: biens.ville,
        quartier: biens.quartier,
        prix: biens.prix,
        type: biens.type,
        mainImageUrl: biens.mainImageUrl,
      })
      .from(biens)
      .where(and(isNull(biens.deletedAt), eq(biens.statut, 'disponible')))
      .orderBy(desc(biens.createdAt))
    return { success: true, biens: rows }
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur de chargement des biens." }
  }
}

export async function planifierVisiteAutonomeAction(input: any) {
  return demanderVisitePubliqueAction(input)
}
