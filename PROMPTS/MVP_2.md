# MVP_2.md — CRM, Pipeline & Agents
## Favor Company International

> **Durée :** Semaines 6–10  
> **Prérequis :** MVP_1 entièrement terminé et testé  
> **Objectif :** CRM complet avec pipeline de vente, gestion des leads, agents et notifications

---

## Périmètre MVP_2

| # | Feature | Priorité | Statut |
|---|---|---|---|
| F11 | Gestion des Leads | 🔴 Critique | ⬜ Todo |
| F12 | Pipeline de Vente (8 étapes) | 🔴 Critique | ⬜ Todo |
| F13 | Gestion des Dossiers & Tâches | 🔴 Critique | ⬜ Todo |
| F14 | Gestion des Visites | 🔴 Critique | ⬜ Todo |
| F15 | Notifications & Communication | 🟠 Important | ⬜ Todo |
| F16 | Rapports & KPIs | 🟠 Important | ⬜ Todo |

---

## F11 — Gestion des Leads

### Critères d'acceptance
- [ ] Formulaire de contact sur le site génère un lead en DB
- [ ] Liste des leads dans le backoffice avec filtres
- [ ] Scoring automatique des leads (0–100)
- [ ] Attribution manuelle d'un lead à un agent
- [ ] Attribution automatique possible (round-robin)
- [ ] Historique des interactions par lead (appels, emails, WhatsApp)
- [ ] Changement de statut du lead (nouveau → contacté → qualifié → converti/perdu)
- [ ] Filtres : statut, agent, source, date, score

### Logique de Scoring
```typescript
// src/lib/crm/scoring.ts

interface ScoringFactors {
  aVisite: boolean           // +30 pts
  aPayeAcompte: boolean      // +25 pts
  aRappeleAgent: boolean     // +20 pts
  aOuvertEmail: boolean      // +10 pts
  aRempliFormulaire: boolean // +10 pts
  source: 'direct' | 'reseaux' | 'referral' | 'organic'  // +5 à +15 pts
}

export function calculerScore(factors: ScoringFactors): number {
  let score = 0
  if (factors.aVisite) score += 30
  if (factors.aPayeAcompte) score += 25
  if (factors.aRappeleAgent) score += 20
  if (factors.aOuvertEmail) score += 10
  if (factors.aRempliFormulaire) score += 10

  const sourceScore = {
    direct: 15,
    referral: 12,
    reseaux: 8,
    organic: 5,
  }
  score += sourceScore[factors.source] ?? 5

  return Math.min(score, 100)
}
```

### Server Action — Créer un Lead
```typescript
// src/app/actions/leads.ts
'use server'

import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { calculerScore } from '@/lib/crm/scoring'

const LeadSchema = z.object({
  nom: z.string().min(2).optional(),
  prenom: z.string().min(2).optional(),
  email: z.string().email().optional(),
  telephone: z.string().min(8),
  source: z.enum(['site_web', 'whatsapp', 'appel', 'reseaux_sociaux', 'referral']),
  bienInteresse: z.string().uuid().optional(),
  message: z.string().optional(),
})

export async function creerLead(formData: FormData) {
  const parsed = LeadSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('leads')
    .insert({
      ...parsed.data,
      statut: 'nouveau',
      score: calculerScore({
        aVisite: false,
        aPayeAcompte: false,
        aRappeleAgent: false,
        aOuvertEmail: false,
        aRempliFormulaire: true,
        source: parsed.data.source === 'site_web' ? 'direct' : 'reseaux',
      }),
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Notifier les admins d'un nouveau lead
  await notifierNouveauLead(data)

  return { success: true, leadId: data.id }
}
```

### Attribution automatique (round-robin)
```typescript
// src/lib/crm/attribution.ts
export async function attribuerLeadAutomatiquement(leadId: string, supabase: SupabaseClient) {
  // Récupérer l'agent avec le moins de leads actifs
  const { data: agents } = await supabase
    .from('users')
    .select(`
      id,
      leads:leads(count)
    `)
    .eq('role', 'admin_agent')
    .eq('statut', 'actif')
    .order('leads.count', { ascending: true })
    .limit(1)

  if (!agents || agents.length === 0) return

  const agentId = agents[0].id

  await supabase
    .from('leads')
    .update({ agent_id: agentId, statut: 'contacté' })
    .eq('id', leadId)

  // Notifier l'agent
  await supabase.from('notifications').insert({
    user_id: agentId,
    titre: 'Nouveau lead assigné',
    message: `Un nouveau lead vous a été attribué.`,
    type: 'lead',
    lien: `/admin/leads/${leadId}`,
  })
}
```

---

