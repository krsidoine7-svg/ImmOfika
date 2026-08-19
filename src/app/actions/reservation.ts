'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Resend } from 'resend'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReservationResult {
  success: boolean
  error?: string
  reservationId?: string
}

// ─── Action principale ────────────────────────────────────────────────────────

export async function creerReservation(bienId: string, notes?: string): Promise<ReservationResult> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Vérifier la session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Vous devez être connecté pour réserver.' }
  }

  // Appel de la fonction RPC atomique Supabase
  const { data, error } = await supabase.rpc('reserver_bien_atomic', {
    p_bien_id: bienId,
    p_client_id: user.id,
  })

  if (error) {
    console.error('[creerReservation RPC]', error.message)
    return { success: false, error: 'Une erreur technique est survenue. Veuillez réessayer.' }
  }

  const result = data as { success: boolean; error?: string; reservation_id?: string; bien_titre?: string }

  if (!result.success) {
    return { success: false, error: result.error ?? 'Réservation impossible.' }
  }

  // Mettre à jour les notes si renseignées
  if (notes && result.reservation_id) {
    await supabase
      .from('reservations')
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('id', result.reservation_id)
  }

  // Déclencher le service de notifications (In-app client/admins & E-mail de confirmation)
  try {
    const { notifierEvenementAction } = await import("@/lib/notifications/service")
    
    // Récupérer le nom complet de l'utilisateur depuis les profils
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    await notifierEvenementAction('RESERVATION_CREEE', {
      reservationId: result.reservation_id,
      clientEmail: user.email,
      clientName: profile?.full_name || 'Client',
      bienTitre: result.bien_titre,
      clientId: user.id
    })
  } catch (notifErr) {
    console.error('[Notification reservation]', notifErr)
  }

  return {
    success: true,
    reservationId: result.reservation_id,
  }
}

// ─── Action annulation ────────────────────────────────────────────────────────

export async function annulerReservation(reservationId: string): Promise<ReservationResult> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non connecté.' }

  // Vérifier que la réservation appartient à l'utilisateur
  const { data: reservation } = await supabase
    .from('reservations')
    .select('id, bien_id, statut, client_id')
    .eq('id', reservationId)
    .eq('client_id', user.id)
    .single()

  if (!reservation) return { success: false, error: 'Réservation introuvable.' }
  if (reservation.statut === 'annule') return { success: false, error: 'Réservation déjà annulée.' }
  if (reservation.statut === 'confirme') return { success: false, error: 'Impossible d\'annuler une réservation confirmée. Contactez-nous.' }

  // Soft delete + annulation
  await supabase
    .from('reservations')
    .update({
      statut: 'annule',
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', reservationId)

  // Remettre le bien à "disponible"
  await supabase
    .from('biens')
    .update({ statut: 'disponible', updated_at: new Date().toISOString() })
    .eq('id', reservation.bien_id)

  return { success: true }
}
