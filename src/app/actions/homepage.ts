'use server'

import { db } from "@/lib/db/index"
import { homepageConfigs } from "@/lib/db/schema"
import { eq, isNull } from "drizzle-orm"
import { requireAdminAccess } from "@/lib/auth/permissions"
import { revalidatePath } from "next/cache"
import { z } from 'zod'
import { uploadToR2 } from "@/lib/r2/client"

const SectionSchema = z.enum(['hero', 'about', 'expertise', 'team', 'testimonials', 'faq', 'cta', 'footer', 'explainer_video', 'tracking'])

/**
 * Fetches all homepage configurations from the database.
 * Accessible to everyone (public).
 * Returns a dictionary mapping section names to their contents.
 */
export async function getHomepageConfigsAction() {
  try {
    const rows = await db
      .select()
      .from(homepageConfigs)
      .where(isNull(homepageConfigs.deletedAt))

    const configs: Record<string, any> = {}
    for (const row of rows) {
      configs[row.section] = row.content
    }

    return {
      success: true,
      configs
    }
  } catch (error) {
    console.error('[Fetch Homepage Configs Error]', error)
    return {
      success: false,
      error: "Erreur lors de la récupération des configurations."
    }
  }
}

/**
 * Updates or creates the configuration for a specific homepage section.
 * Restricted to administrative roles.
 * Triggers an instant Next.js cache revalidation of the public homepage.
 */
export async function updateHomepageSectionAction(section: string, content: any) {
  // Enforce administrative access control
  await requireAdminAccess()

  const parsedSection = SectionSchema.safeParse(section)
  if (!parsedSection.success) {
    return {
      success: false,
      error: "Section invalide."
    }
  }

  if (!content || typeof content !== 'object') {
    return {
      success: false,
      error: "Le contenu de la configuration doit être un objet JSON valide."
    }
  }

  const sectionName = parsedSection.data

  try {
    // Check if the configuration already exists
    const existing = await db
      .select()
      .from(homepageConfigs)
      .where(eq(homepageConfigs.section, sectionName))
      .limit(1)

    if (existing.length > 0) {
      // Update existing config
      await db
        .update(homepageConfigs)
        .set({
          content,
          updatedAt: new Date(),
          deletedAt: null // Ensure it is not soft deleted if updated
        })
        .where(eq(homepageConfigs.section, sectionName))
    } else {
      // Create new config
      await db
        .insert(homepageConfigs)
        .values({
          section: sectionName,
          content
        })
    }

    // Instantly purge Next.js static page cache for the homepage
    revalidatePath('/')

    return {
      success: true,
      message: `Configuration de la section "${sectionName}" mise à jour avec succès.`
    }
  } catch (error) {
    console.error('[Update Homepage Config Error]', error)
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour de la configuration."
    }
  }
}

/**
 * Uploads a file directly to Cloudflare R2 under the 'homepage' folder.
 * Restricted to administrative roles.
 */
export async function uploadHomepageImageAction(formData: FormData) {
  await requireAdminAccess()

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) {
    return {
      success: false,
      error: "Aucun fichier n'a été fourni."
    }
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadToR2(buffer, file.name, file.type, 'homepage')
    
    return {
      success: true,
      url
    }
  } catch (error) {
    console.error('[R2 Homepage Upload Error]', error)
    return {
      success: false,
      error: "Impossible de télécharger l'image vers Cloudflare R2."
    }
  }
}
