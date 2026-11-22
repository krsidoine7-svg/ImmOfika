export const siteConfig = {
  name: "Anyilo",
  shortName: "Anyilo",
  tagline: "Ton chez-toi garanti, zéro palabre !",
  description: "Solution complète d'achat, de vente, de location et de promotion immobilière agréée.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://anyilo.com",
  // Domaines officiels : production et préproduction (NEXT_PUBLIC_APP_URL fixe le domaine actif)
  domains: {
    production: "https://anyilo.com",
    preprod: "https://preprod.anyilo.com",
  },
  company: {
    name: "Anyilo",
    legalStatus: "Promoteur Immobilier Agréé",
    email: "contact@anyilo.com",
    phone: "+225 27 24 00 00 00",
    address: "Yahou, immeuble en face de la maison blanche, au 2ie",
    commune: "Cocody, Abidjan",
    quartier: "Yahou",
    rccm: "CI-ABJ-2024-B-14285",
    ncc: "2034567A", // Numéro de Compte Contribuable (à remplacer par le vrai)
    cc: "2034567A",
    regime: "Régime Normal d'Imposition (RNI)", // RNI obligatoire pour promotion immobilière
    centreImpots: "DGI - Centre des Impôts de Cocody",
    dran: "Direction Régionale Abidjan Nord",
    tauxTva: 0.18, // 18% TVA légale République de Côte d'Ivoire
  },
  theme: {
    primaryColor: "#10B981", // Emerald 500
    primaryDark: "#059669",  // Emerald 600
    accentColor: "#ECFDF5",   // Mint Light / Emerald 50
    backgroundColor: "#FFFFFF",
  },
  social: {
    facebook: "https://facebook.com/anyilo",
    linkedin: "https://linkedin.com/company/anyilo",
    whatsapp: "https://wa.me/2250103132878",
  }
}

export type SiteConfig = typeof siteConfig
