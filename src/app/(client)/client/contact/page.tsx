import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { profiles, reservations, biens, systemSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Mail, Phone, MapPin, HelpCircle } from 'lucide-react'
import ContactFormClient from '@/components/client/ContactFormClient'

export const metadata = {
  title: 'Contacter mon Agent — ImmOfika',
  description: 'Prenez contact avec votre conseiller immobilier agréé.',
}

export default async function ContactAgentPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Chercher si le client a un agent attitré via ses réservations
  const userReservations = await db
    .select({
      agentName: profiles.fullName,
      agentEmail: profiles.email,
      agentPhone: profiles.phone,
      agentAvatar: profiles.avatarUrl,
      bienTitre: biens.titre,
    })
    .from(reservations)
    .innerJoin(biens, eq(reservations.bienId, biens.id))
    .leftJoin(profiles, eq(biens.agentId, profiles.id))
    .where(eq(reservations.clientId, user.id))
    .limit(1)

  const clientProfile = await db
    .select({ fullName: profiles.fullName })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1)

  const clientName = clientProfile[0]?.fullName || user.email?.split('@')[0]

  // Charger la configuration Promoteur du système pour le numéro et le message WhatsApp
  const promoterConfigDb = await db
    .select({ value: systemSettings.value })
    .from(systemSettings)
    .where(eq(systemSettings.key, 'promoter'))
    .limit(1)

  const promoterConfig = (promoterConfigDb[0]?.value as Record<string, any>) || {}
  const whatsappPhone = promoterConfig.whatsappPhone || '2250700000000'
  const whatsappTemplateRaw = promoterConfig.whatsappTemplate || 'Bonjour ImmOfika, je suis {name}. Je souhaite échanger concernant mes projets immobiliers.'
  
  // Remplacer les variables de template
  const whatsappMessage = whatsappTemplateRaw.replace('{name}', clientName)

  const hasAgent = userReservations.length > 0 && userReservations[0].agentName
  const agent = hasAgent ? userReservations[0] : null

  return (
    <main className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 bg-white min-h-screen">
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
          Support Client Privé
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Service Client & Support
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Besoin d&apos;assistance ou de conseils sur votre projet d&apos;acquisition avec ImmOfika ?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* Agent Info Card */}
        <div className="border border-slate-100 rounded-3xl p-6 bg-slate-50 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-lg mb-4">
              {hasAgent ? "Votre Conseiller Privé" : "ImmOfika International"}
            </h2>
            
            {hasAgent ? (
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  {agent?.agentName?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{agent?.agentName}</p>
                  <p className="text-xs text-slate-500 font-medium">Agent assigné à {agent?.bienTitre}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  IMO
                </div>
                <div>
                  <p className="font-bold text-slate-900">Équipe Commerciale</p>
                  <p className="text-xs text-emerald-600 font-bold">Promoteur Immobilier Agréé</p>
                </div>
              </div>
            )}

            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <Phone className="h-4.5 w-4.5 text-emerald-600" />
                <span className="font-bold text-slate-900">{hasAgent && agent?.agentPhone ? agent.agentPhone : "+225 27 24 00 00 00"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4.5 w-4.5 text-emerald-600" />
                <span className="truncate font-semibold text-slate-800">{hasAgent && agent?.agentEmail ? agent.agentEmail : "contact@immofika.ci"}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs font-medium text-slate-600">Abidjan, Côte d&apos;Ivoire</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-8 pt-6 border-t border-slate-200/60">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Notre équipe commerciale et administrative est disponible du lundi au vendredi de 8h00 à 18h00 pour répondre à toutes vos questions.
            </p>
            
            <a
              href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-emerald-500 bg-emerald-500/5 hover:bg-emerald-50 text-emerald-600 hover:text-white font-bold text-xs transition-all duration-300 shadow-sm cursor-pointer"
            >
              <svg className="h-4.5 w-4.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.453L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.023-5.115-2.887-6.98-1.865-1.865-4.343-2.888-6.983-2.89-5.439 0-9.865 4.422-9.87 9.865-.001 1.673.437 3.307 1.272 4.745l-.992 3.622 3.77-.989zM16.8 13.5c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.58.13-.17.26-.65.82-.8 1-.15.17-.3.19-.56.06-.26-.13-1.1-.4-2.1-1.3-.77-.69-1.3-1.54-1.45-1.8-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.3-.02-.43-.06-.13-.58-1.39-.8-1.92-.21-.52-.42-.45-.58-.45-.15 0-.33-.02-.51-.02s-.47.07-.72.33c-.25.26-.95.93-.95 2.28 0 1.35.98 2.65 1.11 2.83.14.18 1.93 2.94 4.67 4.12.65.28 1.16.45 1.56.57.66.21 1.26.18 1.73.11.53-.08 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.07-.1-.24-.18-.5-.3z"/>
              </svg>
              Contacter sur WhatsApp
            </a>
          </div>
        </div>

        {/* Message Form */}
        <div className="border border-slate-100 rounded-3xl p-6 bg-white shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-emerald-600" />
            Envoyer un message rapide
          </h3>

          <ContactFormClient />
        </div>
      </div>
    </main>
  )
}
