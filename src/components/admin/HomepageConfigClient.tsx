'use client'

import * as React from "react"
import { 
  Save, 
  Trash, 
  Plus, 
  Image as ImageIcon, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  HelpCircle,
  Users,
  MessageSquare,
  Shield,
  FileText,
  Video
} from "lucide-react"
import { toast } from "sonner"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateHomepageSectionAction, uploadHomepageImageAction } from "@/app/actions/homepage"
import { CustomSelect } from "@/components/ui/custom-select"

const HERO_THEME_OPTIONS = [
  { value: "white", label: "Blanc Pur (Lumineux)" },
  { value: "night", label: "Bleu Nuit (Sombre & Prestigieux)" },
  { value: "gray", label: "Gris Sobriété" }
]

const STANDARD_THEME_OPTIONS = [
  { value: "white", label: "Blanc Pur" },
  { value: "gray", label: "Gris Sobriété" },
  { value: "night", label: "Bleu Nuit (Sombre)" }
]

const EXPERTISE_THEME_OPTIONS = [
  { value: "light", label: "Clair (Gris soyeux)" },
  { value: "white", label: "Blanc Pur" },
  { value: "night", label: "Bleu Nuit (Sombre)" }
]

const TESTIMONIALS_THEME_OPTIONS = [
  { value: "night", label: "Bleu Nuit (Sombre & Prestigieux)" },
  { value: "white", label: "Blanc Pur" },
  { value: "gray", label: "Gris Sobriété" }
]

const RATING_OPTIONS = [
  { value: "5", label: "5 Étoiles" },
  { value: "4", label: "4 Étoiles" },
  { value: "3", label: "3 Étoiles" },
  { value: "2", label: "2 Étoiles" },
  { value: "1", label: "1 Étoile" }
]

const SERVICE_ICON_OPTIONS = [
  { value: "Grid", label: "Grille (Lotissement)" },
  { value: "Layers", label: "Couches (Foncier)" },
  { value: "Compass", label: "Boussole (Topographie)" },
  { value: "Building2", label: "Immeuble (Gestion)" },
  { value: "Scale", label: "Balance (Transactions)" },
  { value: "Users", label: "Personnes (Intermédiation)" },
  { value: "Globe", label: "Globe (Commerce)" },
  { value: "Hammer", label: "Marteau (Construction)" },
  { value: "Package", label: "Paquet (Matériaux)" },
  { value: "Map", label: "Carte (Terrains)" },
  { value: "Sprout", label: "Pousse (Agriculture)" }
]

interface ConfigClientProps {
  initialConfigs: Record<string, any>
}

// Fallback default configurations
const DEFAULTS: Record<string, any> = {
  footer: {
    enabled: true,
    theme: "white",
    newsletter_title: "Restez informé des opportunités",
    newsletter_description: "Recevez nos dernières exclusivités immobilières et nos analyses de marché directement dans votre boîte mail. Pas de spam.",
    tagline: "« Anyilo : Ton chez-toi garanti, zéro palabre ! 🇨🇮 »",
    description: "Notre expertise et notre rigueur commerciale à votre service.",
    whatsapp_number: "+225 01 03 13 28 78",
    whatsapp_link: "https://wa.me/2250103132878",
    facebook_link: "https://www.facebook.com/share/1MUiXffGM7/",
    address: "Yahou, immeuble en face de la maison blanche, au 2ieme etage",
    address_link: "https://maps.google.com/?q=Yahou+immeuble+en+face+de+la+maison+blanche",
    phone_fixe: "+225 27 24 37 01 55 (Fixe)",
    phone_mobile: "+225 07 47 63 17 06 (Mobile)",
    email: "Anyilo@gmail.com"
  },
  featured_partners: {
    enabled: true,
    theme: "white",
    tag: "Partenaires Officiels & Agréés",
    title: "Nos Promoteurs & Agences d'Élite en Vedette",
    italic_word: "en Vedette",
    description: "Découvrez nos promoteurs certifiés et agences partenaires Anyilo. Échangez directement par WhatsApp ou appel avec leurs conseillers dédiés.",
    partners: []
  },
  heroVideo: {
    enabled: true,
    theme: "dark",
    tagline: "« Anyilo : Ton chez-toi garanti, zéro palabre ! 🇨🇮 »",
    title: "Découvrez notre vision de l'immobilier en vidéo",
    description: "En tant que Promoteur Immobilier Agréé, Anyilo s'engage à vous offrir des projets d'aménagement foncier et de construction d'exception. Regardez notre vidéo explicative pour comprendre notre rigueur et notre accompagnement.",
    video_url: "/video-heros.mp4",
    thumbnail_image: "/heros-img.png",
    points: [
      { title: "Aménagement Foncier Agréé", desc: "Des lotissements approuvés officiellement par l'État pour une sécurité juridique totale.", icon: "Shield" },
      { title: "Études Topographiques", desc: "Des travaux géométriques de haute précision réalisés par nos géomètres-experts.", icon: "Compass" },
      { title: "Construction de Prestige", desc: "Des villas d'exception bâties selon les normes de qualité et d'ingénierie les plus strictes.", icon: "Hammer" }
    ]
  },
  tracking: {
    facebook_pixel_id: "",
    google_analytics_id: ""
  }
}

