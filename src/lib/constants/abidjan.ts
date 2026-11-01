/**
 * Référentiel Géographique et Foncier d'Abidjan & Côte d'Ivoire
 * Adapté aux normes du Ministère de la Construction, du Logement et de l'Urbanisme (MCLU)
 */

export interface CommuneAbidjan {
  id: string
  nom: string
  zone: 'nord' | 'sud' | 'centre' | 'peripherie'
  quartiers: string[]
  coords: {
    lat: number
    lng: number
  }
}

export const COMMUNES_ABIDJAN: CommuneAbidjan[] = [
  {
    id: 'cocody',
    nom: 'Cocody',
    zone: 'nord',
    quartiers: ['Angré', 'Riviera 2', 'Riviera 3', 'Riviera Palmeraie', 'Riviera Bonoumin', 'Riviera Faya', 'Riviera Golf', 'Deux-Plateaux', 'Deux-Plateaux Vallons', 'Danga', 'Ambassades', 'Attoban', 'Mermoz', 'Blockhaus'],
    coords: { lat: 5.3599, lng: -3.9870 },
  },
  {
    id: 'marcory',
    nom: 'Marcory',
    zone: 'sud',
    quartiers: ['Zone 4C', 'Zone 4', 'Biétry', 'Résidentiel', 'Anoumabo', 'Champroux', 'Hibiscus'],
    coords: { lat: 5.2952, lng: -3.9847 },
  },
  {
    id: 'plateau',
    nom: 'Plateau',
    zone: 'centre',
    quartiers: ['Centre des Affaires', 'Cité Administrative', 'Commerce', 'Lagune'],
    coords: { lat: 5.3261, lng: -4.0197 },
  },
  {
    id: 'yopougon',
    nom: 'Yopougon',
    zone: 'nord',
    quartiers: ['Niangon Nord', 'Niangon Sud', 'Maroc', 'Toits Rouges', 'Selmer', 'Siporex', 'Bel-Air', 'Millionnaire', 'Nouveau Quartier'],
    coords: { lat: 5.3444, lng: -4.0778 },
  },
  {
    id: 'koumassi',
    nom: 'Koumassi',
    zone: 'sud',
    quartiers: ['Zone Industrielle', 'Remblais', 'Sopim', 'Prodomo', 'Campement'],
    coords: { lat: 5.2974, lng: -3.9535 },
  },
  {
    id: 'treichville',
    nom: 'Treichville',
    zone: 'sud',
    quartiers: ['Zone 1', 'Zone 2', 'Zone 3', 'Arras', 'Avenue 16', 'Belleville'],
    coords: { lat: 5.3045, lng: -4.0108 },
  },
  {
    id: 'port-bouet',
    nom: 'Port-Bouët',
    zone: 'sud',
    quartiers: ['Vridi', 'Zone Aéroportuaire', 'Derrière Wharf', 'Adjouffou', 'Gonzaqueville', 'Jean Folly'],
    coords: { lat: 5.2583, lng: -3.9312 },
  },
  {
    id: 'adjame',
    nom: 'Adjamé',
    zone: 'centre',
    quartiers: ['220 Logements', 'Mirador', 'Williamsville', 'Bracodi', 'Habitat Extension'],
    coords: { lat: 5.3619, lng: -4.0264 },
  },
  {
    id: 'abobo',
    nom: 'Abobo',
    zone: 'nord',
    quartiers: ['Baoulé', 'Sogefiha', 'Avocatier', 'PK 18', 'Té', 'Belle-Ville', 'Sagbé'],
    coords: { lat: 5.4208, lng: -4.0194 },
  },
  {
    id: 'attecoube',
    nom: 'Attécoubé',
    zone: 'centre',
    quartiers: ['Locodjro', 'Abobo-Doumé', 'Santé', 'Agban'],
    coords: { lat: 5.3489, lng: -4.0411 },
  },
  {
    id: 'bingerville',
    nom: 'Bingerville',
    zone: 'peripherie',
    quartiers: ['Féh Kessé', 'Akandjé', 'Sehia', 'Blanchon', 'Anan'],
    coords: { lat: 5.3578, lng: -3.8967 },
  },
  {
    id: 'grand-bassam',
    nom: 'Grand-Bassam',
    zone: 'peripherie',
    quartiers: ['Quartier France', 'Rosiers', 'Impérial', 'Modeste', 'Moossou'],
    coords: { lat: 5.2104, lng: -3.7389 },
  },
  {
    id: 'songon',
    nom: 'Songon',
    zone: 'peripherie',
    quartiers: ['Songon Kassemblé', 'Songon Dagbé', 'Songon Agban'],
    coords: { lat: 5.3217, lng: -4.2612 },
  },
  {
    id: 'anyama',
    nom: 'Anyama',
    zone: 'peripherie',
    quartiers: ['Anyama Centre', 'Ebimpé', 'Akéikoi', 'Belle-Ville'],
    coords: { lat: 5.4947, lng: -4.0519 },
  },
]

