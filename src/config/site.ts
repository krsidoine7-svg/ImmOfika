export const siteConfig = {
  name: "ImmOfika",
  shortName: "ImmOfika",
  tagline: "Plateforme Immobilière & Promotion Agréée",
  description: "Solution complète d'achat, de vente, de location et de promotion immobilière agréée.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://immofika.ci",
  company: {
    name: "ImmOfika International",
    legalStatus: "Promoteur Immobilier Agréé",
    email: "contact@immofika.ci",
    phone: "+225 27 24 00 00 00",
    address: "Abidjan, Côte d'Ivoire",
    rccm: "CI-ABJ-202X-B-XXXX",
    cc: "0000000X",
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
    whatsapp: "https://wa.me/2250700000000",
  }
}

export type SiteConfig = typeof siteConfig