## F12 — Pipeline de Vente (8 Étapes)

### Critères d'acceptance
- [ ] Vue Kanban avec 8 colonnes (drag & drop)
- [ ] Vue liste du pipeline
- [ ] Vue calendrier (rendez-vous et deadlines)
- [ ] Déplacer un lead entre les étapes déclenche une notification
- [ ] Filtres : par agent, par bien, par date, par étape
- [ ] Statistiques du pipeline (nb leads par étape, taux de conversion entre étapes)

### Les 8 Étapes
```typescript
// src/constants/pipeline.ts
export const PIPELINE_ETAPES = [
  { code: 'prospect',        nom: 'Prospect',         couleur: '#6B7280', ordre: 1 },
  { code: 'qualifie',        nom: 'Lead Qualifié',    couleur: '#3B82F6', ordre: 2 },
  { code: 'visite_planifiee',nom: 'Visite Planifiée', couleur: '#8B5CF6', ordre: 3 },
  { code: 'visite_effectuee',nom: 'Visite Effectuée', couleur: '#EC4899', ordre: 4 },
  { code: 'negociation',     nom: 'Négociation',      couleur: '#F59E0B', ordre: 5 },
  { code: 'offre_acceptee',  nom: 'Offre Acceptée',   couleur: '#10B981', ordre: 6 },
  { code: 'contrat_signe',   nom: 'Contrat Signé',    couleur: '#059669', ordre: 7 },
  { code: 'vente_finalisee', nom: 'Vente Finalisée',  couleur: '#065F46', ordre: 8 },
] as const
```

### Composant Kanban
```tsx
// src/components/admin/KanbanPipeline.tsx
'use client'

import { useState } from 'react'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { PIPELINE_ETAPES } from '@/constants/pipeline'

interface KanbanPipelineProps {
  leads: LeadAvecEtape[]
  onLeadMove: (leadId: string, newEtape: string) => void
}

export function KanbanPipeline({ leads, onLeadMove }: KanbanPipelineProps) {
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    onLeadMove(active.id as string, over.id as string)
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_ETAPES.map(etape => (
          <PipelineColonne
            key={etape.code}
            etape={etape}
            leads={leads.filter(l => l.etape === etape.code)}
          />
        ))}
      </div>
    </DndContext>
  )
}
```

---

## F13 — Gestion des Dossiers & Tâches

### Critères d'acceptance
- [ ] Créer un dossier pour un client (lié à un bien)
- [ ] Ajouter/modifier/supprimer des tâches dans un dossier
- [ ] Attribuer une tâche à un agent
- [ ] Statuts tâches : à faire, en cours, terminée, bloquée
- [ ] Progression du dossier en % (calculée depuis les tâches terminées)
- [ ] Vue Kanban des tâches
- [ ] Vue Tableau avec tri et filtres
- [ ] Vue Calendrier (deadlines)
- [ ] Alerte si deadline dépassée
- [ ] Gestion des blocages (commentaire obligatoire)
- [ ] Attribution de client à un agent de suivi

### Calcul de la progression
```typescript
// src/lib/dossiers/progression.ts
export function calculerProgression(taches: Tache[]): number {
  if (taches.length === 0) return 0
  const terminées = taches.filter(t => t.statut === 'terminée').length
  return Math.round((terminées / taches.length) * 100)
}
```

### Server Action — Créer Dossier
```typescript
// src/app/actions/dossiers.ts
'use server'

import { z } from 'zod'
import { checkPermission } from '@/lib/auth/permissions'
import { createServerClient } from '@/lib/supabase/server'

const DossierSchema = z.object({
  clientId: z.string().uuid(),
  agentId: z.string().uuid().optional(),
  bienId: z.string().uuid().optional(),
  titre: z.string().min(3),
  description: z.string().optional(),
  priorite: z.enum(['basse', 'normale', 'haute', 'urgente']).default('normale'),
  deadline: z.string().datetime().optional(),
})

export async function creerDossier(input: z.infer<typeof DossierSchema>) {
  await checkPermission('dossiers.créer')
  
  const parsed = DossierSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('dossiers')
    .insert({ ...parsed.data, statut: 'ouvert', progression: 0 })
    .select()
    .single()

  if (error) return { error: error.message }
  return { success: true, dossier: data }
}
```

---

## F14 — Gestion des Visites

### Critères d'acceptance
- [ ] Calendrier de disponibilités (agents)
- [ ] Réservation de visite par le client (depuis le site)
- [ ] Validation / refus par l'admin ou l'agent
- [ ] Attribution d'un agent pour la visite
- [ ] Confirmation automatique client (email + notification)
- [ ] Rappel automatique 24h avant la visite
- [ ] Visites payantes : intégration paiement Paystack
- [ ] Suivi : planifiée → confirmée → effectuée → annulée
- [ ] Notes post-visite par l'agent

