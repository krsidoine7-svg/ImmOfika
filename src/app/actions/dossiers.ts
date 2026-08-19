'use server'

import { db } from "@/lib/db/index"
import { dossiers, taches, profiles } from "@/lib/db/schema"
import { eq, and, isNull } from "drizzle-orm"
import { requirePermission } from "@/lib/auth/permissions"
import { revalidatePath } from "next/cache"
import { z } from 'zod'

// Helper for parsing dates
const robustDateSchema = z.preprocess((val) => {
  if (typeof val === 'string' && val.trim() !== '') {
    const parsedDate = new Date(val)
    if (!isNaN(parsedDate.getTime())) return parsedDate
  }
  if (val instanceof Date) return val
  return null
}, z.date().nullable().optional())

// Validation schemas
const dossierSchema = z.object({
  clientId: z.string().uuid("ID client invalide"),
  agentId: z.string().uuid("ID agent invalide").nullable().optional().or(z.literal("")),
  bienId: z.string().uuid("ID bien invalide").nullable().optional().or(z.literal("")),
  titre: z.string().min(2, "Le titre doit contenir au moins 2 caractères"),
  description: z.string().nullable().optional().or(z.literal("")),
  statut: z.enum(['ouvert', 'en_cours', 'bloque', 'clos']).default('ouvert'),
  priorite: z.enum(['basse', 'normale', 'haute', 'urgente']).default('normale'),
  deadline: robustDateSchema,
})

const modifyDossierSchema = dossierSchema.partial().extend({
  id: z.string().uuid("ID du dossier invalide"),
})

const tacheSchema = z.object({
  dossierId: z.string().uuid("ID du dossier invalide"),
  titre: z.string().min(2, "Le titre doit contenir au moins 2 caractères"),
  description: z.string().nullable().optional().or(z.literal("")),
  assigneeId: z.string().uuid("ID de l'assignataire invalide").nullable().optional().or(z.literal("")),
  statut: z.enum(['a_faire', 'en_cours', 'terminee', 'bloquee']).default('a_faire'),
  priorite: z.enum(['basse', 'normale', 'moyenne', 'haute', 'urgente']).default('normale'),
  deadline: robustDateSchema,
  bloqueCommentaire: z.string().nullable().optional().or(z.literal("")),
})

const modifyTacheSchema = tacheSchema.partial().extend({
  id: z.string().uuid("ID de la tâche invalide"),
})

/**
 * Recalculate completion percentage for a dossier and update its column in the DB.
 */
async function recalculerProgressionDossier(dossierId: string, transaction = db) {
  // Get all tasks for this dossier that are NOT deleted
  const allTasks = await transaction
    .select({ statut: taches.statut })
    .from(taches)
    .where(
      and(
        eq(taches.dossierId, dossierId),
        isNull(taches.deletedAt)
      )
    )

  const total = allTasks.length
  if (total === 0) {
    await transaction
      .update(dossiers)
      .set({ progression: 0, updatedAt: new Date() })
      .where(eq(dossiers.id, dossierId))
    return 0
  }

  const completed = allTasks.filter(t => t.statut === 'terminee').length
  const progression = Math.round((completed / total) * 100)

  await transaction
    .update(dossiers)
    .set({ progression, updatedAt: new Date() })
    .where(eq(dossiers.id, dossierId))

  return progression
}

/**
 * Verify if a profile exists and has the 'agent' role.
 */
async function validerRoleAgent(profileId: string | null | undefined): Promise<{ error?: string }> {
  if (!profileId) return {}
  
  const [profile] = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, profileId))

  if (!profile) {
    return { error: "Profil assignataire introuvable." }
  }

  if (profile.role !== 'agent' && profile.role !== 'admin_agent') {
    return { error: "L'affectation est restreinte uniquement aux utilisateurs avec le rôle 'agent' ou 'admin_agent'." }
  }

  return {}
}

// ─── DOSSIERS ACTIONS ─────────────────────────────────────────────────────────