export default function HomepageConfigClient({ initialConfigs }: ConfigClientProps) {
  // Initialize config state merging DB values and fallbacks
  const [configs, setConfigs] = React.useState<Record<string, any>>(() => {
    const state: Record<string, any> = {}
    for (const section of Object.keys(DEFAULTS)) {
      state[section] = {
        ...DEFAULTS[section],
        ...(initialConfigs[section] || {})
      }
    }
    return state
  })

  const [savingSection, setSavingSection] = React.useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = React.useState<string | null>(null)

  // Generic text / number change handler
  const handleFieldChange = (section: string, field: string, value: any) => {
    setConfigs(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  // Handle file uploads to R2
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, section: string, field: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(`${section}-${field}`)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await uploadHomepageImageAction(formData)
      if (res.success && res.url) {
        handleFieldChange(section, field, res.url)
        const isVideo = file.type.startsWith("video/") || file.name.endsWith(".mp4")
        if (isVideo) {
          toast.success("Vidéo téléchargée avec succès et enregistrée sur R2.")
        } else {
          toast.success("Image téléchargée avec succès et enregistrée sur R2.")
        }
      } else {
        toast.error(res.error || "Une erreur est survenue lors du téléchargement.")
      }
    } catch {
      toast.error("Impossible de se connecter au serveur de stockage.")
    } finally {
      setUploadingImage(null)
    }
  }

  // Save changes to Supabase and purge Vercel/Next cache
  const handleSaveSection = async (section: string) => {
    setSavingSection(section)
    const content = configs[section]

    try {
      const res = await updateHomepageSectionAction(section, content)
      if (res.success) {
        toast.success(res.message || "Section mise à jour avec succès.")
      } else {
        toast.error(res.error || "Impossible d'enregistrer les modifications.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Une erreur est survenue lors de la sauvegarde.")
    } finally {
      setSavingSection(null)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <Tabs defaultValue="footer" orientation="vertical" className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Sidebar Tabs */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">Sections</h3>
            <TabsList variant="line" className="flex flex-col h-auto w-full bg-transparent gap-1 items-stretch">
              <TabsTrigger value="footer" className="justify-start py-2.5 px-4 rounded-xl text-left font-semibold hover:bg-slate-50 data-[active]:bg-emerald-50 data-[active]:text-emerald-700 data-[active]:font-extrabold border-0 transition-all">
                Pied de page & Contacts
              </TabsTrigger>
              <TabsTrigger value="tracking" className="justify-start py-2.5 px-4 rounded-xl text-left font-semibold hover:bg-slate-50 data-[active]:bg-emerald-50 data-[active]:text-emerald-700 data-[active]:font-extrabold border-0 transition-all">
                Pixels & Suivi (Analytique)
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Form Content Cards */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* HERO TAB */}

            {/* EXPLAINER VIDEO TAB */}

            {/* ABOUT TAB */}

            {/* EXPERTISE TAB */}

            {/* TESTIMONIALS TAB */}

            {/* FAQ TAB */}

            {/* CTA TAB */}

            {/* FOOTER TAB */}
            <TabsContent value="footer">
              <Card className="rounded-3xl shadow-sm border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-gray-100">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Pied de page (Footer) & Contacts</CardTitle>
                    <CardDescription>Configurez la newsletter, les numéros mobiles, WhatsApp, fixe, email et adresses de l'entreprise.</CardDescription>
                  </div>
                  <Button 
                    onClick={() => handleSaveSection("footer")} 
                    disabled={savingSection === "footer"}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {savingSection === "footer" ? "Sauvegarde..." : "Enregistrer"}
                  </Button>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Newsletter Settings */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Formulaire de Newsletter</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Titre d'appel</label>
                        <Input value={configs.footer.newsletter_title} onChange={(e) => handleFieldChange("footer", "newsletter_title", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 block mb-1">Texte de description</label>
                      <Input value={configs.footer.newsletter_description} onChange={(e) => handleFieldChange("footer", "newsletter_description", e.target.value)} />
                    </div>
                  </div>

                  {/* Brand Block */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Identité du promoteur (Bas Gauche)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Slogan ou Devise (Citation)</label>
                        <Input value={configs.footer.tagline} onChange={(e) => handleFieldChange("footer", "tagline", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Description courte sous le slogan</label>
                        <Input value={configs.footer.description} onChange={(e) => handleFieldChange("footer", "description", e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Lien Facebook du promoteur</label>
                        <Input value={configs.footer.facebook_link} onChange={(e) => handleFieldChange("footer", "facebook_link", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* Coordonnées & Contacts */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Coordonnées du Promoteur</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Adresse physique (Libellé)</label>
                        <Input value={configs.footer.address} onChange={(e) => handleFieldChange("footer", "address", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Lien Google Maps</label>
                        <Input value={configs.footer.address_link} onChange={(e) => handleFieldChange("footer", "address_link", e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Téléphone WhatsApp (Affichage)</label>
                        <Input value={configs.footer.whatsapp_number} onChange={(e) => handleFieldChange("footer", "whatsapp_number", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Lien Direct WhatsApp (wa.me/...)</label>
                        <Input value={configs.footer.whatsapp_link} onChange={(e) => handleFieldChange("footer", "whatsapp_link", e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Téléphone Fixe</label>
                        <Input value={configs.footer.phone_fixe} onChange={(e) => handleFieldChange("footer", "phone_fixe", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Téléphone Mobile</label>
                        <Input value={configs.footer.phone_mobile} onChange={(e) => handleFieldChange("footer", "phone_mobile", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Email du promoteur</label>
                        <Input value={configs.footer.email} onChange={(e) => handleFieldChange("footer", "email", e.target.value)} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tracking">
              <Card className="rounded-3xl shadow-sm border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-gray-100">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Pixels & Codes de Suivi</CardTitle>
                    <CardDescription>Configurez vos codes de suivi (Facebook Pixel, Google Analytics). Ces scripts seront injectés sur les pages publiques uniquement si le visiteur accepte les cookies.</CardDescription>
                  </div>
                  <Button 
                    onClick={() => handleSaveSection("tracking")} 
                    disabled={savingSection === "tracking"}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {savingSection === "tracking" ? "Sauvegarde..." : "Enregistrer"}
                  </Button>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-900 block mb-1">ID du Pixel Facebook (Meta Pixel)</label>
                      <Input 
                        type="text"
                        placeholder="Ex: 123456789012345"
                        value={configs.tracking?.facebook_pixel_id || ""}
                        onChange={(e) => handleFieldChange("tracking", "facebook_pixel_id", e.target.value)}
                        className="rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Exemple : 27384910283749. Saisissez uniquement l'identifiant numérique.</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-900 block mb-1">ID de Mesure Google Analytics (GA4)</label>
                      <Input 
                        type="text"
                        placeholder="Ex: G-XXXXXXXXXX"
                        value={configs.tracking?.google_analytics_id || ""}
                        onChange={(e) => handleFieldChange("tracking", "google_analytics_id", e.target.value)}
                        className="rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Exemple : G-K2L98XW1Z3. Saisissez le code commençant par G-.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </div>

        </div>
      </Tabs>
    </div>
  )
}
