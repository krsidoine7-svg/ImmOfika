'use server'

import { 
  creerTacheAction, 
  modifierTacheAction, 
  supprimerTacheAction 
} from "@/app/actions/dossiers"
import { db } from "@/lib/db/index"
import { taches } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export { creerTacheAction, modifierTacheAction, supprimerTacheAction }

export async function deplacerTacheAction(taskId: string, targetStatut: string, newPosition?: number) {
  try {
    const res = await modifierTacheAction({
      id: taskId,
      statut: targetStatut as any,
    })
    revalidatePath('/admin/dossiers')
    return res
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function ajouterCommentaireBlocageAction(taskId: string, commentaire: string) {
  try {
    await db
      .update(taches)
      .set({ 
        bloqueCommentaire: commentaire,
        updatedAt: new Date() 
      })
      .where(eq(taches.id, taskId))
    revalidatePath('/admin/dossiers')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
