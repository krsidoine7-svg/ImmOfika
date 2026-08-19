'use server'

import { db } from "@/lib/db/index"
import { analyticsEvents, profiles, roles, permissions, rolePermissions } from "@/lib/db/schema"
import { requireSuperAdminAccess } from "@/lib/auth/permissions"
import { eq, and, gte } from "drizzle-orm"
import { revalidatePath, unstable_cache } from "next/cache"

// Fonction interne de calcul des analytics avec cache de 30 secondes
const getCachedAnalyticsData = unstable_cache(
  async () => {
    // Filtrer pour n'analyser que les données des 30 derniers jours (évite les scans complets de table)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const allEvents = await db.select()
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, thirtyDaysAgo))

    // Calculer les métriques globales
    const uniqueVisitors = new Set(allEvents.map(e => e.visitorId))
    const totalPageViews = allEvents.filter(e => e.eventType === 'page_view' || e.eventType === 'onboarding_step').length

    // Durée moyenne
    const durationEvents = allEvents.filter(e => e.eventType === 'page_duration')
    const totalDuration = durationEvents.reduce((acc, curr) => acc + (curr.duration || 0), 0)
    const avgDuration = durationEvents.length > 0 ? Math.round(totalDuration / durationEvents.length) : 0

    // Répartition des terminaux (device)
    const deviceCounts: Record<string, number> = { ordinateur: 0, tablette: 0, mobile: 0 }
    // Répartition des régions (region)
    const regionCounts: Record<string, number> = {}

    // Parcourir pour extraire les détails
    allEvents.forEach(event => {
      const details = (event.details as any) || {}
      
      // Compter les terminaux
      const dev = details.device || 'ordinateur'
      if (dev in deviceCounts) {
        deviceCounts[dev]++
      } else {
        deviceCounts['ordinateur']++
      }

      // Compter les régions
      const reg = details.region
      if (reg) {
        regionCounts[reg] = (regionCounts[reg] || 0) + 1
      }
    })

    // 2. Traitement des funnels d'onboarding (Kanban)
    const signupStages = ["visite_inscription", "attente_otp", "compte_cree"]
    const reservationStages = ["fiche_bien", "page_formulaire", "validation_reservation"]

    const visitorHighestSignupStage: Record<string, string> = {}
    const visitorHighestResStage: Record<string, string> = {}

    // Temps de passage par étape
    const stageDurations: Record<string, { total: number; count: number }> = {}

    allEvents.forEach(event => {
      const details = (event.details as any) || {}
      const stepName = details.stepName

      if (stepName) {
        const vId = event.visitorId

        // Tunnel Inscription
        if (signupStages.includes(stepName)) {
          const currentHighest = visitorHighestSignupStage[vId]
          const currentIdx = currentHighest ? signupStages.indexOf(currentHighest) : -1
          const newIdx = signupStages.indexOf(stepName)
          if (newIdx > currentIdx) {
            visitorHighestSignupStage[vId] = stepName
          }
        }

        // Tunnel Réservation
        if (reservationStages.includes(stepName)) {
          const currentHighest = visitorHighestResStage[vId]
          const currentIdx = currentHighest ? reservationStages.indexOf(currentHighest) : -1
          const newIdx = reservationStages.indexOf(stepName)
          if (newIdx > currentIdx) {
            visitorHighestResStage[vId] = stepName
          }
        }
      }

      // Calcul des durées par étape (si enregistré comme page_duration)
      if (event.eventType === 'page_duration') {
        const stepNameForDuration = details.stepName
        if (stepNameForDuration && event.duration > 0) {
          if (!stageDurations[stepNameForDuration]) {
            stageDurations[stepNameForDuration] = { total: 0, count: 0 }
          }
          stageDurations[stepNameForDuration].total += event.duration
          stageDurations[stepNameForDuration].count++
        }
      }
    })

    // Construire les colonnes Kanban pour Inscription
    const signupKanban = signupStages.map(stage => {
      const visitorsInStage = Object.entries(visitorHighestSignupStage)
        .filter(([_, highest]) => highest === stage)
        .map(([vId]) => vId)

      const durationData = stageDurations[stage]
      const avgTime = durationData ? Math.round(durationData.total / durationData.count) : 0

      return {
        stage,
        label: stage === 'visite_inscription' ? '1. Formulaire Inscription' :
               stage === 'attente_otp' ? '2. Attente Code OTP' : '3. Compte Créé (Succès)',
        visitorsCount: visitorsInStage.length,
        avgTimeSeconds: avgTime
      }
    })

    // Construire les colonnes Kanban pour Réservation
    const reservationKanban = reservationStages.map(stage => {
      const visitorsInStage = Object.entries(visitorHighestResStage)
        .filter(([_, highest]) => highest === stage)
        .map(([vId]) => vId)

      const durationData = stageDurations[stage]
      const avgTime = durationData ? Math.round(durationData.total / durationData.count) : 0

      return {
        stage,
        label: stage === 'fiche_bien' ? '1. Fiche du Bien' :
               stage === 'page_formulaire' ? '2. Coordonnées & Notes' : '3. Redirection Paiement (Succès)',
        visitorsCount: visitorsInStage.length,
        avgTimeSeconds: avgTime
      }
    })

    // 3. Tableau détaillé des liens visités
    const pathStatsMap: Record<string, { views: number; totalDuration: number; durationCount: number }> = {}
    allEvents.forEach(event => {
      if (event.eventType === 'page_view' || event.eventType === 'onboarding_step') {
        if (!pathStatsMap[event.path]) {
          pathStatsMap[event.path] = { views: 0, totalDuration: 0, durationCount: 0 }
        }
        pathStatsMap[event.path].views++
      } else if (event.eventType === 'page_duration') {
        if (!pathStatsMap[event.path]) {
          pathStatsMap[event.path] = { views: 0, totalDuration: 0, durationCount: 0 }
        }
        pathStatsMap[event.path].totalDuration += event.duration
        pathStatsMap[event.path].durationCount++
      }
    })

    const pathStats = Object.entries(pathStatsMap).map(([path, stats]) => ({
      path,
      views: stats.views,
      avgDuration: stats.durationCount > 0 ? Math.round(stats.totalDuration / stats.durationCount) : 0
    }))

    // 4. Charger la liste des logs bruts pour l'export Excel/CSV
    const rawLogs = allEvents.map(e => {
      const details = (e.details as any) || {}
      return {
        id: e.id,
        visitorId: e.visitorId,
        sessionId: e.sessionId,
        eventType: e.eventType,
        path: e.path,
        device: details.device || 'ordinateur',
        region: details.region || 'Inconnue',
        browser: details.browser || 'Autre',
        duration: e.duration || 0,
        createdAt: e.createdAt
      }
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return {
      kpis: {
        visitorsCount: uniqueVisitors.size,
        pageViewsCount: totalPageViews,
        avgDurationSeconds: avgDuration
      },
      devices: deviceCounts,
      regions: regionCounts,
      signupKanban,
      reservationKanban,
      pathStats,
      rawLogs
    }
  },
  ["admin-analytics-dashboard-data"],
  { revalidate: 30, tags: ["analytics"] }
)

