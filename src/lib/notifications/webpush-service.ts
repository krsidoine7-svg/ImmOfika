import webpush from 'web-push'

const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
}

// Configurer les détails VAPID si les clés sont disponibles
if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    'mailto:contact@immofika.ci',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  )
}

/**
 * Envoie une notification push via le protocole Web-Push
 * @param subscription L'abonnement push du navigateur client
 * @param payload La charge utile JSON stringifiée
 */
export async function sendPush(subscription: any, payload: string) {
  try {
    const result = await webpush.sendNotification(subscription, payload)
    return { success: true, result }
  } catch (error: any) {
    console.error('[WebPush Error]', error)
    // Code 410 (Gone) ou 404 (Not Found) signifie que l'abonnement a expiré ou a été révoqué
    if (error.statusCode === 410 || error.statusCode === 404) {
      return { success: false, expired: true, error }
    }
    return { success: false, expired: false, error }
  }
}
