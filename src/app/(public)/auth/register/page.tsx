"use client"

import Link from "next/link"
import { useState } from "react"
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
  FieldSeparator,
} from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/utils/supabase/client"
import { registerUserAction, type AllowedPublicRole } from "@/app/actions/authActions"
import { Loader2, Mail, Eye, EyeOff, Home, Key, Building2, HardHat, CheckCircle2 } from "lucide-react"

interface ProfileOption {
  id: AllowedPublicRole
  title: string
  subtitle: string
  badge: string
  icon: typeof Home
}

const PROFILE_OPTIONS: ProfileOption[] = [
  {
    id: "client",
    title: "Acheteur / Locataire",
    subtitle: "Recherchez un bien, planifiez des visites et déposez votre dossier de réservation.",
    badge: "Accès libre",
    icon: Home,
  },
  {
    id: "proprietaire",
    title: "Propriétaire Particulier",
    subtitle: "Publiez vos biens en direct sans intermédiaire, gérez vos visites et encaissez vos loyers.",
    badge: "Direct",
    icon: Key,
  },
  {
    id: "agence",
    title: "Agence Immobilière",
    subtitle: "Diffusez vos mandats, animez votre équipe de négociateurs et gérez vos prospects.",
    badge: "Pro",
    icon: Building2,
  },
  {
    id: "promoteur",
    title: "Promoteur Agréé",
    subtitle: "Commercialisez vos programmes neufs (VEFA) et lotissements certifiés MCLU.",
    badge: "Agréé État",
    icon: HardHat,
  },
]

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<AllowedPublicRole>("client")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const hasMinLength = password.length >= 10
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!acceptedTerms) {
      setError("Vous devez accepter les conditions d'utilisation et la politique de confidentialité.")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      setLoading(false)
      return
    }

    if (!isPasswordValid) {
      setError("Le mot de passe doit comporter au moins 10 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial.")
      setLoading(false)
      return
    }

    const res = await registerUserAction(
      { email, password, acceptedTerms, role: selectedRole },
      typeof window !== 'undefined' ? window.location.origin : undefined
    )

    if (!res.success) {
      setError(res.error || "Une erreur est survenue lors de l'inscription.")
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          role: selectedRole,
        },
      },
    })
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex w-full max-w-md flex-col gap-6"
        >
          <div className="flex justify-center mb-2">
            <Logo />
          </div>

          <Card className="shadow-xl border border-slate-100 bg-white rounded-3xl p-4">
            <CardHeader className="text-center">
              <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <Mail className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl font-extrabold text-slate-900">Vérifiez vos e-mails</CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-2">
                Un lien de confirmation a été envoyé à : <br />
                <strong className="text-slate-900 font-bold">{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-4">
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition-all"
                onClick={() => router.push("/auth/login")}
              >
                Retour à la connexion
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
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
        {/* Logo */}
        <div className="flex justify-center mb-1">
          <Logo />
        </div>

        <Card className="shadow-xl border border-slate-100 bg-white rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-4 pt-8">
            <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Rejoindre ImmOfika
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 font-medium max-w-md mx-auto mt-1">
              Choisissez votre profil sur la première marketplace immobilière sécurisée d&apos;Abidjan.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 sm:px-10 pb-8">
            <form onSubmit={handleRegister}>
              <FieldGroup className="gap-6">
                {error && (
                  <Alert variant="destructive" className="bg-red-50 border border-red-200 text-red-700 rounded-xl">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* SÉLECTEUR DE PROFIL MARKETPLACE */}
                <div className="space-y-3">
                  <FieldLabel className="text-sm font-bold text-slate-900 flex items-center justify-between">
                    <span>Quel est votre profil ?</span>
                    <span className="text-xs text-emerald-600 font-medium">Étape 1 sur 2</span>
                  </FieldLabel>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PROFILE_OPTIONS.map((opt) => {
                      const IconComponent = opt.icon
                      const isSelected = selectedRole === opt.id

                      return (
                        <div
                          key={opt.id}
                          onClick={() => setSelectedRole(opt.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              setSelectedRole(opt.id)
                            }
                          }}
                          className={`relative p-4 rounded-2xl border text-left cursor-pointer transition-all select-none ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-sm"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div
                              className={`h-9 w-9 rounded-xl flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "bg-emerald-500 text-white shadow-sm"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                isSelected
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {opt.badge}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                            {opt.title}
                            {isSelected && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 ml-auto" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            {opt.subtitle}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <FieldSeparator className="text-slate-400 my-1">
                  Identifiants de connexion
                </FieldSeparator>

                {/* Google SSO Button */}
                <Field>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading || loading}
                    className="w-full h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-3 font-bold text-xs sm:text-sm"
                  >
                    {googleLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                    ) : (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                    Continuer avec Google ({PROFILE_OPTIONS.find((p) => p.id === selectedRole)?.title})
                  </Button>
                </Field>

                {/* Email Field */}
                <Field>
                  <FieldLabel htmlFor="email" className="text-sm font-bold text-slate-900">Email professionnel ou personnel</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-slate-900 placeholder:text-slate-400"
                  />
                </Field>

                {/* Password Fields in Dual-column Grid */}
                <Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="password" className="text-sm font-bold text-slate-900">Mot de passe</FieldLabel>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={loading}
                          className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-slate-900 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
                          disabled={loading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="confirmPassword" className="text-sm font-bold text-slate-900">Confirmation</FieldLabel>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          disabled={loading}
                          className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-slate-900 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
                          disabled={loading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </Field>
                  </div>
                  {/* Indicateur de robustesse du mot de passe */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] space-y-1.5 mt-2">
                    <p className="font-bold text-slate-700">Exigences de sécurité :</p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      <span className={hasMinLength ? "text-emerald-600 font-semibold flex items-center gap-1" : "text-slate-400 flex items-center gap-1"}>
                        {hasMinLength ? "✓" : "○"} 10 caractères min.
                      </span>
                      <span className={hasUppercase ? "text-emerald-600 font-semibold flex items-center gap-1" : "text-slate-400 flex items-center gap-1"}>
                        {hasUppercase ? "✓" : "○"} 1 majuscule
                      </span>
                      <span className={hasLowercase ? "text-emerald-600 font-semibold flex items-center gap-1" : "text-slate-400 flex items-center gap-1"}>
                        {hasLowercase ? "✓" : "○"} 1 minuscule
                      </span>
                      <span className={hasNumber ? "text-emerald-600 font-semibold flex items-center gap-1" : "text-slate-400 flex items-center gap-1"}>
                        {hasNumber ? "✓" : "○"} 1 chiffre
                      </span>
                      <span className={hasSpecial ? "text-emerald-600 font-semibold flex items-center gap-1 col-span-2" : "text-slate-400 flex items-center gap-1 col-span-2"}>
                        {hasSpecial ? "✓" : "○"} 1 caractère spécial (!@#$%...)
                      </span>
                    </div>
                  </div>
                </Field>

                {/* Terms and Privacy Checkbox */}
                <div className="flex items-start gap-3 pt-1">
                  <input
                    id="accept-terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    required
                    className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer accent-emerald-500"
                  />
                  <label htmlFor="accept-terms" className="text-xs text-slate-600 font-medium leading-relaxed select-none cursor-pointer">
                    J&apos;accepte les{" "}
                    <Link href="/legal" target="_blank" className="text-emerald-600 font-bold hover:underline">
                      Conditions d&apos;utilisation
                    </Link>{" "}
                    et la{" "}
                    <Link href="/privacy" target="_blank" className="text-emerald-600 font-bold hover:underline">
                      Politique de confidentialité
                    </Link>{" "}
                    d&apos;ImmOfika.
                  </label>
                </div>

                {/* Submit button */}
                <Field>
                  <Button
                    type="submit"
                    disabled={loading || !acceptedTerms}
                    className="w-full h-12 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Création du compte en cours...
                      </>
                    ) : (
                      `Créer mon compte ${PROFILE_OPTIONS.find((p) => p.id === selectedRole)?.title}`
                    )}
                  </Button>
                  <FieldDescription className="text-center text-slate-500 mt-4 text-xs">
                    Déjà un compte ?{" "}
                    <Link href="/auth/login" className="text-emerald-600 font-bold hover:underline">
                      Se connecter
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
