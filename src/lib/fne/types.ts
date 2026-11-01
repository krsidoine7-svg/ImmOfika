/**
 * Types & Interfaces pour la Facture Normalisée Électronique (FNE)
 * Conforme à l'Arrêté n° 0337 MFB/DGI du 09 mai 2025.
 */

export type FneType = 'VENTE' | 'AVOIR' | 'PROFORMA' | 'BORDEREAU'

export type FneStatut = 'non_certifie' | 'certifie' | 'annule'

export interface FneArticleLigne {
  designation: string
  quantite: number
  prixUnitaireHT: number
  tauxTva: number        // ex: 0.18 pour 18%
  montantHT: number
  montantTva: number
  montantTTC: number
}

export interface FneEmetteurInfo {
  raisonSociale: string
  ncc: string
  regime: string
  centreImpots: string
  rccm: string
  commune: string
  quartier?: string
  telephone: string
  email: string
}

export interface FneClientInfo {
  nom: string
  email?: string | null
  telephone?: string | null
  ncc?: string | null // Obligatoire pour B2B (Art. 6-3)
  adresse?: string | null
}

export interface FneCertificationResult {
  fneNumero: string
  fneType: FneType
  signature: string
  verificationUrl: string
  qrCodeSvg: string
  qrCodeDataUrl: string
  certifieLe: Date
  statut: FneStatut
  mode: 'sandbox' | 'production'
}

export interface FneFacturePayload {
  paiementId: string
  type?: FneType
  originalPaiementId?: string
  client: FneClientInfo
  articles: FneArticleLigne[]
  montantTotalHT: number
  montantTotalTVA: number
  montantTotalTTC: number
  modeReglement: string
  referenceTransaction: string
}

