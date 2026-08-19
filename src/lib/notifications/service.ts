import { db } from "../db/index"
import { notifications, profiles } from "../db/schema"
import { eq, and, isNull } from "drizzle-orm"
import { Resend } from "resend"
import { sendPushNotificationAction } from "@/app/actions/push"

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

// Wrapper d'envoi d'e-mail avec Resend
export async function envoyerEmailHelper(to: string, subject: string, htmlContent: string) {
  if (!resend) {
    console.log(`[Resend Mock] Email to: ${to} | Subject: ${subject} (Resend API key missing)`)
    return { success: true, mock: true }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Immo Pro <noreply@immopro.ci>',
      to,
      subject,
      html: htmlContent,
    })
    if (error) {
      console.error('[Resend Error]', error)
      return { success: false, error: error.message }
    }
    return { success: true, data }
  } catch (err: any) {
    console.error('[Resend Exception]', err)
    return { success: false, error: err.message }
  }
}

// Helper pour créer une notification in-app
export async function creerNotificationHelper(
  userId: string,
  title: string,
  message: string,
  type: 'reservation' | 'paiement' | 'visite' | 'lead' | 'system',
  link?: string | null
) {
  try {
    const [inserted] = await db
      .insert(notifications)
      .values({
        userId,
        title,
        message,
        type,
        link: link || null,
        lu: false,
      })
      .returning()

    // Déclencher le Web Push en tâche de fond
    const pushCategory = (type === 'paiement' || type === 'reservation') ? 'transactional' : 'systemUpdates'
    sendPushNotificationAction(userId, pushCategory, title, message, link || undefined).catch((err: any) => {
      console.warn('[WebPush Auto Trigger Error]', err)
    })

    return { success: true, notification: inserted }
  } catch (err: any) {
    console.error('[creerNotificationHelper Error]', err)
    return { success: false, error: err.message }
  }
}

