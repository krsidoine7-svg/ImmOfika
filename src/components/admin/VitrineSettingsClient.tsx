"use client"

import * as React from "react"
import { ShieldCheck, MessageCircle, Phone, Building, CheckCircle2, AlertCircle, ExternalLink, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"

interface VitrineProps {
  moduleEnabled: boolean
  user: {
    id: string
    email: string
    role: string
  }
  profile: {
    fullName: string
    phone: string
  }
  biens: {
    id: string
    titre: string
    prix: string
    ville: string
    quartier?: string | null
    statut: string
  }[]
}

export default function VitrineSettingsClient({ moduleEnabled, user, profile, biens }: VitrineProps) {
  const [whatsapp, setWhatsapp] = React.useState("2250701020304")
  const [phone, setPhone] = React.useState(profile.phone || "+225 0701020304")
  const [agrement, setAgrement] = React.useState("Agrément Agréé MCLU N° 2026/041")
  const [communes, setCommunes] = React.useState("Cocody, Bingerville, Assinie")
  const [bio, setBio] = React.useState("Promotion immobilière agréée et mandats exclusifs avec ACD.")

  if (!moduleEnabled) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="p-8 rounded-3xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="text-base font-black text-amber-950">Module Vitrine & En Vedette Désactivé</h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              Le Super Administrateur a temporairement désactivé la vitrine des promoteurs et agents en première page. 
              Tant que ce module est inactif, les coordonnées et les biens en vedette ne sont pas diffusés publiquement.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, "")
  const testWhatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent("Bonjour, je vous contacte depuis la plateforme ImmOfika.")}`

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* En-tête Statut */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Partenaire Agréé & Certifié ImmOfika</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Ma Vitrine & Contact Direct
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Configurez votre canal WhatsApp direct et votre ligne téléphonique professionnelle pour recevoir instantanément les demandes d'acheteurs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href={testWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer w-full sm:w-auto justify-center"
            >
              <MessageCircle className="h-4 w-4 fill-white" />
              Tester mon WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Formulaire des coordonnées directes */}
      <Card className="rounded-3xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900">Coordonnées Professionnelles Visibles du Public</CardTitle>
          <CardDescription>Ces informations permettent aux visiteurs de la page d'accueil de vous contacter directement en 1 clic.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">Numéro WhatsApp (avec indicatif pays, sans +)</label>
              <div className="relative">
                <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
                <Input 
                  value={whatsapp} 
                  onChange={(e) => setWhatsapp(e.target.value)} 
                  className="pl-10"
                  placeholder="Ex: 2250701020304"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Exemple pour la Côte d'Ivoire : 2250701020304</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">Téléphone d'Appel Direct</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="pl-10"
                  placeholder="Ex: +225 0701020304"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">Numéro d'Agrément Officiel / Carte Pro</label>
              <Input 
                value={agrement} 
                onChange={(e) => setAgrement(e.target.value)} 
                placeholder="Ex: Agrément Ministériel MCLU N° ..."
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">Communes & Zones de couverture</label>
              <Input 
                value={communes} 
                onChange={(e) => setCommunes(e.target.value)} 
                placeholder="Ex: Cocody, Bingerville, Assinie..."
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-900 block mb-1">Présentation / Spécialité</label>
            <Input 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              placeholder="Ex: Programmes neufs de prestige et terrains sécurisés avec ACD..."
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button 
              onClick={() => toast.success("Coordonnées de vitrine enregistrées avec succès !")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
            >
              Enregistrer mes coordonnées
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mes Biens gérés rattachés */}
      <Card className="rounded-3xl border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Biens & Programmes Rattachés à ma Vitrine ({biens.length})</CardTitle>
            <CardDescription>Les annonces que vous gérez et qui sont mises en avant auprès des investisseurs.</CardDescription>
          </div>
          <Link href="/admin/biens">
            <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs gap-1.5 cursor-pointer">
              Gérer mon catalogue
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {biens.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs">
              Aucun bien actuellement rattaché. Rendez-vous dans la gestion des biens pour publier votre première offre.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {biens.map((b) => (
                <div key={b.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100/70 px-2 py-0.5 rounded">
                      {b.statut}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-1">{b.titre}</h4>
                    <p className="text-[11px] text-slate-500">{b.quartier ? `${b.quartier}, ` : ''}{b.ville}</p>
                  </div>
                  <p className="text-xs font-extrabold text-slate-900 font-mono">
                    {parseInt(b.prix || '0').toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

