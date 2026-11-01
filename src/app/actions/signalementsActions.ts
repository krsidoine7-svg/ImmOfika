'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'
import { signalements, biens, profiles } from '@/lib/db/schema'
import { eq, desc, and, isNull, sql } from 'drizzle-orm'
import { assertCan, requireAdminAccess } from '@/lib/auth/permissions'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// ─── Schémas Zod ─────────────────────────────────────────────────────────────

const CreerSignalementSchema = z.object({
  bienId: z.string().uuid('Identifiant de bien invalide'),
  motif: z.enum([
    'faux_prix',
    'demarcheur_arnaque',
    'bien_deja_vendu',
    'photos_trompeuses',
    'autre',
  ]),
  description: z.string().min(5, 'La description doit comporter au moins 5 caractères'),
})

const TraiterSignalementSchema = z.object({
  signalementId: z.string().uuid(),
  decision: z.enum(['approuve_retrait', 'rejeter_signalement']),
  commentaire: z.string().min(3, 'Le commentaire de décision est obligatoire'),
})

const ValiderTitreFoncierSchema = z.object({
  bienId: z.string().uuid(),
  decision: z.enum(['valider', 'rejeter']),
  typeTitrePropriete: z.string().optional(),
  motifRejet: z.string().optional(),
})

// ─── Actions Signalements Communautaires ─────────────────────────────────────

export async function creerSignalementAction(formData: z.infer<typeof CreerSignalementSchema>) {
  try {
    const parsed = CreerSignalementSchema.parse(formData)
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Vérifier que le bien existe
    const [bien] = await db
      .select({ id: biens.id })
      .from(biens)
      .where(and(eq(biens.id, parsed.bienId), isNull(biens.deletedAt)))
      .limit(1)

    if (!bien) {
      return { error: 'Annonce introuvable ou déjà retirée.' }
    }

    const [nouveauSignalement] = await db
      .insert(signalements)
      .values({
        bienId: parsed.bienId,
        auteurId: user?.id || null,
        motif: parsed.motif,
        description: parsed.description,
        statut: 'nouveau',
      })
      .returning()

    revalidatePath('/admin/moderation')

    return {
      success: true,
      message: 'Votre signalement a été transmis à l équipe de modération ImmOfika.',
      signalementId: nouveauSignalement.id,
    }
  } catch (err: any) {
    return { error: err.message || 'Impossible d enregistrer le signalement.' }
  }
}

export async function getSignalementsAction(filtreStatut?: string) {
  try {
    // Vérification de permission modérateur / admin
    await requireAdminAccess()

    let query = db
      .select({
        id: signalements.id,
        motif: signalements.motif,
        description: signalements.description,
        statut: signalements.statut,
        decisionCommentaire: signalements.decisionCommentaire,
        createdAt: signalements.createdAt,
        bien: {
          id: biens.id,
          titre: biens.titre,
          slug: biens.slug,
          prix: biens.prix,
          ville: biens.ville,
          quartier: biens.quartier,
          statutModeration: biens.statutModeration,
          mainImageUrl: biens.mainImageUrl,
        },
        auteur: {
          id: profiles.id,
          fullName: profiles.fullName,
          email: profiles.email,
        },
      })
      .from(signalements)
      .innerJoin(biens, eq(signalements.bienId, biens.id))
      .leftJoin(profiles, eq(signalements.auteurId, profiles.id))
      .orderBy(desc(signalements.createdAt))

    const results = await query

    if (filtreStatut && filtreStatut !== 'tous') {
      return { signalements: results.filter((s) => s.statut === filtreStatut) }
    }

    return { signalements: results }
  } catch (err: any) {
    return { error: err.message || 'Impossible de récupérer les signalements.', signalements: [] }
  }
}

export async function traiterSignalementAction(data: z.infer<typeof TraiterSignalementSchema>) {
  try {
    const user = await requireAdminAccess()
    const parsed = TraiterSignalementSchema.parse(data)

    const [sig] = await db
      .select()
      .from(signalements)
      .where(eq(signalements.id, parsed.signalementId))
      .limit(1)

    if (!sig) return { error: 'Signalement introuvable.' }

    if (parsed.decision === 'approuve_retrait') {
      // 1. Marquer le signalement comme traité
      await db
        .update(signalements)
        .set({
          statut: 'traite',
          traitePar: user.id,
          decisionCommentaire: parsed.commentaire,
          updatedAt: new Date(),
        })
        .where(eq(signalements.id, parsed.signalementId))

      // 2. Rejeter et retirer l'annonce du catalogue public
      await db
        .update(biens)
        .set({
          statutModeration: 'rejete',
          motifRejet: `Retiré suite à signalement modération : ${parsed.commentaire}`,
          updatedAt: new Date(),
        })
        .where(eq(biens.id, sig.bienId))

      revalidatePath('/admin/moderation')
      revalidatePath('/biens')

      // Notifier l'auteur du signalement
      try {
        const [bienRecord] = await db
          .select({ titre: biens.titre })
          .from(biens)
          .where(eq(biens.id, sig.bienId))
          .limit(1)
        const { notifierEvenementAction } = await import('@/lib/notifications/service')
        await notifierEvenementAction('SIGNALEMENT_TRAITE', {
          auteurId: sig.auteurId,
          bienTitre: bienRecord?.titre || 'Bien immobilier',
          decision: 'approuve_retrait',
        })
      } catch {}

      return { success: true, message: 'Signalement validé : annonce retirée de la publication.' }
    } else {
      // Rejeter le signalement (infraction non caractérisée)
      await db
        .update(signalements)
        .set({
          statut: 'rejete',
          traitePar: user.id,
          decisionCommentaire: parsed.commentaire,
          updatedAt: new Date(),
        })
        .where(eq(signalements.id, parsed.signalementId))

      revalidatePath('/admin/moderation')

      // Notifier l'auteur du signalement
      try {
        const [bienRecord] = await db
          .select({ titre: biens.titre })
          .from(biens)
          .where(eq(biens.id, sig.bienId))
          .limit(1)
        const { notifierEvenementAction } = await import('@/lib/notifications/service')
        await notifierEvenementAction('SIGNALEMENT_TRAITE', {
          auteurId: sig.auteurId,
          bienTitre: bienRecord?.titre || 'Bien immobilier',
          decision: 'rejeter_signalement',
        })
      } catch {}

      return { success: true, message: 'Signalement classé sans suite.' }
    }
  } catch (err: any) {
    return { error: err.message || 'Erreur lors du traitement du signalement.' }
  }
}

