import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import PaymentButton from '@/components/payment/PaymentButton'
import { db } from '@/lib/db'
import { visites, biens, profiles } from '@/lib/db/schema'
import { eq, and, isNull, desc } from 'drizzle-orm'
import DashboardVisitesList from '@/components/client/DashboardVisitesList'
import {
  Home,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Compass,
  Download,
  CheckCircle
} from 'lucide-react'

export const metadata = {
  title: 'Espace Client — ImmOfika',
  description: 'Gérez vos réservations immobilières et vos paiements sécurisés avec ImmOfika.',
}

export default async function ClientDashboard() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch profiles table data
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, role, kyc_status, kyc_rejection_reason')
    .eq('id', user.id)
    .single()

  // Fetch client reservations with joined biens details and payments
  const { data: reservationsData } = await supabase
    .from('reservations')
    .select('id, statut, date_expiration, notes, created_at, contrat_scanne_url, biens(*), paiements(*)')
    .eq('client_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const reservationsList = (reservationsData || []).map((res: any) => {
    const bien = Array.isArray(res.biens) ? res.biens[0] : res.biens
    const payments = Array.isArray(res.paiements) ? res.paiements : (res.paiements ? [res.paiements] : [])
    const totalDejaPaye = payments
      .filter((p: any) => p.statut === 'paye')
      .reduce((sum: number, p: any) => sum + parseFloat(p.montant || '0'), 0)

    const lastPaymentWithInvoice = payments.find((p: any) => p.facture_url)
    const factureUrl = lastPaymentWithInvoice?.facture_url

    // Determine current timeline step (1 to 5)
    let currentStep = 1 // Step 1: Réservation (validated)
    if (res.statut === 'confirme' || totalDejaPaye > 0) {
      currentStep = 2 // Step 2: Acompte validé
    }
    if (res.statut === 'confirme' && totalDejaPaye >= parseFloat(bien?.prix || '0') * 0.1) {
      currentStep = 3 // Step 3: Contrat signé
    }
    if (res.statut === 'confirme' && totalDejaPaye > parseFloat(bien?.prix || '0') * 0.3) {
      currentStep = 4 // Step 4: Échéancier en cours
    }
    if (res.statut === 'clos' || res.statut === 'livre') {
      currentStep = 5 // Step 5: Clés livrées / ACD
    }

    return {
      id: res.id,
      statut: res.statut,
      dateExpiration: res.date_expiration,
      notes: res.notes,
      createdAt: res.created_at,
      bien,
      totalDejaPaye,
      factureUrl,
      contratScanneUrl: res.contrat_scanne_url,
      currentStep
    }
  })

  // Calculate stats
  const totalReservations = reservationsList.length
  const pendingPayments = reservationsList.filter((r) => r.statut === 'en_attente').length
  const confirmedReservations = reservationsList.filter((r) => r.statut === 'confirme').length

  // Fetch client visits using Drizzle ORM
  const clientVisites = await db
    .select({
      id: visites.id,
      dateVisite: visites.dateVisite,
      statut: visites.statut,
      commentaires: visites.commentaires,
      bienTitre: biens.titre,
      bienVille: biens.ville,
      bienQuartier: biens.quartier,
      agentName: profiles.fullName,
    })
    .from(visites)
    .innerJoin(biens, eq(visites.bienId, biens.id))
    .leftJoin(profiles, eq(visites.agentId, profiles.id))
    .where(
      and(
        eq(visites.clientId, user.id),
        isNull(visites.deletedAt)
      )
    )
    .orderBy(desc(visites.dateVisite))

  const kycIncomplete = !profile?.kyc_status || profile?.kyc_status === 'none'

  return (
    <main className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8 bg-white min-h-screen">
      
      {/* Red banner for rejected KYC */}
      {profile?.kyc_status === 'none' && profile?.kyc_rejection_reason && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-red-900">❌ Votre pièce d&apos;identité (KYC) a été refusée par nos agents.</p>
            <p className="font-semibold text-red-700">Raison du refus : {profile.kyc_rejection_reason}</p>
            <p className="font-medium">
              Veuillez charger un nouveau document valide (recto-verso lisible, non expiré) pour débloquer la signature de vos contrats.
              <a href="/client/profil" className="underline font-bold ml-1 hover:text-red-900">Mettre à jour ma pièce d&apos;identité</a>
            </p>
          </div>
        </div>
      )}

      {/* Notion-style KYC warning banner */}
      {kycIncomplete && !profile?.kyc_rejection_reason && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-900">
          <AlertCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-emerald-900">ℹ️ Pour finaliser vos contrats juridiques officiels, veuillez compléter vos informations d&apos;identité (KYC).</p>
            <p className="font-medium">
              Téléversez une photo de votre pièce d&apos;identité (CNI ou Passeport) depuis les paramètres de votre profil. 
              <a href="/client/profil" className="underline font-bold ml-1 hover:text-emerald-700">Compléter mon profil maintenant</a>
            </p>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="border border-slate-100 rounded-3xl p-6 sm:p-8 bg-slate-50/70 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900 text-white uppercase tracking-wider">
                Espace Client Privé
              </span>
              <span className="px-3 py-0.5 rounded-full text-[10px] border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold uppercase tracking-wider">
                Promoteur Agréé
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Bonjour, {profile?.full_name || user.email?.split('@')[0]}
            </h1>
            <p className="text-slate-600 font-medium max-w-xl text-xs sm:text-sm mt-1.5 leading-relaxed">
              Suivez l&apos;avancement de vos projets fonciers et immobiliers ImmOfika et gérez vos documents légaux.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/client/paiements"
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 transition-all text-xs font-bold text-white shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Download className="h-4 w-4 text-white" />
              Mes Paiements
            </a>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <Home className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Réservations Totales</p>
            <p className="text-xl font-black text-slate-800">{totalReservations}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <Clock className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Paiements en attente</p>
            <p className="text-xl font-black text-slate-800">{pendingPayments}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Biens Confirmés</p>
            <p className="text-xl font-black text-emerald-600">{confirmedReservations}</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Reservations List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Compass className="h-5 w-5 text-emerald-600" />
            Suivi Individuel de mes Biens
          </h2>

          {reservationsList.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center shadow-sm space-y-4">
              <Home className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-slate-500 font-medium text-sm">Vous n&apos;avez réservé aucun bien pour le moment.</p>
              <a
                href="/biens"
                className="inline-block py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-md shadow-emerald-500/20"
              >
                Parcourir notre catalogue de biens
              </a>
            </div>
          ) : (
            reservationsList.map((res) => {
              const hasProperty = !!res.bien
              const bien = res.bien || {}
              const exactPrice = parseFloat(bien.prix || '0')
              const acompteAmount = Math.round(exactPrice * 0.1)

              const steps = [
                { label: "Réservation" },
                { label: "Acompte (10%)" },
                { label: "Contrat Signé" },
                { label: "Échéancier" },
                { label: "ACD / Clés" }
              ]

              return (
                <div
                  key={res.id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md p-6 space-y-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-2xl shrink-0 overflow-hidden relative">
                        {bien.main_image_url ? (
                          <img
                            src={bien.main_image_url}
                            alt={bien.titre || 'Bien ImmOfika'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Home className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="px-2 py-0.5 rounded text-[8px] font-extrabold bg-emerald-50 text-emerald-700 uppercase border border-emerald-100">
                          {bien.type || 'Bien'}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-base mt-1 leading-snug">
                          {bien.titre || 'Bien sans titre'}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium flex items-center gap-0.5 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {bien.quartier ? `${bien.quartier}, ` : ''}{bien.ville || 'Côte d\'Ivoire'}
                        </p>
                      </div>
                    </div>

                    {/* Quick status badge */}
                    <div className="shrink-0">
                      {res.statut === 'en_attente' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1">
                          <Clock className="h-3 w-3 animate-spin" /> Acompte requis
                        </span>
                      )}
                      {res.statut === 'confirme' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" /> Confirmé
                        </span>
                      )}
                      {res.statut === 'expire' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                          Expiré
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progressive Timeline Tracker for this specific property */}
                  <div className="bg-slate-50/70 p-4 sm:p-6 rounded-2xl space-y-4 border border-slate-100/60">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suivi d&apos;avancement du projet</p>
                    
                    <div className="grid grid-cols-5 gap-1.5 relative pt-2">
                      {/* Background connecting line */}
                      <div className="absolute top-7 left-4 right-4 h-[2px] bg-slate-200 -z-0" />
                      
                      {steps.map((step, idx) => {
                        const stepNum = idx + 1
                        const isCompleted = stepNum < res.currentStep
                        const isActive = stepNum === res.currentStep
                        
                        return (
                          <div key={idx} className="flex flex-col items-center text-center z-10">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                              isCompleted 
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs' 
                                : isActive 
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 animate-pulse' 
                                : 'bg-white text-slate-400 border-slate-200'
                            }`}>
                              {isCompleted ? '✓' : stepNum}
                            </div>
                            <span className="text-[9px] font-bold mt-2 text-slate-600 block truncate w-full max-w-[70px]">
                              {step.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Financials details panel */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-b border-slate-100 py-4 text-xs font-medium">
                    <div>
                      <p className="text-slate-400 font-bold text-[10px] uppercase">Valeur totale</p>
                      <p className="font-black text-slate-900 mt-0.5">
                        {new Intl.NumberFormat('fr-CI').format(exactPrice)} FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold text-[10px] uppercase">Acompte (10%)</p>
                      <p className="font-black text-emerald-700 mt-0.5">
                        {new Intl.NumberFormat('fr-CI').format(acompteAmount)} FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold text-[10px] uppercase">Déjà versé</p>
                      <p className="font-black text-emerald-600 mt-0.5">
                        {new Intl.NumberFormat('fr-CI').format(res.totalDejaPaye)} FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold text-[10px] uppercase">Solde restant</p>
                      <p className="font-black text-slate-900 mt-0.5">
                        {new Intl.NumberFormat('fr-CI').format(Math.max(0, exactPrice - res.totalDejaPaye))} FCFA
                      </p>
                    </div>
                  </div>

                  {/* Interactive actions for this reservation */}
                  {res.statut === 'en_attente' && hasProperty && (
                    <div className="space-y-4">
                      <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed font-medium">
                        Veuillez régler votre acompte de 10% sous 7 jours pour valider la réservation et sécuriser le bien.
                      </div>
                      <PaymentButton
                        reservationId={res.id}
                        clientId={user.id}
                        acompteRequis={acompteAmount}
                        totalDejaPaye={res.totalDejaPaye}
                        email={user.email || ''}
                        bienTitre={bien.titre}
                      />
                    </div>
                  )}

                  {res.statut === 'confirme' && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                        <span className="text-xs text-slate-700 font-medium">Contrat de réservation validé. Vos documents officiels sont téléchargeables.</span>
                      </div>
                      <div className="flex gap-2">
                        {res.factureUrl && (
                          <a
                            href={res.factureUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors shrink-0 shadow-xs border border-slate-200"
                          >
                            <Download className="h-4 w-4 text-slate-500" />
                            Facture
                          </a>
                        )}
                        {res.contratScanneUrl && (
                          <a
                            href={res.contratScanneUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shrink-0 shadow-md shadow-emerald-500/20"
                          >
                            <Download className="h-4 w-4 text-white" />
                            Contrat Signé
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}

          {/* Visits List */}
          <div className="mt-8 border-t border-slate-100 pt-8">
            <DashboardVisitesList visites={clientVisites} />
          </div>
        </div>

        {/* Sidebar Info Columns */}
        <div className="space-y-6">
          
          {/* Quick Support Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-emerald-600" />
              Besoin d&apos;aide ?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Une préoccupation sur vos paiements, ou besoin de conseils juridiques pour l&apos;ACD ? Contactez directement nos conseillers agréés.
            </p>
            <div className="space-y-2">
              <a
                href="/client/contact"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-slate-800 font-bold text-xs transition-colors"
              >
                Contacter mon conseiller
              </a>
            </div>
          </div>

          {/* Rule Card */}
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-xs text-slate-600 space-y-3 font-medium leading-relaxed">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-emerald-600" />
              Réglementation ImmOfika
            </h3>
            <ul className="space-y-2 list-disc list-inside">
              <li>Toute réservation non réglée sous 7 jours est annulée de plein droit.</li>
              <li>La validation par acompte garantit l&apos;exclusivité du bien durant 3 mois.</li>
              <li>Remboursement de 87% garanti en cas de désistement volontaire.</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
