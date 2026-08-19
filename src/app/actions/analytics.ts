// src/app/actions/analytics.ts
'use server'

import { db } from "@/lib/db/index"
import { cookieConsents } from "@/lib/db/schema"
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { sql } from "drizzle-orm"

/**
 * Logs an anonymous cookie consent choice ('accepted' or 'declined') in the database.
 */
export async function logCookieConsentAction(consent: 'accepted' | 'declined') {
  try {
    await db.insert(cookieConsents).values({
      consent,
    })
    return { success: true }
  } catch (error) {
    console.error("[Log Cookie Consent Error]", error)
    return { success: false, error: "Impossible d'enregistrer le consentement." }
  }
}

/**
 * Fetches aggregated cookie consent statistics.
 * Restricted to super_admin or tech_super_admin roles.
 */
export async function getCookieConsentStatsAction() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: "Non authentifié" }
    }

    // Verify role is super_admin or tech_super_admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'super_admin' && profile.role !== 'tech_super_admin')) {
      return { success: false, error: "Non autorisé" }
    }

    const rows = await db
      .select({
        consent: cookieConsents.consent,
        count: sql<number>`count(*)::int`,
      })
      .from(cookieConsents)
      .groupBy(cookieConsents.consent)

    const stats = {
      accepted: 0,
      declined: 0,
    }

    for (const row of rows) {
      if (row.consent === 'accepted') stats.accepted = row.count
      if (row.consent === 'declined') stats.declined = row.count
    }

    return { success: true, stats }
  } catch (error) {
    console.error("[Get Cookie Stats Error]", error)
    return { success: false, error: "Impossible de récupérer les statistiques." }
  }
}