// ─── Visa & Contrôle des Titres Fonciers (MCLU) ─────────────────────────────

export async function validerTitreFoncierAction(data: z.infer<typeof ValiderTitreFoncierSchema>) {
  try {
    await requireAdminAccess()
    const parsed = ValiderTitreFoncierSchema.parse(data)

    const [bienRecord] = await db
      .select()
      .from(biens)
      .where(eq(biens.id, parsed.bienId))
      .limit(1)

    if (parsed.decision === 'valider') {
      await db
        .update(biens)
        .set({
          statutModeration: 'valide',
          typeTitrePropriete: parsed.typeTitrePropriete || undefined,
          motifRejet: null,
          updatedAt: new Date(),
        })
        .where(eq(biens.id, parsed.bienId))

      // Déclencher les notifications multi-canaux
      try {
        const { notifierEvenementAction } = await import('@/lib/notifications/service')
        await notifierEvenementAction('BIEN_VALIDE', {
          ownerId: bienRecord?.ownerId,
          bienTitre: bienRecord?.titre,
          slug: bienRecord?.slug,
          typeTitrePropriete: parsed.typeTitrePropriete || bienRecord?.typeTitrePropriete,
        })

        if (bienRecord) {
          await notifierEvenementAction('ALERTE_CORRESPONDANCE', {
            bienId: bienRecord.id,
            titre: bienRecord.titre,
            commune: bienRecord.quartier || bienRecord.ville,
            ville: bienRecord.ville,
            type: bienRecord.type,
            transaction: bienRecord.transaction,
            prix: bienRecord.prix,
            slug: bienRecord.slug,
          })
        }
      } catch (notifErr) {
        console.error('[Notification BIEN_VALIDE Error]', notifErr)
      }

      revalidatePath('/admin/moderation')
      revalidatePath('/admin/biens')
      revalidatePath('/biens')

      return { success: true, message: 'Titre foncier et annonce validés pour diffusion publique.' }
    } else {
      if (!parsed.motifRejet) {
        return { error: 'Un motif clair de rejet est obligatoire.' }
      }

      await db
        .update(biens)
        .set({
          statutModeration: 'rejete',
          motifRejet: parsed.motifRejet,
          updatedAt: new Date(),
        })
        .where(eq(biens.id, parsed.bienId))

      try {
        const { notifierEvenementAction } = await import('@/lib/notifications/service')
        await notifierEvenementAction('BIEN_REJETE', {
          ownerId: bienRecord?.ownerId,
          bienTitre: bienRecord?.titre,
          motifRejet: parsed.motifRejet,
        })
      } catch (notifErr) {
        console.error('[Notification BIEN_REJETE Error]', notifErr)
      }

      revalidatePath('/admin/moderation')
      revalidatePath('/admin/biens')

      return { success: true, message: 'Annonce rejetée avec notification du motif au propriétaire.' }
    }
  } catch (err: any) {
    return { error: err.message || 'Erreur lors de la validation du titre.' }
  }
}

// ─── Détecteur Anti-Fraude & Doublons Suspects ───────────────────────────────

export async function detecterDoublonsAnnonceAction(bienId: string) {
  try {
    await requireAdminAccess()

    const [bienCible] = await db
      .select()
      .from(biens)
      .where(eq(biens.id, bienId))
      .limit(1)

    if (!bienCible) return { error: 'Bien introuvable.', doublons: [] }

    // Recherche de biens actifs dans la même commune/ville avec caractéristiques similaires
    const candidats = await db
      .select({
        id: biens.id,
        titre: biens.titre,
        slug: biens.slug,
        prix: biens.prix,
        ville: biens.ville,
        quartier: biens.quartier,
        surface: biens.surface,
        mainImageUrl: biens.mainImageUrl,
        ownerId: biens.ownerId,
      })
      .from(biens)
      .where(
        and(
          eq(biens.type, bienCible.type),
          eq(biens.transaction, bienCible.transaction),
          isNull(biens.deletedAt)
        )
      )

    const prixCible = Number(bienCible.prix)
    const doublonsSuspects = candidats
      .filter((c) => c.id !== bienCible.id)
      .filter((c) => {
        // Même quartier ou ville
        const memeZone =
          c.ville.toLowerCase() === bienCible.ville.toLowerCase() ||
          (c.quartier && bienCible.quartier && c.quartier.toLowerCase() === bienCible.quartier.toLowerCase())

        if (!memeZone) return false

        // Écart de prix suspect (ex: démarquage pirate de plus de 25%)
        const prixCandidat = Number(c.prix)
        const ecartPrix = Math.abs(prixCandidat - prixCible) / Math.max(prixCible, 1)

        return ecartPrix > 0.25 || c.titre.toLowerCase() === bienCible.titre.toLowerCase()
      })

    return { doublons: doublonsSuspects }
  } catch (err: any) {
    return { error: err.message || 'Erreur lors de l analyse des doublons.', doublons: [] }
  }
}

