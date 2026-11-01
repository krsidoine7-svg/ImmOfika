/**
 * Types et interfaces pour la marketplace ImmOfika
 */

export type AdvertiserType = 'particulier' | 'agence' | 'promoteur' | 'entreprise'

export interface MarketplaceBien {
  id: string
  slug: string
  titre: string
  description?: string | null
  prix: number
  devise: string
  transaction: 'vente' | 'location'
  type: string
  statut: 'disponible' | 'reserve' | 'vendu' | 'loue'
  ville: string
  commune?: string | null
  quartier?: string | null
  adresse?: string | null
  surface?: number | null
  pieces?: number | null
  chambres?: number | null
  sallesDeBain?: number | null
  meuble?: boolean | null
  parking?: boolean | null
  piscine?: boolean | null
  gardiennage?: boolean | null
  mainImageUrl: string
  videoUrl?: string | null
  pdfAnnexeUrl?: string | null
  vues: number
  latitude?: number | null
  longitude?: number | null
  typeTitrePropriete?: string | null
  preuveProprieteUrl?: string | null
  isProgrammeNeuf?: boolean | null
  chargesComprises?: boolean | null
  createdAt?: string
  organization?: {
    id: string
    name: string
    slug?: string
    type: 'agence' | 'promoteur'
    agrementNumero?: string | null
    logoUrl?: string | null
    telephone?: string | null
    whatsapp?: string | null
    verifiedAt?: string | null
  } | null
  advertiser: {
    name: string
    type: AdvertiserType
    phone?: string | null
    whatsapp?: string | null
    agrementNumero?: string | null
    verified?: boolean
    logoUrl?: string | null
  }
}

export interface MarketplaceSearchFilters {
  search?: string
  transaction?: 'vente' | 'location' | ''
  type?: string
  commune?: string
  quartier?: string
  prixMin?: number | string
  prixMax?: number | string
  piecesMin?: number | string
  chambresMin?: number | string
  surfaceMin?: number | string
  typeTitrePropriete?: string
  meuble?: boolean
  parking?: boolean
  piscine?: boolean
  gardiennage?: boolean
  isProgrammeNeuf?: boolean
  hasTitreOnly?: boolean
  page?: number
  limit?: number
  sort?: 'recent' | 'prix_asc' | 'prix_desc' | 'surface_desc'
}

export interface CategoryDefinition {
  id: string
  title: string
  shortTitle: string
  subtitle: string
  iconName: 'Home' | 'Building2' | 'KeyRound' | 'Trees' | 'Store'
  filter: {
    transaction?: 'vente' | 'location'
    type?: string
    meuble?: boolean
  }
  catalogUrl: string
}

/**
 * Registre des catégories de la marketplace
 * Extensible : de nouvelles catégories peuvent être ajoutées ici sans modifier les composants
 */
export const MARKETPLACE_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'maisons-location',
    title: 'Maisons à louer',
    shortTitle: 'Maisons',
    subtitle: 'Villas familiales et duplex tout confort pour votre famille',
    iconName: 'Home',
    filter: {
      transaction: 'location',
      type: 'villa',
    },
    catalogUrl: '/biens?transaction=location&type=villa',
  },
  {
    id: 'residences-location',
    title: 'Résidences à louer',
    shortTitle: 'Résidences',
    subtitle: 'Appartements meublés et résidences de standing prêtes à habiter',
    iconName: 'KeyRound',
    filter: {
      transaction: 'location',
      meuble: true,
    },
    catalogUrl: '/biens?transaction=location&meuble=true',
  },
  {
    id: 'appartements-vente',
    title: 'Appartements à vendre',
    shortTitle: 'Appartements',
    subtitle: 'Immeubles neufs et appartements de standing avec titres sécurisés',
    iconName: 'Building2',
    filter: {
      transaction: 'vente',
      type: 'appartement',
    },
    catalogUrl: '/biens?transaction=vente&type=appartement',
  },
  {
    id: 'terrains-vente',
    title: 'Terrains à vendre',
    shortTitle: 'Terrains',
    subtitle: 'Parcelles viabilisées avec Arrêté de Concession Définitive (ACD)',
    iconName: 'Trees',
    filter: {
      transaction: 'vente',
      type: 'terrain',
    },
    catalogUrl: '/biens?transaction=vente&type=terrain',
  },
]


// ─── Modèle Organisation Multi-Annonceurs ────────────────────────────────────

export interface Organization {
  id: string
  name: string
  slug: string
  type: 'agence' | 'promoteur'
  rccm?: string | null
  ncc?: string | null
  agrementNumero?: string | null
  logoUrl?: string | null
  description?: string | null
  telephone?: string | null
  email?: string | null
  whatsapp?: string | null
  ville: string
  commune?: string | null
  adresse?: string | null
  verifiedAt?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface OrganizationMember {
  id: string
  organizationId: string
  userId: string
  roleInOrg: 'gerant' | 'negociateur' | 'assistant'
  assignedAt: string
}

export interface RechercheAlerte {
  id: string
  userId: string
  titre: string
  criteres: {
    transaction?: 'vente' | 'location'
    type?: string
    ville?: string
    commune?: string
    quartier?: string
    prixMin?: number
    prixMax?: number
    surfaceMin?: number
    pieces?: number
  }
  frequence: 'immediat' | 'quotidien' | 'hebdomadaire'
  isActive: boolean
  lastNotifiedAt?: string | null
  createdAt: string
}

export interface DossierCandidat {
  id: string
  userId: string
  statut: 'brouillon' | 'soumis' | 'valide' | 'rejete'
  typeProjet: 'location' | 'achat'
  profession?: string | null
  employeur?: string | null
  revenuMensuel?: number | null
  fichiers: {
    cniUrl?: string
    bulletinsSalaireUrls?: string[]
    attestationTravailUrl?: string
    quittanceUrl?: string
  }
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface Signalement {
  id: string
  bienId: string
  auteurId?: string | null
  motif: 'faux_prix' | 'demarcheur_arnaque' | 'bien_deja_vendu' | 'photos_trompeuses' | 'autre'
  description?: string | null
  statut: 'nouveau' | 'en_cours' | 'traite' | 'rejete'
  traitePar?: string | null
  decisionCommentaire?: string | null
  createdAt: string
  updatedAt: string
}
