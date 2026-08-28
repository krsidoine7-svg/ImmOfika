import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/index"
import { visites, leads, profiles, biens } from "@/lib/db/schema"
import { eq, and, isNull, desc } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
import { generateICalFeed, ICalExportEvent } from "@/lib/calendar/ical-generator"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await context.params
    if (!agentId) {
      return new NextResponse("ID Agent manquant", { status: 400 })
    }

    const clientProfile = alias(profiles, 'client_profile')

    // Récupérer les informations de l'agent pour nommer l'agenda
    const [agent] = await db
      .select({ fullName: profiles.fullName })
      .from(profiles)
      .where(eq(profiles.id, agentId))

    const calendarName = agent ? `Visites — ${agent.fullName}` : "Visites ImmOfika"

    // Récupérer les visites de l'agent
    const visitesList = await db
      .select({
        id: visites.id,
        dateVisite: visites.dateVisite,
        statut: visites.statut,
        commentaires: visites.commentaires,
        bienTitre: biens.titre,
        bienVille: biens.ville,
        bienQuartier: biens.quartier,
        leadNom: leads.nom,
        leadPrenom: leads.prenom,
        leadPhone: leads.telephone,
        clientName: clientProfile.fullName,
        clientPhone: clientProfile.phone,
      })
      .from(visites)
      .innerJoin(biens, eq(visites.bienId, biens.id))
      .leftJoin(leads, eq(visites.leadId, leads.id))
      .leftJoin(clientProfile, eq(visites.clientId, clientProfile.id))
      .where(
        and(
          eq(visites.agentId, agentId),
          isNull(visites.deletedAt)
        )
      )
      .orderBy(desc(visites.dateVisite))

    const exportEvents: ICalExportEvent[] = visitesList.map((row) => {
      const start = new Date(row.dateVisite)
      // Durée par défaut : 1 heure
      const end = new Date(start.getTime() + 60 * 60 * 1000)

      const contactName = row.clientName || [row.leadPrenom, row.leadNom].filter(Boolean).join(" ") || "Client Anonyme"
      const contactPhone = row.clientPhone || row.leadPhone || "Non renseigné"

      let status: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED' = 'CONFIRMED'
      if (row.statut === 'annulee' || row.statut === 'client_absent') {
        status = 'CANCELLED'
      } else if (row.statut === 'planifiee') {
        status = 'TENTATIVE'
      }

      const description = [
        `Client / Prospect : ${contactName}`,
        `Téléphone : ${contactPhone}`,
        `Statut : ${row.statut.toUpperCase()}`,
        row.commentaires ? `Commentaires : ${row.commentaires}` : null
      ].filter(Boolean).join("\\n")

      const location = [row.bienTitre, row.bienQuartier, row.bienVille, "Côte d'Ivoire"].filter(Boolean).join(", ")

      return {
        id: row.id,
        start,
        end,
        summary: `Visite : ${row.bienTitre}`,
        description,
        location,
        status,
      }
    })

    const icsContent = generateICalFeed(exportEvents, calendarName)

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="visites-${agentId}.ics"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error: any) {
    console.error("[iCal Export Error]", error)
    return new NextResponse("Erreur lors de la génération de l'agenda", { status: 500 })
  }
}
