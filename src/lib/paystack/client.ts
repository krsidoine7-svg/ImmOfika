const PAYSTACK_BASE = 'https://api.paystack.co'

export const paystackConfig = {
  baseUrl: PAYSTACK_BASE,
  secretKey: process.env.PAYSTACK_SECRET_KEY || '',
  publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
  webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || '',
  // Paystack API accepts generic channel names like 'card' and 'mobile_money'.
  // Passing provider-specific strings (like orange_money_ci) will cause "No active channel" error.
  // Both cards and mobile money can be tested in test mode.
  channels: ['card', 'mobile_money'] as const,
}

