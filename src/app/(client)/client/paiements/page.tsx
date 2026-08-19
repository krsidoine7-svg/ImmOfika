import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { CreditCard, Download, Clock, ShieldCheck, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const metadata = {
  title: 'Mes Paiements — ImmOfika',
}

export default async function PaiementsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch all payments for this client with reservation details
  const { data: paiementsData } = await supabase
    .from('paiements')
    .select('id, montant, devise, statut, type_paiement, facture_numero, facture_url, paid_at, created_at, reservations(id, biens(titre))')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  const paiements = paiementsData || []

  return (
    <main className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8 bg-white min-h-screen">
      <div>
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
          Espace Financier
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Historique des Paiements
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Retrouvez toutes vos transactions et téléchargez vos reçus et factures d&apos;ImmOfika.
        </p>
      </div>

      <div className="border border-slate-100 rounded-3xl p-6 bg-white shadow-sm">
        {paiements.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Aucun paiement trouvé.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                  <th className="pb-4 font-semibold">Date</th>
                  <th className="pb-4 font-semibold">Bien concerné</th>
                  <th className="pb-4 font-semibold">Montant</th>
                  <th className="pb-4 font-semibold">Statut</th>
                  <th className="pb-4 font-semibold text-right">Facture</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {paiements.map((p: any) => {
                  const reservation = Array.isArray(p.reservations) ? p.reservations[0] : p.reservations
                  const bien = reservation?.biens ? (Array.isArray(reservation.biens) ? reservation.biens[0] : reservation.biens) : null
                  
                  return (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 font-medium text-[#0F172A]">
                        {format(new Date(p.created_at), 'dd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="py-4 text-gray-600">
                        {bien?.titre || 'Bien inconnu'}
                        <div className="text-xs text-slate-400 mt-0.5 capitalize">{p.type_paiement}</div>
                      </td>
                      <td className="py-4 font-bold text-[#0F172A]">
                        {new Intl.NumberFormat('fr-CI').format(p.montant)} {p.devise}
                      </td>
                      <td className="py-4">
                        {p.statut === 'paye' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <ShieldCheck className="h-3.5 w-3.5" /> Payé
                          </span>
                        )}
                        {p.statut === 'en_attente' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                            <Clock className="h-3.5 w-3.5" /> En attente
                          </span>
                        )}
                        {p.statut === 'echoue' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                            <XCircle className="h-3.5 w-3.5" /> Échoué
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        {p.facture_url ? (
                          <a
                            href={p.facture_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-2 rounded-lg text-[#B8860B] hover:bg-[#B8860B]/10 transition-colors"
                            title="Télécharger la facture"
                          >
                            <Download className="h-5 w-5" />
                          </a>
                        ) : (
                          <span className="text-slate-300 text-xs italic">N/A</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
