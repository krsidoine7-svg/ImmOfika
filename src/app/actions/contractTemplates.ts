'use server'

import { db } from '@/lib/db'
import { contractTemplates } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { uploadToR2 } from '@/lib/r2/client'
import { requireAdminAccess } from '@/lib/auth/permissions'
import { revalidatePath } from 'next/cache'

export async function getContractTemplatesAction() {
  try {
    const list = await db
      .select()
      .from(contractTemplates)
      .orderBy(desc(contractTemplates.createdAt))
    return { success: true, templates: list }
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur chargement modèles' }
  }
}

export async function uploadContractTemplateAction(formData: FormData) {
  await requireAdminAccess()

  try {
    const nom = formData.get('nom') as string
    const description = formData.get('description') as string
    const typeBien = (formData.get('typeBien') as string) || 'foncier'
    const file = formData.get('fichier') as File

    if (!nom || !file) {
      return { success: false, error: 'Le nom du modèle et le fichier Word (.docx) sont obligatoires.' }
    }

    if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      return { success: false, error: 'Seuls les fichiers Microsoft Word (.docx) sont autorisés comme modèle.' }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileName = `template_${Date.now()}_${file.name.replace(/\s+/g, '_')}`
    const fichierUrl = await uploadToR2(buffer, fileName, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')

    const [newTemplate] = await db
      .insert(contractTemplates)
      .values({
        nom,
        description: description || 'Modèle de contrat d\'entreprise',
        typeBien,
        fichierUrl,
        fichierNom: file.name,
        isDefault: false,
      })
      .returning()

    revalidatePath('/admin/parametres/templates')
    return { success: true, template: newTemplate, message: `Modèle "${nom}" enregistré avec succès !` }
  } catch (err: any) {
    console.error('[Upload Template Error]', err)
    return { success: false, error: err.message || 'Erreur lors de l\'enregistrement du modèle Word.' }
  }
}

export async function setDefaultContractTemplateAction(templateId: string) {
  await requireAdminAccess()

  try {
    // Reset defaults
    await db.update(contractTemplates).set({ isDefault: false })

    // Set new default
    await db
      .update(contractTemplates)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(eq(contractTemplates.id, templateId))

    revalidatePath('/admin/parametres/templates')
    return { success: true, message: 'Modèle défini par défaut avec succès.' }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteContractTemplateAction(templateId: string) {
  await requireAdminAccess()

  try {
    await db.delete(contractTemplates).where(eq(contractTemplates.id, templateId))
    revalidatePath('/admin/parametres/templates')
    return { success: true, message: 'Modèle supprimé.' }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
