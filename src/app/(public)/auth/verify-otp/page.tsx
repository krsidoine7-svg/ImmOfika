"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
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
            <CardTitle className="text-2xl font-bold tracking-tight text-[#1A2A4A]">Vérification OTP</CardTitle>
            <CardDescription className="text-sm text-gray-500">
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
                  <FieldLabel htmlFor="email" className="text-sm font-semibold text-[#1A2A4A]">Email ou Téléphone (+33...)</FieldLabel>
                  <Input
                    id="email"
                    type="text"
                    placeholder="nom@exemple.com ou +33612345678"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus-visible:ring-[#C9A84C] text-[#1A2A4A]"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="token" className="text-sm font-semibold text-[#1A2A4A]">Code de vérification</FieldLabel>
                  <Input
                    id="token"
                    type="text"
                    placeholder="123456"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus-visible:ring-[#C9A84C] text-[#1A2A4A] text-center tracking-[0.5em] text-lg font-bold"
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
                        Vérification...
                      </>
                    ) : (
                      "Vérifier le code"
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
