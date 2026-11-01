'use server'

import { db } from "@/lib/db"
import { biens, bienImages } from "@/lib/db/schema"
import { eq, desc, isNull, inArray, and } from "drizzle-orm"

export async function getPublishedBiensAction(limitCount: number = 100) {
  try {
    const publishedBiens = await db
      .select()
      .from(biens)
      .where(
        and(
          isNull(biens.deletedAt),
          eq(biens.statutModeration, 'valide'),
          inArray(biens.statut, ['disponible', 'reserve'])
        )
      )
      .orderBy(desc(biens.createdAt))
      .limit(limitCount)

    // Si certains biens n'ont pas de photo principale, récupérer leur première photo dans bienImages
    const biensSansImage = publishedBiens.filter(b => !b.mainImageUrl)
    if (biensSansImage.length > 0) {
      const ids = biensSansImage.map(b => b.id)
      const images = await db
        .select({
          bienId: bienImages.bienId,
          url: bienImages.url,
        })
        .from(bienImages)
        .where(inArray(bienImages.bienId, ids))
        .orderBy(bienImages.order)

      const imageMap = new Map<string, string>()
      images.forEach(img => {
        if (!imageMap.has(img.bienId)) {
          imageMap.set(img.bienId, img.url)
        }
      })

      publishedBiens.forEach(b => {
        if (!b.mainImageUrl && imageMap.has(b.id)) {
          b.mainImageUrl = imageMap.get(b.id)!
        }
      })
    }
      
    return { success: true, biens: publishedBiens }
  } catch (error: any) {
    console.error("Error fetching published biens:", error)
    return { success: false, error: error.message, biens: [] }
  }
}

