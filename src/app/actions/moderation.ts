"use server"

import { db } from '@/lib/db'
import { profiles, biens, paiements, leads, notifications } from '@/lib/db/schema'
import { sql, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { requireSuperAdminAccess } from '@/lib/auth/permissions'

export interface SystemHealthResult {
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE_PAUSED'
  latencyMs: number
  databaseOk: boolean
  authServiceOk: boolean
  timestamp: string
  message: string
  profilesCount?: number
  errorDetails?: string
}

/**
 * Exécute un diagnostic complet en temps réel du serveur et de Supabase (Health Check).
 * Si un webhookUrl Make.com est fourni, envoie le rapport directement par POST.
 */
export async function runSystemHealthCheckAction(webhookUrl?: string): Promise<SystemHealthResult> {
  await requireSuperAdminAccess()

  const startTime = performance.now()
  let databaseOk = false
  let authServiceOk = false
  let profilesCount = 0
  let errorDetails: string | undefined = undefined

  try {
    // 1. Test ping SQL ultra-rapide et comptage des comptes
    const result = await db.select({ count: sql<number>`count(*)` }).from(profiles)
    profilesCount = Number(result[0]?.count || 0)
    databaseOk = true
  } catch (err: unknown) {
    databaseOk = false
    errorDetails = err instanceof Error ? err.message : String(err)
  }

  // 2. Test du service Auth Supabase
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { error: authError } = await supabase.auth.getSession()
    if (!authError) {
      authServiceOk = true
    } else {
      errorDetails = (errorDetails ? errorDetails + ' | ' : '') + authError.message
    }
  } catch (err: unknown) {
    authServiceOk = false
    errorDetails = (errorDetails ? errorDetails + ' | ' : '') + (err instanceof Error ? err.message : String(err))
  }

  const endTime = performance.now()
  const latencyMs = Math.round(endTime - startTime)

  let status: 'ONLINE' | 'DEGRADED' | 'OFFLINE_PAUSED' = 'ONLINE'
  let message = '🟢 Serveur Supabase & Base de données pleinement opérationnels.'

  if (!databaseOk || !authServiceOk) {
    status = 'OFFLINE_PAUSED'
    message = '🔴 ALERTE CRITIQUE : Supabase est inaccessible, en pause ou hors ligne ! Rendez-vous sur console.supabase.com pour relancer le projet.'
  } else if (latencyMs > 1500) {
    status = 'DEGRADED'
    message = '🟡 ALERTE : Latence élevée sur la base de données. Surveillance recommandée.'
  }

  const healthPayload: SystemHealthResult = {
    status,
    latencyMs,
    databaseOk,
    authServiceOk,
    timestamp: new Date().toISOString(),
    message,
    profilesCount,
    errorDetails,
  }

  // Envoi automatique au Webhook Make.com si configuré ou demandé
  if (webhookUrl && webhookUrl.startsWith('http')) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'FAVOR_CI_SYSTEM_HEALTH_CHECK',
          promoterStatus: 'Promoteur Immobilier Agréé',
          ...healthPayload,
        }),
      })
    } catch (webhookErr) {
      console.error('Erreur lors de lenvoi au webhook Make.com:', webhookErr)
    }
  }

  return healthPayload
}

/**
 * Envoie une alerte personnalisée ou un rapport de test au webhook Make.com
 */
export async function sendWebhookAlertAction(webhookUrl: string, customMessage: string, alertType: string = 'SECURITE_LBC_FT'): Promise<{ success: boolean; message: string }> {
  await requireSuperAdminAccess()

  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return { success: false, message: 'URL de Webhook Make.com invalide.' }
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'FAVOR_CI_WEBHOOK_ALERT',
        promoterStatus: 'Promoteur Immobilier Agréé',
        alertType,
        customMessage,
        timestamp: new Date().toISOString(),
      }),
    })

    if (res.ok) {
      return { success: true, message: 'Alerte envoyée avec succès au Webhook Make.com !' }
    } else {
      return { success: false, message: `Échec Make.com: Code HTTP ${res.status}` }
    }
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : 'Erreur réseau vers le webhook.' }
  }
}

/**
 * Récupère le flux complet de modération (comptes, médias, transactions, leads)
 */
