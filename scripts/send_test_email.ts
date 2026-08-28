import { Resend } from 'resend'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function main() {
  const apiKey = process.env.RESEND_API_KEY
  const targetEmail = 'krsidoine7@gmail.com'

  console.log("=======================================================")
  console.log("📧 TEST D'ENVOI D'EMAIL IMMOFIKA VIA RESEND")
  console.log("=======================================================\n")
  console.log(`Clé API Resend configurée : ${apiKey ? apiKey.substring(0, 7) + '...' : 'AUCUNE'}`)
  console.log(`Destinataire : ${targetEmail}\n`)

  if (!apiKey || apiKey.includes('xxxxxxxx')) {
    console.error("⚠️ ATTENTION : La variable RESEND_API_KEY dans .env.local contient une clé factice (re_xxxxxxxx...).")
    console.error("   Pour recevoir réellement l'email sur krsidoine7@gmail.com, veuillez coller votre vraie clé Resend dans .env.local !")
    process.exit(1)
  }

  const resend = new Resend(apiKey)

  try {
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <!-- En-tête Vert Émeraude Officiel -->
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">ImmOfika</h1>
          <p style="color: #A7F3D0; margin: 6px 0 0 0; font-size: 15px; font-weight: 600;">Ton chez-toi garanti, zéro palabre ! 🇨🇮</p>
        </div>
        
        <!-- Corps de l'email -->
        <div style="padding: 32px 28px; background: #FFFFFF;">
          <h2 style="color: #065F46; margin-top: 0; font-size: 20px;">Confirmation de Réservation</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">Bonjour Sidoine,</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">Nous vous confirmons l'enregistrement officiel de votre réservation sur <strong>ImmOfika</strong>.</p>
          
          <!-- Carte d'information Vert Menthe -->
          <div style="background: #ECFDF5; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #A7F3D0; border-left: 5px solid #10B981;">
            <p style="margin: 0; color: #065F46; font-size: 14px;"><strong>Référence Réservation :</strong> RES-2026-89412</p>
            <p style="margin: 10px 0 0; color: #065F46; font-size: 14px;"><strong>Bien concerné :</strong> Villa Duplex Riviera — 4 chambres</p>
            <p style="margin: 10px 0 0; color: #065F46; font-size: 14px;"><strong>Montant Acompte :</strong> 12 000 000 FCFA</p>
            <p style="margin: 10px 0 0; color: #047857; font-size: 14px;"><strong>Statut :</strong> <span style="background: #10B981; color: #FFFFFF; padding: 3px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">ENREGISTRÉ</span></p>
          </div>

          <p style="color: #334155; font-size: 15px; line-height: 1.6;">Notre équipe commerciale reste à votre entière disposition pour l'établissement de votre dossier d'acquisition.</p>

          <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #F1F5F9;">
            <p style="margin: 0; color: #64748B; font-size: 14px;">Cordialement,</p>
            <p style="margin: 4px 0 0; color: #059669; font-weight: 700; font-size: 15px;">L'équipe ImmOfika International</p>
          </div>
        </div>
        
        <!-- Pied de page -->
        <div style="background: #F8FAFC; padding: 20px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 13px; color: #64748B;">
          © 2026 ImmOfika. Tous droits réservés.
        </div>
      </div>
    `

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Domaine de test par défaut Resend
      to: targetEmail,
      subject: '🎉 Test de Notification ImmOfika — Confirmation de Réservation',
      html: htmlContent,
    })

    if (error) {
      console.error("❌ Erreur d'envoi Resend:", error)
    } else {
      console.log("✅ EMAIL ENVOYÉ AVEC SUCCÈS À krsidoine7@gmail.com !")
      console.log("ID Message Resend:", data?.id)
    }
  } catch (err: any) {
    console.error("❌ Erreur d'exception:", err?.message || err)
  }
}

main()
