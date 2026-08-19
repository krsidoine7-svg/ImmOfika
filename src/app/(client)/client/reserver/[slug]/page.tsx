import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import ReservationForm from '@/components/biens/ReservationForm'
import Navbar from '@/components/shared/Navbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Réserver un bien — ImmOfika',
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ReserverPage({ params }: PageProps) {
  const { slug } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Vérifier la session — page protégée
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/auth/login?redirect=/client/reserver/${slug}`)
  }

  // Charger le bien
  const { data: bien, error } = await supabase
    .from('biens')
    .select('id, slug, titre, prix, type, transaction, statut, ville, quartier, surface, chambres, main_image_url')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single()

  if (error || !bien) notFound()

  // Charger le profil du client
  const { data: profil } = await supabase
    .from('profiles')
    .select('full_name, phone, email')
    .eq('id', user.id)
    .single()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F6F1] pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <a href="/" className="hover:text-[#C9A84C] transition-colors">Accueil</a>
            <span>/</span>
            <a href="/biens" className="hover:text-[#C9A84C] transition-colors">Biens</a>
            <span>/</span>
            <a href={`/biens/${slug}`} className="hover:text-[#C9A84C] transition-colors truncate max-w-[200px]">{bien.titre}</a>
            <span>/</span>
            <span className="text-[#1A2A4A] font-medium">Réservation</span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Récapitulatif du bien */}
            <div>
              <h1 className="text-2xl font-bold text-[#1A2A4A] mb-6">
                Confirmer votre réservation
              </h1>

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                {bien.main_image_url && (
                   
                  <img
                    src={bien.main_image_url}
                    alt={bien.titre}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#C9A84C]/10 text-[#C9A84C] capitalize">
                      {bien.type}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#1A2A4A]/10 text-[#1A2A4A] capitalize">
                      {bien.transaction}
                    </span>
                  </div>
                  <h2 className="font-semibold text-[#1A2A4A] text-lg mb-2">{bien.titre}</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    {bien.quartier ? `${bien.quartier}, ` : ''}{bien.ville}
                  </p>

                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Prix</span>
                      <span className="font-bold text-[#C9A84C]">
                        {new Intl.NumberFormat('fr-CI').format(parseFloat(bien.prix))} FCFA
                        {bien.transaction === 'location' ? '/mois' : ''}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Durée réservation</span>
                      <span className="font-medium text-[#1A2A4A]">3 mois maximum</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Statut actuel</span>
                      <span className="font-medium text-emerald-600 capitalize">{bien.statut}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info légale */}
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
                <p className="font-semibold mb-1">📋 Information importante</p>
                <p>
                  La réservation bloque le bien pendant 3 mois. Un acompte vous sera demandé 
                  pour confirmer votre dossier. Sans paiement dans les 7 jours, la réservation 
                  pourra être libérée automatiquement.
                </p>
              </div>
            </div>

            {/* Formulaire */}
            <ReservationForm
              bienId={bien.id}
              bienSlug={slug}
              bienStatut={bien.statut}
              clientNom={profil?.full_name ?? user.email ?? ''}
              clientEmail={user.email ?? ''}
              clientPhone={profil?.phone ?? ''}
            />
          </div>
        </div>
      </main>
    </>
  )
}
