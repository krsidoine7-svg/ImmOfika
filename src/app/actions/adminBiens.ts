'use server'

import { db } from "@/lib/db/index"
import { biens, reservations, bienImages, favoris, profiles } from "@/lib/db/schema"
import { eq, count, isNull } from "drizzle-orm"
import { requireAdminAccess } from "@/lib/auth/permissions"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { uploadToR2 } from "@/lib/r2/client"
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
  await requireAdminAccess()
  
  const id = formData.get('id') as string
  if (!id) throw new Error("ID manquant")

  // Soft delete
  await db.update(biens).set({ deletedAt: new Date() }).where(eq(biens.id, id))

  revalidatePath('/admin/biens')
  revalidatePath('/biens')
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
  await requireAdminAccess()

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
  })

  // Déclencher les notifications push pour tous les abonnés actifs
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
    
    // Envoyer les notifications push en parallèle pour optimiser la latence
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

  revalidatePath('/admin/biens')
  revalidatePath('/biens')
  redirect('/admin/biens')
}

export async function updateBienAction(formData: FormData) {
  await requireAdminAccess()

  const id = formData.get('id') as string
  if (!id) throw new Error("ID manquant")

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

  await db.update(biens).set(updateData).where(eq(biens.id, id))

  revalidatePath('/admin/biens')
  revalidatePath('/biens')
  redirect('/admin/biens')
}
