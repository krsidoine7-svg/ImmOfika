export interface Property {
  slug: string
  title: string
  location: string
  price: number
  type: string // "Vente" | "Location"
  bedrooms: number | null
  bathrooms: number | null
  area: number
  image: string
  tag: string
  trend?: string
  description?: string
}

export const properties: Property[] = [
  {
    slug: "villa-duplex-riviera-4ch",
    title: "Villa duplex Riviera — 4 chambres",
    location: "Riviera, Abidjan",
    price: 120000000,
    type: "Vente",
    bedrooms: 4,
    bathrooms: 3,
    area: 450,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800",
    tag: "Exclusivité",
    trend: "Coup de cœur"
  },
  {
    slug: "appartement-2ch-marcory",
    title: "Appartement 2 chambres — Marcory",
    location: "Marcory, Abidjan",
    price: 750000,
    type: "Location",
    bedrooms: 2,
    bathrooms: 1,
    area: 85,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800",
    tag: "Nouveau",
    trend: "Rare"
  },
  {
    slug: "terrain-cocody-1000m2-01",
    title: "Terrain plat à Cocody — 1000 m²",
    location: "Cocody, Abidjan",
    price: 45000000,
    type: "Vente",
    bedrooms: null,
    bathrooms: null,
    area: 1000,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
    tag: "Opportunité",
    trend: "Titre foncier"
  }
]

export function mapDBBienToProperty(dbBien: any): Property {
  return {
    slug: dbBien.slug,
    title: dbBien.titre,
    location: `${dbBien.quartier ? dbBien.quartier + ', ' : ''}${dbBien.ville}`,
    price: Number(dbBien.prix),
    type: dbBien.transaction === 'vente' ? 'Vente' : 'Location',
    bedrooms: dbBien.chambres,
    bathrooms: dbBien.sallesDeBain,
    area: Number(dbBien.surface || 0),
    image: dbBien.mainImageUrl || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
    tag: dbBien.transaction === 'vente' ? 'À vendre' : 'À louer',
    trend: dbBien.statut,
    description: dbBien.description
  }
}

export function matchesProperty(
  item: Property,
  searchQuery: { location: string; type: string; budget: string }
): boolean {
  // 1. Filtrage Localisation
  const matchesLoc = !searchQuery.location || 
    item.location.toLowerCase().includes(searchQuery.location.toLowerCase().split(" ")[0].replace("(", "")) ||
    searchQuery.location.toLowerCase().includes(item.location.toLowerCase().split(",")[0].trim());
  
  // 2. Filtrage Type de bien (Villa, Duplex, Penthouse, Appartement)
  let matchesType = true;
  if (searchQuery.type) {
    matchesType = item.title.toLowerCase().includes(searchQuery.type.toLowerCase()) || 
                  item.slug.toLowerCase().includes(searchQuery.type.toLowerCase());
  }
  
  // 3. Filtrage Budget en FCFA
  let matchesBudget = true;
  if (searchQuery.budget === "50m") {
    matchesBudget = item.price <= 50000000;
  } else if (searchQuery.budget === "150m") {
    matchesBudget = item.price <= 150000000;
  } else if (searchQuery.budget === "300m") {
    matchesBudget = item.price <= 300000000;
  } else if (searchQuery.budget === "500m") {
    matchesBudget = item.price >= 500000000;
  }
  
  return matchesLoc && matchesType && matchesBudget;
}

