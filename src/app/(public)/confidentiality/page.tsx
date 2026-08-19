import * as React from 'react'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/public/Footer'
import Link from 'next/link'
import { ShieldCheckIcon, EyeIcon, UserCheckIcon, LockIcon } from 'lucide-react'

export const metadata = {
  title: "Politique de Confidentialité - Favor Company International",
  description: "Découvrez notre politique de confidentialité et la manière dont nous protégeons vos données personnelles conformément à la législation en vigueur en Côte d'Ivoire.",
}

export default function ConfidentialityPage() {
  return (
    <>
      <Navbar />
      <main id="confidentiality-main" className="min-h-screen bg-[#F8F6F1] pt-24">
        {/* Hero Section */}
        <section id="confidentiality-hero" className="bg-[#1A2A4A] py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center justify-center p-3 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] mb-4">
              <ShieldCheckIcon className="h-8 w-8" />
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Politique de <span className="text-[#C9A84C]">Confidentialité</span>
            </h1>
            <p className="text-white/60 text-lg">
              Votre confiance est notre priorité. Engagement de protection des données personnelles de Favor Company.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section id="confidentiality-content" className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-xl space-y-12">
            
            {/* Introduction */}
            <div className="text-gray-600 text-sm md:text-base leading-relaxed space-y-3">
              <p>
                Chez <strong>Favor Company International</strong>, nous accordons une importance primordiale à la confidentialité et à la sécurité de vos données à caractère personnel.
              </p>
              <p>
                La présente Politique de Confidentialité a pour but de vous informer en toute transparence sur la nature des données que nous collectons, la raison de leur collecte, la manière dont elles sont traitées, sécurisées et conservées, ainsi que sur les droits dont vous disposez en vertu de la <strong>loi ivoirienne n° 2013-450 du 19 juin 2013</strong> relative à la protection des données à caractère personnel et, le cas échéant, du Règlement Général sur la Protection des Données (RGPD).
              </p>
            </div>

            {/* 1. Collecte des données */}
            <article id="confidentiality-collection" className="space-y-4">
              <div className="flex items-center gap-3 text-[#1A2A4A] border-b pb-3">
                <EyeIcon className="h-6 w-6 text-[#C9A84C]" />
                <h2 className="text-xl md:text-2xl font-bold">1. Quelles données collectons-nous ?</h2>
              </div>
              <div className="text-gray-600 space-y-3 text-sm md:text-base leading-relaxed">
                <p>
                  Dans le cadre de l&apos;utilisation de notre plateforme et de nos services immobiliers d&apos;exception, nous collectons les catégories de données suivantes :
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  <li><strong>Informations d&apos;identité :</strong> nom complet, adresse e-mail, numéro de téléphone, pièce d&apos;identité nationale ou passeport (requis pour la génération des contrats de réservation officiels).</li>
                  <li><strong>Informations de profil :</strong> mot de passe (haché de manière sécurisée en base), photo de profil.</li>
                  <li><strong>Données relatives aux transactions :</strong> historique de vos réservations, montants des acomptes, reçus de transaction Paystack, références de paiement, canal de paiement utilisé. <em>Aucune donnée bancaire (numéro de carte ou code secret Mobile Money) n&apos;est stockée sur nos serveurs ; elles sont entièrement traitées par l&apos;intermédiaire sécurisé Paystack.</em></li>
                  <li><strong>Données de navigation et techniques :</strong> adresse IP, logs de connexion, type de navigateur, données géographiques de recherche de biens (ville, quartier).</li>
                </ul>
              </div>
            </article>

            {/* 2. Finalités du traitement */}
            <article id="confidentiality-purpose" className="space-y-4">
              <div className="flex items-center gap-3 text-[#1A2A4A] border-b pb-3">
                <UserCheckIcon className="h-6 w-6 text-[#C9A84C]" />
                <h2 className="text-xl md:text-2xl font-bold">2. Pourquoi traitons-nous vos données ?</h2>
              </div>
              <div className="text-gray-600 space-y-3 text-sm md:text-base leading-relaxed">
                <p>
                  Le traitement de vos données personnelles repose sur des bases juridiques précises et est effectué pour les finalités suivantes :
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Exécution d&apos;un contrat :</strong> gestion de votre compte utilisateur, traitement de vos réservations de terrains ou de villas, génération automatisée des contrats de réservation légaux conformes OHADA et des factures d&apos;acompte.</li>
                  <li><strong>Obligation légale :</strong> respect des exigences comptables et fiscales ivoiriennes en matière de transaction financière et de promotion immobilière.</li>
                  <li><strong>Intérêt légitime :</strong> amélioration continue de l&apos;ergonomie de notre catalogue de biens, envoi de notifications importantes concernant le statut de vos options de réservation, sécurisation de la plateforme contre les fraudes.</li>
                  <li><strong>Consentement :</strong> envoi de propositions commerciales personnalisées ou de newsletters, si vous y avez consenti.</li>
                </ul>
              </div>
            </article>

            {/* 3. Sécurité des données */}
            <article id="confidentiality-security" className="space-y-4">
              <div className="flex items-center gap-3 text-[#1A2A4A] border-b pb-3">
                <LockIcon className="h-6 w-6 text-[#C9A84C]" />
                <h2 className="text-xl md:text-2xl font-bold">3. Comment vos données sont-elles sécurisées ?</h2>
              </div>
              <div className="text-gray-600 space-y-3 text-sm md:text-base leading-relaxed">
                <p>
                  Favor Company International applique des mesures de sécurité techniques et organisationnelles d&apos;une exigence absolue pour préserver l&apos;intégrité, la confidentialité et la disponibilité de vos informations personnelles :
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Chiffrement en transit :</strong> Toutes les communications entre votre navigateur et nos serveurs sont cryptées via le protocole HTTPS / TLS 1.3.</li>
                  <li><strong>Sécurité d&apos;accès base de données :</strong> Notre base de données PostgreSQL hébergée sur Supabase applique des politiques de sécurité au niveau des lignes (Row Level Security - RLS). Chaque client a l&apos;assurance technique de ne pouvoir accéder qu&apos;à ses propres données personnelles, réservations et transactions.</li>
                  <li><strong>Chiffrement des données sensibles :</strong> Les données personnelles hautement critiques (telles que les coordonnées téléphoniques ou les numéros de CNI/Passeports pour la génération de contrats) sont stockées avec un haut niveau de cryptage de bout en bout.</li>
                  <li><strong>Passerelle de paiement sécurisée :</strong> Les transactions sont opérées par l&apos;API sécurisée de Paystack qui respecte les normes de sécurité de l&apos;industrie des cartes de paiement (PCI-DSS niveau 1).</li>
                </ul>
              </div>
            </article>

            {/* 4. Durée de conservation */}
            <article id="confidentiality-retention" className="space-y-4">
              <div className="flex items-center gap-3 text-[#1A2A4A] border-b pb-3">
                <ShieldCheckIcon className="h-6 w-6 text-[#C9A84C]" />
                <h2 className="text-xl md:text-2xl font-bold">4. Durée de conservation des données</h2>
              </div>
              <div className="text-gray-600 space-y-2 text-sm md:text-base leading-relaxed">
                <p>
                  Nous ne conservons vos données que pour la durée strictement nécessaire à l&apos;accomplissement des finalités pour lesquelles elles ont été collectées :
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Les données de compte utilisateur sont conservées tant que votre compte est actif. En cas de demande de suppression, elles sont effacées sous 30 jours, à l&apos;exception des données comptables.</li>
                  <li>Les données liées aux réservations et transactions financières sont conservées pendant une durée de <strong>10 ans</strong>, conformément aux obligations comptables et fiscales OHADA et ivoiriennes.</li>
                </ul>
              </div>
            </article>

            {/* 5. Politique d'Annulation de Réservation & Acompte de 10% */}
            <article id="confidentiality-cancellation" className="space-y-4">
              <div className="flex items-center gap-3 text-[#1A2A4A] border-b pb-3">
                <ShieldCheckIcon className="h-6 w-6 text-[#C9A84C]" />
                <h2 className="text-xl md:text-2xl font-bold">5. Politique d&apos;Annulation & Acompte de 10% Non-Remboursable</h2>
              </div>
              <div className="text-gray-600 space-y-3 text-sm md:text-base leading-relaxed">
                <p>
                  En sa qualité de <strong>Promoteur Immobilier Agréé par l&apos;État de Côte d&apos;Ivoire (Agrément N° 049/MCU/DGUF)</strong>, Favor Company International applique les règles suivantes en cas d&apos;annulation d&apos;une réservation immobilière :
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Acompte initial de 10% non remboursable :</strong> Le versement d&apos;acompte initial (minimum 10% du prix total du bien) effectué lors de la réservation est définitivement acquis à la société Favor Company International à titre d&apos;indemnité forfaitaire non remboursable. Cet acompte couvre les frais d&apos;instruction du dossier, les vérifications foncières, le temps de blocage du bien et les démarches administratives.</li>
                  <li><strong>Remboursement des versements ultérieurs :</strong> Si l&apos;acquéreur a effectué des versements complémentaires au-delà de l&apos;acompte initial de 10% (ex: règlements échelonnés ultérieurs), le montant de ces tranches complémentaires lui sera intégralement restitué dans un délai de 30 jours suivant la notification formelle de l&apos;annulation.</li>
                </ul>
              </div>
            </article>

            {/* 5. Vos droits */}
            <article id="confidentiality-rights" className="space-y-4">
              <div className="flex items-center gap-3 text-[#1A2A4A] border-b pb-3">
                <UserCheckIcon className="h-6 w-6 text-[#C9A84C]" />
                <h2 className="text-xl md:text-2xl font-bold">5. Quels sont vos droits ?</h2>
              </div>
              <div className="text-gray-600 space-y-3 text-sm md:text-base leading-relaxed">
                <p>
                  Conformément à la réglementation ivoirienne (Loi n° 2013-450) et internationale (RGPD), vous disposez des droits suivants concernant vos données à caractère personnel :
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Droit d&apos;accès :</strong> Le droit de savoir si des données vous concernant sont traitées et d&apos;en obtenir une copie lisible.</li>
                  <li><strong>Droit de rectification :</strong> Le droit de corriger ou de mettre à jour des données inexactes, incomplètes ou obsolètes.</li>
                  <li><strong>Droit à l&apos;effacement (droit à l&apos;oubli) :</strong> Le droit de demander la suppression définitive de vos données personnelles sous réserve des obligations légales de conservation.</li>
                  <li><strong>Droit d&apos;opposition :</strong> Le droit de vous opposer à tout moment, pour des motifs légitimes, au traitement de vos données ou à leur utilisation à des fins de prospection commerciale.</li>
                </ul>
                <p>
                  Pour exercer l&apos;un de ces droits, vous pouvez contacter notre Délégué à la Protection des Données (DPO) par e-mail à l&apos;adresse suivante : <a href="mailto:dpo@favor-ci.com" className="text-[#C9A84C] hover:underline">dpo@favor-ci.com</a> ou par courrier à notre siège social à Cocody Riviera M&apos;Badon.
                </p>
              </div>
            </article>

            {/* Footer controls */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-xs text-gray-400">Dernière mise à jour : Mai 2026</span>
              <div className="flex gap-4">
                <Link href="/legal" className="text-xs text-[#C9A84C] hover:underline font-medium">Mentions Légales</Link>
                <Link href="/cookies" className="text-xs text-[#C9A84C] hover:underline font-medium">Gestion des Cookies</Link>
              </div>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
