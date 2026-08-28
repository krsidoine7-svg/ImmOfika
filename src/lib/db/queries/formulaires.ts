import { db } from '@/lib/db'
import { formulaires, formulaireReponses } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import { Formulaire, ChampFormulaire } from '@/types/formulaire'

/**
 * Récupère la liste de tous les formulaires (Admin)
 */
export async function getFormulairesAdmin() {
  try {
    const list = await db
      .select()
      .from(formulaires)
      .orderBy(desc(formulaires.createdAt))
    return list
  } catch (error) {
    console.error('[getFormulairesAdmin] Error:', error)
    return []
  }
}

/**
 * Récupère un formulaire par son ID (Admin)
 */
export async function getFormulaireById(id: string) {
  try {
    const [form] = await db
      .select()
      .from(formulaires)
      .where(eq(formulaires.id, id))
      .limit(1)
    return form || null
  } catch (error) {
    console.error('[getFormulaireById] Error:', error)
    return null
  }
}

/**
 * Récupère un formulaire actif par son slug (Client)
 */
export async function getFormulaireBySlug(slug: string) {
  try {
    const [form] = await db
      .select()
      .from(formulaires)
      .where(eq(formulaires.slug, slug))
      .limit(1)

    if (!form || form.statut !== 'actif') {
      return null
    }

    return form
  } catch (error) {
    console.error('[getFormulaireBySlug] Error:', error)
    return null
  }
}

/**
 * Crée un nouveau formulaire
 */
export async function createFormulaire(data: {
  titre: string
  description?: string
  slug: string
  champs: ChampFormulaire[]
  statut?: 'actif' | 'archive'
  notificationsEmail?: string
  createdBy?: string
}) {
  try {
    const [newForm] = await db
      .insert(formulaires)
      .values({
        titre: data.titre,
        description: data.description || null,
        slug: data.slug,
        champs: data.champs,
        statut: data.statut || 'actif',
        notificationsEmail: data.notificationsEmail || null,
        createdBy: data.createdBy || null,
      })
      .returning()

    return newForm
  } catch (error) {
    console.error('[createFormulaire] Error:', error)
    throw error
  }
}

/**
 * Met à jour un formulaire existant
 */
export async function updateFormulaire(
  id: string,
  data: Partial<{
    titre: string
    description: string
    slug: string
    champs: ChampFormulaire[]
    statut: 'actif' | 'archive'
    notificationsEmail: string
  }>
) {
  try {
    const [updated] = await db
      .update(formulaires)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(formulaires.id, id))
      .returning()

    return updated
  } catch (error) {
    console.error('[updateFormulaire] Error:', error)
    throw error
  }
}

/**
 * Supprime un formulaire et ses réponses associées (Cascade)
 */
export async function deleteFormulaire(id: string) {
  try {
    await db.delete(formulaires).where(eq(formulaires.id, id))
    return true
  } catch (error) {
    console.error('[deleteFormulaire] Error:', error)
    return false
  }
}

/**
 * Enregistre une réponse à un formulaire
 */
export async function saveFormulaireReponse(data: {
  formulaireId: string
  reponses: Record<string, unknown>
  fichiers?: Record<string, { url: string; name: string; size: number }>
  ipAddress?: string
  userAgent?: string
}) {
  try {
    const [newReponse] = await db
      .insert(formulaireReponses)
      .values({
        formulaireId: data.formulaireId,
        reponses: data.reponses,
        fichiers: data.fichiers || {},
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      })
      .returning()

    return newReponse
  } catch (error) {
    console.error('[saveFormulaireReponse] Error:', error)
    throw error
  }
}

/**
 * Récupère toutes les réponses d'un formulaire donné
 */
export async function getFormulaireReponses(formulaireId: string) {
  try {
    const list = await db
      .select()
      .from(formulaireReponses)
      .where(eq(formulaireReponses.formulaireId, formulaireId))
      .orderBy(desc(formulaireReponses.createdAt))

    return list
  } catch (error) {
    console.error('[getFormulaireReponses] Error:', error)
    return []
  }
}

/**
 * Compte le nombre de réponses d'un formulaire
 */
export async function getFormulaireReponsesCount(formulaireId: string) {
  try {
    const [res] = await db
      .select({ value: count() })
      .from(formulaireReponses)
      .where(eq(formulaireReponses.formulaireId, formulaireId))

    return Number(res?.value || 0)
  } catch (error) {
    console.error('[getFormulaireReponsesCount] Error:', error)
    return 0
  }
}
