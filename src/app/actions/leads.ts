'use server'

import { db } from "@/lib/db/index"
import { leads, profiles, biens, leadInteractions, reservations, paiements, visites } from "@/lib/db/schema"
import { eq, and, isNull, desc, count, or } from "drizzle-orm"
import { requirePermission } from "@/lib/auth/permissions"
import { revalidatePath } from "next/cache"
import { z } from 'zod'
import { calculerScore } from "@/lib/crm/scoring"
import { attribuerLeadAutomatiquement } from "@/lib/crm/attribution"
import { PIPELINE_ETAPES } from "@/constants/pipeline"

// Schema de validation des inputs pour la création de Lead
const leadSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères").optional().or(z.literal("")),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères").optional().or(z.literal("")),
  email: z.string().email("L'adresse e-mail n'est pas valide").optional().or(z.literal("")),
  telephone: z.string().min(8, "Le numéro de téléphone doit contenir au moins 8 caractères"),
  source: z.enum(['site_web', 'whatsapp', 'appel', 'reseaux_sociaux', 'referral']).default('site_web'),
  bienInteresse: z.string().uuid("Bien invalide").optional().or(z.literal("")),
  message: z.string().optional().or(z.literal("")),
})

// 1. Création publique d'un Lead (depuis le site web)
export async function creerLeadAction(input: z.infer<typeof leadSchema>) {
  const parsed = leadSchema.safeParse(input)
  
  if (!parsed.success) {
    return { 
      error: 'Données invalides : ' + parsed.error.issues.map(i => i.message).join(', ') 
    }
  }

  const { nom, prenom, email, telephone, source, bienInteresse, message } = parsed.data

  try {
    // Calcul du score initial du lead
    const scoreInitial = calculerScore({
      aVisite: false,
      aPayeAcompte: false,
      aRappeleAgent: false,
      aOuvertEmail: false,
      aRempliFormulaire: true,
      source: source === 'site_web' ? 'direct' : 'reseaux',
    })

    // Insertion du lead en base de données
    const [insertedLead] = await db
      .insert(leads)
      .values({
        nom: nom || null,
        prenom: prenom || null,
        email: email || null,
        telephone,
        source,
        statut: 'nouveau',
        score: scoreInitial,
        bienInteresse: bienInteresse || null,
        message: message || null,
      })
      .returning()

    if (!insertedLead) {
      return { error: "Erreur lors de la création du lead en base de données." }
    }

    // Attribution automatique par Round-Robin
    const agentId = await attribuerLeadAutomatiquement(insertedLead.id)

    // Déclencher les notifications
    try {
      const { notifierEvenementAction } = await import("@/lib/notifications/service")
      
      // Notifier du nouveau lead
      await notifierEvenementAction('NOUVEAU_LEAD', {
        prenom: insertedLead.prenom,
        nom: insertedLead.nom,
        source: insertedLead.source
      })

      // Si attribué à un agent, le notifier
      if (agentId) {
        await notifierEvenementAction('LEAD_ATTRIBUE', {
          leadId: insertedLead.id,
          agentId: agentId,
          leadName: `${insertedLead.prenom || ''} ${insertedLead.nom || ''}`.trim() || insertedLead.telephone
        })
      }
    } catch (notifErr) {
      console.error("Erreur notification lead:", notifErr)
    }

    try {
      revalidatePath('/admin/leads')
    } catch (e) {
      // Safe fallback if called outside active Next.js static generation context
    }

    return { 
      success: true, 
      leadId: insertedLead.id,
      agentId 
    }
  } catch (err: any) {
    console.error("Erreur creation lead:", err)
    return { error: err.message || "Une erreur inconnue est survenue." }
  }
}

