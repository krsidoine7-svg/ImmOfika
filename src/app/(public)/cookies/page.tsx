import * as React from 'react'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/public/Footer'
import Link from 'next/link'
import { EyeIcon, ShieldCheckIcon, SlidersHorizontalIcon, HelpCircleIcon } from 'lucide-react'

export const metadata = {
  title: "Gestion des Cookies - Favor Company International",
  description: "Consultez notre politique relative aux cookies et apprenez comment configurer vos préférences sur la plateforme immobilière de luxe de Favor Company.",
}

export default function CookiesPage() {
  return (
    <>
      <Navbar />
      <main id="cookies-main" className="min-h-screen bg-[#F8F6F1] pt-24">
        {/* Hero Section */}
        <section id="cookies-hero" className="bg-[#1A2A4A] py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center justify-center p-3 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] mb-4">
              <EyeIcon className="h-8 w-8" />
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Politique des <span className="text-[#C9A84C]">Cookies</span>
            </h1>
            <p className="text-white/60 text-lg">
              Transparence sur l&apos;utilisation des cookies techniques et analytiques sur notre plateforme immobilière d&apos;exception.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section id="cookies-content" className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-xl space-y-12">
            
            {/* Introduction */}
            <div className="text-gray-600 text-sm md:text-base leading-relaxed space-y-3">
              <p>
                Lors de votre navigation sur la plateforme <strong>Favor Company International</strong>, des informations sont susceptibles d&apos;être enregistrées dans des fichiers « cookies » installés sur votre terminal (ordinateur, tablette ou smartphone).
              </p>
              <p>
                La présente page vous explique ce qu&apos;est un cookie, à quoi il sert, quels types de cookies sont utilisés sur notre site et comment vous pouvez configurer vos choix de manière simple.
              </p>
            </div>

            {/* 1. Définition */}
            <article id="cookies-definition" className="space-y-4">
              <div className="flex items-center gap-3 text-[#1A2A4A] border-b pb-3">
                <HelpCircleIcon className="h-6 w-6 text-[#C9A84C]" />
                <h2 className="text-xl md:text-2xl font-bold">1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
              </div>
              <div className="text-gray-600 text-sm md:text-base leading-relaxed">
                <p>
                  Un cookie est un petit fichier texte, contenant un identifiant unique, déposé et stocké sur le disque dur de votre terminal par le serveur de la plateforme internet que vous visitez. Les cookies permettent au site web de reconnaître votre terminal, de retenir vos préférences de navigation (comme le filtre de vos recherches de villas ou terrains, ou votre connexion de session active) et de collecter des statistiques anonymes de visites pour améliorer nos services.
                </p>
              </div>
            </article>

            {/* 2. Catégories de Cookies */}
            <article id="cookies-categories" className="space-y-4">
              <div className="flex items-center gap-3 text-[#1A2A4A] border-b pb-3">
                <ShieldCheckIcon className="h-6 w-6 text-[#C9A84C]" />
                <h2 className="text-xl md:text-2xl font-bold">2. Quels cookies utilisons-nous ?</h2>
              </div>
              <div className="text-gray-600 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  Nous utilisons principalement trois grandes catégories de cookies, chacune répondant à des exigences de fonctionnement spécifiques :
                </p>

                {/* Cookies techniques essentiels */}
                <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-2">
                  <h3 className="font-bold text-[#1A2A4A] text-base">A. Cookies techniques essentiels (Strictement Nécessaires)</h3>
                  <p className="text-xs md:text-sm text-gray-500">
                    Ces cookies sont indispensables au bon fonctionnement technique de la plateforme. Ils vous permettent d&apos;utiliser les fonctionnalités principales du site de manière sécurisée (par exemple : rester connecté de façon sécurisée à votre espace client Supabase tout au long de votre visite, sauvegarder votre progression lors d&apos;une étape d&apos;achat ou de réservation).
                  </p>
                  <p className="text-xs text-amber-600 font-medium">
                    Ces cookies ne requièrent pas votre consentement préalable et ne peuvent pas être désactivés, sous peine de rendre l&apos;accès au site impossible ou instable.
                  </p>
                </div>

                {/* Cookies de performance et analytiques */}
                <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-2">
                  <h3 className="font-bold text-[#1A2A4A] text-base">B. Cookies de performance et de mesure d&apos;audience</h3>
                  <p className="text-xs md:text-sm text-gray-500">
                    Ces cookies nous aident à comprendre le comportement des internautes sur notre site (pages les plus visitées, durée de consultation des fiches biens, taux de conversion des formulaires de réservation). Ces informations nous sont précieuses pour corriger les bugs de navigation et rendre le parcours utilisateur le plus fluide et prestigieux possible.
                  </p>
                  <p className="text-xs text-gray-500">
                    Nous utilisons principalement des outils d&apos;analyse d&apos;audience anonymisés conformes aux recommandations de protection des données (ex: Google Analytics 4, Sentry, PostHog).
                  </p>
                </div>

                {/* Cookies de confort et de personnalisation */}
                <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-2">
                  <h3 className="font-bold text-[#1A2A4A] text-base">C. Cookies de confort et fonctionnalités additionnelles</h3>
                  <p className="text-xs md:text-sm text-gray-500">
                    Ces cookies vous évitent de devoir saisir à nouveau vos critères de recherche (ville d&apos;exception de Côte d&apos;Ivoire, fourchette de prix, type de bien) lors de vos visites successives sur le catalogue en ligne. Ils sont également requis pour faire fonctionner notre service de tchat d&apos;assistance IA en temps réel.
                  </p>
                </div>
              </div>
            </article>

            {/* 3. Choix de gestion */}
            <article id="cookies-management" className="space-y-4">
              <div className="flex items-center gap-3 text-[#1A2A4A] border-b pb-3">
                <SlidersHorizontalIcon className="h-6 w-6 text-[#C9A84C]" />
                <h2 className="text-xl md:text-2xl font-bold">3. Comment configurer et gérer vos cookies ?</h2>
              </div>
              <div className="text-gray-600 space-y-3 text-sm md:text-base leading-relaxed">
                <p>
                  Lors de votre première visite sur la plateforme de Favor Company, un bandeau d&apos;information apparaît au bas de l&apos;écran pour vous inviter à accepter ou refuser le dépôt de cookies non-essentiels.
                </p>
                <p>
                  Vous pouvez également configurer directement votre navigateur internet pour accepter, rejeter ou supprimer les cookies stockés sur votre terminal à tout moment. Voici la procédure pour les principaux navigateurs :
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Google Chrome :</strong> Paramètres &gt; Confidentialité et sécurité &gt; Cookies et autres données de site.</li>
                  <li><strong>Apple Safari :</strong> Préférences &gt; Confidentialité &gt; Bloquer tous les cookies.</li>
                  <li><strong>Mozilla Firefox :</strong> Options &gt; Vie privée et sécurité &gt; Cookies et données de sites.</li>
                  <li><strong>Microsoft Edge :</strong> Paramètres &gt; Autorisations du site &gt; Cookies et données de site.</li>
                </ul>
              </div>
            </article>

            {/* Footer links */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-xs text-gray-400">Dernière mise à jour : Mai 2026</span>
              <div className="flex gap-4">
                <Link href="/legal" className="text-xs text-[#C9A84C] hover:underline font-medium">Mentions Légales</Link>
                <Link href="/privacy" className="text-xs text-[#C9A84C] hover:underline font-medium">Politique de Confidentialité</Link>
              </div>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
