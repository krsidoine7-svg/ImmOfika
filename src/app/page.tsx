import * as React from "react"
import Navbar from "@/components/shared/Navbar"
import HeroSection from "@/components/public/HeroSection"
import ExplainerVideoSection from "@/components/public/ExplainerVideoSection"
import AboutSection from "@/components/public/AboutSection"
import ServicesSection from "@/components/public/ServicesSection"
import FaqSection from "@/components/public/FaqSection"
import TestimonialsSection from "@/components/public/TestimonialsSection"
import CtaSection from "@/components/public/CtaSection"
import Footer from "@/components/public/Footer"
import { Reveal } from "@/components/shared/Reveal"
import { getHomepageConfigsAction } from "@/app/actions/homepage"
import { getPublishedBiensAction } from "@/app/actions/publicBiens"
import { getMarketplaceShowcaseAction } from "@/app/actions/marketplaceCategories"
import { getNearbyBiensAction } from "@/app/actions/nearbyBiens"
import { mapDBBienToProperty } from "@/data/properties"
import Preloader3D from "@/components/public/Preloader3D"
import MarketplaceShowcaseSection from "@/components/public/MarketplaceShowcaseSection"
import FeaturedPartnersSection from "@/components/public/FeaturedPartnersSection"

export default async function Home() {
  const [res, biensRes, showcaseRes, nearbyRes] = await Promise.all([
    getHomepageConfigsAction(),
    getPublishedBiensAction(100),
    getMarketplaceShowcaseAction(6),
    getNearbyBiensAction({ limit: 6 })
  ])
  
  const configs = res.configs || {}
  const dbBiens = biensRes.success ? (biensRes.biens || []) : []
  const properties = dbBiens.map(mapDBBienToProperty)
  const categoriesData = showcaseRes.success ? showcaseRes.categories : {}
  const nearbyBiens = nearbyRes.success ? nearbyRes.biens : []
  const initialCommune = nearbyRes.success ? nearbyRes.commune : undefined

  const heroData = configs.hero || {}
  const explainerVideoData = configs.explainer_video || {}
  const aboutData = configs.about || {}
  const expertiseData = configs.expertise || {}
  const testimonialsData = configs.testimonials || {}
  const faqData = configs.faq || {}
  const ctaData = configs.cta || {}
  const footerData = configs.footer || {}
  const featuredPartnersData = configs.featured_partners || {}

  return (
    <div className="relative flex flex-col min-h-screen">
      <Preloader3D />
      <Navbar />
      <main className="flex-1">
        {heroData.enabled !== false && <HeroSection data={heroData} properties={properties} />}

        {/* Vitrine Unique et Unifiée : Géolocalisation & Catégories Marketplace */}
        <MarketplaceShowcaseSection 
          categoriesData={categoriesData}
          initialNearbyBiens={nearbyBiens} 
          initialCommune={initialCommune} 
        />

        {expertiseData.enabled !== false && (
          <Reveal width="100%" y={60}>
            <ServicesSection data={expertiseData} />
          </Reveal>
        )}


        {/* Section Promoteurs & Agences d'Élite en Vedette (Interrupteur Super Admin) */}
        {featuredPartnersData.enabled !== false && (
          <Reveal width="100%" y={60}>
            <FeaturedPartnersSection data={featuredPartnersData} />
          </Reveal>
        )}

        {aboutData.enabled !== false && (
          <Reveal width="100%" y={60}>
            <AboutSection data={aboutData} />
          </Reveal>
        )}

        {testimonialsData.enabled !== false && (
          <Reveal width="100%" y={60}>
            <TestimonialsSection data={testimonialsData} />
          </Reveal>
        )}

        {faqData.enabled !== false && (
          <Reveal width="100%" y={60}>
            <FaqSection data={faqData} />
          </Reveal>
        )}

        {ctaData.enabled !== false && (
          <Reveal width="100%" y={60}>
            <CtaSection data={ctaData} />
          </Reveal>
        )}
      </main>
      <Footer data={footerData} />
    </div>
  )
}