// Fonction centrale pour dispatcher les notifications par événement
export async function notifierEvenementAction(
  event: 'NOUVEAU_LEAD' | 'LEAD_ATTRIBUE' | 'RESERVATION_CREEE' | 'PAIEMENT_CONFIRME' | 'PAIEMENT_ECHOUE' | 'VISITE_PLANIFIEE' | 'VISITE_CLOTUREE',
  data: any
) {
  console.log(`[Notification Service] Event triggered: ${event}`, data)

  try {
    // 1. NOUVEAU_LEAD
    if (event === 'NOUVEAU_LEAD') {
      const admins = await db
        .select({ id: profiles.id, email: profiles.email })
        .from(profiles)
        .where(
          and(
            eq(profiles.role, 'admin'),
            isNull(profiles.deletedAt)
          )
        )
      
      for (const admin of admins) {
        await creerNotificationHelper(
          admin.id,
          'Nouveau prospect enregistré',
          `Un nouveau prospect ${data.prenom || ''} ${data.nom || ''} s'est enregistré via la source ${data.source || 'site_web'}.`,
          'lead',
          `/admin/leads`
        )
      }
    }

    // 2. LEAD_ATTRIBUE
    else if (event === 'LEAD_ATTRIBUE') {
      const { leadId, agentId, leadName } = data
      if (agentId) {
        await creerNotificationHelper(
          agentId,
          'Nouveau prospect attribué',
          `Le prospect ${leadName} vous a été attribué pour suivi.`,
          'lead',
          `/admin/leads`
        )
      }
    }

    // 3. RESERVATION_CREEE
    else if (event === 'RESERVATION_CREEE') {
      const { reservationId, clientEmail, clientName, bienTitre, clientId } = data

      // Notification Client (Email)
      if (clientEmail) {
        const clientHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: #1A2A4A; padding: 24px; text-align: center;">
              <h1 style="color: #C9A84C; margin: 0; font-size: 20px;">Favor Company International</h1>
            </div>
            <div style="padding: 24px; background: #ffffff;">
              <h2 style="color: #1A2A4A; margin-top: 0;">Votre réservation est bien enregistrée</h2>
              <p>Bonjour ${clientName || ''},</p>
              <p>Nous vous confirmons l'enregistrement de votre réservation pour le bien <strong>${bienTitre}</strong>.</p>
              <div style="background: #F8F6F1; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #C9A84C;">
                <p style="margin: 0;"><strong>Référence Réservation :</strong> ${reservationId}</p>
                <p style="margin: 8px 0 0;"><strong>Statut :</strong> En attente de paiement de l'acompte</p>
                <p style="margin: 8px 0 0;"><strong>Date d'expiration :</strong> Dans 3 mois</p>
              </div>
              <p>Notre équipe vous recontactera très rapidement pour finaliser votre dossier d'acquisition.</p>
              <p style="margin-top: 24px;">Cordialement,<br>L'équipe Favor Company</p>
            </div>
          </div>
        `
        await envoyerEmailHelper(clientEmail, `Confirmation de Réservation — ${bienTitre}`, clientHtml)
      }

      // Notification In-app Client
      if (clientId) {
        await creerNotificationHelper(
          clientId,
          'Réservation enregistrée',
          `Votre réservation pour ${bienTitre} est en cours de traitement.`,
          'reservation',
          `/client/dashboard`
        )
      }

      // Notification In-app aux Admins
      const admins = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(
          and(
            eq(profiles.role, 'admin'),
            isNull(profiles.deletedAt)
          )
        )
      for (const admin of admins) {
        await creerNotificationHelper(
          admin.id,
          'Nouvelle réservation client',
          `Le client ${clientName || 'Anonyme'} a réservé le bien ${bienTitre}.`,
          'reservation',
          `/admin/reservations`
        )
      }
    }

    // 4. PAIEMENT_CONFIRME
    else if (event === 'PAIEMENT_CONFIRME') {
      const { clientEmail, clientName, bienTitre, montant, paiementRef, clientId, agentId } = data

      // Email reçu de paiement au Client
      if (clientEmail) {
        const receiptHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: #1A2A4A; padding: 24px; text-align: center;">
              <h1 style="color: #C9A84C; margin: 0; font-size: 20px;">Favor Company International</h1>
            </div>
            <div style="padding: 24px; background: #ffffff;">
              <h2 style="color: #10B981; margin-top: 0;">Reçu de paiement confirmé</h2>
              <p>Bonjour ${clientName || ''},</p>
              <p>Nous avons bien reçu votre paiement de <strong>${montant.toLocaleString('fr-CI')} FCFA</strong> pour l'acompte du bien <strong>${bienTitre}</strong>.</p>
              <div style="background: #F0FDF4; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #10B981;">
                <p style="margin: 0;"><strong>Référence de transaction :</strong> ${paiementRef}</p>
                <p style="margin: 8px 0 0;"><strong>Statut :</strong> Payé</p>
              </div>
              <p>Votre facture officielle a été générée et est accessible depuis votre espace client.</p>
            </div>
          </div>
        `
        await envoyerEmailHelper(clientEmail, `Paiement reçu — ${bienTitre}`, receiptHtml)
      }

      // Notification In-app Client
      if (clientId) {
        await creerNotificationHelper(
          clientId,
          'Paiement confirmé !',
          `Votre paiement de ${montant.toLocaleString('fr-CI')} FCFA pour ${bienTitre} a été validé.`,
          'paiement',
          `/client/paiements`
        )
      }

      // Notification In-app Agent
      if (agentId) {
        await creerNotificationHelper(
          agentId,
          'Acompte payé par votre client',
          `Le client ${clientName || ''} a réglé l'acompte pour ${bienTitre}.`,
          'paiement',
          `/admin/paiements`
        )
      }

      // Notification In-app aux Admins
      const admins = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(
          and(
            eq(profiles.role, 'admin'),
            isNull(profiles.deletedAt)
          )
        )
      for (const admin of admins) {
        await creerNotificationHelper(
          admin.id,
          'Paiement reçu (Réservation)',
          `Paiement de ${montant.toLocaleString('fr-CI')} FCFA validé pour ${bienTitre}.`,
          'paiement',
          `/admin/paiements`
        )
      }
    }

    // 5. PAIEMENT_ECHOUE
    else if (event === 'PAIEMENT_ECHOUE') {
      const { clientEmail, clientName, bienTitre, montant, clientId } = data

      if (clientEmail) {
        const failHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: #1A2A4A; padding: 24px; text-align: center;">
              <h1 style="color: #C9A84C; margin: 0; font-size: 20px;">Favor Company International</h1>
            </div>
            <div style="padding: 24px; background: #ffffff;">
              <h2 style="color: #EF4444; margin-top: 0;">Échec de paiement</h2>
              <p>Bonjour ${clientName || ''},</p>
              <p>La tentative de paiement de <strong>${montant.toLocaleString('fr-CI')} FCFA</strong> pour l'acompte du bien <strong>${bienTitre}</strong> a échoué.</p>
              <p>Nous vous invitons à réessayer la transaction depuis votre espace client ou à contacter votre banque.</p>
            </div>
          </div>
        `
        await envoyerEmailHelper(clientEmail, `Échec de paiement — ${bienTitre}`, failHtml)
      }

      if (clientId) {
        await creerNotificationHelper(
          clientId,
          'Échec de paiement',
          `La transaction pour ${bienTitre} a été rejetée.`,
          'paiement',
          `/client/paiements`
        )
      }
    }

    // 6. VISITE_PLANIFIEE
    else if (event === 'VISITE_PLANIFIEE') {
      const { clientEmail, clientName, bienTitre, dateVisite, agentId, agentName } = data

      // Notification Client (Email)
      if (clientEmail) {
        const formattedDate = new Date(dateVisite).toLocaleDateString('fr-FR', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })
        const visitHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: #1A2A4A; padding: 24px; text-align: center;">
              <h1 style="color: #C9A84C; margin: 0; font-size: 20px;">Favor Company International</h1>
            </div>
            <div style="padding: 24px; background: #ffffff;">
              <h2 style="color: #1A2A4A; margin-top: 0;">Votre visite de bien est planifiée</h2>
              <p>Bonjour ${clientName || ''},</p>
              <p>Une visite sur site pour le bien <strong>${bienTitre}</strong> a été planifiée.</p>
              <div style="background: #F8F6F1; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #C9A84C;">
                <p style="margin: 0;"><strong>Date & Heure :</strong> ${formattedDate}</p>
                <p style="margin: 8px 0 0;"><strong>Agent Accompagnateur :</strong> ${agentName || 'Non assigné'}</p>
              </div>
              <p>Un conseiller commercial se tiendra à votre disposition à cette date.</p>
            </div>
          </div>
        `
        await envoyerEmailHelper(clientEmail, `Visite planifiée — ${bienTitre}`, visitHtml)
      }

      // Notification In-app & Email Agent
      if (agentId) {
        await creerNotificationHelper(
          agentId,
          'Nouvelle visite planifiée',
          `Vous êtes affecté pour accompagner la visite de ${clientName || 'un client'} pour ${bienTitre}.`,
          'visite',
          `/admin/visites`
        )

        // Récupérer l'email de l'agent
        const [agentProfile] = await db
          .select({ email: profiles.email })
          .from(profiles)
          .where(eq(profiles.id, agentId))

        if (agentProfile?.email) {
          const formattedDate = new Date(dateVisite).toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
          })
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://favorcompany.ci'
          const icalUrl = `${appUrl}/api/agenda/${agentId}/export.ics`

          const agentHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
              <div style="background: #1A2A4A; padding: 24px; text-align: center;">
                <h1 style="color: #C9A84C; margin: 0; font-size: 20px;">Favor Company International — Espace Agent</h1>
              </div>
              <div style="padding: 24px; background: #ffffff;">
                <h2 style="color: #1A2A4A; margin-top: 0;">Nouvelle visite à accompagner</h2>
                <p>Bonjour ${agentName || 'Agent Commercial'},</p>
                <p>Vous avez été affecté pour accompagner une nouvelle visite sur site pour le bien <strong>${bienTitre}</strong>.</p>
                <div style="background: #F8F6F1; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #C9A84C;">
                  <p style="margin: 0;"><strong>Client :</strong> ${clientName || 'Client'}</p>
                  <p style="margin: 8px 0 0;"><strong>Date & Heure :</strong> ${formattedDate}</p>
                </div>
                <p>💡 <strong>Synchronisation Agenda :</strong> Vous pouvez ajouter automatiquement toutes vos visites dans Google Calendar ou Outlook en vous abonnant à votre flux iCal personnel :</p>
                <p style="word-break: break-all; background: #f1f5f9; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 13px;">
                  <a href="${icalUrl}" style="color: #2563eb;">${icalUrl}</a>
                </p>
                <p style="margin-top: 24px;">Cordialement,<br>La Direction Commerciale</p>
              </div>
            </div>
          `
          await envoyerEmailHelper(agentProfile.email, `Nouvelle visite assignée — ${bienTitre}`, agentHtml)
        }
      }
    }

    // 7. VISITE_CLOTUREE
    else if (event === 'VISITE_CLOTUREE') {
      const { clientName, bienTitre, statut } = data
      const statusLabel = statut === 'effectuee' ? 'EFFECTUÉE' : statut === 'annulee' ? 'ANNULÉE' : 'CLIENT ABSENT'

      const admins = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(
          and(
            eq(profiles.role, 'admin'),
            isNull(profiles.deletedAt)
          )
        )
      for (const admin of admins) {
        await creerNotificationHelper(
          admin.id,
          `Visite clôturée (${statusLabel})`,
          `La visite de ${clientName || 'Client'} pour ${bienTitre} a été marquée comme : ${statusLabel}.`,
          'visite',
          `/admin/visites`
        )
      }
    }

  } catch (err: any) {
    console.error('[Notification Service Exception]', err)
  }
}
