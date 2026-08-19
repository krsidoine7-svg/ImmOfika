'use server'

import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function updatePasswordAction(password: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Non authentifié" }
  }
  
  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

export async function softDeleteAccountAction() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Non authentifié" }
  }
  
  try {
    // Soft delete in profiles
    await db.update(profiles)
      .set({ deletedAt: new Date() })
      .where(eq(profiles.id, user.id))
      
    // Sign out from Supabase Auth
    await supabase.auth.signOut()
    
    return { success: true }
  } catch (error) {
    console.error("Error soft-deleting account:", error)
    return { success: false, error: String(error) }
  }
}
