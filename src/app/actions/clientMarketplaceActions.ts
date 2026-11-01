'use server'

import { calculerCompletudeDossier } from '@/lib/dossier'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

// ─── Schémas Zod ─────────────────────────────────────────────────────────────

const AlerteCriteresSchema = z.object({
  commune: z.string().optional(),
  type: z.string().optional(),
  transaction: z.enum(['vente', 'location', '']).optional(),
  prixMin: z.number().min(0).optional(),
  prixMax: z.number().min(0).optional(),
  piecesMin: z.number().min(0).optional(),
  typeTitrePropriete: z.string().optional(),
})

const CreerAlerteSchema = z.object({
  titre: z.string().min(2, 'Le titre de l alerte doit comporter au moins 2 caractères'),
  criteres: AlerteCriteresSchema,
  frequence: z.enum(['immediat', 'quotidien', 'hebdomadaire']).default('quotidien'),
})

const DossierCandidatSchema = z.object({
  typeProjet: z.enum(['location', 'achat']).default('location'),
  profession: z.string().nullable().optional(),
  employeur: z.string().nullable().optional(),
  revenuMensuel: z.number().min(0).nullable().optional(),
  fichiers: z.object({
    cniUrl: z.string().nullable().optional(),
    bulletinsSalaireUrls: z.array(z.string()).optional(),
    attestationTravailUrl: z.string().nullable().optional(),
    quittanceUrl: z.string().nullable().optional(),
  }).default({}),
  notes: z.string().nullable().optional(),
})

// ─── Server Actions : Recherches & Alertes Sauvegardées ───────────────────────

export async function creerAlerteAction(formData: z.infer<typeof CreerAlerteSchema>) {
  try {
    const parsed = CreerAlerteSchema.parse(formData)
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Vous devez être connecté pour créer une alerte.' }
    }

    const { data, error } = await supabase
      .from('recherches_alertes')
      .insert({
        user_id: user.id,
        titre: parsed.titre,
        criteres: parsed.criteres,
        frequence: parsed.frequence,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      return { error: `Erreur lors de la création de l alerte : ${error.message}` }
    }

    return { success: true, alerte: data }
  } catch (err: any) {
    return { error: err.message || 'Données d alerte invalides.' }
  }
}

export async function getMesAlertesAction() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Non authentifié', alertes: [] }
    }

    const { data, error } = await supabase
      .from('recherches_alertes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return { error: error.message, alertes: [] }
    }

    return { alertes: data ?? [] }
  } catch (err: any) {
    return { error: err.message, alertes: [] }
  }
}

export async function toggleAlerteAction(alerteId: string, isActive: boolean) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Non authentifié' }
    }

    const { error } = await supabase
      .from('recherches_alertes')
      .update({ is_active: isActive })
      .eq('id', alerteId)
      .eq('user_id', user.id) // Anti-IDOR

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function supprimerAlerteAction(alerteId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Non authentifié' }
    }

    const { error } = await supabase
      .from('recherches_alertes')
      .delete()
      .eq('id', alerteId)
      .eq('user_id', user.id) // Anti-IDOR

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

// ─── Server Actions : Dossier Candidat (Location / Achat) ────────────────────



export async function getMonDossierCandidatAction() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Non authentifié', dossier: null }
    }

    const { data, error } = await supabase
      .from('dossiers_candidats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found
      return { error: error.message, dossier: null }
    }

    return { dossier: data ?? null }
  } catch (err: any) {
    return { error: err.message, dossier: null }
  }
}

export async function sauvegarderDossierCandidatAction(formData: z.infer<typeof DossierCandidatSchema>) {
  try {
    const parsed = DossierCandidatSchema.parse(formData)
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Non authentifié' }
    }

    // Vérifier si un dossier existe déjà pour cet utilisateur
    const { data: existing } = await supabase
      .from('dossiers_candidats')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      const { data, error } = await supabase
        .from('dossiers_candidats')
        .update({
          type_projet: parsed.typeProjet,
          profession: parsed.profession,
          employeur: parsed.employeur,
          revenu_mensuel: parsed.revenuMensuel,
          fichiers: parsed.fichiers,
          notes: parsed.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) return { error: error.message }
      return { success: true, dossier: data }
    } else {
      const { data, error } = await supabase
        .from('dossiers_candidats')
        .insert({
          user_id: user.id,
          type_projet: parsed.typeProjet,
          profession: parsed.profession,
          employeur: parsed.employeur,
          revenu_mensuel: parsed.revenuMensuel,
          fichiers: parsed.fichiers,
          notes: parsed.notes,
          statut: 'brouillon',
        })
        .select()
        .single()

      if (error) return { error: error.message }
      return { success: true, dossier: data }
    }
  } catch (err: any) {
    return { error: err.message || 'Données du dossier candidat invalides.' }
  }
}

export async function soumettreDossierCandidatAction() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Non authentifié' }
    }

    const { data: dossier, error: fetchError } = await supabase
      .from('dossiers_candidats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (fetchError || !dossier) {
      return { error: 'Veuillez renseigner votre dossier avant de le soumettre.' }
    }

    const completude = calculerCompletudeDossier(
      dossier.fichiers || {},
      dossier.profession,
      dossier.revenu_mensuel
    )

    if (completude < 40) {
      return {
        error: `Votre dossier est incomplet (${completude}%). Veuillez renseigner au moins votre profession, revenu et pièce d identité.`,
      }
    }

    const { error: updateError } = await supabase
      .from('dossiers_candidats')
      .update({ statut: 'soumis', updated_at: new Date().toISOString() })
      .eq('id', dossier.id)
      .eq('user_id', user.id)

    if (updateError) return { error: updateError.message }

    return { success: true, message: 'Votre dossier a été soumis avec succès à la vérification.' }
  } catch (err: any) {
    return { error: err.message }
  }
}

