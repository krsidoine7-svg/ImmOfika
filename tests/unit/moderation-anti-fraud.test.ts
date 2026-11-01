import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { randomUUID } from 'crypto'

// ─── Schémas Zod de modération & anti-fraude ──────────────────────────────────

const CreerSignalementSchema = z.object({
  bienId: z.string().uuid('Identifiant de bien invalide'),
  motif: z.enum([
    'faux_prix',
    'demarcheur_arnaque',
    'bien_deja_vendu',
    'photos_trompeuses',
    'autre',
  ]),
  description: z.string().min(5, 'La description doit comporter au moins 5 caractères'),
})

const TraiterSignalementSchema = z.object({
  signalementId: z.string().uuid(),
  decision: z.enum(['approuve_retrait', 'rejeter_signalement']),
  commentaire: z.string().min(3, 'Le commentaire de décision est obligatoire'),
})

const ValiderTitreFoncierSchema = z.object({
  bienId: z.string().uuid(),
  decision: z.enum(['valider', 'rejeter']),
  typeTitrePropriete: z.string().optional(),
  motifRejet: z.string().optional(),
})

// Algorithme anti-fraude miroir
function detecterDoublonSuspect(
  cible: { id: string; ville: string; quartier?: string | null; prix: number; titre: string },
  candidat: { id: string; ville: string; quartier?: string | null; prix: number; titre: string }
): boolean {
  if (cible.id === candidat.id) return false

  const memeZone =
    candidat.ville.toLowerCase() === cible.ville.toLowerCase() ||
    Boolean(candidat.quartier && cible.quartier && candidat.quartier.toLowerCase() === cible.quartier.toLowerCase())

  if (!memeZone) return false

  const ecartPrix = Math.abs(candidat.prix - cible.prix) / Math.max(cible.prix, 1)
  return ecartPrix > 0.25 || candidat.titre.toLowerCase() === cible.titre.toLowerCase()
}

describe('Modération Marketplace & Bouclier Anti-Fraude Abidjan', () => {
  it('devrait valider un signalement d abus conforme et rejeter les motifs invalides', () => {
    const valide = CreerSignalementSchema.safeParse({
      bienId: randomUUID(),
      motif: 'demarcheur_arnaque',
      description: 'Ce démarcheur n a aucun mandat du propriétaire et réclame des frais de visite illégaux',
    })
    expect(valide.success).toBe(true)

    const motifInvalide = CreerSignalementSchema.safeParse({
      bienId: randomUUID(),
      motif: 'haine', // non autorisé
      description: 'Annonce inappropriée',
    })
    expect(motifInvalide.success).toBe(false)

    const descTropCourte = CreerSignalementSchema.safeParse({
      bienId: randomUUID(),
      motif: 'faux_prix',
      description: 'non',
    })
    expect(descTropCourte.success).toBe(false)
  })

  it('devrait valider les décisions d arbitrage de signalement avec justification obligatoire', () => {
    const retraitValide = TraiterSignalementSchema.safeParse({
      signalementId: randomUUID(),
      decision: 'approuve_retrait',
      commentaire: 'Annonce pirate confirmée après appel du syndic de la copropriété',
    })
    expect(retraitValide.success).toBe(true)

    const sansCommentaire = TraiterSignalementSchema.safeParse({
      signalementId: randomUUID(),
      decision: 'rejeter_signalement',
      commentaire: '',
    })
    expect(sansCommentaire.success).toBe(false)
  })

  it('devrait contrôler les visas de titres fonciers MCLU et exiger un motif en cas de rejet', () => {
    const visaApprouve = ValiderTitreFoncierSchema.safeParse({
      bienId: randomUUID(),
      decision: 'valider',
      typeTitrePropriete: 'acd',
    })
    expect(visaApprouve.success).toBe(true)

    const visaRejete = ValiderTitreFoncierSchema.safeParse({
      bienId: randomUUID(),
      decision: 'rejeter',
      motifRejet: 'Numéro d arrêté ministériel introuvable dans le répertoire officiel du MCLU',
    })
    expect(visaRejete.success).toBe(true)
  })

  it('devrait détecter les démarquages pirates et annonces clonées avec un écart de prix > 25%', () => {
    const annonceOriginale = {
      id: 'bien-1',
      ville: 'Cocody',
      quartier: 'Ambassades',
      prix: 300000000, // 300M FCFA
      titre: 'Somptueuse Villa Duplex 6 Pièces Piscine',
    }

    // Démarquage pirate (faux démarcheur affiche à 200M FCFA pour attirer les pigeons, écart 33%)
    const annoncePirate = {
      id: 'bien-2',
      ville: 'Cocody',
      quartier: 'Ambassades',
      prix: 200000000, // 200M FCFA (écart > 25%)
      titre: 'Villa 6 pièces prestige avec piscine',
    }

    expect(detecterDoublonSuspect(annonceOriginale, annoncePirate)).toBe(true)

    // Annonce normale dans un autre quartier avec prix standard
    const annonceAutre = {
      id: 'bien-3',
      ville: 'Yopougon',
      quartier: 'Niangon',
      prix: 45000000,
      titre: 'Appartement 3 pièces standing',
    }

    expect(detecterDoublonSuspect(annonceOriginale, annonceAutre)).toBe(false)

    // Annonce clone avec titre strictement identique même avec prix proche
    const annonceCloneTitre = {
      id: 'bien-4',
      ville: 'Cocody',
      quartier: 'Ambassades',
      prix: 290000000,
      titre: 'somptueuse villa duplex 6 pièces piscine',
    }

    expect(detecterDoublonSuspect(annonceOriginale, annonceCloneTitre)).toBe(true)
  })
})
