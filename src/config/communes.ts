// src/config/communes.ts
// Référentiel des communes d'Abidjan et des principales villes de Côte d'Ivoire

export interface CommuneInfo {
  id: string
  nom: string
  region: string
  lat: number
  lng: number
  quartiers: string[]
  description?: string
}

export const COMMUNES_CI: CommuneInfo[] = [
  {
    id: "cocody",
    nom: "Cocody",
    region: "Abidjan",
    lat: 5.3599,
    lng: -3.9870,
    quartiers: [
      "cocody", "riviera", "angre", "angré", "deux plateaux", "golf", 
      "palmeraie", "faya", "danga", "bonoumin", "ambassades", "attoban", "abatta"
    ],
    description: "Quartier résidentiel prisé, villas d'exception et ambassades."
  },
  {
    id: "marcory",
    nom: "Marcory",
    region: "Abidjan",
    lat: 5.3025,
    lng: -3.9877,
    quartiers: [
      "marcory", "zone 4", "zone 4c", "bietry", "biétry", "residentiel", 
      "résidentiel", "remblais", "anoumambo", "hibiscus"
    ],
    description: "Dynamisme commercial, restaurants réputés et cadre de vie agréable."
  },
  {
    id: "yopougon",
    nom: "Yopougon",
    region: "Abidjan",
    lat: 5.3421,
    lng: -4.0722,
    quartiers: [
      "yopougon", "niangon", "millionnaire", "maroc", "selmer", "toits rouges", 
      "gesco", "siporex", "bel air", "académie"
    ],
    description: "La plus grande commune d'Abidjan, vivante et accessible."
  },
  {
    id: "plateau",
    nom: "Plateau",
    region: "Abidjan",
    lat: 5.3255,
    lng: -4.0197,
    quartiers: ["plateau", "centre des affaires", "cite administrative", "cité administrative"],
    description: "Cœur économique, sièges sociaux et appartements haut de gamme."
  },
  {
    id: "bingerville",
    nom: "Bingerville",
    region: "Abidjan",
    lat: 5.3587,
    lng: -3.8967,
    quartiers: ["bingerville", "feh kesse", "feh kessé", "blanchon", "akandje", "akandjé", "marina"],
    description: "Ville historique en pleine expansion, calme et bordée par la lagune."
  },
  {
    id: "koumassi",
    nom: "Koumassi",
    region: "Abidjan",
    lat: 5.3005,
    lng: -3.9489,
    quartiers: ["koumassi", "zone industrielle", "remblais", "prodomo", "divo", "camp commando"],
    description: "Commune centrale très dynamique, idéalement connectée à Marcory."
  },
  {
    id: "port-bouet",
    nom: "Port-Bouët",
    region: "Abidjan",
    lat: 5.2570,
    lng: -3.9312,
    quartiers: ["port-bouet", "port-bouët", "aeroport", "aéroport", "vridi", "gonzagueville", "derriere wharf", "abidjan sud"],
    description: "Façade maritime, aéroport Félix-Houphouët-Boigny et plages."
  },
  {
    id: "treichville",
    nom: "Treichville",
    region: "Abidjan",
    lat: 5.3089,
    lng: -4.0105,
    quartiers: ["treichville", "avenue 16", "belleville", "port autonome", "gare de bassam"],
    description: "Quartier culturel, portuaire et carrefour commercial."
  },
  {
    id: "adjame",
    nom: "Adjamé",
    region: "Abidjan",
    lat: 5.3610,
    lng: -4.0255,
    quartiers: ["adjame", "adjamé", "220 logements", "mirador", "williamsville", "liberte"],
    description: "Grand pôle commercial et d'échanges au cœur de la métropole."
  },
  {
    id: "abobo",
    nom: "Abobo",
    region: "Abidjan",
    lat: 5.4167,
    lng: -4.0167,
    quartiers: ["abobo", "baoule", "anokoua", "ndotre", "n'dotré", "pk18", "samake"],
    description: "Commune populaire très animée et en forte rénovation urbaine."
  },
  {
    id: "attecoube",
    nom: "Attécoubé",
    region: "Abidjan",
    lat: 5.3350,
    lng: -4.0380,
    quartiers: ["attecoube", "attécoubé", "locodjro", "boribana", "sante", "santé"],
    description: "Vue imprenable sur la baie lagunaire du Banco."
  },
  {
    id: "songon",
    nom: "Songon",
    region: "Abidjan",
    lat: 5.3167,
    lng: -4.2500,
    quartiers: ["songon", "dagbe", "agban", "m'brathe", "kassemble"],
    description: "Zone d'avenir résidentiel et de grands projets immobiliers neufs."
  },
  {
    id: "grand-bassam",
    nom: "Grand-Bassam",
    region: "Sud-Comoé",
    lat: 5.2089,
    lng: -3.7389,
    quartiers: ["grand-bassam", "bassam", "quartier france", "rosiers", "moossou", "imperial"],
    description: "Ville balnéaire classée UNESCO, prisée pour les résidences secondaires."
  },
  {
    id: "assinie",
    nom: "Assinie",
    region: "Sud-Comoé",
    lat: 5.1378,
    lng: -3.2842,
    quartiers: ["assinie", "assinie-mafia", "mafia", "france", "bord de mer", "lagune"],
    description: "Station balnéaire de grand luxe, villas de vacances pieds dans l'eau."
  },
  {
    id: "yamoussoukro",
    nom: "Yamoussoukro",
    region: "Bélier",
    lat: 6.8206,
    lng: -5.2767,
    quartiers: ["yamoussoukro", "fondation", "basilique", "morofe", "habitat"],
    description: "Capitale politique et administrative de la Côte d'Ivoire."
  },
  {
    id: "bouake",
    nom: "Bouaké",
    region: "Gbêkê",
    lat: 7.6900,
    lng: -5.0300,
    quartiers: ["bouake", "bouaké", "air france", "commerce", "nimbo", "koko"],
    description: "Deuxième métropole du pays et grand pôle carrefour du centre."
  },
  {
    id: "san-pedro",
    nom: "San Pédro",
    region: "San-Pédro",
    lat: 4.7485,
    lng: -6.6363,
    quartiers: ["san pedro", "san-pédro", "balmer", "cite", "lac", "zone industrielle"],
    description: "Deuxième pôle portuaire du pays, porte du cacao et du tourisme littoral."
  }
]

