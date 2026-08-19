"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/utils/supabase/client"
import { Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      setTimeout(() => router.push("/auth/login"), 3000)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F6F1] p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex w-full max-w-md flex-col gap-6"
        >
          <Link href="/" className="flex items-center gap-2 self-center font-bold text-2xl text-[#1A2A4A] tracking-wider">
            FAVOR COMPANY
          </Link>

          <Card className="shadow-xl border border-gray-100/50 bg-white rounded-2xl p-4">
            <CardHeader className="text-center">
              <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-bold text-[#1A2A4A]">Mot de passe mis à jour</CardTitle>
              <CardDescription className="text-sm text-gray-500 mt-2">
                Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion...
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F6F1] p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex w-full max-w-md flex-col gap-6"
      >
        <Link href="/" className="flex items-center gap-2 self-center font-bold text-2xl text-[#1A2A4A] tracking-wider hover:opacity-85 transition-opacity">
          FAVOR COMPANY
        </Link>

        <Card className="shadow-xl border border-gray-100/50 bg-white/95 backdrop-blur-md rounded-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold tracking-tight text-[#1A2A4A]">Nouveau mot de passe</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Définissez votre nouveau mot de passe sécurisé.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReset}>
              <FieldGroup className="gap-5">
                {error && (
                  <Alert variant="destructive" className="bg-red-50 border border-red-200 text-red-700 rounded-xl">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Field>
                  <FieldLabel htmlFor="password" className="text-sm font-semibold text-[#1A2A4A]">Nouveau mot de passe</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus-visible:ring-[#C9A84C] text-[#1A2A4A] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C9A84C] transition-colors focus:outline-none"
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
                  <FieldLabel htmlFor="confirmPassword" className="text-sm font-semibold text-[#1A2A4A]">Confirmer le mot de passe</FieldLabel>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus-visible:ring-[#C9A84C] text-[#1A2A4A] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C9A84C] transition-colors focus:outline-none"
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

                <Field>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl font-bold bg-[#C9A84C] hover:bg-[#b8943d] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Mise à jour...
                      </>
                    ) : (
                      "Mettre à jour le mot de passe"
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
