'use server'

import { db } from "@/lib/db/index"
import { biens, reservations, bienImages, favoris, profiles } from "@/lib/db/schema"
import { eq, count, isNull, and } from "drizzle-orm"
import { assertCan, requireAdminAccess } from "@/lib/auth/permissions"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { uploadToR2 } from "@/lib/r2/client"
import { logAuditEvent } from "@/lib/audit/logger"
import { z } from 'zod'

const bienSchema = z.object({
  titre: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
  description: z.string().min(10, "La description doit faire au moins 10 caractères"),
  prix: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().positive("Le prix doit être supérieur à 0")
  ),
  type: z.string().min(1, "Le type est requis"),
  transaction: z.enum(['vente', 'location']),
  ville: z.string().min(1, "La ville est requise"),
  quartier: z.string().min(1, "Le quartier est requis"),
  surface: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().positive("La surface doit être supérieure à 0")
  ),
  chambres: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().int().nonnegative("Le nombre de chambres ne peut pas être négatif")
  ),
  sallesDeBain: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().int().nonnegative("Le nombre de salles de bain ne peut pas être négatif")
  ),
})

export async function deleteBienAction(formData: FormData) {
  const id = formData.get('id') as string
  if (!id) throw new Error("ID manquant")

  const [existingBien] = await db.select().from(biens).where(eq(biens.id, id))
  if (!existingBien) throw new Error("Bien introuvable")

  // Vérification de permission : Seul l'admin ou le propriétaire du bien peut supprimer
  const user = await assertCan('bien:delete', { ownerId: existingBien.ownerId })
  const isStaff = user.role === 'admin' || user.role === 'super_admin' || user.hierarchyLevel >= 5

  // Soft delete avec défense en profondeur SQL
  if (isStaff) {
    await db.update(biens).set({ deletedAt: new Date() }).where(eq(biens.id, id))
  } else {
    const result = await db
      .update(biens)
      .set({ deletedAt: new Date() })
      .where(and(eq(biens.id, id), eq(biens.ownerId, user.id)))
  }

  await logAuditEvent({
    userId: user.id,
    userEmail: user.email,
    userRole: user.role,
    action: 'bien.deleted',
    entity: 'biens',
    entityId: id,
    details: { titre: existingBien.titre },
  })

  revalidatePath('/admin/biens')
  revalidatePath('/biens')
  revalidatePath('/dashboard/bailleur')
}

export async function getBienImpact(id: string) {
  await requireAdminAccess()

  const [[resCount], [imgCount], [favCount]] = await Promise.all([
    db.select({ count: count() }).from(reservations).where(eq(reservations.bienId, id)),
    db.select({ count: count() }).from(bienImages).where(eq(bienImages.bienId, id)),
    db.select({ count: count() }).from(favoris).where(eq(favoris.bienId, id)),
  ])

  return {
    reservations: resCount?.count || 0,
    images: imgCount?.count || 0,
    favoris: favCount?.count || 0,
  }
}

export async function createBienAction(formData: FormData) {
  // Vérification de permission : Client bloqué, Propriétaire/Agence/Admin autorisés
  const user = await assertCan('bien:create')
  const isStaff = user.role === 'admin' || user.role === 'super_admin'

  const parsed = bienSchema.safeParse({
    titre: formData.get('titre'),
    description: formData.get('description'),
    prix: formData.get('prix'),
    type: formData.get('type'),
    transaction: formData.get('transaction'),
    ville: formData.get('ville'),
    quartier: formData.get('quartier'),
    surface: formData.get('surface'),
    chambres: formData.get('chambres'),
    sallesDeBain: formData.get('sallesDeBain'),
  })

  if (!parsed.success) {
    throw new Error('Données du bien invalides : ' + parsed.error.issues.map(i => i.message).join(', '))
  }

  const {
    titre,
    description,
    prix,
    type,
    transaction,
    ville,
    quartier,
    surface,
    chambres,
    sallesDeBain,
  } = parsed.data

  const imageFile = formData.get('image') as File | null
  if (!imageFile || imageFile.size === 0) {
    throw new Error("La photo principale est obligatoire lors de la création d'un bien")
  }

  const buffer = Buffer.from(await imageFile.arrayBuffer())
  const mainImageUrl = await uploadToR2(buffer, imageFile.name, imageFile.type, 'biens')

  const slug = titre
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4)

  // Modération : Un bien créé par un admin est validé directement. Les tiers passent par 'en_attente'
  const statutModeration = isStaff ? 'valide' : 'en_attente'

  await db.insert(biens).values({
    slug,
    titre,
    description,
    type,
    transaction,
    prix: prix.toString(),
    ville,
    quartier,
    surface: surface !== null ? surface.toString() : null,
    chambres,
    sallesDeBain,
    mainImageUrl,
    ownerId: user.id,
    statutModeration,
  })

  // Déclencher les notifications push uniquement si le bien est validé et en ligne
  if (statutModeration === 'valide') {
    try {
      const activeProfiles = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(isNull(profiles.deletedAt))

      const pushCategory = 'newProperties' as const
      const notificationTitle = `Nouveau bien : ${titre}`
      const notificationBody = `${type === 'terrain' ? 'Un magnifique terrain' : 'Un nouveau bien'} disponible à ${ville} (${quartier}).`
      const notificationUrl = `/biens/${slug}`

      const { sendPushNotificationAction } = await import('@/app/actions/push')
      
      await Promise.all(
        activeProfiles.map((profile) =>
          sendPushNotificationAction(
            profile.id,
            pushCategory,
            notificationTitle,
            notificationBody,
            notificationUrl
          ).catch((e) => console.error(`Échec d'envoi du push au profil ${profile.id}:`, e))
        )
      )
    } catch (err) {
      console.error('Erreur lors du déclenchement des notifications push pour le nouveau bien :', err)
    }
  }

  await logAuditEvent({
    userId: user.id,
    userEmail: user.email,
    userRole: user.role,
    action: 'bien.created',
    entity: 'biens',
    details: { titre, prix, ville, statutModeration },
  })

  revalidatePath('/admin/biens')
  revalidatePath('/biens')
  revalidatePath('/dashboard/bailleur')

  if (isStaff) {
    redirect('/admin/biens')
  } else {
    redirect('/dashboard/bailleur')
  }
}

