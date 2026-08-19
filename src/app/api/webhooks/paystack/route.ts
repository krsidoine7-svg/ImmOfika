import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq } from 'drizzle-orm'
import { Resend } from 'resend'
import { paiements, reservations, biens, profiles } from '@/lib/db/schema'
import { paystackConfig } from '@/lib/paystack/client'
import { genererEtEnvoyerFacture } from '@/lib/factures/genererFacture'

// Instantiate direct DB connection (bypass cookies/RLS on webhook calls)
const pgClient = postgres(process.env.DATABASE_URL!)
const db = drizzle(pgClient)

interface PaystackWebhookPayload {
  event: string
  data: {
    reference: string
    amount: number
    channel: string
    status: string
    paid_at: string
    customer: {
      email: string
    }
    metadata?: {
      reservation_id?: string
      client_id?: string
      bien_id?: string
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const paystackSignature = request.headers.get('x-paystack-signature')

    if (!paystackSignature) {
      console.warn('[Paystack Webhook] Missing x-paystack-signature')
      return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
    }

    // Verify webhook signature (HMAC-SHA512)
    const expectedHash = crypto
      .createHmac('sha512', paystackConfig.webhookSecret)
      .update(rawBody)
      .digest('hex')

    if (expectedHash !== paystackSignature) {
      console.error('[Paystack Webhook] Invalid signature. Access Denied.')
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody) as PaystackWebhookPayload
    console.log(`[Paystack Webhook] Received event: ${payload.event} for reference: ${payload.data.reference}`)

    if (payload.event === 'charge.success') {
      const { reference, amount, channel, paid_at, metadata } = payload.data
      const reservationId = metadata?.reservation_id
      const clientId = metadata?.client_id
      const bienId = metadata?.bien_id

      if (!reservationId || !clientId) {
        console.warn(`[Paystack Webhook] Missing reservation_id (${reservationId}) or client_id (${clientId}) in metadata`)
        return NextResponse.json({ error: 'Metadata manquante' }, { status: 400 })
      }

      // 1. Idempotency Check: check if the payment has already been processed
      const [existingPayment] = await db
        .select()
        .from(paiements)
        .where(eq(paiements.paystackReference, reference))
        .limit(1)

      if (existingPayment && existingPayment.statut === 'paye') {
        console.log(`[Paystack Webhook] Transaction ${reference} already marked as paid. Skipping.`)
        return NextResponse.json({ received: true, alreadyProcessed: true })
      }

      // Generate invoice number (e.g. FC-2026-8942)
      const invoiceNumber = `FC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

      let paymentId = existingPayment?.id

      // 2. Update or create payment record (single write, no duplication)
      if (existingPayment) {
        await db
          .update(paiements)
          .set({
            statut: 'paye',
            paystackChannel: channel,
            factureNumero: invoiceNumber,
            paidAt: paid_at ? new Date(paid_at) : new Date(),
            updatedAt: new Date(),
          })
          .where(eq(paiements.id, existingPayment.id))
      } else {
        // Fallback: create record if initierPaiement didn't run beforehand
        const [newPayment] = await db.insert(paiements).values({
          reservationId,
          clientId,
          montant: (amount / 100).toString(),
          devise: 'XOF',
          statut: 'paye',
          paystackReference: reference,
          paystackChannel: channel,
          factureNumero: invoiceNumber,
          paidAt: paid_at ? new Date(paid_at) : new Date(),
        }).returning({ id: paiements.id })
        paymentId = newPayment.id
      }

      // Fetch client full name & bien details to calculate required acompte
      const [clientProfile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, clientId))
        .limit(1)

      let bienTitle = 'Votre Bien Immobilier'
      let bienPrice = 0
      let bienAgentId: string | null = null
      if (bienId) {
        const [bienRecord] = await db
          .select()
          .from(biens)
          .where(eq(biens.id, bienId))
          .limit(1)
        if (bienRecord) {
          bienTitle = bienRecord.titre
          bienPrice = parseFloat(bienRecord.prix || '0')
          bienAgentId = bienRecord.agentId
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
      const resteAPayer = Math.max(0, requiredAcompte - totalPaid)

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

      if (paymentId) {
        console.log(`[Paystack Webhook] Génération de la facture et préparation du contrat Word (.docx) pour le paiement ${paymentId}...`)
        await genererEtEnvoyerFacture(paymentId)

        // Marquer le contrat Word (.docx) comme prêt pour vérification par l'agent
        await db
          .update(reservations)
          .set({
            notes: `Contrat Word (.docx) généré automatiquement à la réception de l'acompte. Prêt pour vérification et personnalisation par l'agent.`,
            updatedAt: new Date(),
          })
          .where(eq(reservations.id, reservationId))
      }

      // 4. Déclencher le service de notifications (In-app client/admins/agent et email)
      try {
        const { notifierEvenementAction } = await import("@/lib/notifications/service")
        await notifierEvenementAction('PAIEMENT_CONFIRME', {
          clientEmail: clientProfile?.email || payload.data.customer.email,
          clientName: clientProfile?.fullName || 'Client',
          bienTitre: bienTitle,
          montant: amount / 100,
          paiementRef: reference,
          clientId,
          agentId: bienAgentId
        })
      } catch (notifErr) {
        console.error('[Paystack Webhook Notification Error]', notifErr)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('[Paystack Webhook Process Error]', err)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
