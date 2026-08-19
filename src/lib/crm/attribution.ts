import { db } from '../db'
import { leads, profiles } from '../db/schema'
import { eq, and, isNull, count } from 'drizzle-orm'

export async function attribuerLeadAutomatiquement(leadId: string): Promise<string | null> {
  // 1. Récupérer tous les agents actifs (non supprimés)
  const agentsList = await db
    .select({
      id: profiles.id,
      fullName: profiles.fullName,
      email: profiles.email,
    })
    .from(profiles)
    .where(
      and(
        eq(profiles.role, 'agent'),
        isNull(profiles.deletedAt)
      )
    )

  if (agentsList.length === 0) {
    console.log('Attribution automatique : Aucun agent actif disponible en base.')
    return null
  }

  // 2. Compter pour chaque agent le nombre de leads actifs assignés
  const agentLeadCounts = await Promise.all(
    agentsList.map(async (agent) => {
      const [result] = await db
        .select({ count: count() })
        .from(leads)
        .where(
          and(
            eq(leads.agentId, agent.id),
            isNull(leads.deletedAt)
          )
        )
      return {
        agentId: agent.id,
        count: result?.count ?? 0,
      }
    })
  )

  // 3. Trier les agents par volume de leads croissant
  agentLeadCounts.sort((a, b) => a.count - b.count)
  const selectedAgentId = agentLeadCounts[0].agentId

  // 4. Mettre à jour le lead en base de données
  await db
    .update(leads)
    .set({
      agentId: selectedAgentId,
      statut: 'nouveau',
      updatedAt: new Date(),
    })
    .where(eq(leads.id, leadId))

  console.log(`Attribution automatique réussie : Lead ${leadId} attribué à l'agent ${selectedAgentId}`)
  return selectedAgentId
}