// Calcul de la distance orthodromique (Haversine) en kilomètres
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10 // Arrondi au 10ème (ex: 2.4 km)
}

// Trouve la commune la plus proche à partir de coordonnées GPS
export function findNearestCommune(lat: number, lng: number): { commune: CommuneInfo; distanceKm: number } {
  let nearest = COMMUNES_CI[0]
  let minDistance = Infinity

  for (const commune of COMMUNES_CI) {
    const dist = calculateDistanceKm(lat, lng, commune.lat, commune.lng)
    if (dist < minDistance) {
      minDistance = dist
      nearest = commune
    }
  }

  return {
    commune: nearest,
    distanceKm: minDistance
  }
}

// Normalise un texte (sans accents, minuscules) pour la recherche
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, " ")
    .trim()
}

// Vérifie si une chaîne de localisation (ville + quartier) correspond à une commune
export function matchesCommune(locationText: string, communeIdOrName: string): boolean {
  if (!locationText || !communeIdOrName) return false

  const commune = COMMUNES_CI.find(
    (c) => c.id === communeIdOrName.toLowerCase() || normalizeString(c.nom) === normalizeString(communeIdOrName)
  )

  if (!commune) {
    return normalizeString(locationText).includes(normalizeString(communeIdOrName))
  }

  const normalizedLocation = normalizeString(locationText)

  // Vérifier le nom de la commune
  if (normalizedLocation.includes(normalizeString(commune.nom))) {
    return true
  }

  // Vérifier chacun des quartiers affiliés
  return commune.quartiers.some((q) => normalizedLocation.includes(normalizeString(q)))
}

// Récupère une commune par son ID ou son Nom
export function getCommuneByIdOrName(idOrName: string): CommuneInfo | undefined {
  if (!idOrName) return undefined
  const norm = normalizeString(idOrName)
  return COMMUNES_CI.find((c) => c.id === idOrName.toLowerCase() || normalizeString(c.nom) === norm)
}
