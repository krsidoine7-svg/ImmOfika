'use server'

import { db } from "@/lib/db"
import { biens } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export async function getPublishedBiensAction(limitCount: number = 100) {
  try {
    const publishedBiens = await db.select()
      .from(biens)
      .where(eq(biens.statut, 'disponible'))
      .orderBy(desc(biens.createdAt))
      .limit(limitCount)
      
    return { success: true, biens: publishedBiens }
  } catch (error: any) {
    console.error("Error fetching published biens:", error)
    return { success: false, error: error.message }
  }
}
