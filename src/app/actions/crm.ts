'use server'

import { db } from "@/lib/db/index"
import { leads } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function toggleManualConditionAction(
  leadId: string,
  conditionId: string,
  nextValidState: boolean
) {
  if (!leadId || !conditionId) {
    return { error: "Paramètres manquants." }
  }

  try {
    const updateData: Record<string, any> = { updatedAt: new Date() }

    if (conditionId === 'visite_confirmee') {
      updateData.visiteConfirmee = nextValidState
    } else if (conditionId === 'offre_validee') {
      updateData.offreValidee = nextValidState
    } else if (conditionId === 'engagement_signe') {
      updateData.engagementSigne = nextValidState
    }

    await db
      .update(leads)
      .set(updateData)
      .where(eq(leads.id, leadId))

    revalidatePath('/admin/leads')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || "Erreur lors de la mise à jour." }
  }
}
