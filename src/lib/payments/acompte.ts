/**
 * Règle unique de calcul de l'acompte requis pour confirmer une réservation.
 * - Vente    : 10 % du prix de vente
 * - Location : 1 mois de loyer (le prix d'une location est un loyer mensuel)
 *
 * Utilisée partout (initiation du paiement, confirmation, tableau de bord client)
 * pour éviter les écarts entre le montant proposé et le montant exigé.
 */
export const ACOMPTE_FORFAIT_SANS_PRIX = 50000

export function calculerAcompteRequis(prix: number, transaction?: string | null): number {
  if (!prix || prix <= 0) return ACOMPTE_FORFAIT_SANS_PRIX
  if (transaction === 'location') return Math.round(prix)
  return Math.round(prix * 0.1)
}

export function libelleAcompte(transaction?: string | null): string {
  return transaction === 'location' ? '1 mois de loyer' : '10 % du prix'
}
