'use server'

import { db } from "@/lib/db/index"
import { profiles, reservations, paiements, favoris } from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"
import { requireAdminAccess } from "@/lib/auth/permissions"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const ToggleStatusSchema = z.object({
  id: z.string().uuid("ID utilisateur invalide"),
  currentStatus: z.string()
})

const UserImpactSchema = z.object({
  userId: z.string().uuid("ID utilisateur invalide")
})

export async function toggleUserStatusAction(formData: FormData) {
  await requireAdminAccess()
  
  const id = formData.get('id') as string
  const currentStatus = formData.get('currentStatus') as string

  const parsed = ToggleStatusSchema.safeParse({ id, currentStatus })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  if (parsed.data.currentStatus === 'active') {
    // Suspend user (soft delete)
    await db.update(profiles).set({ deletedAt: new Date() }).where(eq(profiles.id, parsed.data.id))
  } else {
    // Reactivate user
    await db.update(profiles).set({ deletedAt: null }).where(eq(profiles.id, parsed.data.id))
  }

  revalidatePath('/admin/utilisateurs')
}

export async function getUserImpact(userId: string) {
  await requireAdminAccess()

  const parsed = UserImpactSchema.safeParse({ userId })
  if (!parsed.success) {
    return { reservations: 0, paiements: 0, favoris: 0 }
  }

  const [[resCount], [paiCount], [favCount]] = await Promise.all([
    db.select({ count: count() }).from(reservations).where(eq(reservations.clientId, parsed.data.userId)),
    db.select({ count: count() }).from(paiements).where(eq(paiements.clientId, parsed.data.userId)),
    db.select({ count: count() }).from(favoris).where(eq(favoris.clientId, parsed.data.userId)),
  ])

  return {
    reservations: resCount?.count || 0,
    paiements: paiCount?.count || 0,
    favoris: favCount?.count || 0,
  }
}
