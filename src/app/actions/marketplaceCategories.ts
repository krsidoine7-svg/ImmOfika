'use server'

import { db } from "@/lib/db"
import { biens, bienImages, profiles } from "@/lib/db/schema"
import { eq, and, isNull, inArray, desc, or, SQL } from "drizzle-orm"
import {
  MARKETPLACE_CATEGORIES,
  CategoryDefinition,
  MarketplaceBien,
  AdvertiserType,
} from "@/types/marketplace"

const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800"

/**
 * Récupère les annonces actives pour une catégorie donnée
 */
export async function getBiensByCategoryAction(
  category: CategoryDefinition,
  limitCount: number = 6
): Promise<MarketplaceBien[]> {
  try {
    const conditions: SQL<unknown>[] = [
      isNull(biens.deletedAt),
      or(isNull(biens.statutModeration), eq(biens.statutModeration, 'valide')) as SQL<unknown>,
    ]

    // Filtrer par transaction (vente / location)
    if (category.filter.transaction) {
      conditions.push(eq(biens.transaction, category.filter.transaction))
    }

    // Filtrer par type (villa, appartement, terrain...)
    if (category.filter.type) {
      conditions.push(eq(biens.type, category.filter.type))
    }

    // Filtrer par meublé si spécifié
    if (category.filter.meuble !== undefined) {
      conditions.push(eq(biens.meuble, category.filter.meuble))
    }

    // Requête principale
    const rows = await db
      .select({
        id: biens.id,
        slug: biens.slug,
        titre: biens.titre,
        description: biens.description,
        prix: biens.prix,
        transaction: biens.transaction,
        type: biens.type,
        statut: biens.statut,
        ville: biens.ville,
        quartier: biens.quartier,
        surface: biens.surface,
        chambres: biens.chambres,
        sallesDeBain: biens.sallesDeBain,
        meuble: biens.meuble,
        mainImageUrl: biens.mainImageUrl,
        vues: biens.vues,
        agentId: biens.agentId,
        agentName: profiles.fullName,
        agentPhone: profiles.phone,
        agentRole: profiles.role,
      })
      .from(biens)
      .leftJoin(profiles, eq(biens.agentId, profiles.id))
      .where(and(...conditions))
      .orderBy(desc(biens.createdAt))
      .limit(limitCount)

    // Compléter les images manquantes depuis bienImages
    const biensSansImage = rows.filter((b) => !b.mainImageUrl)
    const imageMap = new Map<string, string>()

    if (biensSansImage.length > 0) {
      const ids = biensSansImage.map((b) => b.id)
      const images = await db
        .select({
          bienId: bienImages.bienId,
          url: bienImages.url,
        })
        .from(bienImages)
        .where(inArray(bienImages.bienId, ids))
        .orderBy(bienImages.order)

      images.forEach((img) => {
        if (!imageMap.has(img.bienId)) {
          imageMap.set(img.bienId, img.url)
        }
      })
    }

    return rows.map((row) => {
      // Déterminer le type d'annonceur
      let advertiserType: AdvertiserType = 'particulier'
      const role = (row.agentRole || '').toLowerCase()
      if (role.includes('admin') || role === 'promoteur') {
        advertiserType = 'promoteur'
      } else if (role === 'agent' || role.includes('agence')) {
        advertiserType = 'agence'
      }

      const imageUrl =
        row.mainImageUrl ||
        imageMap.get(row.id) ||
        DEFAULT_FALLBACK_IMAGE

      return {
        id: row.id,
        slug: row.slug,
        titre: row.titre,
        description: row.description,
        prix: parseFloat(row.prix || '0'),
        devise: 'FCFA',
        transaction: (row.transaction as 'vente' | 'location') || 'vente',
        type: row.type,
        statut: (row.statut as 'disponible' | 'reserve' | 'vendu' | 'loue') || 'disponible',
        ville: row.ville,
        quartier: row.quartier,
        surface: row.surface ? parseFloat(row.surface) : null,
        chambres: row.chambres,
        sallesDeBain: row.sallesDeBain,
        meuble: row.meuble,
        mainImageUrl: imageUrl,
        vues: row.vues || 0,
        advertiser: {
          name: row.agentName || 'ImmOfika Partenaire',
          type: advertiserType,
          phone: row.agentPhone,
        },
      }
    })
  } catch (error) {
    console.error(`[getBiensByCategoryAction Error: ${category.id}]`, error)
    return []
  }
}

/**
 * Récupère l'ensemble des annonces pour toutes les catégories enregistrées
 * Exécuté en parallèle pour des performances maximales
 */
export async function getMarketplaceShowcaseAction(limitPerCategory: number = 6) {
  try {
    const results = await Promise.all(
      MARKETPLACE_CATEGORIES.map(async (cat) => {
        const items = await getBiensByCategoryAction(cat, limitPerCategory)
        return { categoryId: cat.id, items }
      })
    )

    const categoriesData: Record<string, MarketplaceBien[]> = {}
    results.forEach(({ categoryId, items }) => {
      categoriesData[categoryId] = items
    })

    return {
      success: true,
      categories: categoriesData,
    }
  } catch (error: any) {
    console.error('[getMarketplaceShowcaseAction Error]', error)
    return {
      success: false,
      error: error.message || 'Erreur lors de la récupération du catalogue',
      categories: {},
    }
  }
}
