"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Logo from "@/components/shared/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  getCurrentUserOnboardingStatusAction,
  completeOnboardingAction,
  type AllowedPublicRole,
} from "@/app/actions/authActions"
import {
  Loader2,
  CheckCircle2,
  Building2,
  HardHat,
  Home,
  Key,
  ShieldCheck,
  Phone,
  User,
  MapPin,
  FileCheck2,
} from "lucide-react"

const ABIDJAN_COMMUNES = [
  "Cocody (Angré, Riviera, Deux-Plateaux)",
  "Plateau (Centre des affaires)",
  "Marcory (Zone 4, Biétry)",
  "Koumassi",
  "Treichville",
  "Yopougon",
  "Port-Bouët",
  "Bingerville",
  "Adjamé",
  "Attécoubé",
  "Abobo",
  "Songon",
  "Grand-Bassam (Zone périurbaine)",
  "Autre commune",
]

export default function OnboardingPage() {
  const router = useRouter()
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [role, setRole] = useState<AllowedPublicRole>("client")
  const [userEmail, setUserEmail] = useState<string>("")

  // Form states
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("+225 ")
  const [commune, setCommune] = useState("Cocody (Angré, Riviera, Deux-Plateaux)")
  const [searchType, setSearchType] = useState<"location" | "achat" | "les_deux">("location")
  const [kycDocType, setKycDocType] = useState("cni")
  const [organizationName, setOrganizationName] = useState("")
  const [rccm, setRccm] = useState("")
  const [ncc, setNcc] = useState("")
  const [agrementNumero, setAgrementNumero] = useState("")
  const [whatsapp, setWhatsapp] = useState("+225 ")
  const [adresse, setAdresse] = useState("")
  const [acceptedEngagement, setAcceptedEngagement] = useState(false)

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await getCurrentUserOnboardingStatusAction()
        if (!res.isAuthenticated) {
          router.replace("/auth/login?callbackUrl=/auth/onboarding")
          return
        }

        if (res.profile?.is_onboarded) {
          if (res.profile.role === "client") {
            router.replace("/client/dashboard")
          } else if (res.profile.role === "admin" || res.profile.role === "super_admin") {
            router.replace("/admin")
          } else {
            router.replace("/dashboard/bailleur")
          }
          return
        }

        const userRole = (res.profile?.role || "client") as AllowedPublicRole
        setRole(userRole)
        setUserEmail(res.user?.email || "")
        if (res.profile?.full_name) setFullName(res.profile.full_name)
        if (res.profile?.phone) setPhone(res.profile.phone)
      } catch (err) {
        console.error("Error loading onboarding status:", err)
      } finally {
        setLoadingInitial(false)
      }
    }

    loadStatus()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    if (role === "proprietaire" && !acceptedEngagement) {
      setError("Veuillez certifier sur l'honneur être titulaire ou mandataire légal des biens présentés.")
      setSubmitting(false)
      return
    }

    const res = await completeOnboardingAction({
      fullName,
      phone,
      commune,
      searchType,
      kycDocType,
      organizationName,
      rccm,
      ncc,
      agrementNumero,
      whatsapp,
      adresse,
    })

    if (!res.success) {
      setError(res.error || "Une erreur est survenue lors de la finalisation.")
      setSubmitting(false)
    } else {
      router.push(res.redirectUrl || "/client/dashboard")
    }
  }

  if (loadingInitial) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-sm font-semibold">Initialisation de votre profil ImmOfika...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex w-full max-w-2xl flex-col gap-6"
      >
        <div className="flex justify-center mb-1">
          <Logo />
        </div>

        <Card className="shadow-xl border border-slate-100 bg-white rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-4 pt-8 border-b border-slate-100 bg-gradient-to-b from-emerald-50/40 to-transparent">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-700 text-xs font-bold mx-auto mb-3">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Étape 2 sur 2 — Finalisation du profil
            </div>

            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {role === "client" && "Bienvenue sur ImmOfika"}
              {role === "proprietaire" && "Configurez votre espace Propriétaire"}
              {role === "agence" && "Enregistrez votre Agence Immobilière"}
              {role === "promoteur" && "Enregistrez votre Programme Promoteur"}
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 font-medium max-w-md mx-auto mt-1">
              {role === "client" && "Renseignez vos coordonnées pour recevoir des alertes personnalisées et déposer vos dossiers de visite."}
              {role === "proprietaire" && "Validez votre identité pour sécuriser vos annonces directes sans frais d'intermédiaire."}
              {role === "agence" && "Identifiez votre agence pour administrer votre vitrine et attribuer des mandats à vos agents."}
              {role === "promoteur" && "Déclarez votre agrément ministériel MCLU pour afficher le badge Promoteur Certifié."}
            </CardDescription>

            <div className="text-xs text-slate-400 mt-2 font-mono">
              Compte : <span className="text-slate-700 font-medium">{userEmail}</span>
            </div>
          </CardHeader>

          <CardContent className="px-6 sm:px-10 pt-6 pb-8">
            <form onSubmit={handleSubmit}>
              <FieldGroup className="gap-5">
                {error && (
                  <Alert variant="destructive" className="bg-red-50 border border-red-200 text-red-700 rounded-xl">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* ─── 1. CLIENT (Acheteur / Locataire) ────────────────────── */}
                {role === "client" && (
                  <>
                    <Field>
                      <FieldLabel htmlFor="fullName" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <User className="h-4 w-4 text-emerald-600" /> Nom & Prénoms complets
                      </FieldLabel>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Ex: Kouamé Jean-Marc"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        disabled={submitting}
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-slate-900"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="phone" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-emerald-600" /> Numéro de téléphone / WhatsApp (+225)
                      </FieldLabel>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+225 07 00 00 00 00"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        disabled={submitting}
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-slate-900"
                      />
                      <FieldDescription className="text-xs text-slate-400">
                        Nécessaire pour la confirmation de vos créneaux de visite par SMS / WhatsApp.
                      </FieldDescription>
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="searchType" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Home className="h-4 w-4 text-emerald-600" /> Votre projet principal
                        </FieldLabel>
                        <select
                          id="searchType"
                          value={searchType}
                          onChange={(e) => setSearchType(e.target.value as "location" | "achat" | "les_deux")}
                          disabled={submitting}
                          className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="location">Location résidentielle</option>
                          <option value="achat">Achat immobilier (VEFA / Ancien)</option>
                          <option value="les_deux">Les deux (Veille active)</option>
                        </select>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="commune" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-emerald-600" /> Commune d&apos;intérêt prioritaire
                        </FieldLabel>
                        <select
                          id="commune"
                          value={commune}
                          onChange={(e) => setCommune(e.target.value)}
                          disabled={submitting}
                          className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          {ABIDJAN_COMMUNES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </>
                )}

                {/* ─── 2. PROPRIÉTAIRE PARTICULIER ─────────────────────────── */}
                {role === "proprietaire" && (
                  <>
                    <Field>
                      <FieldLabel htmlFor="fullName" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <User className="h-4 w-4 text-emerald-600" /> Nom & Prénoms complets
                      </FieldLabel>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Ex: Touré Fatou"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        disabled={submitting}
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-slate-900"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="phone" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-emerald-600" /> Numéro de téléphone direct (+225)
                      </FieldLabel>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+225 05 00 00 00 00"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        disabled={submitting}
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-slate-900"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="kycDocType" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <FileCheck2 className="h-4 w-4 text-emerald-600" /> Type de pièce d&apos;identité officielle
                      </FieldLabel>
                      <select
                        id="kycDocType"
                        value={kycDocType}
                        onChange={(e) => setKycDocType(e.target.value)}
                        disabled={submitting}
                        className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="cni">Carte Nationale d&apos;Identité (CNI Ivoirienne)</option>
                        <option value="passeport">Passeport biométrique</option>
                        <option value="attestation">Attestation d&apos;identité officielle</option>
                        <option value="carte_consulaire">Carte Consulaire</option>
                      </select>
                      <FieldDescription className="text-xs text-slate-400">
                        Votre justificatif pourra être téléversé lors de la publication de vos premiers titres de propriété (ACD, CMPF, Titre Foncier).
                      </FieldDescription>
                    </Field>

                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
                      <input
                        id="accept-engagement"
                        type="checkbox"
                        checked={acceptedEngagement}
                        onChange={(e) => setAcceptedEngagement(e.target.checked)}
                        required
                        className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
                      />
                      <label htmlFor="accept-engagement" className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none">
                        <strong>Engagement de conformité légale :</strong> Je certifie sur l&apos;honneur être le légitime propriétaire ou le mandataire direct des biens que je publierai sur ImmOfika, et je m&apos;engage à fournir les justificatifs de titre foncier valides lors de chaque publication.
                      </label>
                    </div>
                  </>
                )}

                {/* ─── 3. PROFESSIONNEL (AGENCE ou PROMOTEUR) ──────────────── */}
                {(role === "agence" || role === "promoteur") && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="orgName" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-emerald-600" /> Raison sociale / Nom officiel
                        </FieldLabel>
                        <Input
                          id="orgName"
                          type="text"
                          placeholder={role === "promoteur" ? "Ex: Ivoire Promotion Immobilière SA" : "Ex: Abidjan Prestige Conseil"}
                          value={organizationName}
                          onChange={(e) => setOrganizationName(e.target.value)}
                          required
                          disabled={submitting}
                          className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-slate-900"
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="rccm" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <FileCheck2 className="h-4 w-4 text-emerald-600" /> Numéro RCCM
                        </FieldLabel>
                        <Input
                          id="rccm"
                          type="text"
                          placeholder="CI-ABJ-2023-B-XXXXX"
                          value={rccm}
                          onChange={(e) => setRccm(e.target.value)}
                          required
                          disabled={submitting}
                          className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-slate-900"
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {role === "promoteur" ? (
                        <Field>
                          <FieldLabel htmlFor="agrement" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <HardHat className="h-4 w-4 text-emerald-600" /> N° Agrément MCLU (Obligatoire)
                          </FieldLabel>
                          <Input
                            id="agrement"
                            type="text"
                            placeholder="Ex: AG-2022-MCLU-XXXX"
                            value={agrementNumero}
                            onChange={(e) => setAgrementNumero(e.target.value)}
                            required
                            disabled={submitting}
                            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-slate-900"
                          />
                        </Field>
                      ) : (
                        <Field>
                          <FieldLabel htmlFor="ncc" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <FileCheck2 className="h-4 w-4 text-emerald-600" /> Compte Contribuable (NCC)
                          </FieldLabel>
                          <Input
                            id="ncc"
                            type="text"
                            placeholder="Ex: 2100000 X"
                            value={ncc}
                            onChange={(e) => setNcc(e.target.value)}
                            disabled={submitting}
                            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-slate-900"
                          />
                        </Field>
                      )}

                      <Field>
                        <FieldLabel htmlFor="commune" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-emerald-600" /> Commune du siège
                        </FieldLabel>
                        <select
                          id="commune"
                          value={commune}
                          onChange={(e) => setCommune(e.target.value)}
                          disabled={submitting}
                          className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          {ABIDJAN_COMMUNES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="phone" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-emerald-600" /> Téléphone du standard (+225)
                        </FieldLabel>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+225 27 00 00 00 00"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          disabled={submitting}
                          className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-slate-900"
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="whatsapp" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-emerald-600" /> Numéro WhatsApp direct
                        </FieldLabel>
                        <Input
                          id="whatsapp"
                          type="tel"
                          placeholder="+225 07 00 00 00 00"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          disabled={submitting}
                          className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-slate-900"
                        />
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="adresse" className="text-sm font-bold text-slate-900">
                        Adresse physique du siège
                      </FieldLabel>
                      <Input
                        id="adresse"
                        type="text"
                        placeholder="Ex: Boulevard Latrille, Immeuble Horizon 3e étage"
                        value={adresse}
                        onChange={(e) => setAdresse(e.target.value)}
                        disabled={submitting}
                        className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-slate-900"
                      />
                    </Field>
                  </>
                )}

                {/* Bouton de confirmation */}
                <Field className="pt-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Finalisation de votre compte...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        Accéder à mon tableau de bord
                      </>
                    )}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

