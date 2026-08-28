import { paystackConfig } from './client'

export interface PaystackRefundResult {
  success: boolean
  refundId?: string
  amount?: number
  error?: string
}

/**
 * Initiates an 87% refund for an expired/canceled reservation
 */
export async function rembourserClient(
  paystackReference: string,
  montantTotal: number
): Promise<PaystackRefundResult> {
  if (!paystackReference) {
    return { success: false, error: 'Référence Paystack manquante' }
  }

  const montantRembourse = Math.floor(montantTotal * 0.87) // 87% refund policy

  try {
    const response = await fetch(`${paystackConfig.baseUrl}/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackConfig.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction: paystackReference,
        amount: montantRembourse * 100, // Convert to cents
        currency: 'XOF',
        merchant_note: 'Remboursement réservation expirée (87%) — ImmOfika',
      }),
    })

    const data = await response.json()

    if (!data.status) {
      return {
        success: false,
        error: data.message || 'Le remboursement a échoué',
      }
    }

    return {
      success: true,
      refundId: data.data.id,
      amount: montantRembourse,
    }
  } catch (err: any) {
    console.error(`[Paystack Refund Error] Reference: ${paystackReference}`, err)
    return { success: false, error: err.message || 'Erreur lors du remboursement' }
  }
}
