import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Configuration Edge pour Vercel Cron
export const runtime = 'edge'

export async function GET(request: NextRequest) {
  // Vérification de sécurité (optionnel, Vercel ajoute un header spécifique)
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Utilisation du Service Role pour by-passer les RLS dans une tâche cron admin
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const apiKey = process.env.RESEND_API_KEY
  const resendInstance = apiKey ? new Resend(apiKey) : null

  try {
    // 1. Récupérer les réservations qui expirent bientôt (ex: dans moins de 7 jours)
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const { data: expiringReservations, error: expiringError } = await supabase
      .from('reservations')
      .select('id, statut, date_expiration, client_id, biens (id, titre), profiles (email, full_name)')
      .eq('statut', 'en_attente')
      .lte('date_expiration', sevenDaysFromNow.toISOString())
      .gt('date_expiration', new Date().toISOString())

    if (expiringError) throw expiringError

    // Relances email
    for (const res of expiringReservations ?? []) {
      const bienInfo = Array.isArray(res.biens) ? res.biens[0] : res.biens
      const profileInfo = Array.isArray(res.profiles) ? res.profiles[0] : res.profiles

      if (resendInstance && profileInfo?.email) {
        await resendInstance.emails.send({
          from: 'Favor Company <noreply@favorcompany.ci>',
          to: profileInfo.email,
          subject: `Rappel : Votre réservation expire bientôt`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 32px; text-align: center;">
              <h2>Bonjour ${profileInfo.full_name},</h2>
              <p>Votre réservation pour <strong>${bienInfo?.titre}</strong> expire le ${new Date(res.date_expiration).toLocaleDateString('fr-FR')}.</p>
              <p>N'oubliez pas de finaliser le paiement pour ne pas perdre votre priorité !</p>
            </div>
          `,
        }).catch(err => console.error('[Cron] Erreur email', err))
      }
    }

    // 2. Annuler les réservations expirées
    const { data: expiredReservations, error: expiredError } = await supabase
      .from('reservations')
      .select('id, bien_id')
      .eq('statut', 'en_attente')
      .lt('date_expiration', new Date().toISOString())

    if (expiredError) throw expiredError

    if (expiredReservations && expiredReservations.length > 0) {
      const expiredIds = expiredReservations.map(r => r.id)
      const bienIdsToFree = expiredReservations.map(r => r.bien_id)

      // Mettre les réservations en "expire"
      await supabase
        .from('reservations')
        .update({ statut: 'expire', updated_at: new Date().toISOString() })
        .in('id', expiredIds)

      // Remettre les biens en "disponible"
      await supabase
        .from('biens')
        .update({ statut: 'disponible', updated_at: new Date().toISOString() })
        .in('id', bienIdsToFree)
    }

    return NextResponse.json({
      success: true,
      relancesEnvoyees: expiringReservations?.length ?? 0,
      reservationsAnnulees: expiredReservations?.length ?? 0
    })

  } catch (error: any) {
    console.error('[Cron Relances Error]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
