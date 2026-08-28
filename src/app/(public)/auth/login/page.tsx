"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Logo from "@/components/shared/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/utils/supabase/client"
import { Loader2, Smartphone, KeyRound, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password")
  const [identifier, setIdentifier] = useState("") // email or phone
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Reset state & clean any browser forced autofill on page render/deconnexion
    setIdentifier("")
    setPassword("")

    const timer = setTimeout(() => {
      setIdentifier("")
      setPassword("")
      const emailEl = document.getElementById("identifier") as HTMLInputElement
      const passEl = document.getElementById("password") as HTMLInputElement
      if (emailEl) emailEl.value = ""
      if (passEl) passEl.value = ""
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (loginMethod === "password") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: identifier,
          password,
        })

        if (error) {
          setError(error.message)
          setLoading(false)
          return
        }

        const user = data?.user
        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

          if (!profileError && profile && (profile.role.includes('admin') || profile.role === 'agent')) {
            await router.push("/admin")
            router.refresh()
            return
          }
        }
        await router.push("/client/dashboard")
        router.refresh()
      } else {
        // OTP Flow (SMS or Email Magic Link)
        const isPhone = identifier.startsWith("+")
        const { error } = isPhone
          ? await supabase.auth.signInWithOtp({ phone: identifier })
          : await supabase.auth.signInWithOtp({ email: identifier })

        if (error) {
          setError(error.message)
          setLoading(false)
        } else {
          await router.push("/auth/verify-otp")
        }
      }
    } catch (err: any) {
      console.error("Login execution/redirection error:", err)
      setError("Une erreur de connexion au serveur est survenue. Veuillez réessayer.")
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex w-full max-w-md flex-col gap-6"
      >
        {/* Logo */}
        <div className="flex justify-center mb-1">
          <Logo />
        </div>

        <Card className="shadow-xl border border-slate-100 bg-white rounded-3xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-900">Connexion</CardTitle>
            <CardDescription className="text-xs text-slate-500 font-medium">
              Heureux de vous revoir. Connectez-vous à votre espace ImmOfika.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} autoComplete="off">
              {/* Dummy hidden inputs to trap aggressive browser password autofill */}
              <input type="text" name="fake_user" style={{ display: 'none' }} tabIndex={-1} readOnly />
              <input type="password" name="fake_pass" style={{ display: 'none' }} tabIndex={-1} readOnly />

              <FieldGroup className="gap-5">
                {error && (
                  <Alert variant="destructive" className="bg-red-50 border border-red-200 text-red-700 rounded-xl">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Google SSO Button */}
                <Field>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading || loading}
                    className="w-full h-12 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 font-semibold text-sm"
                  >
                    {googleLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                    ) : (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                    Se connecter avec Google
                  </Button>
                </Field>

                <FieldSeparator className="text-gray-400 my-1">
                  Ou continuer avec
                </FieldSeparator>

                {/* Method Toggle */}
                <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => { setLoginMethod("password"); setError(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold py-2 rounded-lg transition-all ${loginMethod === "password" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    <KeyRound className="h-4 w-4" /> Mot de passe
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginMethod("otp"); setError(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold py-2 rounded-lg transition-all ${loginMethod === "otp" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    <Smartphone className="h-4 w-4" /> Code OTP
                  </button>
                </div>

                {/* Identifier Field (Email or Phone) */}
                <Field>
                  <FieldLabel htmlFor="identifier" className="text-sm font-bold text-slate-900">
                    {loginMethod === "password" ? "Email" : "Email ou Téléphone (+225...)"}
                  </FieldLabel>
                  <Input
                    id="identifier"
                    type={loginMethod === "password" ? "email" : "text"}
                    placeholder={loginMethod === "password" ? "nom@exemple.com" : "nom@exemple.com ou +2250700000000"}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    autoComplete="username"
                    disabled={loading || googleLoading}
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-slate-900 placeholder:text-slate-400"
                  />
                </Field>

                {/* Password Field (only visible if method is password) */}
                <AnimatePresence>
                  {loginMethod === "password" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <Field className="pt-2">
                        <div className="flex items-center justify-between">
                          <FieldLabel htmlFor="password" className="text-sm font-bold text-slate-900">Mot de passe</FieldLabel>
                          <Link
                            href="/auth/forgot-password"
                            className="text-xs font-bold text-emerald-600 hover:underline"
                          >
                            Mot de passe oublié ?
                          </Link>
                        </div>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required={loginMethod === "password"}
                            autoComplete="new-password"
                            disabled={loading || googleLoading}
                            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-slate-900 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
                            disabled={loading || googleLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </Field>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <Field>
                  <Button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="w-full h-12 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Connexion en cours...
                      </>
                    ) : (
                      loginMethod === "password" ? "Se connecter" : "Recevoir mon code"
                    )}
                  </Button>
                  <FieldDescription className="text-center text-slate-500 mt-4 text-xs">
                    Pas encore de compte ?{" "}
                    <Link href="/auth/register" className="text-emerald-600 font-bold hover:underline">
                      S&apos;inscrire
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
        <FieldDescription className="px-6 text-center text-xs text-slate-400 leading-relaxed">
          En vous connectant, vous acceptez nos{" "}
          <Link href="/legal" className="text-emerald-600 underline font-semibold">Conditions d&apos;utilisation</Link>{" "}
          et notre{" "}
          <Link href="/privacy" className="text-emerald-600 underline font-semibold">Politique de confidentialité</Link>.
        </FieldDescription>
      </motion.div>
    </div>
  )
}
