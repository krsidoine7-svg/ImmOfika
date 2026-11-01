import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { biens } from '@/lib/db/schema'
import { siteConfig } from '@/config/site'
import { eq, and, isNull } from 'drizzle-orm'

export const revalidate = 3600 // Revalidation horaire du sitemap

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || siteConfig.url || 'https://immofika.ci').replace(/\/$/, '')

  // 1. Pages publiques statiques
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/biens`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/biens/publier`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/legal`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/confidentiality`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // 2. Annonces immobilières dynamiques (uniquement les biens disponibles et non archivés)
  let biensRoutes: MetadataRoute.Sitemap = []
  try {
    const activeBiens = await db
      .select({
        slug: biens.slug,
        updatedAt: biens.updatedAt,
      })
      .from(biens)
      .where(and(eq(biens.statut, 'disponible'), isNull(biens.deletedAt)))

    biensRoutes = activeBiens.map((b) => ({
      url: `${baseUrl}/biens/${encodeURIComponent(b.slug)}`,
      lastModified: b.updatedAt ? new Date(b.updatedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  } catch (err) {
    console.warn('[Sitemap] Impossible de récupérer les annonces pour le sitemap dynamique :', err)
  }

  return [...staticRoutes, ...biensRoutes]
}

