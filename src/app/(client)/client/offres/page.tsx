import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { reservations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Award, CheckCircle, Flame, ShieldAlert, Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Mon Niveau d\'Offre — ImmOfika',
  description: 'Visualisez vos privilèges et avantages acquéreurs.',
}

export default async function OffresPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Vérifier le nombre de réservations confirmées pour calculer la fidélité
  const confirmedReservations = await db
    .select()
    .from(reservations)
    .where(eq(reservations.clientId, user.id))

  const count = confirmedReservations.length
  
  // Déterminer le statut
  let currentTier = "Membre Inscrit"
  let tierDescription = "Vous avez accès au catalogue complet et pouvez réserver un bien."
  let icon = <Award className="h-10 w-10 text-slate-400" />
  
  if (count >= 3) {
    currentTier = "Investisseur Élite"
    tierDescription = "Privilèges VIP ImmOfika : Remises exclusives sur les frais de dossier, accès prioritaire aux nouveaux lotissements."
    icon = <Flame className="h-10 w-10 text-emerald-600" />
  } else if (count >= 1) {
    currentTier = "Acheteur Confirmé"
    tierDescription = "Vous êtes officiellement propriétaire chez ImmOfika. Vous bénéficiez d'un suivi de dossier personnalisé."
    icon = <Sparkles className="h-10 w-10 text-emerald-500" />
  }

  const tiers = [
    {
      name: "Membre Inscrit",
      requirements: "Création de compte",
      benefits: ["Accès au catalogue de biens complet", "Alertes e-mail sur les nouveaux terrains", "Visites guidées gratuites"],
      active: currentTier === "Membre Inscrit"
    },
    {
      name: "Acheteur Confirmé",
      requirements: "1 à 2 réservations ou biens acquis",
      benefits: ["Conseiller immobilier attitré", "Génération rapide de contrats officiels", "Accès au coffre-fort de documents centralisés"],
      active: currentTier === "Acheteur Confirmé"
    },
    {
      name: "Investisseur Élite",
      requirements: "3 biens réservés/acquis ou plus",
      benefits: ["Frais de dossier et de notaire préférentiels", "Accès anticipé 48h aux ventes privées de terrains", "Rapports d'avancement topographiques prioritaires"],
      active: currentTier === "Investisseur Élite"
    }
  ]

  return (
    <main className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 bg-white min-h-screen">
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
          Programme Privilèges
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Niveaux d&apos;Offre & Avantages
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Plus vous construisez votre patrimoine avec ImmOfika, plus vous accédez à des privilèges exclusifs.
        </p>
      </div>

      {/* Current status Banner */}
      <div className="border border-slate-100 rounded-3xl p-6 bg-emerald-50/50 flex flex-col sm:flex-row items-center gap-6">
        <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Votre statut actuel</p>
          <h2 className="text-xl font-black text-slate-900">{currentTier}</h2>
          <p className="text-sm text-slate-600 font-medium">{tierDescription}</p>
        </div>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {tiers.map((tier) => (
          <div 
            key={tier.name} 
            className={`border rounded-3xl p-6 space-y-4 relative flex flex-col justify-between transition-all ${
              tier.active 
                ? "border-emerald-500 bg-white ring-2 ring-emerald-500/20 shadow-md" 
                : "border-slate-100 bg-white shadow-xs"
            }`}
          >
            {tier.active && (
              <span className="absolute -top-3 left-6 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-xs">
                Niveau Actif
              </span>
            )}
            
            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-900 text-base">{tier.name}</h3>
              <p className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider">{tier.requirements}</p>
              
              <ul className="space-y-2.5 pt-4 text-xs text-slate-600 font-medium">
                {tier.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className={`h-4 w-4 shrink-0 mt-0.5 ${tier.active ? "text-emerald-500" : "text-slate-300"}`} />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
