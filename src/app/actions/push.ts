'use server'

import { db } from '@/lib/db/index'
import { pushSubscriptions } from '@/lib/db/schema'
import { eq, and, isNull, sql } from 'drizzle-orm'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { sendPush } from '@/lib/notifications/webpush-service'
import { z } from 'zod'

const PushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.any().nullable().optional(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  })
})

const PushPreferencesSchema = z.object({
  systemUpdates: z.boolean().default(true),
  newProperties: z.boolean().default(true),
  announcements: z.boolean().default(true),
  transactional: z.boolean().default(true),
})

/**
 * Enregistre ou met à jour l'abonnement push de l'utilisateur connecté.
 * @param rawSubscription L'abonnement push récupéré depuis le PushManager du navigateur.
 * @param rawPreferences Les préférences d'activation de catégories de notifications.
 */
export async function saveSubscriptionAction(rawSubscription: any, rawPreferences?: any) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Utilisateur non authentifié' }
  }

  const parsedSub = PushSubscriptionSchema.safeParse(rawSubscription)
  if (!parsedSub.success) {
    return { success: false, error: 'Abonnement push invalide' }
  }

  const preferences = rawPreferences 
    ? PushPreferencesSchema.parse(rawPreferences) 
    : { systemUpdates: true, newProperties: true, announcements: true, transactional: true }

  try {
    const endpoint = parsedSub.data.endpoint

    // Vérifier si cet endpoint existe déjà en base pour n'importe quel profil (y compris soft-deleté)
    const existing = await db
      .select()
      .from(pushSubscriptions)
      .where(
        sql`${pushSubscriptions.subscription}->>'endpoint' = ${endpoint}`
      )
      .limit(1)

    if (existing.length > 0) {
      // Si l'abonnement existe déjà, on met à jour le profil propriétaire et les préférences
      await db
        .update(pushSubscriptions)
        .set({
          profileId: user.id,
          subscription: parsedSub.data,
          preferences,
          updatedAt: new Date(),
          deletedAt: null, // Réactive l'abonnement s'il était supprimé
        })
        .where(eq(pushSubscriptions.id, existing[0].id))
    } else {
      // Sinon, on insère un nouvel abonnement
      await db
        .insert(pushSubscriptions)
        .values({
          profileId: user.id,
          subscription: parsedSub.data,
          preferences,
        })
    }

    return { success: true }
  } catch (error) {
    console.error('[Save Subscription Action Error]', error)
    return { success: false, error: 'Impossible d\'enregistrer l\'abonnement push' }
  }
}

/**
 * Supprime logiquement (soft-delete) l'abonnement push associé à l'endpoint pour l'utilisateur connecté.
 * @param endpoint L'URL de l'endpoint d'abonnement push à désactiver.
 */
export async function deleteSubscriptionAction(endpoint: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non autorisé' }
  }

  try {
    await db
      .update(pushSubscriptions)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(pushSubscriptions.profileId, user.id),
          sql`${pushSubscriptions.subscription}->>'endpoint' = ${endpoint}`
        )
      )

    return { success: true }
  } catch (error) {
    console.error('[Delete Subscription Action Error]', error)
    return { success: false, error: 'Impossible de supprimer l\'abonnement push' }
  }
}

/**
 * Met à jour les préférences de notifications de l'utilisateur connecté.
 * @param rawPreferences Préférences associées aux catégories de push.
 */
export async function updatePushPreferencesAction(rawPreferences: any) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non autorisé' }
  }

  const parsedPreferences = PushPreferencesSchema.safeParse(rawPreferences)
  if (!parsedPreferences.success) {
    return { success: false, error: 'Préférences invalides' }
  }

  try {
    await db
      .update(pushSubscriptions)
      .set({
        preferences: parsedPreferences.data,
        updatedAt: new Date(),
      })
      .where(eq(pushSubscriptions.profileId, user.id))

    return { success: true }
  } catch (error) {
    console.error('[Update Push Preferences Error]', error)
    return { success: false, error: 'Impossible de mettre à jour les préférences' }
  }
}

/**
 * Helper serveur interne pour envoyer une notification à tous les abonnements actifs d'un profil.
 * Vérifie le consentement de l'utilisateur pour la catégorie avant d'envoyer.
 * @param profileId Identifiant unique du profil utilisateur cible.
 * @param category Catégorie de notification push.
 * @param title Titre de la notification.
 * @param body Contenu/corps de la notification.
 * @param url Lien de redirection lors du clic.
 */
export async function sendPushNotificationAction(
  profileId: string,
  category: 'systemUpdates' | 'newProperties' | 'announcements' | 'transactional',
  title: string,
  body: string,
  url?: string
) {
  try {
    const subs = await db
      .select()
      .from(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.profileId, profileId),
          isNull(pushSubscriptions.deletedAt)
        )
      )

    for (const sub of subs) {
      const prefs = sub.preferences as any
      if (prefs && prefs[category] !== false) {
        const payload = JSON.stringify({ title, body, url: url || '/admin/dashboard' })
        const res = await sendPush(sub.subscription, payload)
        
        // Si l'abonnement a expiré, on effectue un nettoyage automatique (soft-delete)
        if (res.expired) {
          await db
            .update(pushSubscriptions)
            .set({ deletedAt: new Date(), updatedAt: new Date() })
            .where(eq(pushSubscriptions.id, sub.id))
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('[Send Push Notification Action Error]', error)
    return { success: false, error: 'Erreur lors de l\'émission du Push' }
  }
}
