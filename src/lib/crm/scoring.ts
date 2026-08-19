export interface ScoringFactors {
  aVisite: boolean           // +30 pts
  aPayeAcompte: boolean      // +25 pts
  aRappeleAgent: boolean     // +20 pts
  aOuvertEmail: boolean      // +10 pts
  aRempliFormulaire: boolean // +10 pts
  source: 'direct' | 'reseaux' | 'referral' | 'organic'  // +5 à +15 pts
}

export function calculerScore(factors: ScoringFactors): number {
  let score = 0
  if (factors.aVisite) score += 30
  if (factors.aPayeAcompte) score += 25
  if (factors.aRappeleAgent) score += 20
  if (factors.aOuvertEmail) score += 10
  if (factors.aRempliFormulaire) score += 10

  const sourceScore = {
    direct: 15,
    referral: 12,
    reseaux: 8,
    organic: 5,
  }
  score += sourceScore[factors.source] ?? 5

  return Math.min(score, 100)
}
