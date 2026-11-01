import crypto from 'crypto'

/**
 * Génère un jeton HMAC sécurisé et déterministe pour le flux iCal de l'agent.
 * Permet l'abonnement par des clients tiers (Google Calendar, Outlook, Apple Calendar)
 * sans exposer le mot de passe ni la session de l'agent.
 */
export function getAgentCalendarToken(agentId: string): string {
  const secret =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.PAYSTACK_SECRET_KEY ||
    'immofika-agent-calendar-security-token-ci'

  return crypto
    .createHmac('sha256', secret)
    .update(`immofika-ical-sync:${agentId}`)
    .digest('hex')
    .slice(0, 32)
}

/**
 * Vérifie la validité du jeton iCal fourni en temps constant (résistant aux attaques de timing)
 */
export function verifyAgentCalendarToken(agentId: string, token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') return false
  const expected = getAgentCalendarToken(agentId)

  if (token.length !== expected.length) {
    return false
  }

  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  } catch {
    return false
  }
}
