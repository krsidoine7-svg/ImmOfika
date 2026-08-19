'use server'

import { db } from '@/lib/db'
import { visites, visiteAvis, biens, profiles } from '@/lib/db/schema'
import { eq, desc, gte } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export interface PlanifierVisiteInput {
  bienId: string
  clientId: string
  dateVisite: string
  plageHoraire: 'matin' | 'apres_midi'
  commentaires?: string
}

export async function planifierVisiteAction(input: PlanifierVisiteInput) {
  const { bienId, clientId, dateVisite, plageHoraire, commentaires } = input

  if (!bienId || !clientId || !dateVisite) {
    return { success: false, error: 'Bien, client et date de visite requis.' }
  }

  try {
    const [bien] = await db.select().from(biens).where(eq(biens.id, bienId))
    if (!bien) {
      return { success: false, error: 'Bien introuvable.' }
    }

    const [newVisite] = await db
      .insert(visites)
      .values({
        bienId,
        clientId,
        agentId: bien.agentId || undefined,
        dateVisite: new Date(dateVisite),
        plageHoraire: plageHoraire || 'matin',
        statut: 'planifiee',
        commentaires: commentaires || undefined,
      })
      .returning()

    revalidatePath('/admin/visites')
    revalidatePath('/client/dashboard')

    return {
      success: true,
      visiteId: newVisite.id,
      message: `Votre visite pour le bien "${bien.titre}" a été planifiée pour le ${new Date(dateVisite).toLocaleDateString('fr-FR')} (${plageHoraire === 'matin' ? 'Matinée 09h-12h' : 'Après-midi 14h-18h'}).`,
    }
  } catch (err: any) {
    console.error('[planifierVisiteAction Error]', err)
    return { success: false, error: err.message || 'Erreur lors de la planification.' }
  }
}

export async function validerVisiteEffectueeAction(visiteId: string) {
  if (!visiteId) return { success: false, error: 'ID de visite requis.' }

  try {
    const [visite] = await db
      .update(visites)
      .set({ statut: 'effectuee', updatedAt: new Date() })
      .where(eq(visites.id, visiteId))
      .returning()

    if (!visite) return { success: false, error: 'Visite introuvable.' }

    revalidatePath('/admin/visites')
    revalidatePath('/client/dashboard')

    return {
      success: true,
      message: 'Visite marquée comme effectuée. Invitation d\'évaluation transmise au client.',
    }
  } catch (err: any) {
    console.error('[validerVisiteEffectueeAction Error]', err)
    return { success: false, error: err.message || 'Erreur lors de la mise à jour.' }
  }
}

export interface SoumettreAvisInput {
  visiteId: string
  clientId: string
  note: number
  commentaire?: string
}

export async function soumettreAvisVisiteAction(input: SoumettreAvisInput) {
  const { visiteId, clientId, note, commentaire } = input

  if (!visiteId || !clientId || !note) {
    return { success: false, error: 'Visite, client et note (1 à 5) requis.' }
  }

  try {
    const [visite] = await db.select().from(visites).where(eq(visites.id, visiteId))
    if (!visite) {
      return { success: false, error: 'Visite introuvable.' }
    }

    const isPublic = note >= 4

    await db.insert(visiteAvis).values({
      visiteId,
      clientId,
      agentId: visite.agentId || undefined,
      note,
      commentaire: commentaire?.trim() || undefined,
      isPublic,
    })

    revalidatePath('/')
    revalidatePath('/admin/visites')
    revalidatePath('/client/dashboard')

    return {
      success: true,
      isPublic,
      message: isPublic
        ? 'Merci pour votre avis 5 étoiles ! Votre témoignage est publié sur la page d\'accueil.'
        : 'Merci pour votre retour d\'expérience, il a été transmis au responsable qualité.',
    }
  } catch (err: any) {
    console.error('[soumettreAvisVisiteAction Error]', err)
    return { success: false, error: err.message || 'Erreur lors de l\'enregistrement de l\'avis.' }
  }
}

export async function getPublicAvisTemoignages() {
  try {
    const reviews = await db
      .select({
        id: visiteAvis.id,
        note: visiteAvis.note,
        commentaire: visiteAvis.commentaire,
        createdAt: visiteAvis.createdAt,
        clientName: profiles.fullName,
        clientEmail: profiles.email,
      })
      .from(visiteAvis)
      .leftJoin(profiles, eq(visiteAvis.clientId, profiles.id))
      .where(eq(visiteAvis.isPublic, true))
      .orderBy(desc(visiteAvis.createdAt))
      .limit(6)

    return reviews
  } catch (e) {
    console.error('[getPublicAvisTemoignages Error]', e)
    return []
  }
}
