"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/utils/supabase/client"
import { Loader2, MailCheck } from "lucide-react"

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
                <MailCheck className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-bold text-[#1A2A4A]">Email Envoyé</CardTitle>
              <CardDescription className="text-sm text-gray-500 mt-2">
                Si un compte existe pour <strong className="text-[#1A2A4A] font-semibold">{email}</strong>, un lien de réinitialisation vous a été envoyé.
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-4">
              <Link
                href="/auth/login"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full h-12 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 font-bold transition-all flex items-center justify-center"
                )}
              >
                Retour à la connexion
              </Link>
            </CardFooter>
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
            <CardTitle className="text-2xl font-bold tracking-tight text-[#1A2A4A]">Mot de passe oublié</CardTitle>
            <CardDescription className="text-sm text-gray-500">
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
                  <FieldLabel htmlFor="email" className="text-sm font-semibold text-[#1A2A4A]">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nom@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus-visible:ring-[#C9A84C] text-[#1A2A4A] placeholder:text-gray-400"
                  />
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
                        Envoi du lien...
                      </>
                    ) : (
                      "Envoyer le lien"
                    )}
                  </Button>
                </Field>
                <div className="w-full text-center text-sm text-gray-500 mt-2">
                  Retour à la{" "}
                  <Link href="/auth/login" className="text-[#C9A84C] font-semibold hover:underline">
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
