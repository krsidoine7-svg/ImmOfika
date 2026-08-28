export const siteConfig = {
  name: "ImmOfika",
  shortName: "ImmOfika",
  tagline: "Ton chez-toi garanti, zéro palabre !",
  description: "Solution complète d'achat, de vente, de location et de promotion immobilière agréée.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://immofika.ci",
  company: {
    name: "ImmOfika",
    legalStatus: "Promoteur Immobilier Agréé",
    email: "ImmOfika@gmail.com",
    phone: "+225 07 47 63 17 06",
    address: "Yahou, immeuble en face de la maison blanche, au 2ie",
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
    whatsapp: "https://wa.me/2250103132878",
  }
}

export type SiteConfig = typeof siteConfig