/**
 * Accès réservé aux super administrateurs et administrateurs techniques.
 * Récupère toutes les données d'analytiques et les agrège pour le tableau de bord.
 */
export async function getAnalyticsDataAction() {
  await requireSuperAdminAccess()

  try {
    const data = await getCachedAnalyticsData()
    return {
      success: true,
      data
    }
  } catch (error: any) {
    console.error('[Get Analytics Error]', error)
    return { success: false, error: error.message }
  }
}

/**
 * Charge tous les profils utilisateurs avec leurs rôles.
 */
export async function getAllUsersRolesAction() {
  await requireSuperAdminAccess()
  try {
    const users = await db.select({
      id: profiles.id,
      email: profiles.email,
      fullName: profiles.fullName,
      role: profiles.role,
      createdAt: profiles.createdAt
    }).from(profiles)

    return { success: true, users }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Modifie le rôle d'un utilisateur spécifique.
 */
export async function updateUserRoleAction(userId: string, newRole: string) {
  await requireSuperAdminAccess()
  try {
    await db.update(profiles).set({ role: newRole }).where(eq(profiles.id, userId))
    revalidatePath('/admin/analytics')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Charge les rôles, permissions et la table d'association correspondante.
 */
export async function getRbacConfigurationAction() {
  await requireSuperAdminAccess()
  try {
    const rolesList = await db.select().from(roles)
    const permissionsList = await db.select().from(permissions)
    const rolePermissionsList = await db.select().from(rolePermissions)

    return {
      success: true,
      roles: rolesList,
      permissions: permissionsList,
      rolePermissions: rolePermissionsList
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Active ou désactive une permission pour un rôle donné.
 */
export async function toggleRolePermissionAction(roleName: string, permissionCode: string, grant: boolean) {
  await requireSuperAdminAccess()
  try {
    if (grant) {
      // Vérifier si elle existe déjà
      const existing = await db.select().from(rolePermissions).where(
        and(
          eq(rolePermissions.roleName, roleName),
          eq(rolePermissions.permissionCode, permissionCode)
        )
      ).limit(1)

      if (existing.length === 0) {
        await db.insert(rolePermissions).values({
          roleName,
          permissionCode
        })
      }
    } else {
      await db.delete(rolePermissions).where(
        and(
          eq(rolePermissions.roleName, roleName),
          eq(rolePermissions.permissionCode, permissionCode)
        )
      )
    }

    revalidatePath('/admin/analytics')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
