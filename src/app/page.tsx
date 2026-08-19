import * as React from "react"
import Navbar from "@/components/shared/Navbar"
import ChatBot from "@/components/shared/ChatBot"
import HeroSection from "@/components/public/HeroSection"
import ExplainerVideoSection from "@/components/public/ExplainerVideoSection"
import AboutSection from "@/components/public/AboutSection"
import ServicesSection from "@/components/public/ServicesSection"
import BiensSection from "@/components/public/BiensSection"
import FaqSection from "@/components/public/FaqSection"
import TestimonialsSection from "@/components/public/TestimonialsSection"
import CtaSection from "@/components/public/CtaSection"
import Footer from "@/components/public/Footer"
import { Reveal } from "@/components/shared/Reveal"
import { getHomepageConfigsAction } from "@/app/actions/homepage"
import { getPublishedBiensAction } from "@/app/actions/publicBiens"
import { mapDBBienToProperty } from "@/data/properties"

export default async function Home() {
  const [res, biensRes] = await Promise.all([
    getHomepageConfigsAction(),
    getPublishedBiensAction(100)
  ])
  
  const configs = res.configs || {}
  const dbBiens = biensRes.success ? (biensRes.biens || []) : []
  const properties = dbBiens.map(mapDBBienToProperty)

  const heroData = configs.hero || {}
  const explainerVideoData = configs.explainer_video || {}
  const aboutData = configs.about || {}
  const expertiseData = configs.expertise || {}
  const testimonialsData = configs.testimonials || {}
  const faqData = configs.faq || {}
  const ctaData = configs.cta || {}
  const footerData = configs.footer || {}

  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {heroData.enabled !== false && <HeroSection data={heroData} properties={properties} />}
        
        {aboutData.enabled !== false && (
          <Reveal width="100%" y={60}>
            <AboutSection data={aboutData} />
          </Reveal>
        )}

        {expertiseData.enabled !== false && (
          <Reveal width="100%" y={60}>
            <ServicesSection data={expertiseData} />
          </Reveal>
        )}

        <React.Suspense fallback={<div className="h-96 max-w-[1280px] mx-auto bg-slate-50/50 animate-pulse rounded-[40px] border border-dashed border-slate-100" />}>
          <BiensSection properties={properties} />
        </React.Suspense>

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
      <ChatBot />
    </div>
  )
}

