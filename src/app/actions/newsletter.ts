'use server'

import { db } from "@/lib/db/index"
import { newsletterSubscribers } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { z } from 'zod'

const EmailSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
})

export async function subscribeToNewsletter(email: string) {
  const parsed = EmailSchema.safeParse({ email })
  
  if (!parsed.success) {
    return { 
      success: false, 
      error: parsed.error.issues[0].message 
    }
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase()

  try {
    // Vérifier si déjà abonné en base
    const existing = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, normalizedEmail))
      .limit(1)

    if (existing.length > 0) {
      return { 
        success: true, 
        message: "Vous êtes déjà abonné à notre newsletter !" 
      }
    }

    // Insérer le nouvel abonné
    await db.insert(newsletterSubscribers).values({
      email: normalizedEmail,
    })

    return { 
      success: true, 
      message: "Inscription réussie ! Merci pour votre confiance." 
    }
  } catch (error: any) {
    console.error('[Newsletter Subscription Error]', error)
    return { 
      success: false, 
      error: "Une erreur est survenue lors de l'inscription." 
    }
  }
}
