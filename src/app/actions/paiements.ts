'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { paystackConfig } from '@/lib/paystack/client'
import { z } from 'zod'

const InitPaiementSchema = z.object({
  reservationId: z.string().uuid(),
  clientId: z.string().uuid(),
  montant: z.number().positive(), // in XOF
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

  const { reservationId, clientId, montant, email } = parsed.data

  // Generate a unique reference prefix with IM (ImmOfika)
  const reference = `IM-PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Check if the reservation actually exists and belongs to the client
    const { data: reservation, error: resError } = await supabase
      .from('reservations')
      .select('id, statut, bien_id, biens(prix, titre)')
      .eq('id', reservationId)
      .eq('client_id', clientId)
      .single()

    if (resError || !reservation) {
      return { success: false, error: 'Réservation introuvable ou invalide.' }
    }

    if (reservation.statut === 'confirme') {
      return { success: false, error: 'Cette réservation est déjà confirmée.' }
    }

    // Contrôle strict du montant : Minimum 10% de la valeur du bien
    const bienPrix = (reservation.biens as any)?.prix ? Number((reservation.biens as any).prix) : 0
    if (bienPrix > 0) {
      const minAcompte = bienPrix * 0.10
      const formatAmountStr = (n: number) => new Intl.NumberFormat('fr-FR').format(n).replace(/[\u202F\u00A0]/g, ' ') + ' FCFA'

      if (montant < minAcompte) {
        return {
          success: false,
          error: `Le montant minimal d'acompte est de ${formatAmountStr(minAcompte)} (10%). Vous pouvez verser plus, mais pas moins.`,
        }
      }

      if (montant > bienPrix) {
        return {
          success: false,
          error: `Le montant saisi (${formatAmountStr(montant)}) dépasse le prix total du bien (${formatAmountStr(bienPrix)}).`,
        }
      }
    }

        // Insert record in 'paiements' table using the internal reference as 'paystackReference'
    // because Paystack will match this reference when triggering webhook or verification!
    const { error: dbError } = await supabase.from('paiements').insert({
      reservation_id: reservationId,
      client_id: clientId,
      montant: montant,
      devise: 'XOF',
      statut: 'en_attente',
      type_paiement: 'acompte',
      paystack_reference: reference,
    })

    if (dbError) {
      console.error('[initierPaiement DB Error]', dbError.message)
      return { success: false, error: 'Erreur lors de la création de la transaction en base : ' + dbError.message }
    }

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
        amount: Math.round(montant * 100),
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