export async function updateBienAction(formData: FormData) {
  const id = formData.get('id') as string
  if (!id) throw new Error("ID manquant")

  const [existingBien] = await db.select().from(biens).where(eq(biens.id, id))
  if (!existingBien) throw new Error("Bien introuvable")

  // Vérification de permission : Seul l'admin ou le propriétaire du bien peut modifier
  const user = await assertCan('bien:edit', { ownerId: existingBien.ownerId })
  const isStaff = user.role === 'admin' || user.role === 'super_admin'

  const parsed = bienSchema.safeParse({
    titre: formData.get('titre'),
    description: formData.get('description'),
    prix: formData.get('prix'),
    type: formData.get('type'),
    transaction: formData.get('transaction'),
    ville: formData.get('ville'),
    quartier: formData.get('quartier'),
    surface: formData.get('surface'),
    chambres: formData.get('chambres'),
    sallesDeBain: formData.get('sallesDeBain'),
  })

  if (!parsed.success) {
    throw new Error('Données du bien invalides : ' + parsed.error.issues.map(i => i.message).join(', '))
  }

  const {
    titre,
    description,
    prix,
    type,
    transaction,
    ville,
    quartier,
    surface,
    chambres,
    sallesDeBain,
  } = parsed.data

  const imageFile = formData.get('image') as File | null

  const updateData: Record<string, any> = {
    titre,
    description,
    type,
    transaction,
    prix: prix.toString(),
    ville,
    quartier,
    surface: surface !== null ? surface.toString() : null,
    chambres,
    sallesDeBain,
    updatedAt: new Date(),
  }

  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer())
    updateData.mainImageUrl = await uploadToR2(buffer, imageFile.name, imageFile.type, 'biens')
  }

  // Défense en profondeur SQL : un non-staff ne peut altérer que ses propres annonces en base
  if (isStaff) {
    await db.update(biens).set(updateData).where(eq(biens.id, id))
  } else {
    await db.update(biens).set(updateData).where(and(eq(biens.id, id), eq(biens.ownerId, user.id)))
  }

  await logAuditEvent({
    userId: user.id,
    userEmail: user.email,
    userRole: user.role,
    action: 'bien.updated',
    entity: 'biens',
    entityId: id,
    details: { titre },
  })

  revalidatePath('/admin/biens')
  revalidatePath('/biens')
  revalidatePath('/dashboard/bailleur')

  if (isStaff) {
    redirect('/admin/biens')
  } else {
    redirect('/dashboard/bailleur')
  }
}

/**
 * Modère une annonce soumise par un bailleur ou un promoteur (Validation ou Rejet avec motif)
 */
export async function modererBienAction(bienId: string, statut: 'valide' | 'rejete', motifRejet?: string) {
  const user = await assertCan('bien:moderate')

  await db
    .update(biens)
    .set({
      statutModeration: statut,
      motifRejet: statut === 'rejete' ? (motifRejet || 'Non conforme aux critères de publication') : null,
      updatedAt: new Date(),
    })
    .where(eq(biens.id, bienId))

  await logAuditEvent({
    userId: user.id,
    userEmail: user.email,
    userRole: user.role,
    action: `bien.moderated.${statut}`,
    entity: 'biens',
    entityId: bienId,
    details: { statut, motifRejet },
  })

  revalidatePath('/admin/biens')
  revalidatePath('/biens')
  revalidatePath('/dashboard/bailleur')

  return { success: true }
}
