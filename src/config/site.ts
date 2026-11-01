export const siteConfig = {
  name: "ImmOfika",
  shortName: "ImmOfika",
  tagline: "Ton chez-toi garanti, zéro palabre !",
  description: "Solution complète d'achat, de vente, de location et de promotion immobilière agréée.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://immofika.ci",
  company: {
    name: "ImmOfika",
    legalStatus: "Promoteur Immobilier Agréé",
    email: "contact@immofika.ci",
    phone: "+225 27 24 00 00 00",
    address: "Yahou, immeuble en face de la maison blanche, au 2ie",
    commune: "Cocody, Abidjan",
    quartier: "Yahou",
    rccm: "CI-ABJ-2024-B-14285",
    ncc: process.env.FNE_COMPANY_NCC || "2034567A", // Numéro de Compte Contribuable DGI
    cc: "2034567A",
    regime: "Régime Normal d'Imposition (RNI)", // RNI obligatoire pour promotion immobilière
    centreImpots: "DGI - Centre des Impôts de Cocody",
    dran: "Direction Régionale Abidjan Nord",
    tauxTva: 0.18, // 18% TVA légale République de Côte d'Ivoire
    fneApiUrl: process.env.FNE_API_URL || "https://fne.dgi.gouv.ci/api",
    fneApiKey: process.env.FNE_API_KEY || "",
    fneMode: (process.env.FNE_MODE as "sandbox" | "production") || "sandbox",
  },
  theme: {
    primaryColor: "#10B981", // Emerald 500
    primaryDark: "#059669",  // Emerald 600
    accentColor: "#ECFDF5",   // Mint Light / Emerald 50
    backgroundColor: "#FFFFFF",
  },
  social: {
    facebook: "https://facebook.com/immofika",
    linkedin: "https://linkedin.com/company/immofika",
    whatsapp: "https://wa.me/2250103132878",
  }
}

export type SiteConfig = typeof siteConfig
