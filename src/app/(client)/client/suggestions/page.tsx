import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { suggestions } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { HelpCircle, MessageSquare, PlusCircle, CheckCircle } from 'lucide-react'
import SuggestionFormClient from '@/components/client/SuggestionFormClient'

export const metadata = {
  title: 'Suggestions & Retours — ImmOfika',
  description: 'Laissez vos avis et retours d\'expérience.',
}

export default async function SuggestionsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Récupérer les suggestions passées du client
  const userSuggestions = await db
    .select()
    .from(suggestions)
    .where(eq(suggestions.clientId, user.id))
    .orderBy(desc(suggestions.createdAt))

  return (
    <main className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 bg-white min-h-screen">
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
          Espace Retours
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Boîte à Suggestions & Retours
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Partagez vos idées ou questions avec les équipes d&apos;ImmOfika.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Formulaire Client */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
              <PlusCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Nouveau Retour</h2>
              <p className="text-xs text-slate-500 font-medium">Transmettez une idée ou un besoin.</p>
            </div>
          </div>
          <SuggestionFormClient />
        </div>

        {/* Historique des Suggestions */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-emerald-600" />
            Vos retours précédents
          </h2>

          {userSuggestions.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <HelpCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Vous n&apos;avez encore soumis aucun retour.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userSuggestions.map((sug) => (
                <div key={sug.id} className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm space-y-2">
                  <div className="flex items-start justify-between">
                    <p className="text-xs font-bold text-slate-900 capitalize">{sug.categorie}</p>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {sug.createdAt ? new Date(sug.createdAt).toLocaleDateString('fr-FR') : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{sug.message}</p>

                  <div className="pt-2 border-t border-slate-50 flex flex-col gap-2 text-[11px]">
                    <div className="font-semibold">
                      {sug.statut === 'en_attente' && (
                        <span className="text-amber-600 flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" /> En cours d&apos;analyse
                        </span>
                      )}
                      {sug.statut === 'repondue' && (
                        <span className="text-emerald-600 flex items-center gap-1 font-bold">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Réponse apportée
                        </span>
                      )}
                    </div>

                    {sug.reponse && (
                      <div className="bg-emerald-50/60 p-3 rounded-xl border-l-2 border-emerald-500 text-[11px] text-slate-800 leading-relaxed font-normal mt-2 w-full">
                        <p className="font-bold text-emerald-900 mb-1">Réponse de l&apos;équipe ImmOfika :</p>
                        {sug.reponse}
                      </div>
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