### Flux de réservation visite
```
Client choisit un bien → Clique "Réserver une visite"
→ Choisit une date/heure disponible
→ Si visite payante → Paiement Paystack
→ Confirmation automatique (email)
→ Notification à l'admin et l'agent
→ Agent confirme ou propose un autre créneau
→ Rappel 24h avant
→ Après visite : agent saisit ses notes
→ Lead automatiquement avancé dans le pipeline
```

---

## F15 — Notifications & Communication

### Critères d'acceptance
- [ ] Notifications in-app (temps réel via Supabase Realtime)
- [ ] Centre de notifications (cloche dans la navbar)
- [ ] Marquer comme lu / archiver
- [ ] Emails transactionnels (Resend) pour chaque événement clé
- [ ] Relances automatiques WhatsApp (via API officielle ou n8n)
- [ ] Relance paiement : 1 semaine avant l'échéance
- [ ] Relance réservation : J+60, J-14 expiration, J+14 expiration

### Événements déclenchant une notification
| Événement | Client | Agent | Admin |
|---|---|---|---|
| Nouvelle réservation | ✅ Email + In-app | ✅ In-app | ✅ In-app |
| Paiement reçu | ✅ Email + In-app | ✅ In-app | ✅ In-app |
| Paiement échoué | ✅ Email | ✅ In-app | — |
| Visite confirmée | ✅ Email | — | — |
| Rappel visite (J-24h) | ✅ Email + WhatsApp | ✅ In-app | — |
| Contrat envoyé | ✅ Email | — | — |
| Contrat signé | ✅ Email | ✅ In-app | ✅ In-app |
| Réservation bientôt expirée | ✅ Email + WhatsApp | ✅ In-app | — |
| Nouveau lead | — | ✅ In-app | ✅ In-app |

### Realtime Supabase
```typescript
// src/hooks/useNotifications.ts
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const supabase = createClient()

  useEffect(() => {
    // Charger les notifications existantes
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('lu', false)
      .order('created_at', { ascending: false })
      .then(({ data }) => setNotifications(data ?? []))

    // Écouter les nouvelles notifications en temps réel
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return notifications
}
```

---

## F16 — Rapports & KPIs

### Critères d'acceptance
- [ ] Dashboard KPIs avec graphes (CA mensuel, nb leads, taux conversion)
- [ ] Heatmap des zones les plus demandées
- [ ] Performance par agent (nb leads, visites, ventes)
- [ ] Taux d'expiration des réservations
- [ ] Export des rapports (PDF, CSV, Excel)
- [ ] Filtres par période (cette semaine, ce mois, ce trimestre, personnalisé)
- [ ] Scoring client visible

### Composants Graphes (recharts)
```tsx
// src/components/admin/charts/RevenueChart.tsx
'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

interface RevenueChartProps {
  data: { mois: string; ca: number; objectif: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mois" />
        <YAxis tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
        <Tooltip
          formatter={(value: number) =>
            `${value.toLocaleString('fr-CI')} FCFA`
          }
        />
        <Line
          type="monotone"
          dataKey="ca"
          stroke="#F97316"
          strokeWidth={2}
          name="CA Réel"
        />
        <Line
          type="monotone"
          dataKey="objectif"
          stroke="#CBD5E1"
          strokeDasharray="5 5"
          name="Objectif"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

---

## Tests de Recette MVP_2

### Scénario 1 — Parcours Lead Complet
1. Client remplit le formulaire de contact sur le site
2. Lead créé en DB avec score initial
3. Notification reçue par l'admin
4. Lead attribué à un agent
5. Agent contacte le client
6. Lead avancé à "Visite Planifiée" dans le pipeline
7. Visite effectuée → Lead passe en "Négociation"
8. Offre acceptée → Lead passe en "Offre Acceptée"

### Scénario 2 — Kanban Pipeline
1. Se connecter en tant qu'admin_agent
2. Voir uniquement ses leads dans le pipeline
3. Drag & drop un lead de "Prospect" vers "Qualifié"
4. Vérifier que la notification est envoyée

### Scénario 3 — Relances Automatiques
1. Créer une réservation avec date d'expiration dans 2 jours
2. Vérifier que l'email de relance est envoyé (simuler J-2)

### Scénario 4 — Dashboard KPIs
1. Se connecter en tant qu'admin_manager
2. Vérifier que les KPIs du mois sont corrects
3. Exporter le rapport en Excel

---

*MVP_2 terminé → Passer à MVP_3.md*
