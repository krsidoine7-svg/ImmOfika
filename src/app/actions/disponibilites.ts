'use server'

import { db } from "@/lib/db/index"
import { visites, profiles } from "@/lib/db/schema"
import { eq, and, isNull, or, inArray } from "drizzle-orm"

/**
 * Créneaux de visite disponibles pour un mois donné.
 * Un créneau (1 h, du lundi au samedi, 8 h–18 h) est bloqué quand aucun agent
 * n'est libre, c'est-à-dire quand tous ont déjà une visite planifiée ou confirmée.
 * (L'agenda des agents et la synchronisation de calendrier externe ont été retirés.)
 */
export async function getDisponibilitesAction(mois: string, bienId: string) {
  try {
    // 1. Charger tous les agents actifs
    const agentsList = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
      })
      .from(profiles)
      .where(
        and(
          inArray(profiles.role, ['agent', 'admin_agent']),
          isNull(profiles.deletedAt)
        )
      )

    if (agentsList.length === 0) {
      return { success: true, indisponibles: [], message: "Aucun agent configuré dans le système." }
    }

    // Parse du mois requis (ex: '2026-06')
    const [yearStr, monthStr] = mois.split("-")
    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10) - 1 // 0-indexed en JS

    const startOfMonth = new Date(year, month, 1, 0, 0, 0)
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59)

    // 2. Charger toutes les indisponibilités de tous les agents pour ce mois
    
    // A. Visites planifiées / confirmées
    const dbVisites = await db
      .select({
        id: visites.id,
        agentId: visites.agentId,
        dateVisite: visites.dateVisite,
        statut: visites.statut
      })
      .from(visites)
      .where(
        and(
          isNull(visites.deletedAt),
          or(
            eq(visites.statut, 'planifiee'),
            eq(visites.statut, 'confirmee')
          )
        )
      )

    // 4. Générer tous les créneaux potentiels pour le mois
    // Heures de travail : 08h00 à 18h00 (le dernier créneau commence à 17h00)
    const heuresOuvrables = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]
    
    const totalJours = new Date(year, month + 1, 0).getDate()
    const indisponibles: string[] = [] // Liste des créneaux bloqués au format "YYYY-MM-DD HH:MM"

    for (let jour = 1; jour <= totalJours; jour++) {
      const dateCible = new Date(year, month, jour)
      const jourDeSemaine = dateCible.getDay() // 0 = Dimanche, 6 = Samedi
      
      // Dimanche est fermé d'office
      if (jourDeSemaine === 0) {
        for (const heure of heuresOuvrables) {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(jour).padStart(2, '0')}`
          indisponibles.push(`${dateStr} ${heure}`)
        }
        continue
      }

      for (const heure of heuresOuvrables) {
        const [hStr, mStr] = heure.split(":")
        const slotStart = new Date(year, month, jour, parseInt(hStr, 10), parseInt(mStr, 10), 0)
        const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000) // Durée fixe de 1h

        // Compter le nombre d'agents disponibles sur ce créneau spécifique
        let agentsLibres = 0

        for (const agent of agentsList) {
          let occupe = false

          // Check 1: Visites dans l'app
          const aVisite = dbVisites.some(v => {
            if (v.agentId !== agent.id) return false
            const vStart = new Date(v.dateVisite)
            const vEnd = new Date(vStart.getTime() + 60 * 60 * 1000) // 1h par visite
            return vStart < slotEnd && vEnd > slotStart
          })

          if (aVisite) occupe = true

          if (!occupe) {
            agentsLibres++
          }
        }

        // Si aucun agent n'est libre sur ce créneau, il est bloqué pour le client
        if (agentsLibres === 0) {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(jour).padStart(2, '0')}`
          indisponibles.push(`${dateStr} ${heure}`)
        }
      }
    }

    return {
      success: true,
      indisponibles, // format ['2026-06-15 10:00', '2026-06-15 11:00', ...]
    }

  } catch (error: any) {
    console.error("Erreur dans getDisponibilitesAction:", error)
    return { success: false, error: error.message || "Erreur lors du calcul des disponibilités." }
  }
}
