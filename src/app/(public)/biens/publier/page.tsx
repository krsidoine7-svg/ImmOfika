import * as React from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Building2,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  FileText,
  PhoneCall,
} from 'lucide-react'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/public/Footer'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const metadata = {
  title: 'Publier une Annonce Immobilière — ImmOfika',
  description:
    'Déposez votre annonce de vente ou location de maison, appartement, résidence ou terrain sur ImmOfika. Visibilité garantie auprès de milliers d\'acheteurs solvables.',
}

export default async function PublierAnnoncePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  let userRole = 'visitor'
  if (user) {
    const [p] = await db
      .select({ role: profiles.role })
      .from(profiles)
      .where(eq(profiles.id, user.id))
    userRole = (p?.role as string) || 'client'
  }

  const isStaff = userRole.includes('admin') || userRole === 'agent'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-32 pb-20 space-y-12">
        {/* Titre & Accroche */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Vendez ou louez votre bien{' '}
            <span className="text-emerald-600 italic">sans palabre</span>.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            Que vous soyez particulier, agence immobilière ou promoteur agréé, diffusez votre bien auprès d'une audience qualifiée en Côte d'Ivoire et dans la diaspora.
          </p>
        </div>

        {/* Choix des Parcours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Option 1 : Publication Autonome ou Directe */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Building2 className="h-6 w-6" />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  Option 1 — Annonceurs Autonomes
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Je gère mes propres annonces
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Idéal pour les agences, démarcheurs agréés et propriétaires souhaitant gérer directement leurs photos, prix et demandes d'acquéreurs.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 font-medium pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Tableau de bord de suivi des vues et contacts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Publication multi-photos avec Cloudflare R2</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Messagerie directe et contacts WhatsApp qualifiés</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100">
              {isStaff ? (
                <Link
                  href="/admin/biens/nouveau"
                  className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-500/20"
                >
                  <span>Créer une fiche bien (Espace Gestion)</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : user ? (
                <Link
                  href="/client/confier"
                  className="w-full py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <span>Déposer mon bien pour publication</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/auth/register?role=proprietaire"
                  className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-500/20"
                >
                  <span>Créer mon compte annonceur</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Option 2 : Délégation Clé en Main à ImmOfika */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  Option 2 — Gestion Déléguée
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Je confie la gestion à ImmOfika
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Vous n'avez pas le temps d'organiser les visites ? Notre équipe juridique et commerciale se charge de tout de A à Z.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 font-medium pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Reportage photo professionnel & valorisation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Vérification foncière rigoureuse (ACD, CMP)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Filtrage de solvabilité et encaissement sécurisé</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/client/confier"
                className="w-full py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <span>Confier mon bien à l'équipe</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Garanties & Accompagnement */}
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h4 className="text-lg font-extrabold text-white">Besoin d'un accompagnement personnalisé ?</h4>
            <p className="text-xs text-emerald-200 max-w-lg">
              Nos juristes et conseillers immobiliers à Abidjan répondent à toutes vos questions du lundi au samedi.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold bg-white text-slate-900 hover:bg-emerald-400 hover:text-slate-950 text-xs transition-colors shrink-0 shadow-lg"
          >
            <PhoneCall className="h-4 w-4 text-emerald-600" />
            <span>Contactez un conseiller</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
