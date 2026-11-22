'use server'

import { db } from "@/lib/db"
import { reservations, biens } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { requireAdminAccess } from "@/lib/auth/permissions"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const StatutSchema = z.object({
  id: z.string().uuid(),
  statut: z.enum(['en_attente', 'confirme', 'annule', 'expire']),
})

/**
 * Change le statut d'une réservation (l'acompte est réglé hors plateforme).
 * - confirme          -> le bien passe en « reserve »
 * - annule / expire   -> le bien redevient « disponible »
 */
export async function updateReservationStatusAction(formData: FormData) {
  await requireAdminAccess()

  const parsed = StatutSchema.safeParse({ id: formData.get('id'), statut: formData.get('statut') })
  if (!parsed.success) throw new Error("Réservation ou statut invalide")
  const { id, statut } = parsed.data

  const [reservation] = await db
    .update(reservations)
    .set({ statut, updatedAt: new Date() })
    .where(eq(reservations.id, id))
    .returning({ bienId: reservations.bienId })

  if (reservation?.bienId) {
    if (statut === 'confirme') {
      await db.update(biens).set({ statut: 'reserve', updatedAt: new Date() }).where(eq(biens.id, reservation.bienId))
    } else if (statut === 'annule' || statut === 'expire') {
      await db.update(biens).set({ statut: 'disponible', updatedAt: new Date() }).where(eq(biens.id, reservation.bienId))
    }
  }

  revalidatePath('/admin/reservations')
  revalidatePath('/biens')
}
