'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { paystackConfig } from '@/lib/paystack/client'
import { z } from 'zod'

const InitPaiementSchema = z.object({
  reservationId: z.string().uuid(),
  clientId: z.string().uuid(),
  montant: z.number().positive().optional(), // in XOF, calculé automatiquement par le serveur si omis
  email: z.string().email(),
})

export interface InitPaiementResult {
  success: boolean
  authorizationUrl?: string
  reference?: string
  error?: string
}

/**
 * Server Action to initialize a payment on Paystack.
 * Inserts a pending record in `paiements` table and initializes with Paystack API.
 */
export async function initierPaiement(input: z.infer<typeof InitPaiementSchema>): Promise<InitPaiementResult> {
  const parsed = InitPaiementSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Données invalides : ' + Object.keys(parsed.error.flatten().fieldErrors).join(', '),
    }
  }

  const { reservationId, clientId, email } = parsed.data

  // Generate a unique reference prefix with IM (ImmOfika)
  const reference = `IM-PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Sécurité IDOR : Récupérer impérativement la session utilisateur serveur
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Vous devez être connecté pour initier un paiement.' }
    }

    // Récupérer le rôle pour savoir si c'est un agent/admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isStaff = profile?.role && (profile.role.includes('admin') || profile.role === 'agent')

    // Si pas administrateur, l'utilisateur ne peut payer que sa propre réservation
    if (!isStaff && user.id !== clientId) {
      return { success: false, error: 'Accès non autorisé : vous ne pouvez payer que vos propres réservations.' }
    }

    // Check if the reservation actually exists and belongs to the client
    const { data: reservation, error: resError } = await supabase
      .from('reservations')
      .select('id, statut, bien_id, biens(prix, titre, transaction)')
      .eq('id', reservationId)
      .eq('client_id', clientId)
      .single()

    if (resError || !reservation) {
      return { success: false, error: 'Réservation introuvable ou invalide.' }
    }

    if (reservation.statut === 'confirme') {
      return { success: false, error: 'Cette réservation est déjà confirmée.' }
    }

    // Contrôle strict du montant : Recalcul garanti côté serveur
    const bienPrix = (reservation.biens as any)?.prix ? Number((reservation.biens as any).prix) : 0
    const minAcompte = bienPrix > 0 ? Math.round(bienPrix * 0.10) : 50000 // 10% légal ou 50 000 FCFA forfaitaire minimum
    const formatAmountStr = (n: number) => new Intl.NumberFormat('fr-FR').format(n).replace(/[\u202F\u00A0]/g, ' ') + ' FCFA'

    // Si le montant n'est pas fourni, le serveur impose strictement l'acompte légal de 10%
    let montantFinal = parsed.data.montant ? Math.round(parsed.data.montant) : minAcompte

    if (bienPrix > 0) {
      if (montantFinal < minAcompte) {
        return {
          success: false,
          error: `Le montant minimal d'acompte est de ${formatAmountStr(minAcompte)} (10%). Vous ne pouvez pas verser moins.`,
        }
      }

      if (montantFinal > bienPrix) {
        return {
          success: false,
          error: `Le montant saisi (${formatAmountStr(montantFinal)}) dépasse le prix total du bien (${formatAmountStr(bienPrix)}).`,
        }
      }
    }

    // Insert record in 'paiements' table using the internal reference as 'paystackReference'
    const { error: dbError } = await supabase.from('paiements').insert({
      reservation_id: reservationId,
      client_id: clientId,
      montant: montantFinal,
      devise: 'XOF',
      statut: 'en_attente',
      type_paiement: 'acompte',
      paystack_reference: reference,
    })

    if (dbError) {
      console.error('[initierPaiement DB Error]', dbError.message)
      return { success: false, error: 'Erreur lors de la création de la transaction en base : ' + dbError.message }
    }

    // Journalisation d'audit de sécurité
    try {
      const { logAuditEvent } = await import('@/lib/audit/logger')
      await logAuditEvent({
        userId: user.id,
        userEmail: user.email,
        userRole: profile?.role || 'client',
        action: 'paiement.initie',
        entity: 'paiements',
        details: { reservationId, bienId: reservation.bien_id, montant: montantFinal, reference },
      })
    } catch {}

    // Call Paystack API to initialize the transaction
    const response = await fetch(`${paystackConfig.baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackConfig.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        // Amount in kobo/cents. For XOF accounts (live), 1 XOF = 100 kobo on Paystack.
        // For test mode, Paystack uses the account's default currency (NGN/GHS) unless specified.
        amount: Math.round(montantFinal * 100),
        currency: 'XOF',
        reference,
        channels: paystackConfig.channels,
        metadata: {
          favor_company: true,
          reservation_id: reservationId,
          client_id: clientId,
          bien_id: reservation.bien_id,
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/paiement/confirmation`,
      }),
    })

    const data = await response.json()

    if (!data.status) {
      console.error('[Paystack API Error]', JSON.stringify(data))
      // Rollback: mark payment as failed
      await supabase
        .from('paiements')
        .update({ statut: 'echoue', updated_at: new Date().toISOString() })
        .eq('paystack_reference', reference)

      return { success: false, error: `Paystack: ${data.message || JSON.stringify(data)}` }
    }

    return {
      success: true,
      authorizationUrl: data.data.authorization_url,
      reference: reference,
    }
  } catch (err: any) {
    console.error('[initierPaiement Tech Error]', err)
    return { success: false, error: err.message || 'Une erreur technique est survenue.' }
  }
}
