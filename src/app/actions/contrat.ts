'use server'

import { db } from '@/lib/db'
import { reservations, biens } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { uploadToR2 } from '@/lib/r2/client'
import { requireAdminAccess } from '@/lib/auth/permissions'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export interface UploadContratInput {
  reservationId: string
  fileBase64: string
  fileName: string
}

export async function uploaderContratScanneAction(input: UploadContratInput) {
  await requireAdminAccess()

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié.' }
  }

  const { reservationId, fileBase64, fileName } = input

  if (!reservationId || !fileBase64) {
    return { success: false, error: 'Réservation et fichier requis.' }
  }

  if (!fileName.toLowerCase().endsWith('.pdf')) {
    return { success: false, error: 'Seuls les fichiers PDF (.pdf) sont acceptés.' }
  }

  try {
    const [reservation] = await db
      .select()
      .from(reservations)
      .where(eq(reservations.id, reservationId))

    if (!reservation) {
      return { success: false, error: 'Réservation introuvable.' }
    }

    const [bien] = await db
      .select()
      .from(biens)
      .where(eq(biens.id, reservation.bienId))

    // Vérifier si l'utilisateur est l'agent assigné OU s'il est admin/super_admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role as string
    const isAdmin = role === 'admin' || role === 'super_admin' || role === 'tech_super_admin'
    const isAssignedAgent = role === 'agent' && bien?.agentId === user.id

    if (!isAdmin && !isAssignedAgent) {
      return { success: false, error: 'Vous n\'êtes pas autorisé à uploader un contrat pour ce dossier.' }
    }

    // Upload vers R2
    const base64Data = fileBase64.replace(/^data:.+;base64,/, '')
    const pdfBuffer = Buffer.from(base64Data, 'base64')
    const finalFileName = `Contrat_Scanne_${reservationId.slice(0, 8)}_${Date.now()}.pdf`
    
    const publicUrl = await uploadToR2(pdfBuffer, finalFileName, 'application/pdf')

    // Mettre à jour la réservation
    await db
      .update(reservations)
      .set({
        contratScanneUrl: publicUrl,
        contratStatut: 'uploade_par_agent',
        notes: (reservation.notes ? reservation.notes + ' | ' : '') + `Contrat scanné uploadé le ${new Date().toLocaleDateString('fr-FR')} par ${role}.`,
        updatedAt: new Date(),
      })
      .where(eq(reservations.id, reservationId))

    revalidatePath('/admin/reservations')
    revalidatePath(`/admin/reservations/${reservationId}`)

    return {
      success: true,
      contratUrl: publicUrl,
      message: 'Le contrat scanné a été uploadé et sauvegardé avec succès.',
    }
  } catch (err: any) {
    console.error('[uploaderContratScanneAction Error]', err)
    return { success: false, error: err.message || 'Erreur lors de l\'upload du contrat.' }
  }
}
