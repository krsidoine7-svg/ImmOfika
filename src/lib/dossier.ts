/**
 * Calculateur de complétude du dossier candidat locataire / acquéreur
 */
export function calculerCompletudeDossier(
  fichiers: Record<string, any>,
  profession?: string | null,
  revenu?: number | null
): number {
  let score = 0
  if (profession && profession.trim().length > 0) score += 20
  if (revenu && revenu > 0) score += 20
  if (fichiers?.cniUrl) score += 20
  if (Array.isArray(fichiers?.bulletinsSalaireUrls) && fichiers.bulletinsSalaireUrls.length > 0) score += 20
  if (fichiers?.attestationTravailUrl || fichiers?.quittanceUrl) score += 20
  return Math.min(100, score)
}

