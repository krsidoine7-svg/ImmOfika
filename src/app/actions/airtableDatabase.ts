'use server'

import { db } from "@/lib/db"
import { biens, leads, reservations, paiements } from "@/lib/db/schema"
import { eq, isNull, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getAirtableDataAction() {
  try {
    const [biensList, leadsList, reservationsList, paiementsList] = await Promise.all([
      db.select().from(biens).where(isNull(biens.deletedAt)).orderBy(desc(biens.createdAt)),
      db.select().from(leads).orderBy(desc(leads.createdAt)),
      db.select().from(reservations).orderBy(desc(reservations.createdAt)),
      db.select().from(paiements).orderBy(desc(paiements.createdAt)),
    ])

    return {
      success: true,
      data: {
        biens: biensList || [],
        leads: leadsList || [],
        reservations: reservationsList || [],
        paiements: paiementsList || [],
      },
    }
  } catch (error: any) {
    console.error('[getAirtableDataAction error]', error)
    return { success: false, error: error.message || 'Erreur lors du chargement de la base de données' }
  }
}

export async function updateInlineCellAction(tableName: string, rowId: string, field: string, value: any) {
  try {
    if (tableName === 'biens') {
      await db.update(biens).set({ [field]: value, updatedAt: new Date() }).where(eq(biens.id, rowId))
      revalidatePath('/admin/database')
      revalidatePath('/admin/biens')
      return { success: true }
    }

    if (tableName === 'leads') {
      await db.update(leads).set({ [field]: value, updatedAt: new Date() }).where(eq(leads.id, rowId))
      revalidatePath('/admin/database')
      revalidatePath('/admin/leads')
      return { success: true }
    }

    if (tableName === 'reservations') {
      await db.update(reservations).set({ [field]: value, updatedAt: new Date() }).where(eq(reservations.id, rowId))
      revalidatePath('/admin/database')
      revalidatePath('/admin/reservations')
      return { success: true }
    }

    if (tableName === 'paiements') {
      await db.update(paiements).set({ [field]: value, updatedAt: new Date() }).where(eq(paiements.id, rowId))
      revalidatePath('/admin/database')
      revalidatePath('/admin/paiements')
      return { success: true }
    }

    return { success: false, error: 'Table non reconnue' }
  } catch (error: any) {
    console.error('[updateInlineCellAction error]', error)
    return { success: false, error: error.message || 'Erreur de mise à jour' }
  }
}

export async function addRowAirtableAction(tableName: string, rowData: Record<string, any>) {
  try {
    if (tableName === 'biens') {
      const slug = `bien-${Date.now()}`
      const newBien = await db.insert(biens).values({
        slug,
        titre: rowData.titre || 'Nouveau bien',
        description: rowData.description || 'Description du bien',
        prix: String(rowData.prix || 10000000),
        type: rowData.type || 'villa',
        transaction: rowData.transaction || 'vente',
        ville: rowData.ville || 'Abidjan',
        statut: rowData.statut || 'disponible',
      }).returning()
      revalidatePath('/admin/database')
      return { success: true, row: newBien[0] }
    }

    if (tableName === 'leads') {
      const newLead = await db.insert(leads).values({
        nom: rowData.nom || 'Nouveau Lead',
        email: rowData.email || `lead-${Date.now()}@example.com`,
        telephone: rowData.telephone || '+225 0000000000',
        statut: rowData.statut || 'nouveau',
        source: rowData.source || 'Vue Base de Données',
      }).returning()
      revalidatePath('/admin/database')
      return { success: true, row: newLead[0] }
    }

    return { success: false, error: 'Création non supportée pour cette table' }
  } catch (error: any) {
    console.error('[addRowAirtableAction error]', error)
    return { success: false, error: error.message || 'Erreur lors de la création' }
  }
}