export const ABIDJAN_CENTER = {
  lat: 5.3484,
  lng: -4.0197,
  zoom: 12,
}

// ─── Référentiel des Titres Fonciers Légaux en Côte d'Ivoire ────────────────

export interface TitreFoncierInfo {
  code: string
  label: string
  badgeLabel: string
  description: string
  garantieNiveau: 'maximale' | 'haute' | 'intermediaire'
  colorClass: string
}

export const TITRES_FONCIERS: Record<string, TitreFoncierInfo> = {
  acd: {
    code: 'acd',
    label: 'Arrêté de Concession Définitive (ACD)',
    badgeLabel: 'Titre ACD Garanti',
    description: 'Pleine propriété immatriculée et sécurisée par le Ministère de la Construction (MCLU). Titre foncier incontestable.',
    garantieNiveau: 'maximale',
    colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  },
  cmp: {
    code: 'cmp',
    label: 'Certificat de Mutation de Propriété (CMP)',
    badgeLabel: 'Certifié CMP',
    description: 'Mutation de propriété légale validée par la Conservation Foncière et des Hypothèques.',
    garantieNiveau: 'maximale',
    colorClass: 'bg-teal-50 text-teal-700 border-teal-300',
  },
  titre_foncier: {
    code: 'titre_foncier',
    label: 'Titre Foncier (Livre Foncier)',
    badgeLabel: 'Titre Foncier Pur',
    description: 'Immatriculation au Livre Foncier de l État ivoirien sans contestation.',
    garantieNiveau: 'maximale',
    colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  },
  bail_emphyteotique: {
    code: 'bail_emphyteotique',
    label: 'Bail Emphytéotique (99 ans)',
    badgeLabel: 'Bail Emphytéotique',
    description: 'Droit réel immobilier de très longue durée conférant la jouissance complète du bien.',
    garantieNiveau: 'haute',
    colorClass: 'bg-blue-50 text-blue-700 border-blue-300',
  },
  arrete_concession: {
    code: 'arrete_concession',
    label: 'Arrêté d Approbation / Concession Provisoire',
    badgeLabel: 'Lotissement Approuvé MCLU',
    description: 'Programme ou lotissement ayant reçu l arrêté officiel d approbation ministérielle.',
    garantieNiveau: 'haute',
    colorClass: 'bg-cyan-50 text-cyan-700 border-cyan-300',
  },
  attestation_villageoise: {
    code: 'attestation_villageoise',
    label: 'Attestation Villageoise avec Approbation',
    badgeLabel: 'Attestation + Approbation',
    description: 'Attestation coutumière issue d un lotissement approuvé par arrêté ministériel.',
    garantieNiveau: 'intermediaire',
    colorClass: 'bg-amber-50 text-amber-700 border-amber-300',
  },
}

// ─── Types de Biens Immobiliers ─────────────────────────────────────────────

export interface TypeBienInfo {
  value: string
  label: string
  iconName: string
}

export const TYPES_BIENS: TypeBienInfo[] = [
  { value: 'villa', label: 'Villa & Duplex', iconName: 'Home' },
  { value: 'appartement', label: 'Appartement', iconName: 'Building2' },
  { value: 'terrain', label: 'Terrain & Foncier', iconName: 'Trees' },
  { value: 'immeuble', label: 'Immeuble de rapport', iconName: 'Building' },
  { value: 'bureau', label: 'Bureaux & Espaces Pro', iconName: 'Briefcase' },
  { value: 'commerce', label: 'Local Commercial', iconName: 'Store' },
  { value: 'entrepot', label: 'Entrepôt & Logistique', iconName: 'Warehouse' },
]

// ─── Paliers de Prix FCFA ───────────────────────────────────────────────────

export const PALIERS_PRIX_LOCATION = [
  { value: '', label: 'Tout budget' },
  { value: '150000', label: 'Jusqu\'à 150 000 FCFA/mois' },
  { value: '300000', label: 'Jusqu\'à 300 000 FCFA/mois' },
  { value: '600000', label: 'Jusqu\'à 600 000 FCFA/mois' },
  { value: '1200000', label: 'Jusqu\'à 1,2M FCFA/mois' },
  { value: '2500000', label: 'Jusqu\'à 2,5M FCFA/mois' },
]

export const PALIERS_PRIX_VENTE = [
  { value: '', label: 'Tout budget' },
  { value: '25000000', label: 'Jusqu\'à 25M FCFA' },
  { value: '50000000', label: 'Jusqu\'à 50M FCFA' },
  { value: '100000000', label: 'Jusqu\'à 100M FCFA' },
  { value: '250000000', label: 'Jusqu\'à 250M FCFA' },
  { value: '500000000', label: 'Jusqu\'à 500M FCFA' },
]