export async function creerDossierAction(input: z.infer<typeof dossierSchema>) {
  await requirePermission('manage:dossiers')

  const parsed = dossierSchema.safeParse(input)
  if (!parsed.success) {
    return { error: 'Données invalides : ' + parsed.error.issues.map(i => i.message).join(', ') }
  }

  const data = parsed.data
  const agentId = data.agentId || null
  const bienId = data.bienId || null

  try {
    // Vérification du rôle de l'agent si fourni
    if (agentId) {
      const roleCheck = await validerRoleAgent(agentId)
      if (roleCheck.error) return { error: roleCheck.error }
    }

    const [inserted] = await db
      .insert(dossiers)
      .values({
        clientId: data.clientId,
        agentId,
        bienId,
        titre: data.titre,
        description: data.description || null,
        statut: data.statut,
        progression: 0,
        priorite: data.priorite,
        deadline: data.deadline || null,
      })
      .returning()

    if (!inserted) {
      return { error: "Erreur de création du dossier en base de données." }
    }

    try {
      revalidatePath('/admin/dossiers')
    } catch (e) {}

    return { success: true, dossierId: inserted.id }
  } catch (err: any) {
    console.error("Erreur creation dossier:", err)
    return { error: err.message || "Une erreur inconnue est survenue." }
  }
}

export async function modifierDossierAction(input: z.infer<typeof modifyDossierSchema>) {
  await requirePermission('manage:dossiers')

  const parsed = modifyDossierSchema.safeParse(input)
  if (!parsed.success) {
    return { error: 'Données invalides : ' + parsed.error.issues.map(i => i.message).join(', ') }
  }

  const { id, ...data } = parsed.data

  try {
    // Vérification du rôle de l'agent si modifié
    if (data.agentId) {
      const roleCheck = await validerRoleAgent(data.agentId)
      if (roleCheck.error) return { error: roleCheck.error }
    }

    const updateFields: any = {
      updatedAt: new Date()
    }
    if (data.clientId !== undefined) updateFields.clientId = data.clientId
    if (data.agentId !== undefined) updateFields.agentId = data.agentId || null
    if (data.bienId !== undefined) updateFields.bienId = data.bienId || null
    if (data.titre !== undefined) updateFields.titre = data.titre
    if (data.description !== undefined) updateFields.description = data.description || null
    if (data.statut !== undefined) updateFields.statut = data.statut
    if (data.priorite !== undefined) updateFields.priorite = data.priorite
    if (data.deadline !== undefined) updateFields.deadline = data.deadline || null

    await db
      .update(dossiers)
      .set(updateFields)
      .where(eq(dossiers.id, id))

    try {
      revalidatePath('/admin/dossiers')
    } catch (e) {}

    return { success: true }
  } catch (err: any) {
    console.error("Erreur modification dossier:", err)
    return { error: err.message || "Une erreur inconnue est survenue." }
  }
}

export async function supprimerDossierAction(dossierId: string) {
  await requirePermission('manage:dossiers')

  if (!dossierId) return { error: "ID du dossier requis." }

  try {
    await db.transaction(async (tx) => {
      // Soft delete dossier
      await tx
        .update(dossiers)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(dossiers.id, dossierId))

      // Soft delete associated tasks
      await tx
        .update(taches)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(taches.dossierId, dossierId))
    })

    try {
      revalidatePath('/admin/dossiers')
    } catch (e) {}

    return { success: true }
  } catch (err: any) {
    console.error("Erreur suppression dossier:", err)
    return { error: err.message || "Une erreur inconnue est survenue." }
  }
}

// ─── TACHES ACTIONS ───────────────────────────────────────────────────────────

export async function creerTacheAction(input: z.infer<typeof tacheSchema>) {
  await requirePermission('manage:dossiers')

  const parsed = tacheSchema.safeParse(input)
  if (!parsed.success) {
    return { error: 'Données invalides : ' + parsed.error.issues.map(i => i.message).join(', ') }
  }

  const data = parsed.data
  const assigneeId = data.assigneeId || null

  // Commentaire obligatoire en cas de statut 'bloquee'
  if (data.statut === 'bloquee' && (!data.bloqueCommentaire || data.bloqueCommentaire.trim() === '')) {
    return { error: "Un commentaire explicatif est obligatoire pour pouvoir bloquer une tâche." }
  }

  try {
    // Vérification du rôle de l'assignataire si fourni
    if (assigneeId) {
      const roleCheck = await validerRoleAgent(assigneeId)
      if (roleCheck.error) return { error: roleCheck.error }
    }

    const [inserted] = await db
      .insert(taches)
      .values({
        dossierId: data.dossierId,
        titre: data.titre,
        description: data.description || null,
        assigneeId,
        statut: data.statut,
        priorite: data.priorite,
        deadline: data.deadline || null,
        bloqueCommentaire: data.statut === 'bloquee' ? data.bloqueCommentaire : null,
      })
      .returning()

    if (!inserted) {
      return { error: "Erreur de création de la tâche en base de données." }
    }

    // Calcul de la progression du dossier parent
    await recalculerProgressionDossier(data.dossierId)

    try {
      revalidatePath('/admin/dossiers')
    } catch (e) {}

    return { success: true, tacheId: inserted.id }
  } catch (err: any) {
    console.error("Erreur creation tache:", err)
    return { error: err.message || "Une erreur inconnue est survenue." }
  }
}

