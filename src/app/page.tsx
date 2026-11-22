import * as React from "react"
import Navbar from "@/components/shared/Navbar"
import HeroSection from "@/components/public/HeroSection"
import MarketplaceShowcaseSection from "@/components/public/MarketplaceShowcaseSection"
import HowItWorksSection from "@/components/public/HowItWorksSection"
import AvisVisitesSection from "@/components/public/AvisVisitesSection"
import CtaSection from "@/components/public/CtaSection"
import FaqSection from "@/components/public/FaqSection"
import Footer from "@/components/public/Footer"
import { getHomepageConfigsAction } from "@/app/actions/homepage"
import { getMarketplaceShowcaseAction } from "@/app/actions/marketplaceCategories"
import { getNearbyBiensAction } from "@/app/actions/nearbyBiens"

/**
 * Accueil Anyilo — l'essentiel, dans l'ordre où le visiteur en a besoin :
 * 1. Chercher (commune, type, budget)      — HeroSection
 * 2. Voir les vraies annonces               — MarketplaceShowcaseSection
 * 3. Comprendre comment ça marche + anti-arnaque — HowItWorksSection
 * 4. Avis réels après visite (si présents)  — AvisVisitesSection
 * 5. Annonceurs : publier                   — CtaSection
 * 6. Questions fréquentes                   — FaqSection
 * Aucun contenu de preuve (avis, chiffres, partenaires) n'est écrit en dur.
 */
export default async function Home() {
  const [res, showcaseRes, nearbyRes] = await Promise.all([
    getHomepageConfigsAction(),
    getMarketplaceShowcaseAction(6),
    getNearbyBiensAction({ limit: 6 }),
  ])

  const footerData = res.configs?.footer || {}
  const categoriesData = showcaseRes.success ? showcaseRes.categories : {}
  const nearbyBiens = nearbyRes.success ? nearbyRes.biens : []
  const initialCommune = nearbyRes.success ? nearbyRes.commune : undefined

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <MarketplaceShowcaseSection
          categoriesData={categoriesData}
          initialNearbyBiens={nearbyBiens}
          initialCommune={initialCommune}
        />
        <HowItWorksSection />
        <AvisVisitesSection />
        <CtaSection />
        <FaqSection />
      </main>
      <Footer data={footerData} />
    </div>
  )
}
