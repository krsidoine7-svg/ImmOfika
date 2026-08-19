import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { bienConfies } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Home, Briefcase, PlusCircle, CheckCircle, Sparkles } from 'lucide-react'
import ConfierFormClient from '@/components/client/ConfierFormClient'

export const metadata = {
  title: 'Confier un Bien — ImmOfika',
  description: 'Confiez votre terrain ou votre projet immobilier à un promoteur agréé.',
}

export default async function ConfierBienPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Récupérer les biens confiés par le client
  const userConfier = await db
    .select()
    .from(bienConfies)
    .where(eq(bienConfies.clientId, user.id))
    .orderBy(desc(bienConfies.createdAt))

  return (
    <main className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 bg-white min-h-screen">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block">
            Gestion Foncier & Vente
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-700 uppercase">
            Bêta
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Confiez-nous Vos Biens
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Bénéficiez de l&apos;expertise légale et technique d&apos;ImmOfika International pour l&apos;aménagement, la construction ou la gestion de votre patrimoine.
        </p>
      </div>

      {/* Banner Bêta */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
        <div className="p-2 bg-amber-500/15 rounded-xl text-amber-600 shrink-0 mt-0.5">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-amber-900">Module en cours d'expérimentation (Version Bêta)</h4>
          <p className="text-xs text-amber-800/80 mt-0.5">
            Ce service de soumission directe est actuellement en phase Bêta. Vos soumissions seront transmises et traitées en priorité par l&apos;équipe de la Direction Juridique & Conformité.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* Form */}
        <div className="border border-slate-100 rounded-3xl p-6 bg-white shadow-sm space-y-4">
          <h2 className="font-bold text-[#0F172A] text-lg flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-[#B8860B]" />
            Désignation du bien à confier
          </h2>
          <ConfierFormClient />
        </div>

        {/* Historique biens confiés */}
        <div className="border border-slate-100 rounded-3xl p-6 bg-slate-50/30 space-y-4 overflow-y-auto max-h-[500px]">
          <h2 className="font-bold text-[#0F172A] text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-[#D4AF37]" />
            Mes Biens Soumis ({userConfier.length})
          </h2>

          {userConfier.length === 0 ? (
            <div className="text-center py-12 text-slate-600 font-medium text-sm">
              Vous n&apos;avez encore soumis aucun bien à l&apos;étude.
            </div>
          ) : (
            <div className="space-y-4">
              {userConfier.map((bc) => (
                <div key={bc.id} className="bg-white p-4 rounded-2xl border border-slate-100/60 shadow-sm space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#D4AF37]/10 text-[#B8860B] uppercase">
                      {bc.typeService}
                    </span>
                    <span className="text-[10px] text-slate-600 font-medium">
                      {new Date(bc.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-800 space-y-1.5 font-normal">
                    <p><strong>Localisation :</strong> {bc.ville}{bc.quartier ? `, ${bc.quartier}` : ''}</p>
                    {bc.surface && <p><strong>Surface :</strong> {bc.surface} m²</p>}
                    <p><strong>Titre Foncier :</strong> {bc.titreFoncier ? 'Oui (ACD/TF)' : 'Non'}</p>
                    {bc.budget && <p><strong>Budget :</strong> {new Intl.NumberFormat('fr-CI').format(parseFloat(bc.budget))} FCFA</p>}
                  </div>

                  <div className="pt-2 border-t border-slate-50 flex items-center gap-1.5 text-[10px] font-bold">
                    {bc.statut === 'nouveau' && (
                      <span className="text-amber-500 flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" /> À l&apos;étude par nos experts
                      </span>
                    )}
                    {bc.statut === 'contacte' && (
                      <span className="text-[#D4AF37] flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5 text-[#D4AF37]" /> Agent en contact
                      </span>
                    )}
                    {bc.statut === 'clos' && (
                      <span className="text-emerald-500 flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Dossier Finalisé
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