export async function modifierTacheAction(input: z.infer<typeof modifyTacheSchema>) {
  await requirePermission('manage:dossiers')

  const parsed = modifyTacheSchema.safeParse(input)
  if (!parsed.success) {
    return { error: 'Données invalides : ' + parsed.error.issues.map(i => i.message).join(', ') }
  }

  const { id, ...data } = parsed.data

  try {
    // Récupérer la tâche actuelle pour connaître son dossier parent et son statut actuel
    const [currentTache] = await db
      .select()
      .from(taches)
      .where(eq(taches.id, id))

    if (!currentTache) {
      return { error: "Tâche introuvable." }
    }

    // Si le statut change vers 'bloquee', ou si le statut reste 'bloquee' et qu'un commentaire est modifié,
    // valider la présence du commentaire obligatoire.
    const newStatut = data.statut !== undefined ? data.statut : currentTache.statut
    const newCommentaire = data.bloqueCommentaire !== undefined ? data.bloqueCommentaire : currentTache.bloqueCommentaire
    
    if (newStatut === 'bloquee' && (!newCommentaire || newCommentaire.trim() === '')) {
      return { error: "Un commentaire explicatif est obligatoire pour pouvoir bloquer une tâche." }
    }

    // Vérification du rôle de l'assignataire si modifié
    if (data.assigneeId) {
      const roleCheck = await validerRoleAgent(data.assigneeId)
      if (roleCheck.error) return { error: roleCheck.error }
    }

    const updateFields: any = {
      updatedAt: new Date()
    }
    if (data.titre !== undefined) updateFields.titre = data.titre
    if (data.description !== undefined) updateFields.description = data.description || null
    if (data.assigneeId !== undefined) updateFields.assigneeId = data.assigneeId || null
    if (data.statut !== undefined) updateFields.statut = data.statut
    if (data.priorite !== undefined) updateFields.priorite = data.priorite
    if (data.deadline !== undefined) updateFields.deadline = data.deadline || null
    
    // Si la tâche passe à 'bloquee', on conserve ou met à jour le commentaire
    // Sinon, on le vide pour éviter la rétention de commentaires obsolètes
    if (newStatut === 'bloquee') {
      updateFields.bloqueCommentaire = newCommentaire || null
    } else {
      updateFields.bloqueCommentaire = null
    }

    await db
      .update(taches)
      .set(updateFields)
      .where(eq(taches.id, id))

    // Recalcul de la progression
    await recalculerProgressionDossier(currentTache.dossierId)

    try {
      revalidatePath('/admin/dossiers')
    } catch (e) {}

    return { success: true }
  } catch (err: any) {
    console.error("Erreur modification tache:", err)
    return { error: err.message || "Une erreur inconnue est survenue." }
  }
}

export async function supprimerTacheAction(tacheId: string) {
  await requirePermission('manage:dossiers')

  if (!tacheId) return { error: "ID de la tâche requis." }

  try {
    const [currentTache] = await db
      .select({ dossierId: taches.dossierId })
      .from(taches)
      .where(eq(taches.id, tacheId))

    if (!currentTache) {
      return { error: "Tâche introuvable." }
    }

    // Soft delete de la tâche
    await db
      .update(taches)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(taches.id, tacheId))

    // Recalculer la progression du dossier parent
    await recalculerProgressionDossier(currentTache.dossierId)

    try {
      revalidatePath('/admin/dossiers')
    } catch (e) {}

    return { success: true }
  } catch (err: any) {
    console.error("Erreur suppression tache:", err)
    return { error: err.message || "Une erreur inconnue est survenue." }
  }
}