export async function getModerationFeedAction() {
  await requireSuperAdminAccess()

  const recentAccounts = await db
    .select({
      id: profiles.id,
      email: profiles.email,
      fullName: profiles.fullName,
      role: profiles.role,
      avatarUrl: profiles.avatarUrl,
      suspensionReason: profiles.suspensionReason,
      createdAt: profiles.createdAt,
      deletedAt: profiles.deletedAt,
    })
    .from(profiles)
    .orderBy(desc(profiles.createdAt))
    .limit(30)

  const recentProperties = await db
    .select({
      id: biens.id,
      titre: biens.titre,
      type: biens.type,
      transaction: biens.transaction,
      prix: biens.prix,
      statut: biens.statut,
      mainImageUrl: biens.mainImageUrl,
      pdfAnnexeUrl: biens.pdfAnnexeUrl,
      videoUrl: biens.videoUrl,
      createdAt: biens.createdAt,
    })
    .from(biens)
    .orderBy(desc(biens.createdAt))
    .limit(25)

  const recentTransactions = await db
    .select({
      id: paiements.id,
      montant: paiements.montant,
      statut: paiements.statut,
      typePaiement: paiements.typePaiement,
      paystackReference: paiements.paystackReference,
      factureUrl: paiements.factureUrl,
      createdAt: paiements.createdAt,
    })
    .from(paiements)
    .orderBy(desc(paiements.createdAt))
    .limit(25)

  const recentLeads = await db
    .select({
      id: leads.id,
      nom: leads.nom,
      prenom: leads.prenom,
      email: leads.email,
      telephone: leads.telephone,
      message: leads.message,
      source: leads.source,
      createdAt: leads.createdAt,
    })
    .from(leads)
    .orderBy(desc(leads.createdAt))
    .limit(25)

  return {
    accounts: recentAccounts,
    properties: recentProperties,
    transactions: recentTransactions,
    leads: recentLeads,
  }
}

/**
 * Applique une sanction ou modifie l'état d'un compte (Suspension LBC-FT avec motif, Restauration, Suppression)
 */
export async function moderateAccountAction(
  userId: string,
  action: 'suspend' | 'restore' | 'delete',
  reason?: string
): Promise<{ success: boolean; message: string }> {
  await requireSuperAdminAccess()

  try {
    if (action === 'suspend') {
      const motif = reason || "Violation des directives de sécurité ou vérification LBC-FT requise."
      await db
        .update(profiles)
        .set({
          role: 'suspended',
          suspensionReason: motif,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, userId))

      // Tenter d'envoyer une notification système
      try {
        await db.insert(notifications).values({
          userId,
          title: '🚨 Suspension administrative du compte',
          message: motif,
          type: 'system',
          lu: false,
          createdAt: new Date(),
        })
      } catch (e) {
        // Ignorer si échec notif
      }

      revalidatePath('/admin/moderation')
      revalidatePath('/admin/utilisateurs')
      return { success: true, message: `Compte suspendu avec succès. Motif enregistré.` }
    } else if (action === 'restore') {
      await db
        .update(profiles)
        .set({
          role: 'client',
          suspensionReason: null,
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, userId))

      revalidatePath('/admin/moderation')
      revalidatePath('/admin/utilisateurs')
      return { success: true, message: `Compte réactivé et restauré avec succès.` }
    } else if (action === 'delete') {
      await db
        .update(profiles)
        .set({
          deletedAt: new Date(),
          role: 'suspended',
          suspensionReason: 'Compte supprimé par la modération.',
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, userId))

      revalidatePath('/admin/moderation')
      revalidatePath('/admin/utilisateurs')
      return { success: true, message: `Compte supprimé avec succès (Soft delete).` }
    }

    return { success: false, message: 'Action inconnue.' }
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : 'Erreur SQL lors de la modération.' }
  }
}

/**
 * Supprime ou nettoie un élément malveillant ou non conforme (bien, paiement suspect, lead spam)
 */
export async function moderateItemAction(
  type: 'bien' | 'paiement' | 'lead',
  id: string
): Promise<{ success: boolean; message: string }> {
  await requireSuperAdminAccess()

  try {
    if (type === 'bien') {
      await db.update(biens).set({ deletedAt: new Date(), statut: 'archive' }).where(eq(biens.id, id))
      revalidatePath('/admin/biens')
    } else if (type === 'paiement') {
      await db.update(paiements).set({ deletedAt: new Date(), statut: 'annule' }).where(eq(paiements.id, id))
      revalidatePath('/admin/paiements')
    } else if (type === 'lead') {
      await db.update(leads).set({ deletedAt: new Date(), statut: 'perdu' }).where(eq(leads.id, id))
      revalidatePath('/admin/leads')
    }

    revalidatePath('/admin/moderation')
    return { success: true, message: `Élément (${type}) archivé et retiré du flux public.` }
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : 'Erreur lors de la suppression.' }
  }
}
