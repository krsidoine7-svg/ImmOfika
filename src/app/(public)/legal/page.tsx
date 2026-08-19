import * as React from 'react'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/public/Footer'
import Link from 'next/link'
import { ScaleIcon, BuildingIcon, ShieldCheckIcon, GlobeIcon } from 'lucide-react'

export const metadata = {
  title: "Mentions Légales - Favor Company International",
  description: "Consultez les mentions légales de Favor Company International, cabinet d'expertise immobilière de luxe en Côte d'Ivoire.",
}

export default function LegalPage() {
  return (
    <>
      <Navbar />
      <main id="legal-main" className="min-h-screen bg-[#F8F6F1] pt-24">
        {/* Hero Section */}
        <section id="legal-hero" className="bg-[#1A2A4A] py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center justify-center p-3 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] mb-4">
              <ScaleIcon className="h-8 w-8" />
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Mentions <span className="text-[#C9A84C]">Légales</span>
            </h1>
            <p className="text-white/60 text-lg">
              Cadre juridique et informations réglementaires de Favor Company International
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section id="legal-content" className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-xl space-y-12">
            
            {/* 1. Éditeur du Site */}
            <article id="legal-editor" className="space-y-4">
              <div className="flex items-center gap-3 text-[#1A2A4A] border-b pb-3">
                <BuildingIcon className="h-6 w-6 text-[#C9A84C]" />
                <h2 className="text-xl md:text-2xl font-bold">1. Éditeur de la Plateforme</h2>
              </div>
              <div className="text-gray-600 space-y-2 text-sm md:text-base leading-relaxed">
                <p>
                  La plateforme internet <strong>Favor Company International</strong> (accessible à l&apos;adresse <a href="https://favor-ci.vercel.app" className="text-[#C9A84C] hover:underline">https://favor-ci.vercel.app</a>) est éditée par :
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li><strong>Dénomination sociale :</strong> Favor Company International S.A.S.</li>
                  <li><strong>Forme juridique :</strong> Société par Actions Simplifiée (S.A.S.) de droit ivoirien.</li>
                  <li><strong>Siège social :</strong> Abidjan, Cocody Riviera M&apos;Badon, Immeuble Favor, Côte d&apos;Ivoire.</li>
                  <li><strong>Registre du Commerce et du Crédit Mobilier (RCCM) :</strong> CI-ABJ-03-2026-B16-00482.</li>
                  <li><strong>Numéro de Compte Contribuable (NPI) :</strong> 2605959 Z.</li>
                  <li><strong>Capital Social :</strong> 50 000 000 FCFA.</li>
                  <li><strong>Adresse e-mail :</strong> <a href="mailto:contact@favor-ci.com" className="text-[#C9A84C] hover:underline">contact@favor-ci.com</a></li>
                  <li><strong>Téléphone :</strong> +225 07 00 00 00 00</li>
                </ul>
              </div>
            </article>

            {/* 2. Directeur de la Publication */}
            <article id="legal-director" className="space-y-4">
              <div className="flex items-center gap-3 text-[#1A2A4A] border-b pb-3">
                <ScaleIcon className="h-6 w-6 text-[#C9A84C]" />
                <h2 className="text-xl md:text-2xl font-bold">2. Direction de la Publication</h2>
              </div>
              <div className="text-gray-600 text-sm md:text-base leading-relaxed">
                <p>
                  Le Directeur de la publication et responsable éditorial de la plateforme est <strong>M. Toto</strong>, en sa qualité de Président Directeur Général de Favor Company International.
                </p>
              </div>
            </article>

            {/* 3. Hébergement du Site */}
            <article id="legal-hosting" className="space-y-4">
              <div className="flex items-center gap-3 text-[#1A2A4A] border-b pb-3">
                <GlobeIcon className="h-6 w-6 text-[#C9A84C]" />
                <h2 className="text-xl md:text-2xl font-bold">3. Hébergement</h2>
              </div>
              <div className="text-gray-600 space-y-2 text-sm md:text-base leading-relaxed">
                <p>
                  La plateforme internet est hébergée par la société :
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li><strong>Hébergeur :</strong> Vercel Inc.</li>
                  <li><strong>Adresse :</strong> 340 S Lemon Ave #4133 Walnut, CA 91789, États-Unis.</li>
                  <li><strong>Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] hover:underline">https://vercel.com</a></li>
                </ul>
              </div>
            </article>

            {/* 4. Propriété Intellectuelle */}
            <article id="legal-intellectual" className="space-y-4">
              <div className="flex items-center gap-3 text-[#1A2A4A] border-b pb-3">
                <ShieldCheckIcon className="h-6 w-6 text-[#C9A84C]" />
                <h2 className="text-xl md:text-2xl font-bold">4. Propriété Intellectuelle</h2>
              </div>
              <div className="text-gray-600 space-y-3 text-sm md:text-base leading-relaxed">
                <p>
                  L&apos;ensemble de cette plateforme, y compris les textes, photographies, illustrations, logos, icônes, séquences animées ou non, bases de données et codes sources, est la propriété exclusive de <strong>Favor Company International</strong> ou fait l&apos;objet d&apos;une autorisation d&apos;utilisation spécifique.
                </p>
                <p>
                  Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments de la plateforme, quel que soit le moyen ou le procédé utilisé, est strictement interdite sans l&apos;accord écrit préalable de Favor Company International.
                </p>
                <p>
                  Toute exploitation non autorisée de la plateforme ou de l&apos;un quelconque des éléments qu&apos;elle contient sera considérée comme constitutive d&apos;une contrefaçon et poursuivie conformément aux dispositions des articles du Code de la Propriété Intellectuelle en vigueur et des lois applicables en Côte d&apos;Ivoire (Loi n° 2016-555 relative au droit d&apos;auteur).
                </p>
              </div>
            </article>

            {/* 5. Activité Réglementée */}
            <article id="legal-regulation" className="space-y-4">
              <div className="flex items-center gap-3 text-[#1A2A4A] border-b pb-3">
                <BuildingIcon className="h-6 w-6 text-[#C9A84C]" />
                <h2 className="text-xl md:text-2xl font-bold">5. Activité Professionnelle Réglementée</h2>
              </div>
              <div className="text-gray-600 space-y-3 text-sm md:text-base leading-relaxed">
                <p>
                  Favor Company International exerce en qualité d&apos;agent immobilier et de promoteur agréé en Côte d&apos;Ivoire, sous le contrôle du <strong>Ministère de la Construction, du Logement et de l&apos;Urbanisme (MCLU)</strong>.
                </p>
                <p>
                  Toutes les transactions financières et réservations effectuées sur la plateforme sont encadrées par la réglementation de la zone UEMOA (Union Économique et Monétaire Ouest-Africaine) et le droit OHADA. Le traitement des paiements par carte bancaire et Mobile Money (Orange, MTN, Wave) est opéré de manière sécurisée par Paystack, intermédiaire de paiement agréé par la Banque Centrale des États de l&apos;Afrique de l&apos;Ouest (BCEAO).
                </p>
              </div>
            </article>
            
            {/* CTA Back to site */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-xs text-gray-400">Dernière mise à jour : Mai 2026</span>
              <Link 
                href="/biens" 
                className="inline-flex items-center justify-center bg-[#1A2A4A] hover:bg-[#C9A84C] text-white text-sm font-semibold rounded-full px-6 py-2.5 transition-colors duration-300"
              >
                Découvrir nos terrains & villas
              </Link>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
