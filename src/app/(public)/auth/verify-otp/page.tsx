"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Logo from "@/components/shared/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/utils/supabase/client"
import { Loader2 } from "lucide-react"

export default function VerifyOtpPage() {
  const [email, setEmail] = useState("")
  const [token, setToken] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Si on a un format téléphone (+33...), on utilise type: "sms", sinon "email"
    const isPhone = email.startsWith("+")
    const { error } = isPhone
      ? await supabase.auth.verifyOtp({ phone: email, token, type: "sms" })
      : await supabase.auth.verifyOtp({ email, token, type: "email" })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile && (profile.role.includes('admin') || profile.role === 'agent')) {
          router.push("/admin")
          router.refresh()
          return
        }
      }
      router.push("/client/dashboard")
      router.refresh()
    }
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
            <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-900">Vérification OTP</CardTitle>
            <CardDescription className="text-xs text-slate-500 font-medium">
              Entrez le code reçu par email ou SMS.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify}>
              <FieldGroup className="gap-5">
                {error && (
                  <Alert variant="destructive" className="bg-red-50 border border-red-200 text-red-700 rounded-xl">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Field>
                  <FieldLabel htmlFor="email" className="text-sm font-bold text-slate-900">Email ou Téléphone (+225...)</FieldLabel>
                  <Input
                    id="email"
                    type="text"
                    placeholder="nom@exemple.com ou +2250700000000"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-slate-900 placeholder:text-slate-400"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="token" className="text-sm font-bold text-slate-900">Code de vérification</FieldLabel>
                  <Input
                    id="token"
                    type="text"
                    placeholder="123456"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-slate-900 text-center tracking-[0.5em] text-lg font-bold"
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
                        Vérification...
                      </>
                    ) : (
                      "Vérifier le code"
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