// 2. Attribution manuelle d'un lead (Réservé aux admins/agents)
export async function attribuerLeadManuelAction(leadId: string, agentId: string | null) {
  await requirePermission('manage:leads')

  if (!leadId) return { error: "ID du lead requis." }

  try {
    // Récupérer les détails avant mise à jour pour la notification
    const [leadDetails] = await db
      .select({ prenom: leads.prenom, nom: leads.nom, telephone: leads.telephone })
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1)

    await db
      .update(leads)
      .set({
        agentId: agentId || null,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, leadId))

    if (agentId && leadDetails) {
      try {
        const { notifierEvenementAction } = await import("@/lib/notifications/service")
        await notifierEvenementAction('LEAD_ATTRIBUE', {
          leadId,
          agentId,
          leadName: `${leadDetails.prenom || ''} ${leadDetails.nom || ''}`.trim() || leadDetails.telephone
        })
      } catch (notifErr) {
        console.error("Erreur notification lead manuel:", notifErr)
      }
    }

    try {
      revalidatePath('/admin/leads')
    } catch (e) {}
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

// 3. Modification du statut d'un lead
export async function modifierStatutLeadAction(leadId: string, statut: string) {
  await requirePermission('manage:leads')

  if (!leadId || !statut) return { error: "Paramètres manquants." }

  try {
    await db
      .update(leads)
      .set({
        statut,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, leadId))

    try {
      revalidatePath('/admin/leads')
    } catch (e) {}
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

// 4. Suppression d'un lead (Soft Delete)
export async function supprimerLeadAction(leadId: string) {
  await requirePermission('manage:leads')

  if (!leadId) return { error: "ID du lead requis." }

  try {
    await db
      .update(leads)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(leads.id, leadId))

    try {
      revalidatePath('/admin/leads')
    } catch (e) {}
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

// 5. Création manuelle d'un lead par l'administration
export async function creerLeadManuelAction(input: z.infer<typeof leadSchema> & { agentId?: string }) {
  await requirePermission('manage:leads')
  
  const parsed = leadSchema.safeParse(input)
  if (!parsed.success) {
    return { 
      error: 'Données invalides : ' + parsed.error.issues.map(i => i.message).join(', ') 
    }
  }

  const { nom, prenom, email, telephone, source, bienInteresse, message } = parsed.data

  try {
    const scoreInitial = calculerScore({
      aVisite: false,
      aPayeAcompte: false,
      aRappeleAgent: false,
      aOuvertEmail: false,
      aRempliFormulaire: true,
      source: source === 'site_web' ? 'direct' : 'reseaux',
    })

    const [insertedLead] = await db
      .insert(leads)
      .values({
        nom: nom || null,
        prenom: prenom || null,
        email: email || null,
        telephone,
        source,
        statut: 'nouveau',
        score: scoreInitial,
        bienInteresse: bienInteresse || null,
        message: message || null,
        agentId: input.agentId || null,
      })
      .returning()

    try {
      revalidatePath('/admin/leads')
    } catch (e) {}
    return { success: true, leadId: insertedLead.id }
  } catch (err: any) {
    return { error: err.message }
  }
}

// 6. Gestion des Interactions de Leads
const interactionSchema = z.object({
  leadId: z.string().uuid("ID du lead invalide"),
  type: z.enum(['appel', 'email', 'whatsapp', 'note']),
  details: z.string().min(2, "Le compte-rendu doit contenir au moins 2 caractères"),
})

export async function creerLeadInteractionAction(input: z.infer<typeof interactionSchema>) {
  await requirePermission('manage:leads')

  const parsed = interactionSchema.safeParse(input)
  if (!parsed.success) {
    return { error: 'Données invalides : ' + parsed.error.issues.map(i => i.message).join(', ') }
  }

  const { leadId, type, details } = parsed.data

  try {
    const { cookies } = await import("next/headers")
    const { createClient } = await import("@/utils/supabase/server")
    
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    const [inserted] = await db
      .insert(leadInteractions)
      .values({
        leadId,
        type,
        details,
        agentId: user?.id || null,
      })
      .returning()

    // En option, augmenter le score du lead pour récompenser l'interaction active !
    const leadRecord = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1)
    if (leadRecord && leadRecord.length > 0) {
      const currentScore = leadRecord[0].score
      const bonus = (type === 'appel' || type === 'whatsapp') ? 10 : 5
      const newScore = Math.min(currentScore + bonus, 100)
      
      await db.update(leads).set({ score: newScore, updatedAt: new Date() }).where(eq(leads.id, leadId))
    }

    try {
      revalidatePath('/admin/leads')
    } catch (e) {}

    return { success: true, interaction: inserted }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function getLeadInteractionsAction(leadId: string) {
  await requirePermission('view:leads')

  if (!leadId) return { error: "ID du lead requis." }

  try {
    const data = await db
      .select({
        id: leadInteractions.id,
        leadId: leadInteractions.leadId,
        agentId: leadInteractions.agentId,
        type: leadInteractions.type,
        details: leadInteractions.details,
        createdAt: leadInteractions.createdAt,
        agentName: profiles.fullName,
      })
      .from(leadInteractions)
      .leftJoin(profiles, eq(leadInteractions.agentId, profiles.id))
      .where(and(
        eq(leadInteractions.leadId, leadId),
        isNull(leadInteractions.deletedAt)
      ))
      .orderBy(desc(leadInteractions.createdAt))

    return { success: true, interactions: data }
  } catch (err: any) {
    return { error: err.message }
  }
}

// 7. Cartographie d'Impact de Suppression d'un Lead
export async function getLeadImpactAction(leadId: string) {
  await requirePermission('view:leads')

  if (!leadId) return { error: "ID du lead requis." }

  try {
    // 1. Compter les interactions
    const [interactionsCountData] = await db
      .select({ count: count() })
      .from(leadInteractions)
      .where(and(
        eq(leadInteractions.leadId, leadId),
        isNull(leadInteractions.deletedAt)
      ))

    // 2. Récupérer les détails du lead (bien et agent)
    const leadRecord = await db
      .select({
        bienId: leads.bienInteresse,
        agentId: leads.agentId,
      })
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1)

    let propertyName = null
    let agentName = null

    if (leadRecord && leadRecord.length > 0) {
      const { bienId, agentId } = leadRecord[0]

      if (bienId) {
        const property = await db
          .select({ titre: biens.titre })
          .from(biens)
          .where(eq(biens.id, bienId))
          .limit(1)
        if (property && property.length > 0) {
          propertyName = property[0].titre
        }
      }

      if (agentId) {
        const agent = await db
          .select({ fullName: profiles.fullName })
          .from(profiles)
          .where(eq(profiles.id, agentId))
          .limit(1)
        if (agent && agent.length > 0) {
          agentName = agent[0].fullName
        }
      }
    }

    return {
      success: true,
      impact: {
        interactionsCount: interactionsCountData?.count || 0,
        propertyName,
        agentName,
      }
    }
  } catch (err: any) {
    return { error: err.message }
  }
}// 8. Modifier l'étape du pipeline d'un Lead (F12)
export async function modifierEtapeLeadAction(leadId: string, newEtape: string) {
  await requirePermission('manage:leads')

  if (!leadId || !newEtape) return { error: "Paramètres manquants." }

  try {
    // 1. Récupérer l'étape actuelle du lead
    const leadRecord = await db
      .select({ 
        etape: leads.etape, 
        nom: leads.nom, 
        prenom: leads.prenom, 
        agentId: leads.agentId,
        bienInteresse: leads.bienInteresse,
        visiteConfirmee: leads.visiteConfirmee,
        offreValidee: leads.offreValidee,
        engagementSigne: leads.engagementSigne,
        email: leads.email,
        telephone: leads.telephone
      })
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1)

    if (leadRecord.length === 0) return { error: "Prospect non trouvé." }
    const lead = leadRecord[0]
    const oldEtape = lead.etape

    if (oldEtape === newEtape) return { success: true }

    // 2. Évaluer les conditions de transition
    const evalRes = await evaluerConditionsAction(leadId, newEtape)
    if (evalRes.error) return { error: evalRes.error }

    const conditions = evalRes.conditions || []
    const invalidConditions = conditions.filter(c => !c.valid)
    const isForced = invalidConditions.length > 0

    if (isForced && !evalRes.peutForcer) {
      return {
        error: `Impossible de déplacer le prospect : des conditions obligatoires ne sont pas remplies (${invalidConditions.map(c => c.label).join(', ')}).`
      }
    }

    // 3. Mettre à jour l'étape en base
    await db
      .update(leads)
      .set({
        etape: newEtape,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, leadId))

    // 4. Enregistrer l'interaction dans lead_interactions
    const { cookies } = await import("next/headers")
    const { createClient } = await import("@/utils/supabase/server")
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    const oldLabel = PIPELINE_ETAPES.find(e => e.code === oldEtape)?.nom || oldEtape
    const newLabel = PIPELINE_ETAPES.find(e => e.code === newEtape)?.nom || newEtape

    const details = isForced
      ? `[FORÇAGE SUPER-ADMIN] Changement d'étape du pipeline : de "${oldLabel}" à "${newLabel}". Raison : Conditions manquantes ignorées par le Super Administrateur.`
      : `Changement d'étape du pipeline : de "${oldLabel}" à "${newLabel}".`

    await db
      .insert(leadInteractions)
      .values({
        leadId,
        type: 'note',
        details,
        agentId: user?.id || null,
      })

    try {
      revalidatePath('/admin/leads')
    } catch (e) {}

    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

// 9. Évaluer les conditions d'un Lead pour une étape donnée
export async function evaluerConditionsAction(leadId: string, targetEtape: string) {
  await requirePermission('view:leads')

  if (!leadId || !targetEtape) return { error: "Paramètres manquants." }

  try {
    // 1. Récupérer le prospect
    const leadRecord = await db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1)

    if (leadRecord.length === 0) return { error: "Prospect non trouvé." }
    const lead = leadRecord[0]

    // 2. Déterminer si l'utilisateur actuel est super_admin
    const { cookies } = await import("next/headers")
    const { createClient } = await import("@/utils/supabase/server")
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    let peutForcer = false
    if (user?.id) {
      const userProfile = await db
        .select({ role: profiles.role })
        .from(profiles)
        .where(eq(profiles.id, user.id))
        .limit(1)
      if (userProfile.length > 0 && (userProfile[0].role === 'admin' || userProfile[0].role === 'super_admin' || userProfile[0].role === 'tech_super_admin')) {
        peutForcer = true
      }
    }

    // 3. Évaluer les règles logiques
    const conditions: { id: string; label: string; valid: boolean; type: 'auto' | 'manual' }[] = []

    if (targetEtape === 'qualifie') {
      const aNom = !!lead.nom && lead.nom.trim().length > 0
      const aPrenom = !!lead.prenom && lead.prenom.trim().length > 0
      const aEmail = !!lead.email && lead.email.trim().length > 0
      const aTelephone = !!lead.telephone && lead.telephone.trim().length > 0
      
      conditions.push({
        id: 'profil_complet',
        label: "Fiche prospect complète (Nom, Prénom, E-mail, Téléphone)",
        valid: aNom && aPrenom && aEmail && aTelephone,
        type: 'auto'
      })

      conditions.push({
        id: 'bien_lie',
        label: "Un bien d'intérêt est associé au prospect",
        valid: !!lead.bienInteresse,
        type: 'auto'
      })

      const interactions = await db
        .select({ count: count() })
        .from(leadInteractions)
        .where(eq(leadInteractions.leadId, leadId))
      const hasInteraction = (interactions[0]?.count || 0) > 0

      conditions.push({
        id: 'interactions_existantes',
        label: "Au moins une interaction enregistrée (appel, whatsapp, email)",
        valid: hasInteraction,
        type: 'auto'
      })
    }

    else if (targetEtape === 'visite_planifiee') {
      let bienDisponible = false
      if (lead.bienInteresse) {
        const bien = await db
          .select({ statut: biens.statut })
          .from(biens)
          .where(eq(biens.id, lead.bienInteresse))
          .limit(1)
        if (bien.length > 0 && bien[0].statut === 'disponible') {
          bienDisponible = true
        }
      }
      conditions.push({
        id: 'bien_disponible',
        label: "Le bien immobilier d'intérêt est disponible",
        valid: bienDisponible,
        type: 'auto'
      })

      // Vérifier si une visite est planifiée ou confirmée en base
      const plannedVisits = await db
        .select({ count: count() })
        .from(visites)
        .where(and(
          eq(visites.leadId, leadId),
          isNull(visites.deletedAt),
          or(
            eq(visites.statut, 'planifiee'),
            eq(visites.statut, 'confirmee')
          )
        ))
      const hasPlannedVisit = (plannedVisits[0]?.count || 0) > 0

      conditions.push({
        id: 'visite_planifiee_db',
        label: "Une visite est planifiée pour ce prospect en base de données",
        valid: hasPlannedVisit,
        type: 'auto'
      })
    }

    else if (targetEtape === 'visite_effectuee') {
      // Vérifier si une visite est marquée effectuée en base
      const completedVisits = await db
        .select({ count: count() })
        .from(visites)
        .where(and(
          eq(visites.leadId, leadId),
          eq(visites.statut, 'effectuee'),
          isNull(visites.deletedAt)
        ))
      const hasCompletedVisit = (completedVisits[0]?.count || 0) > 0

      conditions.push({
        id: 'visite_confirmee',
        label: "La visite physique sur site est effectuée et validée (en base ou manuellement)",
        valid: hasCompletedVisit || lead.visiteConfirmee,
        type: 'auto'
      })
    }

    else if (targetEtape === 'negociation') {
      const interactions = await db
        .select({ count: count() })
        .from(leadInteractions)
        .where(eq(leadInteractions.leadId, leadId))
      const hasInteraction = (interactions[0]?.count || 0) > 0

      conditions.push({
        id: 'negociation_entamee',
        label: "Des discussions de négociation ont été consignées",
        valid: hasInteraction,
        type: 'auto'
      })
    }

    else if (targetEtape === 'offre_acceptee') {
      conditions.push({
        id: 'offre_validee',
        label: "L'offre d'achat a été officiellement acceptée par le promoteur",
        valid: lead.offreValidee,
        type: 'manual'
      })
    }

    else if (targetEtape === 'contrat_signe') {
      let aReservationActive = false
      
      const queryEmail = lead.email ? eq(profiles.email, lead.email) : null
      const queryPhone = lead.telephone ? eq(profiles.phone, lead.telephone) : null
      
      let profileId: string | null = null
      if (queryEmail || queryPhone) {
        const conditionsOr = []
        if (queryEmail) conditionsOr.push(queryEmail)
        if (queryPhone) conditionsOr.push(queryPhone)
        
        const profileRecord = await db
          .select({ id: profiles.id })
          .from(profiles)
          .where(and(...conditionsOr))
          .limit(1)
        if (profileRecord.length > 0) {
          profileId = profileRecord[0].id
        }
      }

      if (profileId && lead.bienInteresse) {
        const reservationRecord = await db
          .select({ id: reservations.id })
          .from(reservations)
          .where(and(
            eq(reservations.clientId, profileId),
            eq(reservations.bienId, lead.bienInteresse)
          ))
          .limit(1)
        if (reservationRecord.length > 0) {
          aReservationActive = true
        }
      }

      conditions.push({
        id: 'reservation_creee',
        label: "Une réservation active existe en base pour ce client et ce bien",
        valid: aReservationActive,
        type: 'auto'
      })

      conditions.push({
        id: 'engagement_signe',
        label: "Le contrat de réservation/engagement est signé",
        valid: lead.engagementSigne,
        type: 'manual'
      })
    }

    else if (targetEtape === 'vente_finalisee') {
      let aPaiementValide = false
      let bienStatutVendu = false

      if (lead.bienInteresse) {
        const bien = await db
          .select({ statut: biens.statut })
          .from(biens)
          .where(eq(biens.id, lead.bienInteresse))
          .limit(1)
        if (bien.length > 0 && (bien[0].statut === 'vendu' || bien[0].statut === 'reserve')) {
          bienStatutVendu = true
        }
      }

      let profileId: string | null = null
      const queryEmail = lead.email ? eq(profiles.email, lead.email) : null
      const queryPhone = lead.telephone ? eq(profiles.phone, lead.telephone) : null
      if (queryEmail || queryPhone) {
        const conditionsOr = []
        if (queryEmail) conditionsOr.push(queryEmail)
        if (queryPhone) conditionsOr.push(queryPhone)
        
        const profileRecord = await db
          .select({ id: profiles.id })
          .from(profiles)
          .where(and(...conditionsOr))
          .limit(1)
        if (profileRecord.length > 0) {
          profileId = profileRecord[0].id
        }
      }

      if (profileId) {
        const paymentRecord = await db
          .select({ id: paiements.id })
          .from(paiements)
          .where(and(
            eq(paiements.clientId, profileId),
            eq(paiements.statut, 'paye')
          ))
          .limit(1)
        if (paymentRecord.length > 0) {
          aPaiementValide = true
        }
      }

      conditions.push({
        id: 'paiement_valide',
        label: "Au moins un paiement a été validé et encaissé (statut 'Payé')",
        valid: aPaiementValide,
        type: 'auto'
      })

      conditions.push({
        id: 'bien_statut_vendu',
        label: "Le statut du bien immobilier est marqué comme Réserve ou Vendu",
        valid: bienStatutVendu,
        type: 'auto'
      })
    }

    return { success: true, conditions, peutForcer }
  } catch (err: any) {
    return { error: err.message }
  }
}

// 10. Mettre à jour les indicateurs manuels (checks) d'un Lead
export async function modifierLeadChecksAction(
  leadId: string, 
  checks: { visiteConfirmee?: boolean; offreValidee?: boolean; engagementSigne?: boolean }
) {
  await requirePermission('manage:leads')

  if (!leadId) return { error: "ID du prospect manquant." }

  try {
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    }
    if (checks.visiteConfirmee !== undefined) updateData.visiteConfirmee = checks.visiteConfirmee
    if (checks.offreValidee !== undefined) updateData.offreValidee = checks.offreValidee
    if (checks.engagementSigne !== undefined) updateData.engagementSigne = checks.engagementSigne

    await db
      .update(leads)
      .set(updateData)
      .where(eq(leads.id, leadId))

    try {
      revalidatePath('/admin/leads')
    } catch (e) {}

    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
