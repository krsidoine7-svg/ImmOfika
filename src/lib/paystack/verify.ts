import { paystackConfig } from './client'

export interface PaystackVerifyResult {
  success: boolean
  amount?: number
  reference?: string
  status?: string
  channel?: string
  paidAt?: string
  error?: string
  metadata?: {
    reservation_id?: string
    client_id?: string
    bien_id?: string
  }
}

/**
 * Verifies a transaction status directly via Paystack's API
 */
export async function verifierPaiement(reference: string): Promise<PaystackVerifyResult> {
  if (!reference) {
    return { success: false, error: 'Référence manquante' }
  }

  try {
    const response = await fetch(
      `${paystackConfig.baseUrl}/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${paystackConfig.secretKey}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Avoid caching payment status verification
      }
    )

    const data = await response.json()

    if (!data.status || data.data.status !== 'success') {
      return {
        success: false,
        error: data.message || 'Paiement non validé par Paystack',
        status: data.data?.status || 'failed',
      }
    }

    return {
      success: true,
      amount: data.data.amount / 100, // Convert cents to XOF
      reference: data.data.reference,
      status: data.data.status,
      channel: data.data.channel,
      paidAt: data.data.paid_at,
      metadata: data.data.metadata,
    }
  } catch (err: any) {
    console.error(`[Paystack Verification Error] Reference: ${reference}`, err)
    return { success: false, error: err.message || 'Erreur lors de la vérification' }
  }
}
