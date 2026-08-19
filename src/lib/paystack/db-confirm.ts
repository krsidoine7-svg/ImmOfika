import { db } from '@/lib/db/index'
import { eq } from 'drizzle-orm'
import { paiements, reservations, biens, profiles } from '@/lib/db/schema'
import { genererEtEnvoyerFacture } from '@/lib/factures/genererFacture'

export interface ConfirmPaymentInput {
  reference: string
  amountInXof: number // Montant en FCFA
  channel: string
  paidAt?: string
  metadata?: {
    reservation_id?: string
    client_id?: string
    bien_id?: string
  }
}

/**
 * Confirme et valide un paiement Paystack dans la base de données.
 * Cette fonction est idempotente et peut être appelée en toute sécurité
 * par le Webhook ou directement par la page de confirmation de paiement (fail-safe).
 */
export async function confirmerPaiementEnBase({
  reference,
  amountInXof,
  channel,
  paidAt,
  metadata,
}: ConfirmPaymentInput): Promise<{ success: boolean; alreadyProcessed?: boolean }> {
  try {
    const reservationId = metadata?.reservation_id
    const clientId = metadata?.client_id
    const bienId = metadata?.bien_id

    if (!reservationId || !clientId) {
      console.warn(`[ConfirmPaymentDB] Missing reservation_id (${reservationId}) or client_id (${clientId}) in metadata`)
      return { success: false }
    }

    // 1. Idempotency Check: check if the payment has already been processed
    const [existingPayment] = await db
      .select()
      .from(paiements)
      .where(eq(paiements.paystackReference, reference))
      .limit(1)

    if (existingPayment && existingPayment.statut === 'paye') {
      console.log(`[ConfirmPaymentDB] Transaction ${reference} already marked as paid. Skipping.`)
      return { success: true, alreadyProcessed: true }
    }

    // Generate invoice number (e.g. FC-2026-8942)
    const invoiceNumber = `FC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

    let paymentId = existingPayment?.id

    // 2. Update or create payment record
    if (existingPayment) {
      await db
        .update(paiements)
        .set({
          statut: 'paye',
          paystackChannel: channel,
          factureNumero: invoiceNumber,
          paidAt: paidAt ? new Date(paidAt) : new Date(),
          updatedAt: new Date(),
        })
        .where(eq(paiements.id, existingPayment.id))
    } else {
      // Fallback: create record if initierPaiement didn't run beforehand
      const [newPayment] = await db.insert(paiements).values({
        reservationId,
        clientId,
        montant: amountInXof.toString(),
        devise: 'XOF',
        statut: 'paye',
        paystackReference: reference,
        paystackChannel: channel,
        factureNumero: invoiceNumber,
        paidAt: paidAt ? new Date(paidAt) : new Date(),
      }).returning({ id: paiements.id })
      paymentId = newPayment.id
    }

    // Fetch bien details to calculate required acompte
    let bienPrice = 0
    if (bienId) {
      const [bienRecord] = await db
        .select()
        .from(biens)
        .where(eq(biens.id, bienId))
        .limit(1)
      if (bienRecord) {
        bienPrice = parseFloat(bienRecord.prix || '0')
      }
    }

    // Calculate total paid so far for this reservation
    const allPayments = await db
      .select()
      .from(paiements)
      .where(eq(paiements.reservationId, reservationId))

    const totalPaid = allPayments
      .filter((p) => p.statut === 'paye')
      .reduce((sum, p) => sum + parseFloat(p.montant || '0'), 0)

    const requiredAcompte = Math.round(bienPrice * 0.1)
    const isAcompteFullyPaid = totalPaid >= requiredAcompte

    if (isAcompteFullyPaid) {
      // Update Reservation Status to Confirmed
      await db
        .update(reservations)
        .set({
          statut: 'confirme',
          updatedAt: new Date(),
        })
        .where(eq(reservations.id, reservationId))

      // Update Bien (Property) Status to reserved
      if (bienId) {
        await db
          .update(biens)
          .set({
            statut: 'reserve',
            updatedAt: new Date(),
          })
          .where(eq(biens.id, bienId))
      }
    }

    // 3. Génération du PDF, Upload sur R2 et Envoi par e-mail
    if (paymentId) {
      console.log(`[ConfirmPaymentDB] Génération de la facture pour le paiement ${paymentId}...`)
      try {
        await genererEtEnvoyerFacture(paymentId)
      } catch (invoiceErr) {
        console.error(`[ConfirmPaymentDB] Error generating invoice for payment ${paymentId}:`, invoiceErr)
      }
    }

    return { success: true }
  } catch (err) {
    console.error('[ConfirmPaymentDB Error]', err)
    return { success: false }
  }
}
