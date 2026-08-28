import * as React from 'react'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/public/Footer'
import Link from 'next/link'
import { ScaleIcon, BuildingIcon, ShieldCheckIcon, GlobeIcon } from 'lucide-react'

export const metadata = {
  title: "Mentions Légales - ImmOfika",
  description: "Consultez les mentions légales d'ImmOfika, plateforme immobilière et promotion agréée en Côte d'Ivoire.",
}

export default function LegalPage() {
  return (
    <>
      <Navbar />
      <main id="legal-main" className="min-h-screen bg-[#F8F6F1] pt-24">
        {/* Hero Section */}
        <section id="legal-hero" className="bg-slate-900 py-16 px-4 relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <span className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
              <ScaleIcon className="h-8 w-8" />
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Mentions <span className="text-emerald-400">Légales</span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg font-medium">
              Cadre juridique et informations réglementaires d&apos;ImmOfika
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section id="legal-content" className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-xl space-y-12">
            
            {/* 1. Éditeur du Site */}
            <article id="legal-editor" className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-3">
                <BuildingIcon className="h-6 w-6 text-emerald-600" />
                <h2 className="text-xl md:text-2xl font-bold">1. Éditeur de la Plateforme</h2>
              </div>
              <div className="text-slate-600 space-y-2 text-sm md:text-base leading-relaxed">
                <p>
                  La plateforme internet <strong>ImmOfika</strong> (accessible à l&apos;adresse <a href="https://immofika.ci" className="text-emerald-600 font-bold hover:underline">https://immofika.ci</a>) est éditée par :
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li><strong>Dénomination sociale :</strong> ImmOfika S.A.S.</li>
                  <li><strong>Forme juridique :</strong> Société par Actions Simplifiée (S.A.S.) de droit ivoirien.</li>
                  <li><strong>Siège social :</strong> Abidjan, Côte d&apos;Ivoire.</li>
                  <li><strong>Registre du Commerce et du Crédit Mobilier (RCCM) :</strong> CI-ABJ-03-2026-B16-00482.</li>
                  <li><strong>Numéro de Compte Contribuable (NPI) :</strong> 2605959 Z.</li>
                  <li><strong>Capital Social :</strong> 50 000 000 FCFA.</li>
                  <li><strong>Adresse e-mail :</strong> <a href="mailto:contact@immofika.ci" className="text-emerald-600 font-bold hover:underline">contact@immofika.ci</a></li>
                  <li><strong>Téléphone :</strong> +225 07 47 63 17 06</li>
                </ul>
              </div>
            </article>

            {/* 2. Directeur de la Publication */}
            <article id="legal-director" className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-3">
                <ScaleIcon className="h-6 w-6 text-emerald-600" />
                <h2 className="text-xl md:text-2xl font-bold">2. Direction de la Publication</h2>
              </div>
              <div className="text-slate-600 text-sm md:text-base leading-relaxed">
                <p>
                  Le Directeur de la publication et responsable éditorial de la plateforme est la Direction Générale d&apos;<strong>ImmOfika</strong>.
                </p>
              </div>
            </article>

            {/* 3. Hébergement du Site */}
            <article id="legal-hosting" className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-3">
                <GlobeIcon className="h-6 w-6 text-emerald-600" />
                <h2 className="text-xl md:text-2xl font-bold">3. Hébergement</h2>
              </div>
              <div className="text-slate-600 space-y-2 text-sm md:text-base leading-relaxed">
                <p>
                  La plateforme internet est hébergée par la société :
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li><strong>Hébergeur :</strong> Vercel Inc.</li>
                  <li><strong>Adresse :</strong> 340 S Lemon Ave #4133 Walnut, CA 91789, États-Unis.</li>
                  <li><strong>Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold hover:underline">https://vercel.com</a></li>
                </ul>
              </div>
            </article>

            {/* 4. Propriété Intellectuelle */}
            <article id="legal-intellectual" className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-3">
                <ShieldCheckIcon className="h-6 w-6 text-emerald-600" />
                <h2 className="text-xl md:text-2xl font-bold">4. Propriété Intellectuelle</h2>
              </div>
              <div className="text-slate-600 space-y-3 text-sm md:text-base leading-relaxed">
                <p>
                  L&apos;ensemble de cette plateforme, y compris les textes, photographies, illustrations, logos, icônes, séquences animées ou non, bases de données et codes sources, est la propriété exclusive d&apos;<strong>ImmOfika</strong> ou fait l&apos;objet d&apos;une autorisation d&apos;utilisation spécifique.
                </p>
                <p>
                  Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments de la plateforme, quel que soit le moyen ou le procédé utilisé, est strictement interdite sans l&apos;accord écrit préalable d&apos;ImmOfika.
                </p>
                <p>
                  Toute exploitation non autorisée de la plateforme ou de l&apos;un quelconque des éléments qu&apos;elle contient sera considérée comme constitutive d&apos;une contrefaçon et poursuivie conformément aux dispositions des articles du Code de la Propriété Intellectuelle en vigueur et des lois applicables en Côte d&apos;Ivoire (Loi n° 2016-555 relative au droit d&apos;auteur).
                </p>
              </div>
            </article>

            {/* 5. Activité Réglementée */}
            <article id="legal-regulation" className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-3">
                <BuildingIcon className="h-6 w-6 text-emerald-600" />
                <h2 className="text-xl md:text-2xl font-bold">5. Activité Professionnelle Réglementée</h2>
              </div>
              <div className="text-slate-600 space-y-3 text-sm md:text-base leading-relaxed">
                <p>
                  ImmOfika exerce en qualité d&apos;agent immobilier et de promoteur agréé en Côte d&apos;Ivoire, sous le contrôle du <strong>Ministère de la Construction, du Logement et de l&apos;Urbanisme (MCLU)</strong>.
                </p>
                <p>
                  Toutes les transactions financières et réservations effectuées sur la plateforme sont encadrées par la réglementation de la zone UEMOA (Union Économique et Monétaire Ouest-Africaine) et le droit OHADA. Le traitement des paiements par carte bancaire et Mobile Money (Orange, MTN, Wave) est opéré de manière sécurisée par Paystack, intermédiaire de paiement agréé par la Banque Centrale des États de l&apos;Afrique de l&apos;Ouest (BCEAO).
                </p>
              </div>
            </article>
            
            {/* CTA Back to site */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-xs text-slate-400 font-medium">Dernière mise à jour : Mai 2026</span>
              <Link 
                href="/biens" 
                className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-full px-6 py-2.5 shadow-md shadow-emerald-600/20 transition-all"
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
