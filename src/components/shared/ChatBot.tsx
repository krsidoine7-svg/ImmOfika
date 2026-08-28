"use client"

import * as React from "react"
import Link from "next/link"
import {
  MessageCircle,
  X,
  ChevronRight,
  RotateCcw,
  Search,
  FileText,
  ShieldCheck,
  CreditCard,
  Building,
  PhoneCall,
  ExternalLink,
  MapPin,
  Tag,
  CheckCircle2,
  Info,
  Link2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface BienItem {
  id: string
  slug: string
  titre: string
  prix: string | number
  type: string
  transaction: string
  ville: string
  quartier?: string
  statut: string
}

interface FaqPoint {
  label: string
  text: string
}

interface FaqItem {
  key: string
  titre: string
  intro: string
  points: FaqPoint[]
}

interface Message {
  id: string
  sender: "bot" | "user"
  text?: string
  faq?: FaqItem
  biens?: BienItem[]
  hasNoResults?: boolean
}

type Step = "main" | "search_transaction" | "search_type" | "search_ville" | "results" | "faq_detail"

export default function ChatBot() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [step, setStep] = React.useState<Step>("main")
  const [loading, setLoading] = React.useState(false)

  // Filtres de recherche
  const [searchTransaction, setSearchTransaction] = React.useState<string>("tous")
  const [searchType, setSearchType] = React.useState<string>("tous")

  // Stats BDD
  const [stats, setStats] = React.useState<{
    totalDisponibles: number
    totalVente: number
    totalLocation: number
    villes: string[]
    types: string[]
  } | null>(null)

  // Messages du Chat
  const [messages, setMessages] = React.useState<Message[]>([])

  // Charger les stats lors de l'ouverture
  const fetchStats = React.useCallback(async () => {
    try {
      const res = await fetch("/api/chatbot/tree?action=stats")
      const data = await res.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (e) {
      console.error("[ChatBot fetchStats]", e)
    }
  }, [])

  // Réinitialiser vers le menu principal
  const resetToMainMenu = React.useCallback(() => {
    setStep("main")
    setSearchTransaction("tous")
    setSearchType("tous")

    const mainMessage: Message = {
      id: "msg-main-" + Date.now(),
      sender: "bot",
      text: "Bonjour ! Je suis l'assistant virtuel ImmOfika. Que souhaitez-vous rechercher ou consulter aujourd'hui ?",
    }
    setMessages([mainMessage])
  }, [])

  // Initialiser lors de l'ouverture
  React.useEffect(() => {
    if (isOpen && messages.length === 0) {
      fetchStats()
      resetToMainMenu()
    }
  }, [isOpen, messages.length, fetchStats, resetToMainMenu])

  // Gérer la recherche de biens
  const executeSearch = async (transaction: string, type: string, ville: string) => {
    setLoading(true)
    setStep("results")

    try {
      const queryParams = new URLSearchParams({
        action: "search",
        transaction,
        type,
        ville,
      })

      const res = await fetch(`/api/chatbot/tree?${queryParams.toString()}`)
      const data = await res.json()

      if (data.success) {
        const count = data.count || 0
        const biens: BienItem[] = data.biens || []

        let textMsg = ""
        let hasNoResults = false

        if (count === 0) {
          hasNoResults = true
          textMsg = `Aucun bien ne correspond aux critères sélectionnés pour la zone ${ville !== 'toutes' ? ville : 'Globale'}.\n\nN'hésitez pas à modifier vos filtres ou à contacter nos conseillers.`
        } else {
          textMsg = `Voici ${count} bien${count > 1 ? 's' : ''} disponible${count > 1 ? 's' : ''} correspondant à votre recherche :`
        }

        setMessages((prev) => [
          ...prev,
          {
            id: "msg-results-" + Date.now(),
            sender: "bot",
            text: textMsg,
            biens: biens,
            hasNoResults: hasNoResults,
          },
        ])
      }
    } catch (e) {
      console.error("[Chatbot executeSearch]", e)
      setMessages((prev) => [
        ...prev,
        {
          id: "msg-error-" + Date.now(),
          sender: "bot",
          text: "Une erreur est survenue lors de la recherche. Veuillez réessayer.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Afficher FAQ
  const fetchFaq = async (topic: string) => {
    setLoading(true)
    setStep("faq_detail")

    try {
      const res = await fetch(`/api/chatbot/tree?action=faq&topic=${topic}`)
      const data = await res.json()

      if (data.success && data.faq) {
        setMessages((prev) => [
          ...prev,
          {
            id: "msg-faq-" + Date.now(),
            sender: "bot",
            faq: data.faq,
          },
        ])
      }
    } catch (e) {
      console.error("[Chatbot fetchFaq]", e)
    } finally {
      setLoading(false)
    }
  }

  // Obtenir l'icône appropriée pour le sujet de FAQ
  const getFaqIcon = (key?: string) => {
    switch (key) {
      case "reservation":
        return <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
      case "documents":
        return <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
      case "paiement":
        return <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
      case "depot_bien":
        return <Building className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
      default:
        return <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Fenêtre du ChatBot */}
      {isOpen && (
        <div className="mb-4 w-[90vw] sm:w-96 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-emerald-100 dark:border-emerald-950/40 overflow-hidden animate-in slide-in-from-bottom-6 duration-300 flex flex-col h-[550px]">
          
          {/* Header Vert Émeraude Menthe */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 text-white flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 p-0.5 flex items-center justify-center backdrop-blur-sm border border-white/30 shrink-0">
                <img
                  src="/logo-favor.jpeg"
                  alt="ImmOfika"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">Assistant ImmOfika</p>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1.5 mt-0.5 font-medium">
                  <span className="h-2 w-2 bg-emerald-300 rounded-full animate-pulse shadow-sm" />
                  Guide interactif
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {step !== "main" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8 rounded-full"
                  onClick={resetToMainMenu}
                  title="Menu principal"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-8 w-8 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Badge statistiques rapides */}
          {stats && (
            <div className="bg-emerald-50/80 dark:bg-emerald-950/30 px-4 py-2 text-xs text-emerald-800 dark:text-emerald-300 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between font-medium shrink-0">
              <span className="flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                {stats.totalDisponibles} biens disponibles en direct
              </span>
              <span className="text-[10px] bg-emerald-200/60 dark:bg-emerald-800/60 px-2 py-0.5 rounded-full font-bold">
                {stats.totalVente} Vente • {stats.totalLocation} Location
              </span>
            </div>
          )}

          {/* Corps des messages et d'arborescence */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm bg-slate-50/50 dark:bg-zinc-900/50">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-3">
                
                {/* 1. Message Textuel standard */}
                {msg.text && (
                  <div className="flex gap-2.5 items-start">
                    <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-sm">
                      IF
                    </div>
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl rounded-tl-sm p-3.5 shadow-sm border border-slate-100 dark:border-zinc-700/60 max-w-[85%] text-slate-800 dark:text-slate-100 text-xs leading-relaxed space-y-2.5">
                      <p className="whitespace-pre-line">{msg.text}</p>
                      
                      {/* Bouton direct pour consulter tous les biens si aucun résultat n'a été trouvé */}
                      {msg.hasNoResults && (
                        <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-700/50 space-y-2">
                          <p className="text-[11px] text-slate-500 font-medium">Ou consultez directement tout notre catalogue :</p>
                          <Link
                            href="/#biens"
                            onClick={() => setIsOpen(false)}
                            className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-2 shadow-xs"
                          >
                            <Building className="h-4 w-4" />
                            <span>Consulter tous les biens du catalogue</span>
                            <ExternalLink className="h-3.5 w-3.5 ml-auto" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Affichage Formaté des Réponses FAQ */}
                {msg.faq && (
                  <div className="flex gap-2.5 items-start">
                    <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-sm">
                      IF
                    </div>
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl rounded-tl-sm p-4 shadow-sm border border-emerald-100 dark:border-emerald-900/50 max-w-[88%] text-slate-800 dark:text-slate-100 space-y-3">
                      
                      {/* En-tête du sujet avec icône */}
                      <div className="flex items-center gap-2 pb-2 border-b border-emerald-100 dark:border-zinc-700">
                        {getFaqIcon(msg.faq.key)}
                        <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-300">
                          {msg.faq.titre}
                        </h4>
                      </div>

                      {/* Texte introductif */}
                      {msg.faq.intro && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          {msg.faq.intro}
                        </p>
                      )}

                      {/* Liste à puces stylisée avec icônes de validation */}
                      {msg.faq.points && msg.faq.points.length > 0 && (
                        <div className="space-y-2 pt-1">
                          {msg.faq.points.map((pt, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs bg-slate-50 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-900 dark:text-white block text-[11px]">
                                  {pt.label}
                                </span>
                                <span className="text-slate-600 dark:text-slate-300 text-[11px] block leading-relaxed">
                                  {pt.text}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Cartes de Biens Immobilier */}
                {msg.biens && msg.biens.length > 0 && (
                  <div className="ml-9 space-y-2">
                    {msg.biens.map((b, index) => (
                      <div
                        key={b.id}
                        className="bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3 shadow-xs hover:border-emerald-500 transition-all"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            #{index + 1}
                          </span>
                          <h4 className="font-semibold text-xs text-slate-900 dark:text-white flex-1 line-clamp-1">
                            {b.titre}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 capitalize shrink-0">
                            {b.transaction}
                          </span>
                        </div>
                        
                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                          <span className="flex items-center gap-1 font-medium">
                            <MapPin className="h-3 w-3 text-emerald-600" />
                            {b.ville} {b.quartier ? `• ${b.quartier}` : ""}
                          </span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">
                            {Number(b.prix).toLocaleString("fr-FR")} FCFA
                          </span>
                        </div>

                        {/* Lien cliquable direct avec icône Link2 */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-700/50">
                          <Link
                            href={`/biens/${b.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="w-full py-1.5 px-3 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-600 hover:text-white text-emerald-800 dark:text-emerald-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5"
                          >
                            <Link2 className="h-3.5 w-3.5 text-emerald-600 group-hover:text-white" />
                            <span>Consulter la fiche du bien</span>
                            <ExternalLink className="h-3 w-3 ml-auto" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Indicateur de chargement */}
            {loading && (
              <div className="flex gap-2 items-center text-xs text-slate-500 italic ml-9 bg-white dark:bg-zinc-800 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-700 w-fit">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
                Recherche des données en cours...
              </div>
            )}
          </div>

          {/* Zone des choix d'arborescence interactifs */}
          <div className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2 shrink-0">
            
            {/* ETAPE 1 : Menu principal */}
            {step === "main" && (
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <Button
                  variant="outline"
                  className="w-full justify-between h-9 px-3 border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium"
                  onClick={() => {
                    setStep("search_transaction")
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: "msg-step1-" + Date.now(),
                        sender: "bot",
                        text: "Quel type de transaction recherchez-vous ?",
                      },
                    ])
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Search className="h-3.5 w-3.5 text-emerald-600" />
                    1. Rechercher un bien immobilier
                  </span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between h-9 px-3 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  onClick={() => fetchFaq("reservation")}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-emerald-600" />
                    2. Règle des Réservations - Acompte 1/3
                  </span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between h-9 px-3 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  onClick={() => fetchFaq("documents")}
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    3. Documents légaux - ACD & Titre Foncier
                  </span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between h-9 px-3 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  onClick={() => fetchFaq("paiement")}
                >
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                    4. Modes de paiement
                  </span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between h-9 px-3 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  onClick={() => fetchFaq("depot_bien")}
                >
                  <span className="flex items-center gap-2">
                    <Building className="h-3.5 w-3.5 text-emerald-600" />
                    5. Déposer ou confier un bien
                  </span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>

                <Link href="/contact" onClick={() => setIsOpen(false)}>
                  <Button
                    variant="default"
                    className="w-full justify-center h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                  >
                    <PhoneCall className="h-3.5 w-3.5 mr-2" />
                    Parler directement à un conseiller
                  </Button>
                </Link>
              </div>
            )}

            {/* ETAPE 2 : Choix Transaction */}
            {step === "search_transaction" && (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                  Sélectionnez la transaction :
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: "Tout", val: "tous" },
                    { label: "Vente", val: "vente" },
                    { label: "Location", val: "location" },
                  ].map((t) => (
                    <Button
                      key={t.val}
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 hover:bg-emerald-600 hover:text-white font-medium"
                      onClick={() => {
                        setSearchTransaction(t.val)
                        setStep("search_type")
                        setMessages((prev) => [
                          ...prev,
                          {
                            id: "msg-step2-" + Date.now(),
                            sender: "bot",
                            text: `Transaction choisie : ${t.label}.\nChoisissez maintenant le type de bien :`,
                          },
                        ])
                      }}
                    >
                      {t.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* ETAPE 3 : Choix Type */}
            {step === "search_type" && (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                  Sélectionnez le type de bien :
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: "Tous types", val: "tous" },
                    { label: "Terrain", val: "terrain" },
                    { label: "Villa", val: "villa" },
                    { label: "Appartement", val: "appartement" },
                    { label: "Bureau / Magasin", val: "bureau" },
                    { label: "Immeuble", val: "immeuble" },
                  ].map((tp) => (
                    <Button
                      key={tp.val}
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 hover:bg-emerald-600 hover:text-white justify-start font-medium"
                      onClick={() => {
                        setSearchType(tp.val)
                        setStep("search_ville")
                        setMessages((prev) => [
                          ...prev,
                          {
                            id: "msg-step3-" + Date.now(),
                            sender: "bot",
                            text: `Type choisi : ${tp.label}.\nSélectionnez enfin la commune ou ville souhaitée :`,
                          },
                        ])
                      }}
                    >
                      <Tag className="h-3 w-3 mr-1.5 text-emerald-600" />
                      {tp.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* ETAPE 4 : Choix Ville */}
            {step === "search_ville" && (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                  Sélectionnez la ville / zone :
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    "toutes",
                    "Cocody",
                    "Bingerville",
                    "Yamoussoukro",
                    "Assinie",
                    "Marcory",
                  ].map((v) => (
                    <Button
                      key={v}
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 hover:bg-emerald-600 hover:text-white justify-start capitalize font-medium"
                      onClick={() => {
                        executeSearch(searchTransaction, searchType, v)
                      }}
                    >
                      <MapPin className="h-3 w-3 mr-1.5 text-emerald-600" />
                      {v === "toutes" ? "Toutes villes" : v}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* ETAPE RESULTAT OU FAQ : Boutons d'action retour */}
            {(step === "results" || step === "faq_detail") && (
              <div className="grid grid-cols-3 gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[11px] px-1.5 h-8 border-emerald-200 font-medium"
                  onClick={resetToMainMenu}
                >
                  <RotateCcw className="h-3 w-3 mr-1 text-emerald-600" />
                  Menu
                </Button>
                <Link href="/#biens" onClick={() => setIsOpen(false)}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-[11px] px-1.5 h-8 border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-medium"
                  >
                    <Building className="h-3 w-3 mr-1 text-emerald-600" />
                    Tous les biens
                  </Button>
                </Link>
                <Link href="/contact" onClick={() => setIsOpen(false)}>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full text-[11px] px-1.5 h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                  >
                    <PhoneCall className="h-3 w-3 mr-1" />
                    Contact
                  </Button>
                </Link>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Bouton Flottant Déclencheur */}
      <Button
        size="icon"
        className={`h-14 w-14 rounded-full shadow-2xl transition-all duration-300 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:scale-105 ${
          isOpen ? "rotate-90 scale-95 ring-4 ring-emerald-300/40" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ouvrir le Chatbot"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  )
}
