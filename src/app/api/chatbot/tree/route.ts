import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/db'
import { biens } from '@/lib/db/schema'
import { ilike, or, isNull, and, desc } from 'drizzle-orm'

// Biens de secours (Fallback) au cas où la BDD n'est pas alimentée
const FALLBACK_BIENS = [
  {
    id: 'demo-1',
    slug: 'villa-duplex-riviera-4ch',
    titre: 'Villa duplex Riviera — 4 chambres',
    prix: 120000000,
    type: 'villa',
    transaction: 'vente',
    ville: 'Abidjan',
    quartier: 'Riviera',
    surface: 450,
    chambres: 4,
    statut: 'disponible',
  },
  {
    id: 'demo-2',
    slug: 'appartement-2ch-marcory',
    titre: 'Appartement 2 chambres — Marcory',
    prix: 750000,
    type: 'appartement',
    transaction: 'location',
    ville: 'Abidjan',
    quartier: 'Marcory',
    surface: 85,
    chambres: 2,
    statut: 'disponible',
  },
  {
    id: 'demo-3',
    slug: 'terrain-cocody-1000m2-01',
    titre: 'Terrain plat à Cocody — 1000 m²',
    prix: 45000000,
    type: 'terrain',
    transaction: 'vente',
    ville: 'Abidjan',
    quartier: 'Cocody',
    surface: 1000,
    chambres: 0,
    statut: 'disponible',
  },
  {
    id: 'demo-4',
    slug: 'parcelle-bingerville-500m2',
    titre: 'Parcelle sécurisée avec ACD — Bingerville',
    prix: 18000000,
    type: 'terrain',
    transaction: 'vente',
    ville: 'Bingerville',
    quartier: 'Feh Kessé',
    surface: 500,
    chambres: 0,
    statut: 'disponible',
  },
  {
    id: 'demo-5',
    slug: 'villa-assinie-bord-de-mer',
    titre: 'Villa de vacances meublée — Assinie',
    prix: 2500000,
    type: 'villa',
    transaction: 'location',
    ville: 'Assinie',
    quartier: 'Mafia',
    surface: 320,
    chambres: 3,
    statut: 'disponible',
  },
]

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return null
  }
  return createClient(supabaseUrl, supabaseKey)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'stats'

    if (action === 'stats') {
      let totalDisponibles = 0
      let totalVente = 0
      let totalLocation = 0
      let villes: string[] = []
      let types: string[] = []

      // 1. Essai via Supabase
      const supabase = getSupabaseClient()
      if (supabase) {
        try {
          const { data: biensData } = await supabase
            .from('biens')
            .select('id, type, transaction, ville, quartier, statut')
            .is('deleted_at', null)

          if (biensData && biensData.length > 0) {
            totalDisponibles = biensData.filter(b => b.statut === 'disponible').length
            totalVente = biensData.filter(b => b.transaction === 'vente' && b.statut === 'disponible').length
            totalLocation = biensData.filter(b => b.transaction === 'location' && b.statut === 'disponible').length
            villes = Array.from(new Set(biensData.map(b => b.ville).filter(Boolean)))
            types = Array.from(new Set(biensData.map(b => b.type).filter(Boolean)))
          }
        } catch (e) {
          console.warn('[Chatbot Stats Supabase warning]', e)
        }
      }

      // 2. Si 0 résultat Supabase, essai via Drizzle Postgres
      if (totalDisponibles === 0) {
        try {
          const biensData = await db.select().from(biens).where(isNull(biens.deletedAt))
          if (biensData && biensData.length > 0) {
            totalDisponibles = biensData.filter(b => b.statut === 'disponible').length
            totalVente = biensData.filter(b => b.transaction === 'vente' && b.statut === 'disponible').length
            totalLocation = biensData.filter(b => b.transaction === 'location' && b.statut === 'disponible').length
            villes = Array.from(new Set(biensData.map(b => b.ville).filter(Boolean)))
            types = Array.from(new Set(biensData.map(b => b.type).filter(Boolean)))
          }
        } catch (e) {
          console.warn('[Chatbot Stats Drizzle warning]', e)
        }
      }

      // 3. Si toujours 0 résultat, fallback statique
      if (totalDisponibles === 0) {
        totalDisponibles = FALLBACK_BIENS.length
        totalVente = FALLBACK_BIENS.filter(b => b.transaction === 'vente').length
        totalLocation = FALLBACK_BIENS.filter(b => b.transaction === 'location').length
        villes = Array.from(new Set(FALLBACK_BIENS.map(b => b.ville)))
        types = Array.from(new Set(FALLBACK_BIENS.map(b => b.type)))
      }

      return NextResponse.json({
        success: true,
        stats: {
          totalDisponibles,
          totalVente,
          totalLocation,
          villes,
          types,
        },
      })
    }

    if (action === 'search') {
      const transaction = (searchParams.get('transaction') || 'tous').toLowerCase()
      const type = (searchParams.get('type') || 'tous').toLowerCase()
      const ville = (searchParams.get('ville') || 'toutes').toLowerCase()

      let resultats: any[] = []

      // 1. Essai via Supabase
      const supabase = getSupabaseClient()
      if (supabase) {
        try {
          let query = supabase
            .from('biens')
            .select('id, slug, titre, prix, type, transaction, ville, quartier, surface, chambres, statut')
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(10)

          if (transaction !== 'tous') {
            query = query.ilike('transaction', `%${transaction}%`)
          }
          if (type !== 'tous') {
            query = query.ilike('type', `%${type}%`)
          }
          if (ville !== 'toutes') {
            query = query.or(`ville.ilike.%${ville}%,quartier.ilike.%${ville}%,titre.ilike.%${ville}%`)
          }

          const { data } = await query
          if (data && data.length > 0) {
            resultats = data
          }
        } catch (e) {
          console.warn('[Chatbot Search Supabase warning]', e)
        }
      }

      // 2. Essai via Drizzle
      if (resultats.length === 0) {
        try {
          const conditions: any[] = [isNull(biens.deletedAt)]
          if (transaction !== 'tous') {
            conditions.push(ilike(biens.transaction, `%${transaction}%`))
          }
          if (type !== 'tous') {
            conditions.push(ilike(biens.type, `%${type}%`))
          }
          if (ville !== 'toutes') {
            conditions.push(
              or(
                ilike(biens.ville, `%${ville}%`),
                ilike(biens.quartier, `%${ville}%`),
                ilike(biens.titre, `%${ville}%`)
              )
            )
          }

          const data = await db
            .select({
              id: biens.id,
              slug: biens.slug,
              titre: biens.titre,
              prix: biens.prix,
              type: biens.type,
              transaction: biens.transaction,
              ville: biens.ville,
              quartier: biens.quartier,
              surface: biens.surface,
              chambres: biens.chambres,
              statut: biens.statut,
            })
            .from(biens)
            .where(and(...conditions))
            .orderBy(desc(biens.createdAt))
            .limit(10)

          if (data && data.length > 0) {
            resultats = data
          }
        } catch (e) {
          console.warn('[Chatbot Search Drizzle warning]', e)
        }
      }

      // 3. Fallback statique garanti
      if (resultats.length === 0) {
        resultats = FALLBACK_BIENS.filter(b => {
          const matchTrans = transaction === 'tous' || b.transaction.toLowerCase().includes(transaction)
          const matchType = type === 'tous' || b.type.toLowerCase().includes(type)
          const matchVille =
            ville === 'toutes' ||
            b.ville.toLowerCase().includes(ville) ||
            b.quartier.toLowerCase().includes(ville) ||
            b.titre.toLowerCase().includes(ville)

          return matchTrans && matchType && matchVille
        })
      }

      return NextResponse.json({
        success: true,
        count: resultats.length,
        biens: resultats,
      })
    }

    if (action === 'faq') {
      const topic = searchParams.get('topic') || ''

      const faqs: Record<string, { key: string; titre: string; intro: string; points: { label: string; text: string }[] }> = {
        reservation: {
          key: 'reservation',
          titre: "Processus & Règles des Réservations",
          intro: "Chez ImmOfika, la réservation d'un bien suit des règles strictes et transparentes :",
          points: [
            { label: "Acompte de Réservation", text: "1/3 du montant total du bien pour bloquer la réservation." },
            { label: "Durée Maximale", text: "La réservation est valable pour une durée de 3 mois au maximum." },
            { label: "Relances Automatiques", text: "Des notifications de relance sont envoyées 1 semaine avant chaque échéance." },
            { label: "Politique de Remboursement", text: "En cas d'annulation du client, 87% de l'acompte est remboursé avec retenue de 13% pour frais de dossier de gestion." }
          ]
        },
        documents: {
          key: 'documents',
          titre: "Documents & Conformité Légale OHADA",
          intro: "Tous les biens immobiliers et terrains inscrits sur ImmOfika sont certifiés :",
          points: [
            { label: "Attestation de Cession ACD", text: "Attestation de Cession de Droit certifiée et vérifiée pour les parcelles et terrains." },
            { label: "Titre Foncier TF", text: "Titre Foncier officiel et Plan de Bornage contradictoire." },
            { label: "Facture Normalisée", text: "Générée automatiquement aux normes officielles FC-2026." },
            { label: "Contrat & Signature", text: "Bail ou contrat de vente généré avec signature électronique sécurisée SHA-256." }
          ]
        },
        paiement: {
          key: 'paiement',
          titre: "Modes de paiement",
          intro: "ImmOfika intègre un système de paiement multi-canaux 100% sécurisé via Paystack :",
          points: [
            { label: "Mobile Money", text: "Wave, Orange Money, Moov Money, MTN Mobile Money." },
            { label: "Cartes Bancaires", text: "Visa et Mastercard locales ou internationales." },
            { label: "Virement & Chèque", text: "Disponible pour les règlements d'acompte auprès de nos agences agréées." }
          ]
        },
        depot_bien: {
          key: 'depot_bien',
          titre: "Propriétaire ou Agence Immobilière",
          intro: "Vous souhaitez confier un bien ou soumettre un mandat de vente ou de location :",
          points: [
            { label: "Dépôt en ligne", text: "Soumission directe de vos biens sur notre portail dédié." },
            { label: "Modération certifiée", text: "Vérification des titres de propriété par nos agents avant mise en ligne." },
            { label: "Prise de contact", text: "Consultez la page /deposer-bien ou contactez notre équipe." }
          ]
        }
      }

      const selected = faqs[topic] || {
        key: 'defaut',
        titre: "Information ImmOfika",
        intro: "Pour toute question spécifique, nos conseillers sont à votre disposition 6j/7 via la page de contact.",
        points: []
      }

      return NextResponse.json({
        success: true,
        faq: selected,
      })
    }

    return NextResponse.json({ success: false, message: 'Action invalide' }, { status: 400 })
  } catch (err: any) {
    console.error('[Chatbot Tree API catch]', err)
    return NextResponse.json({ success: false, message: err.message || 'Erreur serveur' }, { status: 500 })
  }
}
