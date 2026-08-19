'use server'

import { db } from "@/lib/db/index"
import { visites, profiles, agentCalendriers, agentIndisponibilites, biens } from "@/lib/db/schema"
import { eq, and, isNull, or, inArray } from "drizzle-orm"
import { parseICal, ICalEvent } from "@/lib/calendar/ical-parser"
import { requirePermission } from "@/lib/auth/permissions"
import { revalidatePath } from "next/cache"

// Cache mémoire pour les agendas iCal (expire au bout de 15 minutes)
interface CacheEntry {
  events: ICalEvent[]
  expiresAt: number
}
const icalCache: Record<string, CacheEntry> = {}
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes

/**
 * Télécharge et parse le calendrier iCal d'un agent avec gestion du cache.
 */
export async function fetchAgentICalEvents(url: string): Promise<ICalEvent[]> {
  const now = Date.now()
  if (icalCache[url] && icalCache[url].expiresAt > now) {
    return icalCache[url].events
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const response = await fetch(url, {
      headers: { 'User-Agent': 'FavorCI-CalendarSync/1.0' },
      cache: 'no-store', // Évite le cache agressif du navigateur pour avoir les données fraîches
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      console.warn(`[iCal Sync] Impossible de récupérer l'agenda à l'URL : ${url} — Code statut HTTP : ${response.status}`)
      return icalCache[url]?.events || []
    }
    
    const icsText = await response.text()
    const events = parseICal(icsText)
    
    // Mettre en cache
    icalCache[url] = {
      events,
      expiresAt: now + CACHE_DURATION
    }
    
    return events
  } catch (error) {
    console.error(`[iCal Sync] Impossible de récupérer l'agenda à l'URL : ${url}`, error)
    // En cas d'erreur de réseau, on renvoie le cache existant (même expiré) ou un tableau vide
    return icalCache[url]?.events || []
  }
}

/**
 * Force la purge du cache iCal pour un agent donné
 */
export async function purgerCacheAgentAction(icalUrl: string) {
  if (icalUrl && icalCache[icalUrl]) {
    delete icalCache[icalUrl]
  }
  return { success: true }
}

export interface SlotDisponibilite {
  date: string // format ISO 'YYYY-MM-DD'
  heure: string // format 'HH:MM'
  disponible: boolean
}

/**
 * Récupère les créneaux occupés / libres pour un mois et un bien immobilier donné.
 * Un créneau est disponible si au moins un agent est libre sur ce créneau.
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

    // B. Indisponibilités locales déclarées
    const dbIndisponibilites = await db
      .select()
      .from(agentIndisponibilites)
      .where(
        and(
          isNull(agentIndisponibilites.deletedAt)
        )
      )

    // C. Configuration iCal des agents
    const dbCalendriers = await db
      .select()
      .from(agentCalendriers)
      .where(isNull(agentCalendriers.deletedAt))

    // Associer les calendriers aux agents
    const calendrierParAgent: Record<string, string> = {}
    for (const cal of dbCalendriers) {
      calendrierParAgent[cal.agentId] = cal.icalUrl
    }

    // 3. Charger et parser les flux iCal en parallèle pour les agents
    const googleEventsParAgent: Record<string, ICalEvent[]> = {}
    await Promise.all(
      agentsList.map(async (agent) => {
        const url = calendrierParAgent[agent.id]
        if (url) {
          const events = await fetchAgentICalEvents(url)
          // Filtrer les événements iCal qui se trouvent dans le mois ciblé
          googleEventsParAgent[agent.id] = events.filter(e => {
            return e.end > startOfMonth && e.start < endOfMonth
          })
        } else {
          googleEventsParAgent[agent.id] = []
        }
      })
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

          // Check 2: Indisponibilités déclarées à la main
          if (!occupe) {
            const aIndisp = dbIndisponibilites.some(ind => {
              if (ind.agentId !== agent.id) return false
              const indStart = new Date(ind.dateDebut)
              const indFin = new Date(ind.dateFin)
              return indStart < slotEnd && indFin > slotStart
            })
            if (aIndisp) occupe = true
          }

          // Check 3: Événements Google Calendar
          if (!occupe) {
            const gEvents = googleEventsParAgent[agent.id] || []
            const aGoogleEvent = gEvents.some(ge => {
              return ge.start < slotEnd && ge.end > slotStart
            })
            if (aGoogleEvent) occupe = true
          }

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

// Action pour sauvegarder ou mettre à jour le calendrier iCal de l'agent connecté
export async function sauvegarderCalendrierAction(icalUrl: string) {
  // Les agents ont au moins la permission de voir les visites
  await requirePermission('view:visites')

  const { createClient } = await import('@/utils/supabase/server')
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Non authentifié." }
  }

  try {
    // 1. Essayer de charger le calendrier immédiatement pour le valider et remplir le cache
    let lastSyncedAt: Date | null = null
    try {
      await fetchAgentICalEvents(icalUrl)
      lastSyncedAt = new Date()
    } catch (e) {
      console.warn("[iCal Save] Échec de la première synchronisation/validation:", e)
    }

    // 2. Vérifier si un enregistrement existe déjà pour cet agent
    const existing = await db
      .select()
      .from(agentCalendriers)
      .where(eq(agentCalendriers.agentId, user.id))
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(agentCalendriers)
        .set({
          icalUrl,
          lastSyncedAt: lastSyncedAt || existing[0].lastSyncedAt, // Conserver la date précédente si celle-ci échoue
          deletedAt: null, // Restauration en cas de soft delete précédent
          updatedAt: new Date()
        })
        .where(eq(agentCalendriers.agentId, user.id))
    } else {
      await db
        .insert(agentCalendriers)
        .values({
          agentId: user.id,
          icalUrl,
          lastSyncedAt
        })
    }

    // Vider le cache de l'ancien iCal
    if (existing.length > 0) {
      await purgerCacheAgentAction(existing[0].icalUrl)
    }

    revalidatePath('/admin/agenda')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || "Erreur de sauvegarde." }
  }
}

// Action pour récupérer la config iCal de l'agent connecté
export async function getCalendrierAgentAction() {
  await requirePermission('view:visites')

  const { createClient } = await import('@/utils/supabase/server')
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Non authentifié." }

  try {
    const list = await db
      .select()
      .from(agentCalendriers)
      .where(
        and(
          eq(agentCalendriers.agentId, user.id),
          isNull(agentCalendriers.deletedAt)
        )
      )
      .limit(1)

    return { success: true, calendrier: list[0] || null }
  } catch (err: any) {
    return { error: err.message }
  }
}

// Action pour forcer la synchronisation manuelle de l'agenda iCal de l'agent connecté
export async function forcerSynchronisationCalendrierAction() {
  await requirePermission('view:visites')

  const { createClient } = await import('@/utils/supabase/server')
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Non authentifié." }

  try {
    const list = await db
      .select()
      .from(agentCalendriers)
      .where(
        and(
          eq(agentCalendriers.agentId, user.id),
          isNull(agentCalendriers.deletedAt)
        )
      )
      .limit(1)

    const cal = list[0]
    if (!cal) {
      return { error: "Aucun calendrier configuré à synchroniser." }
    }

    // 1. Purger le cache en mémoire locale
    if (icalCache[cal.icalUrl]) {
      delete icalCache[cal.icalUrl]
    }

    // 2. Forcer le re-téléchargement et le parsing
    await fetchAgentICalEvents(cal.icalUrl)

    // 3. Mettre à jour lastSyncedAt
    const now = new Date()
    await db
      .update(agentCalendriers)
      .set({
        lastSyncedAt: now,
        updatedAt: now
      })
      .where(eq(agentCalendriers.id, cal.id))

    revalidatePath('/admin/agenda')
    return { success: true, lastSyncedAt: now.toISOString() }
  } catch (err: any) {
    return { error: err.message || "Échec de la synchronisation forcée." }
  }
}

// Action pour ajouter une indisponibilité locale
export async function ajouterIndisponibiliteAction(input: {
  titre: string
  dateDebut: string
  dateFin: string
}) {
  await requirePermission('view:visites')

  const { createClient } = await import('@/utils/supabase/server')
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Non authentifié." }

  try {
    const start = new Date(input.dateDebut)
    const end = new Date(input.dateFin)

    if (start >= end) {
      return { error: "La date de début doit être antérieure à la date de fin." }
    }

    const [inserted] = await db
      .insert(agentIndisponibilites)
      .values({
        agentId: user.id,
        titre: input.titre,
        dateDebut: start,
        dateFin: end
      })
      .returning()

    revalidatePath('/admin/agenda')
    return { success: true, indisponibilite: inserted }
  } catch (err: any) {
    return { error: err.message }
  }
}

// Action pour supprimer une indisponibilité locale (soft delete)
export async function supprimerIndisponibiliteAction(id: string) {
  await requirePermission('view:visites')

  const { createClient } = await import('@/utils/supabase/server')
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Non authentifié." }

  try {
    await db
      .update(agentIndisponibilites)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date()
      })
      .where(
        and(
          eq(agentIndisponibilites.id, id),
          eq(agentIndisponibilites.agentId, user.id)
        )
      )

    revalidatePath('/admin/agenda')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

// Action pour récupérer les indisponibilités locales de l'agent connecté
export async function getIndisponibilitesAgentAction() {
  await requirePermission('view:visites')

  const { createClient } = await import('@/utils/supabase/server')
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Non authentifié." }

  try {
    const list = await db
      .select()
      .from(agentIndisponibilites)
      .where(
        and(
          eq(agentIndisponibilites.agentId, user.id),
          isNull(agentIndisponibilites.deletedAt)
        )
      )
      .orderBy(agentIndisponibilites.dateDebut)

    return { success: true, indisponibilites: list }
  } catch (err: any) {
    return { error: err.message }
  }
}

// Action pour récupérer l'agenda d'un agent spécifique (visites assignées)
export async function getAgentAgendaVisitesAction() {
  await requirePermission('view:visites')

  const { createClient } = await import('@/utils/supabase/server')
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Non authentifié." }

  try {
    const list = await db
      .select({
        id: visites.id,
        dateVisite: visites.dateVisite,
        statut: visites.statut,
        commentaires: visites.commentaires,
        bienTitre: biens.titre,
        bienVille: biens.ville,
        clientName: profiles.fullName,
      })
      .from(visites)
      .innerJoin(biens, eq(visites.bienId, biens.id))
      .leftJoin(profiles, eq(visites.clientId, profiles.id))
      .where(
        and(
          eq(visites.agentId, user.id),
          isNull(visites.deletedAt),
          or(
            eq(visites.statut, 'planifiee'),
            eq(visites.statut, 'confirmee'),
            eq(visites.statut, 'effectuee')
          )
        )
      )
      .orderBy(visites.dateVisite)

    return { success: true, visites: list }
  } catch (err: any) {
    return { error: err.message }
  }
}

/**
 * Récupère les KPIs RH pour l'agent connecté
 */
export async function getAgentKPIsAction() {
  await requirePermission('view:visites')

  const { createClient } = await import('@/utils/supabase/server')
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Non authentifié." }

  try {
    const agentId = user.id

    // 1. Déterminer les dates du mois en cours
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()

    const startOfMonth = new Date(year, month, 1, 0, 0, 0)
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59)

    // 2. Charger toutes les visites de l'agent
    const agentVisits = await db
      .select({
        id: visites.id,
        dateVisite: visites.dateVisite,
        statut: visites.statut
      })
      .from(visites)
      .where(
        and(
          eq(visites.agentId, agentId),
          isNull(visites.deletedAt)
        )
      )

    // A. Ratio des visites menées
    const totalHonorees = agentVisits.filter(v => v.statut === 'effectuee').length
    const totalAnnulees = agentVisits.filter(v => v.statut === 'annulee').length

    // B. Temps sur le terrain (1h par visite honorée)
    const totalHoursField = totalHonorees

    // 3. Calculer le taux d'occupation mensuel
    // Slots de travail : Lundi au Samedi, 8h00 - 18h00 (10 slots de 1h par jour)
    const workingSlots: { start: Date; end: Date }[] = []
    const totalDays = new Date(year, month + 1, 0).getDate()

    for (let day = 1; day <= totalDays; day++) {
      const dateCible = new Date(year, month, day)
      const dayOfWeek = dateCible.getDay() // 0 = Dimanche, 6 = Samedi
      if (dayOfWeek === 0) continue // Pas de travail le dimanche

      const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
      for (const h of hours) {
        const slotStart = new Date(year, month, day, h, 0, 0)
        const slotEnd = new Date(year, month, day, h + 1, 0, 0)
        workingSlots.push({ start: slotStart, end: slotEnd })
      }
    }

    const totalWorkingSlotsCount = workingSlots.length

    // Récupérer les indisponibilités locales de ce mois
    const localAbsences = await db
      .select()
      .from(agentIndisponibilites)
      .where(
        and(
          eq(agentIndisponibilites.agentId, agentId),
          isNull(agentIndisponibilites.deletedAt)
        )
      )

    // Récupérer et parser le calendrier iCal
    const listCal = await db
      .select()
      .from(agentCalendriers)
      .where(
        and(
          eq(agentCalendriers.agentId, agentId),
          isNull(agentCalendriers.deletedAt)
        )
      )
    
    const cal = listCal[0]
    let googleEvents: ICalEvent[] = []
    if (cal?.icalUrl) {
      try {
        const events = await fetchAgentICalEvents(cal.icalUrl)
        googleEvents = events.filter(e => e.end > startOfMonth && e.start < endOfMonth)
      } catch (e) {
        console.error("[KPIs Sync] Impossible d'obtenir l'agenda iCal de l'agent :", e)
      }
    }

    // Filtrer les visites actives de ce mois
    const activeMonthVisits = agentVisits.filter(v => {
      const vDate = new Date(v.dateVisite)
      return (
        vDate >= startOfMonth &&
        vDate <= endOfMonth &&
        ['planifiee', 'confirmee', 'effectuee'].includes(v.statut)
      )
    })

    // Évaluer l'occupation pour chaque slot
    let occupiedSlotsCount = 0
    for (const slot of workingSlots) {
      let occupied = false

      // 1. Check visites
      const hasVisit = activeMonthVisits.some(v => {
        const vStart = new Date(v.dateVisite)
        const vEnd = new Date(vStart.getTime() + 60 * 60 * 1000)
        return vStart < slot.end && vEnd > slot.start
      })
      if (hasVisit) occupied = true

      // 2. Check indisponibilités locales
      if (!occupied) {
        const hasAbsence = localAbsences.some(abs => {
          const absStart = new Date(abs.dateDebut)
          const absFin = new Date(abs.dateFin)
          return absStart < slot.end && absFin > slot.start
        })
        if (hasAbsence) occupied = true
      }

      // 3. Check Google Calendar events
      if (!occupied) {
        const hasGoogle = googleEvents.some(ge => {
          return ge.start < slot.end && ge.end > slot.start
        })
        if (hasGoogle) occupied = true
      }

      if (occupied) {
        occupiedSlotsCount++
      }
    }

    const occupationRate = totalWorkingSlotsCount > 0
      ? Math.min(Math.round((occupiedSlotsCount / totalWorkingSlotsCount) * 100), 100)
      : 0

    return {
      success: true,
      kpis: {
        occupationRate,
        occupiedHours: occupiedSlotsCount,
        totalWorkingHours: totalWorkingSlotsCount,
        totalHonorees,
        totalAnnulees,
        totalHoursField
      }
    }
  } catch (err: any) {
    console.error("Erreur dans getAgentKPIsAction :", err)
    return { error: err.message || "Erreur de calcul des KPIs." }
  }
}

