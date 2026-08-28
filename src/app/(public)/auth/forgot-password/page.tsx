"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import Logo from "@/components/shared/Logo"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/utils/supabase/client"
import { Loader2, MailCheck, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
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
          <div className="flex justify-center mb-1">
            <Logo />
          </div>

          <Card className="shadow-xl border border-slate-100 bg-white rounded-3xl p-4">
            <CardHeader className="text-center">
              <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <MailCheck className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-extrabold text-slate-900">Email Envoyé</CardTitle>
              <CardDescription className="text-xs text-slate-500 font-medium mt-2">
                Si un compte existe pour <strong className="text-slate-900 font-semibold">{email}</strong>, un lien de réinitialisation vous a été envoyé.
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-4">
              <Link
                href="/auth/login"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition-all flex items-center justify-center gap-2"
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex w-full max-w-md flex-col gap-6"
      >
        <div className="flex justify-center mb-1">
          <Logo />
        </div>

        <Card className="shadow-xl border border-slate-100 bg-white rounded-3xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-900">Mot de passe oublié</CardTitle>
            <CardDescription className="text-xs text-slate-500 font-medium">
              Entrez votre email pour recevoir un lien de réinitialisation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetRequest}>
              <FieldGroup className="gap-5">
                {error && (
                  <Alert variant="destructive" className="bg-red-50 border border-red-200 text-red-700 rounded-xl">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Field>
                  <FieldLabel htmlFor="email" className="text-sm font-bold text-slate-900">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nom@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-slate-900 placeholder:text-slate-400"
                  />
                </Field>

                <Field>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Envoi du lien...
                      </>
                    ) : (
                      "Envoyer le lien"
                    )}
                  </Button>
                </Field>
                <div className="w-full text-center text-xs text-slate-500 font-medium mt-2">
                  Retour à la{" "}
                  <Link href="/auth/login" className="text-emerald-600 font-bold hover:underline">
                    connexion
                  </Link>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

