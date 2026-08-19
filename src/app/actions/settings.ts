'use server'

import { db } from "@/lib/db"
import { systemSettings } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireAdminAccess } from "@/lib/auth/permissions"
import { z } from "zod"

const SaveSettingSchema = z.object({
  key: z.string().min(1, "La clé de configuration est requise"),
  value: z.any()
})

export async function getSystemSettingsAction() {
  await requireAdminAccess()
  
  try {
    const settingsList = await db.select().from(systemSettings)
    
    const configs: Record<string, any> = {}
    settingsList.forEach((item) => {
      configs[item.key] = item.value
    })
    
    return { success: true, configs }
  } catch (error) {
    console.error("Error loading system settings:", error)
    return { success: false, error: String(error) }
  }
}

export async function saveSystemSettingsAction(key: string, value: any) {
  await requireAdminAccess()
  
  const parsed = SaveSettingSchema.safeParse({ key, value })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }
  
  try {
    const existing = await db.select().from(systemSettings).where(eq(systemSettings.key, parsed.data.key)).limit(1)
    
    if (existing.length > 0) {
      await db.update(systemSettings)
        .set({ value: parsed.data.value, updatedAt: new Date() })
        .where(eq(systemSettings.key, parsed.data.key))
    } else {
      await db.insert(systemSettings)
        .values({ key: parsed.data.key, value: parsed.data.value })
    }
    
    revalidatePath('/admin/parametres/entreprise')
    revalidatePath('/admin/parametres/transactions')
    revalidatePath('/admin/parametres/automatisation')
    revalidatePath('/admin/parametres/securite')
    return { success: true }
  } catch (error) {
    console.error("Error saving system settings:", error)
    return { success: false, error: String(error) }
  }
}
