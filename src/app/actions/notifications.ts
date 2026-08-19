'use server'

import { db } from "@/lib/db/index"
import { notifications, profiles } from "@/lib/db/schema"
import { eq, and, isNull, desc } from "drizzle-orm"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { sendPushNotificationAction } from '@/app/actions/push'

// Récupérer les notifications de l'utilisateur connecté
export async function getNotificationsAction() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Vous devez être connecté." }
  }

  try {
    const list = await db
      .select({
        id: notifications.id,
        userId: notifications.userId,
        title: notifications.title,
        message: notifications.message,
        type: notifications.type,
        link: notifications.link,
        lu: notifications.lu,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, user.id),
          isNull(notifications.deletedAt)
        )
      )
      .orderBy(desc(notifications.createdAt))

    return { success: true, notifications: list }
  } catch (err: any) {
    return { error: err.message || "Erreur de chargement des notifications." }
  }
}

// Marquer une notification comme lue
export async function marquerLueAction(notificationId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Non connecté." }

  try {
    await db
      .update(notifications)
      .set({
        lu: true,
      })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, user.id)
        )
      )

    try {
      revalidatePath('/admin')
      revalidatePath('/client')
    } catch (e) {}

    return { success: true }
  } catch (err: any) {
    return { error: err.message || "Erreur de mise à jour." }
  }
}

// Marquer toutes les notifications de l'utilisateur comme lues
export async function marquerToutesLuesAction() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Non connecté." }

  try {
    await db
      .update(notifications)
      .set({
        lu: true,
      })
      .where(
        and(
          eq(notifications.userId, user.id),
          isNull(notifications.deletedAt)
        )
      )

    try {
      revalidatePath('/admin')
      revalidatePath('/client')
    } catch (e) {}

    return { success: true }
  } catch (err: any) {
    return { error: err.message || "Erreur de mise à jour globale." }
  }
}

// Supprimer (Soft Delete) une notification
export async function supprimerNotificationAction(notificationId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Non connecté." }

  try {
    await db
      .update(notifications)
      .set({
        deletedAt: new Date(),
      })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, user.id)
        )
      )

    try {
      revalidatePath('/admin')
      revalidatePath('/client')
    } catch (e) {}

    return { success: true }
  } catch (err: any) {
    return { error: err.message || "Erreur lors de la suppression." }
  }
}

// Envoyer une notification simple ou groupée depuis l'administration
export async function envoyerNotificationGroupedAction(params: {
  cible: 'ALL' | 'CLIENTS' | 'AGENTS' | 'ADMINS' | 'USER'
  userId?: string
  titre: string
  message: string
  type?: string
  lien?: string
}) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Non connecté." }

  // Vérifier le rôle de l'expéditeur
  const { data: senderProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!senderProfile || !senderProfile.role || !senderProfile.role.includes('admin')) {
    return { error: "Accès refusé. Seuls les administrateurs peuvent diffuser des messages." }
  }

  try {
    let targetIds: string[] = []

    if (params.cible === 'USER' && params.userId) {
      targetIds = [params.userId]
    } else {
      let query = db.select({ id: profiles.id }).from(profiles).where(isNull(profiles.deletedAt))
      if (params.cible === 'CLIENTS') {
        query = db.select({ id: profiles.id }).from(profiles).where(and(eq(profiles.role, 'client'), isNull(profiles.deletedAt)))
      } else if (params.cible === 'AGENTS') {
        query = db.select({ id: profiles.id }).from(profiles).where(and(eq(profiles.role, 'agent'), isNull(profiles.deletedAt)))
      } else if (params.cible === 'ADMINS') {
        query = db.select({ id: profiles.id }).from(profiles).where(and(eq(profiles.role, 'admin'), isNull(profiles.deletedAt)))
      }
      const res = await query
      targetIds = res.map(r => r.id)
    }

    if (targetIds.length === 0) {
      return { error: "Aucun utilisateur trouvé pour cette cible." }
    }

    // Insertion des notifications en base pour tous les utilisateurs ciblés
    const notifsToInsert = targetIds.map(uid => ({
      userId: uid,
      title: params.titre,
      message: params.message,
      type: params.type || 'system',
      link: params.lien || null,
      lu: false,
    }))

    await db.insert(notifications).values(notifsToInsert)

    // Diffusion Push Web en arrière-plan
    for (const uid of targetIds) {
      sendPushNotificationAction(uid, 'systemUpdates', params.titre, params.message, params.lien || undefined).catch((err: any) => {
        console.warn('[Push Broadcast Error]', err)
      })
    }

    try {
      revalidatePath('/admin')
      revalidatePath('/client')
    } catch (e) {}

    return { success: true, count: targetIds.length }
  } catch (err: any) {
    return { error: err.message || "Erreur lors de l'envoi des notifications." }
  }
}

export async function envoyerNotificationLibreAction(params: any) {
  return envoyerNotificationGroupedAction(params)
}


// Récupérer la liste des utilisateurs pour le sélecteur admin
export async function getUsersPourNotificationAction() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Non connecté." }

  try {
    const list = await db
      .select({
        id: profiles.id,
        email: profiles.email,
        fullName: profiles.fullName,
        role: profiles.role,
      })
      .from(profiles)
      .where(isNull(profiles.deletedAt))
      .orderBy(profiles.email)

    return { success: true, users: list }
  } catch (err: any) {
    return { error: err.message || "Erreur de chargement des utilisateurs." }
  }
}

