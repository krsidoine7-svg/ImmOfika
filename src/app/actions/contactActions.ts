'use server'

import { z } from 'zod'
import { headers, cookies } from 'next/headers'
import { checkRateLimit } from '@/lib/security/rateLimiter'
import { logAuditEvent } from '@/lib/audit/logger'
import { createClient } from '@/utils/supabase/server'

const ContactInputSchema = z.object({
  nom: z.string().trim().min(2, 'Le nom doit comporter au moins 2 caractères.'),
  prenom: z.string().trim().optional(),
  email: z.string().trim().email('Adresse email invalide.').optional().or(z.literal('')),
  telephone: z.string().trim().min(8, 'Numéro de téléphone requis.'),
  message: z.string().trim().optional(),
  bienInteresse: z.string().uuid().optional().or(z.literal('')),
  website_hp: z.string().optional(), // Honeypot anti-bots
  source: z.string().optional().default('site_web'),
})

export type ContactInput = z.infer<typeof ContactInputSchema>

export async function envoyerMessageContactAction(input: ContactInput): Promise<{
  success?: boolean
  error?: string
}> {
  // Piège à robots : feindre le succès si le honeypot est renseigné
  if (input.website_hp && input.website_hp.trim().length > 0) {
    return { success: true }
  }

  const parsed = ContactInputSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Informations de contact non conformes.' }
  }

  const headerStore = await headers()
  const clientIp =
    headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerStore.get('x-real-ip') ||
    '127.0.0.1'

  const limit = await checkRateLimit(`contact-msg:${clientIp}`, {
    limit: 5,
    windowSeconds: 600, // 5 messages par 10 minutes par IP
  })

  if (!limit.success) {
    return { error: 'Trop de messages envoyés récemment. Veuillez patienter quelques minutes.' }
  }

  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    await logAuditEvent({
      userId: user?.id || null,
      action: 'contact.message_envoye',
      entity: 'contact',
      details: {
        nom: parsed.data.nom,
        prenom: parsed.data.prenom || null,
        telephone: parsed.data.telephone,
        bienId: parsed.data.bienInteresse || null,
        ip: clientIp,
      },
    })

    return { success: true }
  } catch (err: unknown) {
    console.error('[envoyerMessageContactAction]', err)
    return { error: 'Erreur technique lors de la transmission du message.' }
  }
}

