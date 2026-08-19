'use server'

import { db } from "@/lib/db"
import { reservations } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { requireAdminAccess } from "@/lib/auth/permissions"
import { revalidatePath } from "next/cache"

export async function updateReservationStatusAction(formData: FormData) {
  await requireAdminAccess()
  
  const id = formData.get('id') as string
  const statut = formData.get('statut') as any
  
  if (!id || !statut) throw new Error("ID ou statut manquant")

  await db.update(reservations).set({ statut }).where(eq(reservations.id, id))

  revalidatePath('/admin/reservations')
}
