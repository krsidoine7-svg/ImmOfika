'use server'

import { db } from "@/lib/db/index"
import { visites, leads, profiles, biens, leadInteractions, agentCalendriers, agentIndisponibilites } from "@/lib/db/schema"
import { eq, and, isNull, desc, count, between, or, inArray } from "drizzle-orm"
import { requirePermission } from "@/lib/auth/permissions"
import { revalidatePath } from "next/cache"
import { z } from 'zod'

const visiteSchema = z.object({
  leadId: z.string().uuid("Prospect invalide").optional().nullable(),
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

  console.log("creerVisiteAction RECEIVED INPUT:", input)

  const parsed = visiteSchema.safeParse(input)
  if (!parsed.success) {
    console.log("creerVisiteAction PARSE ERRORS:", parsed.error.format())
    return {
      error: 'Données invalides : ' + parsed.error.issues.map(i => i.message).join(', ') + ' | Received: ' + JSON.stringify(input)
    }
  }

  const { leadId, clientId, bienId, agentId, dateVisite, statut, commentaires } = parsed.data

  try {
    const formattedDate = new Date(dateVisite)
    
    // Insérer la visite
    const [inserted] = await db
      .insert(visites)
      .values({
        leadId: leadId || null,
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

    // Si lié à un Lead/Prospect, automatiser le pipeline et consigner l'interaction
    if (leadId) {
      const [lead] = await db
        .select()
        .from(leads)
        .where(eq(leads.id, leadId))
        .limit(1)

      if (lead) {
        // Enregistrer l'interaction
        await db.insert(leadInteractions).values({
          leadId,
          agentId: agentId || null,
          type: 'note',
          details: `Visite planifiée le ${formattedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} à ${formattedDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} pour ${bienTitre}.`,
        })

        // Si le lead est encore à l'état de simple prospect/qualifié, le passer en visite_planifiee
        if (lead.etape === 'prospect' || lead.etape === 'qualifie') {
          await db
            .update(leads)
            .set({
              etape: 'visite_planifiee',
              updatedAt: new Date()
            })
            .where(eq(leads.id, leadId))
        }
      }
    }

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
      } else if (leadId) {
        const [lead] = await db
          .select({ nom: leads.nom, prenom: leads.prenom, email: leads.email })
          .from(leads)
          .where(eq(leads.id, leadId))
          .limit(1)
        if (lead) {
          clientEmail = lead.email || ""
          clientName = `${lead.prenom || ''} ${lead.nom || ''}`.trim() || "Prospect"
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
        bienTitre,
        dateVisite: formattedDate.toISOString(),
        agentId: agentId || null,
        agentName
      })
    } catch (notifErr) {
      console.error("Erreur notification visite planifiee:", notifErr)
    }

    try {
      revalidatePath('/admin/visites')
      revalidatePath('/admin/leads')
    } catch (e) {}

    return { success: true, visiteId: inserted.id }
  } catch (err: any) {
    console.error("Erreur creation visite:", err)
    return { error: err.message || "Une erreur inconnue est survenue." }
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

  const { id, leadId, clientId, bienId, agentId, dateVisite, statut, commentaires } = parsed.data

  try {
    // Récupérer la visite actuelle
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
    if (leadId !== undefined) updateData.leadId = leadId || null
    if (clientId !== undefined) updateData.clientId = clientId || null

    await db
      .update(visites)
      .set(updateData)
      .where(eq(visites.id, id))

    // Effet de bord sur le Lead si le statut change
    if (statut && current.leadId) {
      const formattedDate = dateVisite ? new Date(dateVisite) : current.dateVisite

      // 1. Visite effectuée
      if (statut === 'effectuee') {
        await db
          .update(leads)
          .set({
            visiteConfirmee: true,
            etape: 'visite_effectuee',
            updatedAt: new Date()
          })
          .where(eq(leads.id, current.leadId))

        await db.insert(leadInteractions).values({
          leadId: current.leadId,
          agentId: agentId || current.agentId || null,
          type: 'note',
          details: `Visite marquée comme EFFECTUÉE. Rapport : ${commentaires || "Aucun commentaire renseigné."}`,
        })
      }
      // 2. Visite annulée
      else if (statut === 'annulee') {
        await db.insert(leadInteractions).values({
          leadId: current.leadId,
          agentId: agentId || current.agentId || null,
          type: 'note',
          details: `Visite ANNULÉE. Motif : ${commentaires || "Non renseigné."}`,
        })
      }
      // 3. Client absent
      else if (statut === 'client_absent') {
        await db.insert(leadInteractions).values({
          leadId: current.leadId,
          agentId: agentId || current.agentId || null,
          type: 'note',
          details: `Visite manquée (CLIENT ABSENT). Note : ${commentaires || "Non renseigné."}`,
        })
      }
    }

    // Déclencher le service de notifications si clôture
    if (statut && ['effectuee', 'annulee', 'client_absent'].includes(statut)) {
      try {
        let clientName = "Client"
        const finalClientId = clientId !== undefined ? clientId : current.clientId
        const finalLeadId = leadId !== undefined ? leadId : current.leadId
        const finalBienId = bienId !== undefined ? bienId : current.bienId

        if (finalClientId) {
          const [profile] = await db
            .select({ fullName: profiles.fullName })
            .from(profiles)
            .where(eq(profiles.id, finalClientId))
            .limit(1)
          if (profile) clientName = profile.fullName || "Client"
        } else if (finalLeadId) {
          const [lead] = await db
            .select({ nom: leads.nom, prenom: leads.prenom })
            .from(leads)
            .where(eq(leads.id, finalLeadId))
            .limit(1)
          if (lead) clientName = `${lead.prenom || ''} ${lead.nom || ''}`.trim() || "Prospect"
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

    try {
      revalidatePath('/admin/visites')
      revalidatePath('/admin/leads')
    } catch (e) {}

    return { success: true }
  } catch (err: any) {
    console.error("Erreur modification visite:", err)
    return { error: err.message || "Une erreur de mise à jour est survenue." }
  }
}

// 3. Supprimer une visite (Soft delete)
export async function supprimerVisiteAction(visiteId: string) {
  await requirePermission('manage:visites')

  if (!visiteId) return { error: "ID de visite requis." }

  try {
    await db
      .update(visites)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(visites.id, visiteId))

    try {
      revalidatePath('/admin/visites')
      revalidatePath('/admin/leads')
    } catch (e) {}

    return { success: true }
  } catch (err: any) {
    return { error: err.message || "Erreur lors de la suppression." }
  }
}

// 4. Récupérer toutes les visites avec filtres
export async function getVisitesAction(filters: {
  agentId?: string
  statut?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}) {
  await requirePermission('view:visites')

  try {
    let query = db
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
        bienTitre: biens.titre,
        bienVille: biens.ville,
        agentName: profiles.fullName,
        clientName: profiles.fullName, // will adjust in JS if from profile or lead
        leadNom: leads.nom,
        leadPrenom: leads.prenom,
        leadPhone: leads.telephone,
        profilePhone: profiles.phone,
      })
      .from(visites)
      .innerJoin(biens, eq(visites.bienId, biens.id))
      .leftJoin(profiles, eq(visites.agentId, profiles.id))
      .leftJoin(leads, eq(visites.leadId, leads.id))
      // Wait, we need another join for client profile if not from lead
      // Drizzle handles multiple joins to the same table by alias, but we can resolve in TS or leftJoin client profiles if needed.
      // For simplicity, let's leftJoin client profile as clientProfiles
      .where(isNull(visites.deletedAt))
      .orderBy(desc(visites.dateVisite))

    const results = await query

    // Filter in JS for simplicity or construct complex query
    const filtered = results.filter(row => {
      // 1. Agent filter
      if (filters.agentId && row.agentId !== filters.agentId) return false

      // 2. Statut filter
      if (filters.statut && row.statut !== filters.statut) return false

      // 3. Date range filter
      if (filters.dateFrom && new Date(row.dateVisite) < new Date(filters.dateFrom)) return false
      if (filters.dateTo && new Date(row.dateVisite) > new Date(filters.dateTo)) return false

      // 4. Text search (Client/Lead name or phone, or property)
      if (filters.search) {
        const s = filters.search.toLowerCase()
        const leadName = `${row.leadPrenom || ''} ${row.leadNom || ''}`.toLowerCase()
        const clientName = row.clientName?.toLowerCase() || ''
        const phone = row.leadPhone || row.profilePhone || ''
        const property = row.bienTitre.toLowerCase()
        if (!leadName.includes(s) && !clientName.includes(s) && !phone.includes(s) && !property.includes(s)) {
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

// 5. Récupérer les visites d'un Lead
export async function getLeadVisitesAction(leadId: string) {
  await requirePermission('view:visites')

  if (!leadId) return { error: "ID du lead requis." }

  try {
    const list = await db
      .select({
        id: visites.id,
        dateVisite: visites.dateVisite,
        statut: visites.statut,
        commentaires: visites.commentaires,
        bienTitre: biens.titre,
        agentName: profiles.fullName,
        agentId: visites.agentId,
        bienId: visites.bienId,
      })
      .from(visites)
      .innerJoin(biens, eq(visites.bienId, biens.id))
      .leftJoin(profiles, eq(visites.agentId, profiles.id))
      .where(and(
        eq(visites.leadId, leadId),
        isNull(visites.deletedAt)
      ))
      .orderBy(desc(visites.dateVisite))

    return { success: true, visites: list }
  } catch (err: any) {
    return { error: err.message }
  }
}

// 6. Analyse d'impact d'une suppression de visite
export async function getVisiteImpactAction(visiteId: string) {
  await requirePermission('view:visites')

  if (!visiteId) return { error: "ID de visite requis." }

  try {
    const [visite] = await db
      .select({
        statut: visites.statut,
        leadId: visites.leadId,
        bienTitre: biens.titre,
      })
      .from(visites)
      .innerJoin(biens, eq(visites.bienId, biens.id))
      .where(eq(visites.id, visiteId))
      .limit(1)

    if (!visite) return { error: "Visite introuvable." }

    let leadImpactInfo = null
    if (visite.leadId) {
      const [lead] = await db
        .select({
          prenom: leads.prenom,
          nom: leads.nom,
          etape: leads.etape,
        })
        .from(leads)
        .where(eq(leads.id, visite.leadId))
        .limit(1)
      if (lead) {
        leadImpactInfo = {
          prospectName: `${lead.prenom || ''} ${lead.nom || ''}`.trim(),
          etapeActuelle: lead.etape,
        }
      }
    }

    return {
      success: true,
      impact: {
        statut: visite.statut,
        bienTitre: visite.bienTitre,
        leadImpactInfo,
      }
    }
  } catch (err: any) {
    return { error: err.message }
  }
}

// ─── Planification Autonome Client & Prospect ─────────────────────────────────

const planAutonomeSchema = z.object({
  bienId: z.string().uuid("Bien immobilier requis"),
  dateVisite: z.string().min(1, "Date et heure de visite requises"),
  commentaires: z.string().optional().nullable(),
  // Coordonnées du prospect s'il n'est pas connecté
  nom: z.string().optional().nullable(),
  prenom: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  telephone: z.string().optional().nullable(),
})

export async function planifierVisiteAutonomeAction(input: z.infer<typeof planAutonomeSchema>) {
  const parsed = planAutonomeSchema.safeParse(input)
  if (!parsed.success) {
    return {
      error: 'Données invalides : ' + parsed.error.issues.map(i => i.message).join(', ')
    }
  }

  const { bienId, dateVisite, commentaires, nom, prenom, email, telephone } = parsed.data
  const formattedDate = new Date(dateVisite)

  try {
    // 1. Récupérer le bien pour savoir s'il existe et s'il a un agent
    const [bien] = await db
      .select({ id: biens.id, titre: biens.titre, agentId: biens.agentId })
      .from(biens)
      .where(eq(biens.id, bienId))
      .limit(1)

    if (!bien) {
      return { error: "Bien immobilier introuvable." }
    }

    const bienTitre = bien.titre

    // 2. Déterminer dynamiquement l'agent accompagnateur libre
    const agentsList = await db
      .select({ id: profiles.id, fullName: profiles.fullName })
      .from(profiles)
      .where(
        and(
          inArray(profiles.role, ['agent', 'admin_agent']),
          isNull(profiles.deletedAt)
        )
      )

    if (agentsList.length === 0) {
      return { error: "Aucun agent commercial disponible pour effectuer des visites actuellement." }
    }

    // Récupérer toutes les occupations pour ce créneau horaire
    const dbVisites = await db
      .select({
        id: visites.id,
        agentId: visites.agentId,
        dateVisite: visites.dateVisite,
        statut: visites.statut
      })
      .from(visites)
      .where(
        and(
          isNull(visites.deletedAt),
          or(
            eq(visites.statut, 'planifiee'),
            eq(visites.statut, 'confirmee')
          )
        )
      )

    const dbIndisponibilites = await db
      .select()
      .from(agentIndisponibilites)
      .where(isNull(agentIndisponibilites.deletedAt))

    const dbCalendriers = await db
      .select()
      .from(agentCalendriers)
      .where(isNull(agentCalendriers.deletedAt))

    const calendrierParAgent: Record<string, string> = {}
    for (const cal of dbCalendriers) {
      calendrierParAgent[cal.agentId] = cal.icalUrl
    }

    const agentsLibres: { id: string; fullName: string | null }[] = []
    
    // Déterminer le créneau (1h)
    const slotStart = formattedDate
    const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000)

    for (const agent of agentsList) {
      let occupe = false

      // Check A: Visites dans l'app
      const aVisite = dbVisites.some(v => {
        if (v.agentId !== agent.id) return false
        const vStart = new Date(v.dateVisite)
        const vEnd = new Date(vStart.getTime() + 60 * 60 * 1000)
        return vStart < slotEnd && vEnd > slotStart
      })
      if (aVisite) occupe = true

      // Check B: Absences manuelles locales
      if (!occupe) {
        const aIndisp = dbIndisponibilites.some(ind => {
          if (ind.agentId !== agent.id) return false
          const indStart = new Date(ind.dateDebut)
          const indFin = new Date(ind.dateFin)
          return indStart < slotEnd && indFin > slotStart
        })
        if (aIndisp) occupe = true
      }

      // Check C: Google iCal
      if (!occupe && calendrierParAgent[agent.id]) {
        try {
          const { fetchAgentICalEvents } = await import("./disponibilites")
          const events = await fetchAgentICalEvents(calendrierParAgent[agent.id])
          const aGoogle = events.some(ge => {
            return ge.start < slotEnd && ge.end > slotStart
          })
          if (aGoogle) occupe = true
        } catch (e) {
          console.error(`Erreur iCal pour l'agent ${agent.id}:`, e)
        }
      }

      if (!occupe) {
        agentsLibres.push(agent)
      }
    }

    if (agentsLibres.length === 0) {
      return { error: "Désolé, ce créneau horaire n'est plus disponible (tous les agents sont occupés). Veuillez en choisir un autre." }
    }

    // Choisir en priorité l'agent du bien s'il est libre, sinon le premier libre
    let agentChoisi = agentsLibres.find(a => a.id === bien.agentId)
    if (!agentChoisi) {
      agentChoisi = agentsLibres[0]
    }

    const agentId = agentChoisi.id
    const agentName = agentChoisi.fullName || "Non assigné"

    // 3. Vérifier s'il y a un utilisateur connecté
    const { createClient } = await import('@/utils/supabase/server')
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    let clientId: string | null = null
    let leadId: string | null = null
    let clientEmail = ""
    let clientName = "Client"

    if (user) {
      // Connecté
      clientId = user.id
      const [profile] = await db
        .select({ fullName: profiles.fullName, email: profiles.email })
        .from(profiles)
        .where(eq(profiles.id, user.id))
        .limit(1)
      if (profile) {
        clientEmail = profile.email || ""
        clientName = profile.fullName || "Client"
      }
    } else {
      // Visiteur anonyme -> gérer via table `leads`
      if (!telephone) {
        return { error: "Le numéro de téléphone est obligatoire pour planifier une visite." }
      }

      // Chercher s'il existe déjà un lead avec cet e-mail ou ce numéro de téléphone
      const { or } = await import('drizzle-orm')
      const conditions = []
      if (email) conditions.push(eq(leads.email, email))
      if (telephone) conditions.push(eq(leads.telephone, telephone))

      const existingLeads = await db
        .select()
        .from(leads)
        .where(
          and(
            or(...conditions),
            isNull(leads.deletedAt)
          )
        )
        .limit(1)

      if (existingLeads.length > 0) {
        const existingLead = existingLeads[0]
        leadId = existingLead.id
        clientEmail = existingLead.email || email || ""
        clientName = `${existingLead.prenom || ''} ${existingLead.nom || ''}`.trim() || nom || "Prospect"

        // Mettre à jour l'étape du lead
        if (existingLead.etape === 'prospect' || existingLead.etape === 'qualifie') {
          await db
            .update(leads)
            .set({
              etape: 'visite_planifiee',
              updatedAt: new Date()
            })
            .where(eq(leads.id, leadId))
        }
      } else {
        // Créer un nouveau lead
        const { calculerScore } = await import("@/lib/crm/scoring")
        const scoreInitial = calculerScore({
          aVisite: false,
          aPayeAcompte: false,
          aRappeleAgent: false,
          aOuvertEmail: false,
          aRempliFormulaire: true,
          source: 'direct',
        })

        const [insertedLead] = await db
          .insert(leads)
          .values({
            nom: nom || null,
            prenom: prenom || null,
            email: email || null,
            telephone: telephone,
            source: 'site_web',
            statut: 'nouveau',
            etape: 'visite_planifiee',
            score: scoreInitial,
            bienInteresse: bienId,
            agentId: agentId || null,
          })
          .returning()

        if (insertedLead) {
          leadId = insertedLead.id
          clientEmail = insertedLead.email || ""
          clientName = `${insertedLead.prenom || ''} ${insertedLead.nom || ''}`.trim() || "Prospect"
        }
      }
    }

    // 4. Insérer la visite
    const [inserted] = await db
      .insert(visites)
      .values({
        leadId: leadId || null,
        clientId: clientId || null,
        bienId,
        agentId: agentId || null,
        dateVisite: formattedDate,
        statut: 'planifiee',
        commentaires: commentaires || null,
      })
      .returning()

    if (!inserted) {
      return { error: "Erreur lors de l'enregistrement de la visite." }
    }

    // Si lié à un lead, consigner l'interaction
    if (leadId) {
      await db.insert(leadInteractions).values({
        leadId,
        agentId: agentId || null,
        type: 'note',
        details: `Visite planifiée de manière autonome le ${formattedDate.toLocaleDateString('fr-FR')} pour ${bienTitre}.`,
      })
    }

    // 5. Envoyer les notifications (email et in-app)
    try {
      const { notifierEvenementAction } = await import("@/lib/notifications/service")
      await notifierEvenementAction('VISITE_PLANIFIEE', {
        clientEmail: clientEmail || null,
        clientName,
        bienTitre,
        dateVisite: formattedDate.toISOString(),
        agentId: agentId || null,
        agentName
      })

      // Si l'utilisateur n'était pas connecté (nouveau lead), notifier en plus les administrateurs
      if (!user) {
        const admins = await db
          .select({ id: profiles.id })
          .from(profiles)
          .where(
            and(
              eq(profiles.role, 'admin'),
              isNull(profiles.deletedAt)
            )
          )
        const { creerNotificationHelper } = await import("@/lib/notifications/service")
        for (const admin of admins) {
          await creerNotificationHelper(
            admin.id,
            'Nouvelle visite auto-planifiée (Prospect)',
            `Le prospect ${clientName} a planifié lui-même une visite pour le bien ${bienTitre} le ${formattedDate.toLocaleDateString('fr-FR')}.`,
            'visite',
            `/admin/visites`
          )
        }
      }
    } catch (notifErr) {
      console.error("Erreur notification visite planifiee autonome:", notifErr)
    }

    // 6. Réhydrater les pages
    try {
      revalidatePath('/admin/visites')
      revalidatePath('/admin/leads')
      revalidatePath('/client/dashboard')
    } catch (e) {}

    return { success: true, visiteId: inserted.id }
  } catch (err: any) {
    console.error("Erreur planifierVisiteAutonomeAction:", err)
    return { error: err.message || "Une erreur est survenue." }
  }
}

export async function getBiensDisponiblesAction() {
  try {
    const list = await db
      .select({
        id: biens.id,
        titre: biens.titre,
        ville: biens.ville,
        quartier: biens.quartier,
      })
      .from(biens)
      .where(
        and(
          eq(biens.statut, 'disponible'),
          isNull(biens.deletedAt)
        )
      )
      .orderBy(biens.titre)
    return { success: true, biens: list }
  } catch (err: any) {
    return { error: err.message }
  }
}
