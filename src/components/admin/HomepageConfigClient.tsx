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
  hero: {
    enabled: true,
    theme: "white",
    title_p1: "Trouvez le",
    title_gold: "bien de vos rêves",
    title_p2: "en toute",
    title_badge: "sérénité.",
    subtitle: "« FAVOR Company Int. : les bienfaits d'un service authentique »",
    description: "Lotissement, aménagement foncier, études topographiques et construction d'exception. L'expertise et l'intégrité au service de vos ambitions.",
    cta1_label: "Découvrir les biens",
    cta1_link: "/biens",
    cta2_label: "En savoir plus",
    main_image: "/heros-img.png",
    badge1_title: "Disponibilité",
    badge1_value: "24h / 7j",
    badge2_title: "Accompagnement",
    badge2_value: "Prestige",
    background_image: "/heros-img.png",
  },
  about: {
    enabled: true,
    theme: "gray",
    tag: "À propos de nous",
    title: "Plus qu'un promoteur immobilier agréé, un partenaire de vie.",
    italic_word: "partenaire",
    description: "Depuis plus de 15 ans, Favor Company s'est imposée comme une référence de l'immobilier premium. Notre secret ? Une écoute attentive et une compréhension profonde des besoins de nos clients.",
    experience_years: "15+",
    experience_label: "Années d'Excellence à Favor",
    grid_image_1: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400",
    grid_image_2: "https://images.unsplash.com/photo-1582408921715-18e7806365c1?auto=format&fit=crop&q=80&w=400",
    grid_image_3: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400",
    background_image: "/heros-img.png",
    features: [
      { title: "Sécurité Garantie", description: "Toutes nos transactions sont sécurisées et encadrées juridiquement.", icon: "Shield" },
      { title: "Vision Stratégique", description: "Nous vous aidons à identifier les meilleures opportunités du marché.", icon: "Target" },
      { title: "Valorisation de Patrimoine", description: "Des conseils experts pour faire fructifier vos investissements.", icon: "TrendingUp" },
      { title: "Accompagnement Premium", description: "Un interlocuteur unique pour une expérience sans stress.", icon: "CheckCircle2" }
    ]
  },
  expertise: {
    enabled: true,
    theme: "light",
    tag: "Nos Domaines d'Expertise",
    title: "Une offre pluridimensionnelle pour un service authentique.",
    italic_word: "service authentique",
    description: "FAVOR Company International combine rigueur technique, intégrité commerciale et vision d'avenir pour propulser chacun de vos projets d'aménagement et de commerce.",
    services: [
      { title: "Le Lotissement", desc: "Création et planification d'espaces de vie harmonieux à travers des plans de lotissement stratégiques et réglementés.", icon: "Grid" },
      { title: "Aménagement Foncier", desc: "Valorisation, viabilisation et aménagement technique de vos parcelles pour optimiser leur valeur et leur usage.", icon: "Layers" },
      { title: "Topographie", desc: "Études rigoureuses et travaux de topographie de haute précision, relevés géométriques et délimitations certifiées.", icon: "Compass" },
      { title: "Gestion Immobilière", desc: "Administration technique, juridique et financière transparente de vos biens résidentiels et commerciaux.", icon: "Building2" }
    ]
  },
  
  testimonials: {
    enabled: true,
    theme: "night",
    tag: "Témoignages",
    title: "Ce que nos clients disent de nous.",
    italic_word: "clients",
    testimonials: [
      { name: "Alexandre Dubois", role: "Propriétaire", text: "Favor Company a vendu mon appartement en moins de deux semaines au prix estimé. Un professionnalisme rare et un accompagnement de tous les instants.", avatar: "https://i.pravatar.cc/150?u=alex", rating: 5 },
      { name: "Sophie Martin", role: "Acheteuse", text: "Grâce à l'équipe Favor, nous avons trouvé la maison de nos rêves. Elle a tout de suite compris nos besoins et ne nous a proposé que biens pertinents.", avatar: "https://i.pravatar.cc/150?u=sophie", rating: 5 }
    ]
  },
  faq: {
    enabled: true,
    theme: "white",
    tag: "Questions Fréquentes",
    title: "Tout ce que vous devez savoir sur vos projets.",
    italic_word: "vos projets",
    description: "Vous avez des questions sur l'achat, la vente ou la location ? Nous avons rassemblé ici les réponses aux questions les plus courantes. Si vous ne trouvez pas votre bonheur, contactez-nous !",
    cta_card_title: "Encore une question ?",
    cta_card_subtitle: "Notre équipe est disponible pour vous répondre personnellement.",
    cta_card_button: "Contactez un expert →",
    faqs: [
      { question: "Quels sont les frais de promotion chez Favor Company ?", answer: "En tant que promoteur immobilier agréé, nos frais de promotion et d'accompagnement sont transparents et compétitifs. Ils sont intégrés à la valeur des lots et incluent l'aménagement foncier, la viabilisation et la sécurisation juridique complète de vos parcelles." }
    ]
  },
  cta: {
    enabled: true,
    theme: "white",
    tag: "Contactez-nous",
    title: "Prêt à concrétiser votre projet immobilier ?",
    italic_word: "immobilier",
    description: "Ne laissez pas votre projet au hasard. Bénéficiez d'une expertise reconnue et d'un accompagnement sur mesure.",
    button_label: "Voir nos biens pour réserver une visite",
    button_link: "/biens"
  },
  footer: {
    enabled: true,
    theme: "white",
    newsletter_title: "Restez informé des opportunités",
    newsletter_description: "Recevez nos dernières exclusivités immobilières et nos analyses de marché directement dans votre boîte mail. Pas de spam.",
    newsletter_badge: "Rejoignez plus de 2 000+ clients prestige",
    tagline: "« FAVOR Company Int. : les bienfaits d'un service authentique »",
    description: "Notre expertise et notre rigueur commerciale à votre service.",
    whatsapp_number: "+225 01 03 13 28 78",
    whatsapp_link: "https://wa.me/2250103132878",
    facebook_link: "https://www.facebook.com/share/1MUiXffGM7/",
    address: "Yahou, immeuble en face de la maison blanche, au 2ieme etage",
    address_link: "https://maps.google.com/?q=Yahou+immeuble+en+face+de+la+maison+blanche",
    phone_fixe: "+225 27 24 37 01 55 (Fixe)",
    phone_mobile: "+225 07 47 63 17 06 (Mobile)",
    email: "Favorcompanyint@gmail.com"
  },
  explainer_video: {
    enabled: true,
    theme: "white",
    tag: "Présentation Vidéo",
    title: "Découvrez notre expertise en action.",
    italic_word: "expertise",
    description: "En tant que Promoteur Immobilier Agréé, Favor Company International s'engage à vous offrir des projets d'aménagement foncier et de construction d'exception. Regardez notre vidéo explicative pour comprendre notre rigueur et notre accompagnement.",
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
      <Tabs defaultValue="hero" orientation="vertical" className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Sidebar Tabs */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">Sections</h3>
            <TabsList variant="line" className="flex flex-col h-auto w-full bg-transparent gap-1 items-stretch">
              <TabsTrigger value="hero" className="justify-start py-2.5 px-4 rounded-xl text-left font-semibold hover:bg-slate-50 data-[active]:bg-emerald-50 data-[active]:text-emerald-700 data-[active]:font-extrabold border-0 transition-all">
                Hero (En-tête)
              </TabsTrigger>
              <TabsTrigger value="explainer_video" className="justify-start py-2.5 px-4 rounded-xl text-left font-semibold hover:bg-slate-50 data-[active]:bg-emerald-50 data-[active]:text-emerald-700 data-[active]:font-extrabold border-0 transition-all">
                Vidéo Explicative
              </TabsTrigger>
              <TabsTrigger value="about" className="justify-start py-2.5 px-4 rounded-xl text-left font-semibold hover:bg-slate-50 data-[active]:bg-emerald-50 data-[active]:text-emerald-700 data-[active]:font-extrabold border-0 transition-all">
                À propos de nous
              </TabsTrigger>
              <TabsTrigger value="expertise" className="justify-start py-2.5 px-4 rounded-xl text-left font-semibold hover:bg-slate-50 data-[active]:bg-emerald-50 data-[active]:text-emerald-700 data-[active]:font-extrabold border-0 transition-all">
                Nos Expertises
              </TabsTrigger>
              <TabsTrigger value="testimonials" className="justify-start py-2.5 px-4 rounded-xl text-left font-semibold hover:bg-slate-50 data-[active]:bg-emerald-50 data-[active]:text-emerald-700 data-[active]:font-extrabold border-0 transition-all">
                Témoignages
              </TabsTrigger>
              <TabsTrigger value="faq" className="justify-start py-2.5 px-4 rounded-xl text-left font-semibold hover:bg-slate-50 data-[active]:bg-emerald-50 data-[active]:text-emerald-700 data-[active]:font-extrabold border-0 transition-all">
                FAQ (Accordéon)
              </TabsTrigger>
              <TabsTrigger value="cta" className="justify-start py-2.5 px-4 rounded-xl text-left font-semibold hover:bg-slate-50 data-[active]:bg-emerald-50 data-[active]:text-emerald-700 data-[active]:font-extrabold border-0 transition-all">
                Section Appel à l'action
              </TabsTrigger>
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
            <TabsContent value="hero">
              <Card className="rounded-3xl shadow-sm border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-gray-100">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Section En-tête (Hero)</CardTitle>
                    <CardDescription>Configurez l'accroche, la description, la vidéo et les visuels principaux.</CardDescription>
                  </div>
                  <Button 
                    onClick={() => handleSaveSection("hero")} 
                    disabled={savingSection === "hero"}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {savingSection === "hero" ? "Sauvegarde..." : "Enregistrer"}
                  </Button>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Top bar controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Visibilité de la section</p>
                        <p className="text-xs text-gray-500">Afficher ou masquer sur la page d'accueil</p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={configs.hero.enabled}
                        onChange={(e) => handleFieldChange("hero", "enabled", e.target.checked)}
                        className="h-6 w-11 rounded-full bg-slate-200 border-0 outline-none cursor-pointer checked:bg-emerald-600 appearance-none relative before:content-[''] before:absolute before:h-5 before:w-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:left-5.5 before:transition-all duration-300 shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-900 block mb-1">Ambiance visuelle (Thématique)</label>
                      <CustomSelect 
                        value={configs.hero.theme}
                        onChange={(val) => handleFieldChange("hero", "theme", val)}
                        options={HERO_THEME_OPTIONS}
                      />
                    </div>
                  </div>

                  {/* General Fields */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Textes & Accroche</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Titre - Partie 1</label>
                        <Input value={configs.hero.title_p1} onChange={(e) => handleFieldChange("hero", "title_p1", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-emerald-700 block mb-1">Titre Mis en Valeur (Milieu)</label>
                        <Input value={configs.hero.title_gold} onChange={(e) => handleFieldChange("hero", "title_gold", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Titre - Partie 2</label>
                        <Input value={configs.hero.title_p2} onChange={(e) => handleFieldChange("hero", "title_p2", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Mot clé dans le Badge</label>
                        <Input value={configs.hero.title_badge} onChange={(e) => handleFieldChange("hero", "title_badge", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 block mb-1">Sous-titre (Citation)</label>
                      <Input value={configs.hero.subtitle} onChange={(e) => handleFieldChange("hero", "subtitle", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 block mb-1">Texte de description</label>
                      <Textarea value={configs.hero.description} onChange={(e) => handleFieldChange("hero", "description", e.target.value)} rows={3} />
                    </div>
                  </div>

                  {/* Media Upload */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Image d'Arrière-plan du Héros (Derrière le texte)</h4>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {configs.hero.background_image && (
                        <div className="flex flex-col gap-2 shrink-0">
                          <img src={configs.hero.background_image} className="h-32 w-48 object-cover rounded-2xl border border-slate-100 shadow-sm" alt="Arrière-plan" />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 text-xs font-semibold gap-1 px-3 w-full"
                            onClick={() => handleFieldChange("hero", "background_image", "")}
                          >
                            <Trash className="h-3.5 w-3.5" />
                            Supprimer
                          </Button>
                        </div>
                      )}
                      <div className="flex-1 w-full">
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-2xl p-6 cursor-pointer hover:bg-slate-50 transition-colors">
                          <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-xs font-bold text-gray-600">
                            {uploadingImage === "hero-background_image" ? "Téléchargement..." : "Uploader une nouvelle photo d'arrière-plan"}
                          </span>
                          <span className="text-[10px] text-gray-400 mt-1">PNG, JPG ou WEBP jusqu'à 5 Mo</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "hero", "background_image")}
                            className="hidden" 
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Image de Villa de Droite</h4>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {configs.hero.main_image && (
                        <div className="flex flex-col gap-2 shrink-0">
                          <img src={configs.hero.main_image} className="h-32 w-48 object-cover rounded-2xl border border-slate-100 shadow-sm" alt="Villa" />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 text-xs font-semibold gap-1 px-3 w-full"
                            onClick={() => handleFieldChange("hero", "main_image", "")}
                          >
                            <Trash className="h-3.5 w-3.5" />
                            Supprimer
                          </Button>
                        </div>
                      )}
                      <div className="flex-1 w-full">
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-2xl p-6 cursor-pointer hover:bg-slate-50 transition-colors">
                          <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-xs font-bold text-gray-600">
                            {uploadingImage === "hero-main_image" ? "Téléchargement..." : "Uploader une nouvelle photo de prestige"}
                          </span>
                          <span className="text-[10px] text-gray-400 mt-1">PNG, JPG ou WEBP jusqu'à 5 Mo</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "hero", "main_image")}
                            className="hidden" 
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  </CardContent>
              </Card>
            </TabsContent>

            {/* EXPLAINER VIDEO TAB */}
            <TabsContent value="explainer_video">
              <Card className="rounded-3xl shadow-sm border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-gray-100">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Vidéo Explicative</CardTitle>
                    <CardDescription>Configurez le titre, les points clés, la miniature et la vidéo explicative.</CardDescription>
                  </div>
                  <Button 
                    onClick={() => handleSaveSection("explainer_video")} 
                    disabled={savingSection === "explainer_video"}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {savingSection === "explainer_video" ? "Sauvegarde..." : "Enregistrer"}
                  </Button>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Top bar controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Visibilité de la section</p>
                        <p className="text-xs text-gray-500">Afficher ou masquer sur la page d'accueil</p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={configs.explainer_video?.enabled}
                        onChange={(e) => handleFieldChange("explainer_video", "enabled", e.target.checked)}
                        className="h-6 w-11 rounded-full bg-slate-200 border-0 outline-none cursor-pointer checked:bg-emerald-600 appearance-none relative before:content-[''] before:absolute before:h-5 before:w-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:left-5.5 before:transition-all duration-300 shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-900 block mb-1">Ambiance visuelle (Thématique)</label>
                      <CustomSelect 
                        value={configs.explainer_video?.theme}
                        onChange={(val) => handleFieldChange("explainer_video", "theme", val)}
                        options={STANDARD_THEME_OPTIONS}
                      />
                    </div>
                  </div>

                  {/* General Texts */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Textes & Accroche</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Tag de section</label>
                        <Input value={configs.explainer_video?.tag} onChange={(e) => handleFieldChange("explainer_video", "tag", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Mot clé en italique (Or)</label>
                        <Input value={configs.explainer_video?.italic_word} onChange={(e) => handleFieldChange("explainer_video", "italic_word", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 block mb-1">Grand Titre</label>
                      <Input value={configs.explainer_video?.title} onChange={(e) => handleFieldChange("explainer_video", "title", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 block mb-1">Description</label>
                      <Textarea value={configs.explainer_video?.description} onChange={(e) => handleFieldChange("explainer_video", "description", e.target.value)} rows={3} />
                    </div>
                  </div>

                  {/* Media Uploads */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Médias (R2)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Video URL */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 block">Fichier Vidéo (MP4, YouTube ou Vimeo)</label>
                        <div className="flex gap-2">
                          <Input 
                            value={configs.explainer_video?.video_url} 
                            onChange={(e) => handleFieldChange("explainer_video", "video_url", e.target.value)} 
                            placeholder="URL R2, YouTube ou Vimeo"
                          />
                          <div className="relative">
                            <input 
                              type="file" 
                              id="explainer-video-file" 
                              accept="video/*" 
                              onChange={(e) => handleImageUpload(e, "explainer_video", "video_url")}
                              className="hidden" 
                            />
                            <Button 
                              type="button" 
                              variant="outline"
                              disabled={uploadingImage === "explainer_video-video_url"}
                              onClick={() => document.getElementById("explainer-video-file")?.click()}
                            >
                              {uploadingImage === "explainer_video-video_url" ? "Upload..." : "R2"}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Thumbnail URL */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 block">Image de Miniature (Couverture)</label>
                        <div className="flex gap-2">
                          <Input 
                            value={configs.explainer_video?.thumbnail_image} 
                            onChange={(e) => handleFieldChange("explainer_video", "thumbnail_image", e.target.value)} 
                          />
                          <div className="relative">
                            <input 
                              type="file" 
                              id="explainer-thumbnail-file" 
                              accept="image/*" 
                              onChange={(e) => handleImageUpload(e, "explainer_video", "thumbnail_image")}
                              className="hidden" 
                            />
                            <Button 
                              type="button" 
                              variant="outline"
                              disabled={uploadingImage === "explainer_video-thumbnail_image"}
                              onClick={() => document.getElementById("explainer-thumbnail-file")?.click()}
                            >
                              {uploadingImage === "explainer_video-thumbnail_image" ? "Upload..." : "R2"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3 Points forts */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">3 Points Clés (Réassurance)</h4>
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} className="p-4 rounded-2xl border border-slate-100 space-y-4 bg-slate-50/50">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="sm:col-span-2">
                            <label className="text-xs font-bold text-gray-600 block mb-1">Titre du point {idx + 1}</label>
                            <Input 
                              value={configs.explainer_video?.points?.[idx]?.title || ""} 
                              onChange={(e) => {
                                const newPoints = [...(configs.explainer_video?.points || [])]
                                if (!newPoints[idx]) newPoints[idx] = { title: "", desc: "", icon: "Shield" }
                                newPoints[idx].title = e.target.value
                                handleFieldChange("explainer_video", "points", newPoints)
                              }} 
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-600 block mb-1">Icône du point {idx + 1}</label>
                            <CustomSelect 
                              value={configs.explainer_video?.points?.[idx]?.icon || "Shield"} 
                              onChange={(val) => {
                                const newPoints = [...(configs.explainer_video?.points || [])]
                                if (!newPoints[idx]) newPoints[idx] = { title: "", desc: "", icon: "Shield" }
                                newPoints[idx].icon = val
                                handleFieldChange("explainer_video", "points", newPoints)
                              }}
                              options={[
                                { value: "Shield", label: "Bouclier (Sécurité)" },
                                { value: "Compass", label: "Boussole (Topo)" },
                                { value: "Hammer", label: "Marteau (Bâtiment)" },
                                { value: "Award", label: "Badge (Prestige)" },
                                { value: "Target", label: "Cible (Vision)" },
                                { value: "CheckCircle2", label: "Validation (Certifié)" }
                              ]}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 block mb-1">Description du point {idx + 1}</label>
                          <Input 
                            value={configs.explainer_video?.points?.[idx]?.desc || ""} 
                            onChange={(e) => {
                              const newPoints = [...(configs.explainer_video?.points || [])]
                              if (!newPoints[idx]) newPoints[idx] = { title: "", desc: "", icon: "Shield" }
                              newPoints[idx].desc = e.target.value
                              handleFieldChange("explainer_video", "points", newPoints)
                            }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABOUT TAB */}
            <TabsContent value="about">
              <Card className="rounded-3xl shadow-sm border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-gray-100">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Section À propos de nous</CardTitle>
                    <CardDescription>Configurez la présentation, la grille de photos et les chiffres clés.</CardDescription>
                  </div>
                  <Button 
                    onClick={() => handleSaveSection("about")} 
                    disabled={savingSection === "about"}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {savingSection === "about" ? "Sauvegarde..." : "Enregistrer"}
                  </Button>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Top bar controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Visibilité de la section</p>
                        <p className="text-xs text-gray-500">Afficher ou masquer sur la page d'accueil</p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={configs.about.enabled}
                        onChange={(e) => handleFieldChange("about", "enabled", e.target.checked)}
                        className="h-6 w-11 rounded-full bg-slate-200 border-0 outline-none cursor-pointer checked:bg-emerald-600 appearance-none relative before:content-[''] before:absolute before:h-5 before:w-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:left-5.5 before:transition-all duration-300 shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-900 block mb-1">Ambiance visuelle</label>
                      <CustomSelect 
                        value={configs.about.theme}
                        onChange={(val) => handleFieldChange("about", "theme", val)}
                        options={STANDARD_THEME_OPTIONS}
                      />
                    </div>
                  </div>

                  {/* General Fields */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Textes Généraux</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Tag (Surligné)</label>
                        <Input value={configs.about.tag} onChange={(e) => handleFieldChange("about", "tag", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Mot en Italique doré</label>
                        <Input value={configs.about.italic_word} onChange={(e) => handleFieldChange("about", "italic_word", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 block mb-1">Titre principal</label>
                      <Input value={configs.about.title} onChange={(e) => handleFieldChange("about", "title", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 block mb-1">Texte de description</label>
                      <Textarea value={configs.about.description} onChange={(e) => handleFieldChange("about", "description", e.target.value)} rows={3} />
                    </div>
                  </div>

                  {/* Badge Chiffres */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Badge Années d'excellence</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Nombre d'années (ex: 15+)</label>
                        <Input value={configs.about.experience_years} onChange={(e) => handleFieldChange("about", "experience_years", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Libellé du badge</label>
                        <Input value={configs.about.experience_label} onChange={(e) => handleFieldChange("about", "experience_label", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* Background Image Upload */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Image d'Arrière-plan de la Section (Sous le texte)</h4>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {configs.about.background_image && (
                        <div className="flex flex-col gap-2 shrink-0">
                          <img src={configs.about.background_image} className="h-32 w-48 object-cover rounded-2xl border border-slate-100 shadow-sm" alt="Arrière-plan" />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 text-xs font-semibold gap-1 px-3 w-full"
                            onClick={() => handleFieldChange("about", "background_image", "")}
                          >
                            <Trash className="h-3.5 w-3.5" />
                            Supprimer
                          </Button>
                        </div>
                      )}
                      <div className="flex-1 w-full">
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-2xl p-6 cursor-pointer hover:bg-slate-50 transition-colors">
                          <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-xs font-bold text-gray-600">
                            {uploadingImage === "about-background_image" ? "Téléchargement..." : "Uploader une nouvelle photo d'arrière-plan"}
                          </span>
                          <span className="text-[10px] text-gray-400 mt-1">PNG, JPG ou WEBP jusqu'à 5 Mo</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "about", "background_image")}
                            className="hidden" 
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Images About */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Grille d'Images de gauche</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[1, 2, 3].map((num) => {
                        const imgField = `grid_image_${num}`
                        return (
                          <div key={num} className="space-y-2 border border-slate-100 p-3 rounded-2xl bg-slate-50/50">
                            <label className="text-xs font-bold text-gray-600 block flex items-center justify-between">
                              <span>Image {num}</span>
                              {configs.about[imgField] && (
                                <button
                                  type="button"
                                  onClick={() => handleFieldChange("about", imgField, "")}
                                  className="text-red-500 hover:text-red-600 transition-colors text-[10px] font-bold"
                                >
                                  Supprimer
                                </button>
                              )}
                            </label>
                            {configs.about[imgField] && (
                              <img src={configs.about[imgField]} className="h-24 w-full object-cover rounded-xl border border-slate-100 mb-2" alt="Grid About" />
                            )}
                            <label className="flex items-center justify-center bg-white border border-gray-200 hover:border-emerald-500 rounded-xl p-2 cursor-pointer hover:bg-slate-50 transition-colors text-center">
                              <span className="text-[10px] font-bold text-gray-600">
                                {uploadingImage === `about-${imgField}` ? "..." : "Changer photo"}
                              </span>
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, "about", imgField)}
                                className="hidden" 
                              />
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* EXPERTISE TAB */}
            <TabsContent value="expertise">
              <Card className="rounded-3xl shadow-sm border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-gray-100">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Section Nos Expertises</CardTitle>
                    <CardDescription>Gérez les textes généraux d'introduction. Les blocs de services sont gérés dynamiquement.</CardDescription>
                  </div>
                  <Button 
                    onClick={() => handleSaveSection("expertise")} 
                    disabled={savingSection === "expertise"}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {savingSection === "expertise" ? "Sauvegarde..." : "Enregistrer"}
                  </Button>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Top bar controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Visibilité de la section</p>
                        <p className="text-xs text-gray-500">Afficher ou masquer sur la page d'accueil</p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={configs.expertise.enabled}
                        onChange={(e) => handleFieldChange("expertise", "enabled", e.target.checked)}
                        className="h-6 w-11 rounded-full bg-slate-200 border-0 outline-none cursor-pointer checked:bg-emerald-600 appearance-none relative before:content-[''] before:absolute before:h-5 before:w-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:left-5.5 before:transition-all duration-300 shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-900 block mb-1">Ambiance visuelle</label>
                      <CustomSelect 
                        value={configs.expertise.theme}
                        onChange={(val) => handleFieldChange("expertise", "theme", val)}
                        options={EXPERTISE_THEME_OPTIONS}
                      />
                    </div>
                  </div>

                  {/* General Fields */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Tag (Surligné)</label>
                        <Input value={configs.expertise.tag} onChange={(e) => handleFieldChange("expertise", "tag", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Mot en Italique doré</label>
                        <Input value={configs.expertise.italic_word} onChange={(e) => handleFieldChange("expertise", "italic_word", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 block mb-1">Titre principal</label>
                      <Input value={configs.expertise.title} onChange={(e) => handleFieldChange("expertise", "title", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 block mb-1">Texte de description d'introduction</label>
                      <Textarea value={configs.expertise.description} onChange={(e) => handleFieldChange("expertise", "description", e.target.value)} rows={3} />
                    </div>
                  </div>

                  {/* Services List Editor */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Liste des Domaines d'Expertise</h4>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl border-emerald-600 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                        onClick={() => {
                          const list = [...(configs.expertise.services || [])]
                          list.push({ title: "Nouveau Service", desc: "Description du service...", icon: "Grid", extra_info: "" })
                          handleFieldChange("expertise", "services", list)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Ajouter
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {configs.expertise.services?.map((svc: any, idx: number) => (
                        <div key={idx} className="border border-slate-100 bg-slate-50/50 p-4 rounded-2xl flex flex-col gap-4 relative">
                          <div className="absolute top-4 right-4 flex gap-1">
                            {idx > 0 && (
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-gray-500"
                                onClick={() => {
                                  const list = [...configs.expertise.services]
                                  const temp = list[idx]
                                  list[idx] = list[idx - 1]
                                  list[idx - 1] = temp
                                  handleFieldChange("expertise", "services", list)
                                }}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                            )}
                            {idx < configs.expertise.services.length - 1 && (
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-gray-500"
                                onClick={() => {
                                  const list = [...configs.expertise.services]
                                  const temp = list[idx]
                                  list[idx] = list[idx + 1]
                                  list[idx + 1] = temp
                                  handleFieldChange("expertise", "services", list)
                                }}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-red-500 hover:bg-red-50"
                              onClick={() => {
                                const list = configs.expertise.services.filter((_: any, i: number) => i !== idx)
                                handleFieldChange("expertise", "services", list)
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2">
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Titre du service</label>
                              <Input 
                                value={svc.title} 
                                onChange={(e) => {
                                  const list = [...configs.expertise.services]
                                  list[idx].title = e.target.value
                                  handleFieldChange("expertise", "services", list)
                                }} 
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Icône visuelle</label>
                              <CustomSelect 
                                value={svc.icon} 
                                onChange={(val) => {
                                  const list = [...configs.expertise.services]
                                  list[idx].icon = val
                                  handleFieldChange("expertise", "services", list)
                                }} 
                                options={SERVICE_ICON_OPTIONS}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Description du service</label>
                              <Textarea 
                                value={svc.desc || ""} 
                                onChange={(e) => {
                                  const list = [...configs.expertise.services]
                                  list[idx].desc = e.target.value
                                  handleFieldChange("expertise", "services", list)
                                }} 
                                rows={3}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Informations complémentaires (Texte libre)</label>
                              <Textarea 
                                value={svc.extra_info || ""} 
                                onChange={(e) => {
                                  const list = [...configs.expertise.services]
                                  list[idx].extra_info = e.target.value
                                  handleFieldChange("expertise", "services", list)
                                }} 
                                placeholder="Ex: Tarifs à partir de..., délais de réalisation, note d'exception..."
                                rows={3}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TESTIMONIALS TAB */}
            <TabsContent value="testimonials">
              <Card className="rounded-3xl shadow-sm border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-gray-100">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Section Témoignages</CardTitle>
                    <CardDescription>Gérez les citations, auteurs et notations par étoiles.</CardDescription>
                  </div>
                  <Button 
                    onClick={() => handleSaveSection("testimonials")} 
                    disabled={savingSection === "testimonials"}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {savingSection === "testimonials" ? "Sauvegarde..." : "Enregistrer"}
                  </Button>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Top bar controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Visibilité de la section</p>
                        <p className="text-xs text-gray-500">Afficher ou masquer sur la page d'accueil</p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={configs.testimonials.enabled}
                        onChange={(e) => handleFieldChange("testimonials", "enabled", e.target.checked)}
                        className="h-6 w-11 rounded-full bg-slate-200 border-0 outline-none cursor-pointer checked:bg-emerald-600 appearance-none relative before:content-[''] before:absolute before:h-5 before:w-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:left-5.5 before:transition-all duration-300 shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-900 block mb-1">Ambiance visuelle</label>
                      <CustomSelect 
                        value={configs.testimonials.theme}
                        onChange={(val) => handleFieldChange("testimonials", "theme", val)}
                        options={TESTIMONIALS_THEME_OPTIONS}
                      />
                    </div>
                  </div>

                  {/* General Fields */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Tag (Surligné)</label>
                        <Input value={configs.testimonials.tag} onChange={(e) => handleFieldChange("testimonials", "tag", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Mot en Italique doré</label>
                        <Input value={configs.testimonials.italic_word} onChange={(e) => handleFieldChange("testimonials", "italic_word", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 block mb-1">Titre principal</label>
                      <Input value={configs.testimonials.title} onChange={(e) => handleFieldChange("testimonials", "title", e.target.value)} />
                    </div>
                  </div>

                  {/* Testimonial list */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Liste des Témoignages</h4>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl border-emerald-600 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                        onClick={() => {
                          const list = [...(configs.testimonials.testimonials || [])]
                          list.push({ name: "Nom client", role: "Rôle", text: "Avis...", rating: 5, avatar: "https://i.pravatar.cc/150?u=new" })
                          handleFieldChange("testimonials", "testimonials", list)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Ajouter
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {configs.testimonials.testimonials?.map((t: any, idx: number) => (
                        <div key={idx} className="border border-slate-100 bg-slate-50/50 p-4 rounded-2xl flex flex-col gap-4 relative">
                          <div className="absolute top-4 right-4 flex gap-1">
                            {idx > 0 && (
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-gray-500"
                                onClick={() => {
                                  const list = [...configs.testimonials.testimonials]
                                  const temp = list[idx]
                                  list[idx] = list[idx - 1]
                                  list[idx - 1] = temp
                                  handleFieldChange("testimonials", "testimonials", list)
                                }}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                            )}
                            {idx < configs.testimonials.testimonials.length - 1 && (
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-gray-500"
                                onClick={() => {
                                  const list = [...configs.testimonials.testimonials]
                                  const temp = list[idx]
                                  list[idx] = list[idx + 1]
                                  list[idx + 1] = temp
                                  handleFieldChange("testimonials", "testimonials", list)
                                }}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-red-500 hover:bg-red-50"
                              onClick={() => {
                                const list = configs.testimonials.testimonials.filter((_: any, i: number) => i !== idx)
                                handleFieldChange("testimonials", "testimonials", list)
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Nom complet</label>
                              <Input 
                                value={t.name} 
                                onChange={(e) => {
                                  const list = [...configs.testimonials.testimonials]
                                  list[idx].name = e.target.value
                                  handleFieldChange("testimonials", "testimonials", list)
                                }} 
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Rôle/Position (ex: Acheteuse)</label>
                              <Input 
                                value={t.role} 
                                onChange={(e) => {
                                  const list = [...configs.testimonials.testimonials]
                                  list[idx].role = e.target.value
                                  handleFieldChange("testimonials", "testimonials", list)
                                }} 
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Note (1 à 5 étoiles)</label>
                              <CustomSelect 
                                value={String(t.rating)} 
                                onChange={(val) => {
                                  const list = [...configs.testimonials.testimonials]
                                  list[idx].rating = Number(val)
                                  handleFieldChange("testimonials", "testimonials", list)
                                }} 
                                options={RATING_OPTIONS}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                            <div className="sm:col-span-3">
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Avatar (URL ou R2)</label>
                              <div className="flex items-center gap-2">
                                <img src={t.avatar} className="h-10 w-10 rounded-full object-cover border border-slate-100" alt="Avatar" />
                                <label className="flex items-center justify-center bg-white border border-gray-200 hover:border-emerald-500 rounded-lg p-1 px-2 cursor-pointer hover:bg-slate-50 transition-colors text-center text-[9px] font-bold text-gray-600">
                                  {uploadingImage === `testimonial-${idx}` ? "..." : "Photo"}
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0]
                                      if (!file) return
                                      setUploadingImage(`testimonial-${idx}`)
                                      const formData = new FormData()
                                      formData.append("file", file)
                                      try {
                                        const res = await uploadHomepageImageAction(formData)
                                        if (res.success && res.url) {
                                          const list = [...configs.testimonials.testimonials]
                                          list[idx].avatar = res.url
                                          handleFieldChange("testimonials", "testimonials", list)
                                          toast.success("Avatar chargé.")
                                        }
                                      } catch {
                                        toast.error("Échec upload.")
                                      } finally {
                                        setUploadingImage(null)
                                      }
                                    }}
                                    className="hidden" 
                                  />
                                </label>
                              </div>
                            </div>
                            <div className="sm:col-span-9">
                              <label className="text-[10px] font-bold text-gray-500 block mb-1">Texte du témoignage</label>
                              <Textarea 
                                value={t.text} 
                                onChange={(e) => {
                                  const list = [...configs.testimonials.testimonials]
                                  list[idx].text = e.target.value
                                  handleFieldChange("testimonials", "testimonials", list)
                                }} 
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* FAQ TAB */}
            <TabsContent value="faq">
              <Card className="rounded-3xl shadow-sm border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-gray-100">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Section FAQ (Questions)</CardTitle>
                    <CardDescription>Configurez la liste des questions/réponses et les textes explicatifs.</CardDescription>
                  </div>
                  <Button 
                    onClick={() => handleSaveSection("faq")} 
                    disabled={savingSection === "faq"}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {savingSection === "faq" ? "Sauvegarde..." : "Enregistrer"}
                  </Button>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Top bar controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Visibilité de la section</p>
                        <p className="text-xs text-gray-500">Afficher ou masquer sur la page d'accueil</p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={configs.faq.enabled}
                        onChange={(e) => handleFieldChange("faq", "enabled", e.target.checked)}
                        className="h-6 w-11 rounded-full bg-slate-200 border-0 outline-none cursor-pointer checked:bg-emerald-600 appearance-none relative before:content-[''] before:absolute before:h-5 before:w-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:left-5.5 before:transition-all duration-300 shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-900 block mb-1">Ambiance visuelle</label>
                      <CustomSelect 
                        value={configs.faq.theme}
                        onChange={(val) => handleFieldChange("faq", "theme", val)}
                        options={STANDARD_THEME_OPTIONS}
                      />
                    </div>
                  </div>

                  {/* General Fields */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Tag (Surligné)</label>
                        <Input value={configs.faq.tag} onChange={(e) => handleFieldChange("faq", "tag", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Mot en Italique doré</label>
                        <Input value={configs.faq.italic_word} onChange={(e) => handleFieldChange("faq", "italic_word", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 block mb-1">Titre principal</label>
                      <Input value={configs.faq.title} onChange={(e) => handleFieldChange("faq", "title", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 block mb-1">Texte de description d'introduction</label>
                      <Textarea value={configs.faq.description} onChange={(e) => handleFieldChange("faq", "description", e.target.value)} rows={3} />
                    </div>
                  </div>

                  {/* CTA Card in FAQ */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Boîte d'appel direct (Gauche)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Titre de la boîte</label>
                        <Input value={configs.faq.cta_card_title} onChange={(e) => handleFieldChange("faq", "cta_card_title", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Sous-titre</label>
                        <Input value={configs.faq.cta_card_subtitle} onChange={(e) => handleFieldChange("faq", "cta_card_subtitle", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Bouton de contact</label>
                        <Input value={configs.faq.cta_card_button} onChange={(e) => handleFieldChange("faq", "cta_card_button", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* FAQ Items */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Liste des Questions / Réponses</h4>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl border-emerald-600 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                        onClick={() => {
                          const list = [...(configs.faq.faqs || [])]
                          list.push({ question: "Nouvelle question ?", answer: "Réponse..." })
                          handleFieldChange("faq", "faqs", list)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Ajouter
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {configs.faq.faqs?.map((f: any, idx: number) => (
                        <div key={idx} className="border border-slate-100 bg-slate-50/50 p-4 rounded-2xl flex flex-col gap-4 relative">
                          <div className="absolute top-4 right-4 flex gap-1">
                            {idx > 0 && (
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-gray-500"
                                onClick={() => {
                                  const list = [...configs.faq.faqs]
                                  const temp = list[idx]
                                  list[idx] = list[idx - 1]
                                  list[idx - 1] = temp
                                  handleFieldChange("faq", "faqs", list)
                                }}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                            )}
                            {idx < configs.faq.faqs.length - 1 && (
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-gray-500"
                                onClick={() => {
                                  const list = [...configs.faq.faqs]
                                  const temp = list[idx]
                                  list[idx] = list[idx + 1]
                                  list[idx + 1] = temp
                                  handleFieldChange("faq", "faqs", list)
                                }}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-red-500 hover:bg-red-50"
                              onClick={() => {
                                const list = configs.faq.faqs.filter((_: any, i: number) => i !== idx)
                                handleFieldChange("faq", "faqs", list)
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="w-[calc(100%-100px)]">
                            <label className="text-[10px] font-bold text-gray-500 block mb-1">Question</label>
                            <Input 
                              value={f.question} 
                              onChange={(e) => {
                                const list = [...configs.faq.faqs]
                                list[idx].question = e.target.value
                                handleFieldChange("faq", "faqs", list)
                              }} 
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 block mb-1">Réponse</label>
                            <Textarea 
                              value={f.answer} 
                              onChange={(e) => {
                                const list = [...configs.faq.faqs]
                                list[idx].answer = e.target.value
                                handleFieldChange("faq", "faqs", list)
                              }} 
                              rows={2}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* CTA TAB */}
            <TabsContent value="cta">
              <Card className="rounded-3xl shadow-sm border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-gray-100">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Section Appel à l'action (CTA)</CardTitle>
                    <CardDescription>Configurez le grand bouton d'action invitant à visiter nos biens.</CardDescription>
                  </div>
                  <Button 
                    onClick={() => handleSaveSection("cta")} 
                    disabled={savingSection === "cta"}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {savingSection === "cta" ? "Sauvegarde..." : "Enregistrer"}
                  </Button>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Top bar controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Visibilité de la section</p>
                        <p className="text-xs text-gray-500">Afficher ou masquer sur la page d'accueil</p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={configs.cta.enabled}
                        onChange={(e) => handleFieldChange("cta", "enabled", e.target.checked)}
                        className="h-6 w-11 rounded-full bg-slate-200 border-0 outline-none cursor-pointer checked:bg-emerald-600 appearance-none relative before:content-[''] before:absolute before:h-5 before:w-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 checked:before:left-5.5 before:transition-all duration-300 shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-900 block mb-1">Ambiance visuelle</label>
                      <CustomSelect 
                        value={configs.cta.theme}
                        onChange={(val) => handleFieldChange("cta", "theme", val)}
                        options={STANDARD_THEME_OPTIONS}
                      />
                    </div>
                  </div>

                  {/* General Fields */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Tag (Surligné)</label>
                        <Input value={configs.cta.tag} onChange={(e) => handleFieldChange("cta", "tag", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Mot en Italique doré</label>
                        <Input value={configs.cta.italic_word} onChange={(e) => handleFieldChange("cta", "italic_word", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 block mb-1">Titre principal</label>
                      <Input value={configs.cta.title} onChange={(e) => handleFieldChange("cta", "title", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 block mb-1">Description courte</label>
                      <Textarea value={configs.cta.description} onChange={(e) => handleFieldChange("cta", "description", e.target.value)} rows={3} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 block mb-1">Texte du bouton</label>
                      <Input value={configs.cta.button_label} onChange={(e) => handleFieldChange("cta", "button_label", e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
                      <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Texte de badge (ex: Rejoignez plus de...)</label>
                        <Input value={configs.footer.newsletter_badge} onChange={(e) => handleFieldChange("footer", "newsletter_badge", e.target.value)} />
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
