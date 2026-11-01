// src/app/actions/nearbyBiens.ts
"use server"

import { db } from "@/lib/db"
import { biens, bienImages, profiles } from "@/lib/db/schema"
import { eq, and, isNull, desc, inArray } from "drizzle-orm"
import { 
  COMMUNES_CI, 
  CommuneInfo, 
  findNearestCommune, 
  getCommuneByIdOrName, 
  matchesCommune, 
  calculateDistanceKm 
} from "@/config/communes"
import { MarketplaceBien, AdvertiserType } from "@/types/marketplace"

export interface NearbyBienItem extends MarketplaceBien {
  distanceKm?: number
  isExactCommune: boolean
  communeNom: string
  latitude?: number | null
  longitude?: number | null
}

export interface NearbyBiensResult {
  success: boolean
  commune: CommuneInfo
  biens: NearbyBienItem[]
  totalExactMatch: number
  detectionMethod: "gps" | "selection" | "default"
  error?: string
}

const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800"

export async function getNearbyBiensAction({
  communeId,
  lat,
  lng,
  limit = 6
}: {
  communeId?: string
  lat?: number
  lng?: number
  limit?: number
}): Promise<NearbyBiensResult> {
  try {
    let targetCommune: CommuneInfo = COMMUNES_CI[0] // Cocody par défaut
    let method: "gps" | "selection" | "default" = "default"

    // 1. Détermination de la commune cible
    if (typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng)) {
      const nearest = findNearestCommune(lat, lng)
      targetCommune = nearest.commune
      method = "gps"
    } else if (communeId) {
      const found = getCommuneByIdOrName(communeId)
      if (found) {
        targetCommune = found
        method = "selection"
      }
    }

    // 2. Récupération des biens actifs avec profil annonceur
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
        latitude: biens.latitude,
        longitude: biens.longitude,
        vues: biens.vues,
        agentId: biens.agentId,
        agentName: profiles.fullName,
        agentPhone: profiles.phone,
        agentRole: profiles.role,
      })
      .from(biens)
      .leftJoin(profiles, eq(biens.agentId, profiles.id))
      .where(
        and(
          eq(biens.statut, "disponible"),
          isNull(biens.deletedAt),
          eq(biens.statutModeration, "valide")
        )
      )
      .orderBy(desc(biens.createdAt))

    // 3. Compléter les images secondaires pour les biens sans mainImageUrl
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

    // 4. Mapper et enrichir avec distance et matching commune
    const scoredBiens: NearbyBienItem[] = rows.map((row) => {
      const fullLoc = `${row.quartier ? row.quartier + ", " : ""}${row.ville || ""}`
      const isExact = matchesCommune(fullLoc, targetCommune.id)

      let distanceKm: number | undefined
      const bLat = row.latitude ? Number(row.latitude) : undefined
      const bLng = row.longitude ? Number(row.longitude) : undefined

      if (typeof lat === "number" && typeof lng === "number" && bLat && bLng) {
        distanceKm = calculateDistanceKm(lat, lng, bLat, bLng)
      } else if (bLat && bLng) {
        distanceKm = calculateDistanceKm(targetCommune.lat, targetCommune.lng, bLat, bLng)
      }

      // Type annonceur
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
        statut: (row.statut as any) || 'disponible',
        ville: row.ville,
        quartier: row.quartier,
        surface: row.surface ? parseFloat(row.surface) : null,
        chambres: row.chambres,
        sallesDeBain: row.sallesDeBain,
        meuble: row.meuble,
        mainImageUrl: imageUrl,
        vues: row.vues || 0,
        latitude: bLat,
        longitude: bLng,
        advertiser: {
          name: row.agentName || 'ImmOfika Partenaire',
          type: advertiserType,
          phone: row.agentPhone,
        },
        distanceKm,
        isExactCommune: isExact,
        communeNom: row.quartier || row.ville || targetCommune.nom
      }
    })

    // 5. Partitionner : correspondances exactes vs communes voisines
    const exactMatches = scoredBiens.filter((b) => b.isExactCommune)
    const otherBiens = scoredBiens.filter((b) => !b.isExactCommune)

    // Trier les exacts par distance (si dispo)
    exactMatches.sort((a, b) => {
      if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm
      }
      return 0
    })

    // Compléter avec les communes les plus proches si moins de `limit` biens
    let finalBiens: NearbyBienItem[] = [...exactMatches]
    if (finalBiens.length < limit) {
      otherBiens.sort((a, b) => {
        if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
          return a.distanceKm - b.distanceKm
        }
        return 0
      })
      const needed = limit - finalBiens.length
      finalBiens = [...finalBiens, ...otherBiens.slice(0, needed)]
    } else {
      finalBiens = finalBiens.slice(0, limit)
    }

    return {
      success: true,
      commune: targetCommune,
      biens: finalBiens,
      totalExactMatch: exactMatches.length,
      detectionMethod: method
    }
  } catch (error: any) {
    console.error("[getNearbyBiensAction Error]", error)
    return {
      success: false,
      commune: COMMUNES_CI[0],
      biens: [],
      totalExactMatch: 0,
      detectionMethod: "default",
      error: error.message || "Erreur lors de la récupération des annonces proches"
    }
  }
}
