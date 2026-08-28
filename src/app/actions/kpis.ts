'use server'

import { db } from "@/lib/db/index"
import { leads, profiles, biens, reservations, paiements, visites, agentCalendriers, agentIndisponibilites, systemSettings } from "@/lib/db/schema"
import { eq, and, gte, lte, isNull, sql, inArray } from "drizzle-orm"
import { requirePermission } from "@/lib/auth/permissions"
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfQuarter, 
  endOfQuarter, 
  startOfYear, 
  endOfYear,
  subMonths,
  format
} from "date-fns"

export type PeriodFilter = 'cette_semaine' | 'ce_mois' | 'ce_trimestre' | 'annee' | 'tout' | 'custom'

export interface KPIParams {
  period: PeriodFilter
  startDate?: string
  endDate?: string
}

function resolvePeriodDates(params: KPIParams) {
  const now = new Date()
  let from: Date | null = null
  let to: Date | null = null

  switch (params.period) {
    case 'cette_semaine':
      from = startOfWeek(now, { weekStartsOn: 1 })
      to = endOfWeek(now, { weekStartsOn: 1 })
      break
    case 'ce_mois':
      from = startOfMonth(now)
      to = endOfMonth(now)
      break
    case 'ce_trimestre':
      from = startOfQuarter(now)
      to = endOfQuarter(now)
      break
    case 'annee':
      from = startOfYear(now)
      to = endOfYear(now)
      break
    case 'custom':
      from = params.startDate ? new Date(params.startDate) : null
      to = params.endDate ? new Date(params.endDate) : null
      break
    case 'tout':
    default:
      from = null
      to = null
      break
  }
  return { from, to }
}

async function getAgentKPIsForPeriod(agentId: string, from: Date | null, to: Date | null) {
  const now = new Date()
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
  const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const activeFrom = from || startOfCurrentMonth
  const activeTo = to || endOfCurrentMonth

  let calcFrom = activeFrom
  let calcTo = activeTo
  if (calcTo.getTime() - calcFrom.getTime() > 92 * 24 * 60 * 60 * 1000) {
    calcFrom = new Date(calcTo.getTime() - 90 * 24 * 60 * 60 * 1000)
  }

  // 1. Charger toutes les visites de l'agent sur la période active
  const agentVisits = await db
    .select({
      id: visites.id,
      dateVisite: visites.dateVisite,
      statut: visites.statut
    })
    .from(visites)
    .where(and(
      eq(visites.agentId, agentId),
      isNull(visites.deletedAt),
      gte(visites.dateVisite, activeFrom),
      lte(visites.dateVisite, activeTo)
    ))

  const totalHonorees = agentVisits.filter(v => v.statut === 'effectuee').length
  const totalAnnulees = agentVisits.filter(v => v.statut === 'annulee').length
  const totalHoursField = totalHonorees // 1h par visite honorée

  // 2. Charger les indisponibilités locales sur la période calc
  const localAbsences = await db
    .select()
    .from(agentIndisponibilites)
    .where(and(
      eq(agentIndisponibilites.agentId, agentId),
      isNull(agentIndisponibilites.deletedAt),
      gte(agentIndisponibilites.dateFin, calcFrom),
      lte(agentIndisponibilites.dateDebut, calcTo)
    ))

  // 3. Charger le calendrier iCal
  const listCal = await db
    .select()
    .from(agentCalendriers)
    .where(and(
      eq(agentCalendriers.agentId, agentId),
      isNull(agentCalendriers.deletedAt)
    ))
    .limit(1)

  const cal = listCal[0]
  let googleEvents: any[] = []
  if (cal?.icalUrl) {
    try {
      const { fetchAgentICalEvents } = await import("./disponibilites")
      const events = await fetchAgentICalEvents(cal.icalUrl)
      googleEvents = events.filter(e => e.end > calcFrom && e.start < calcTo)
    } catch (e) {
      console.warn(`[Agent ${agentId}] Erreur fetch iCal :`, e)
    }
  }

  // 4. Générer les slots de travail
  const workingSlots: { start: Date; end: Date }[] = []
  const cursor = new Date(calcFrom)
  cursor.setHours(0, 0, 0, 0)
  const endLimit = new Date(calcTo)

  while (cursor <= endLimit) {
    const dayOfWeek = cursor.getDay()
    if (dayOfWeek !== 0) { // Pas le dimanche
      const year = cursor.getFullYear()
      const month = cursor.getMonth()
      const day = cursor.getDate()
      const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
      for (const h of hours) {
        const slotStart = new Date(year, month, day, h, 0, 0)
        const slotEnd = new Date(year, month, day, h + 1, 0, 0)
        if (slotStart >= calcFrom && slotEnd <= calcTo) {
          workingSlots.push({ start: slotStart, end: slotEnd })
        }
      }
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  const totalWorkingHours = workingSlots.length

  let occupiedHours = 0
  for (const slot of workingSlots) {
    let occupied = false

    const hasVisit = agentVisits.some(v => {
      if (!['planifiee', 'confirmee', 'effectuee'].includes(v.statut)) return false
      const vStart = new Date(v.dateVisite)
      const vEnd = new Date(vStart.getTime() + 60 * 60 * 1000)
      return vStart < slot.end && vEnd > slot.start
    })
    if (hasVisit) occupied = true

    if (!occupied) {
      const hasAbsence = localAbsences.some(abs => {
        const absStart = new Date(abs.dateDebut)
        const absFin = new Date(abs.dateFin)
        return absStart < slot.end && absFin > slot.start
      })
      if (hasAbsence) occupied = true
    }

    if (!occupied) {
      const hasGoogle = googleEvents.some(ge => {
        return ge.start < slot.end && ge.end > slot.start
      })
      if (hasGoogle) occupied = true
    }

    if (occupied) {
      occupiedHours++
    }
  }

  const occupationRate = totalWorkingHours > 0
    ? Math.min(Math.round((occupiedHours / totalWorkingHours) * 100), 100)
    : 0

  return {
    occupationRate,
    occupiedHours,
    totalWorkingHours,
    totalHonorees,
    totalAnnulees,
    totalHoursField
  }
}

export async function getDashboardKPIsAction(params: KPIParams) {
  const { hasPermission } = await import("@/lib/auth/permissions")
  const canView = await hasPermission('view:paiements')
  
  if (!canView) {
    const { getAgentKPIsAction } = await import("./disponibilites")
    const agentKpisRes = await getAgentKPIsAction()
    
    return {
      notAuthorized: true,
      agentKPIs: agentKpisRes.success ? agentKpisRes.kpis : null,
      kpis: {
        totalRevenue: 0,
        periodRevenue: 0,
        totalLeads: 0,
        conversionRate: 0,
        expirationRate: 0,
        totalVisits: 0,
      },
      revenueHistory: [],
      pipelineDistribution: [],
      geographicDemand: [],
      agentPerformance: []
    }
  }

  const { from, to } = resolvePeriodDates(params)

  // Construction des conditions temporelles pour chaque table
  const paymentConditions = [eq(paiements.statut, 'paye'), isNull(paiements.deletedAt)]
  const leadConditions = [isNull(leads.deletedAt)]
  const reservationConditions = [isNull(reservations.deletedAt)]
  const visitConditions = [isNull(visites.deletedAt)]

  if (from) {
    paymentConditions.push(gte(paiements.paidAt, from))
    leadConditions.push(gte(leads.createdAt, from))
    reservationConditions.push(gte(reservations.createdAt, from))
    visitConditions.push(gte(visites.dateVisite, from))
  }
  if (to) {
    paymentConditions.push(lte(paiements.paidAt, to))
    leadConditions.push(lte(leads.createdAt, to))
    reservationConditions.push(lte(reservations.createdAt, to))
    visitConditions.push(lte(visites.dateVisite, to))
  }

  // 1. Chiffre d'Affaires Global et CA de la Période
  const [[totalRevData], [periodRevData]] = await Promise.all([
    db.select({ sum: sql<string>`coalesce(sum(${paiements.montant}), '0')` })
      .from(paiements)
      .where(and(eq(paiements.statut, 'paye'), isNull(paiements.deletedAt))),
    db.select({ sum: sql<string>`coalesce(sum(${paiements.montant}), '0')` })
      .from(paiements)
      .where(and(...paymentConditions))
  ])

  const totalRevenue = parseFloat(totalRevData?.sum || '0')
  const periodRevenue = parseFloat(periodRevData?.sum || '0')

  // 2. Leads (Total et Conversion)
  const [[leadsTotalData], [leadsConvertedData]] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .where(and(...leadConditions)),
    db.select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .where(and(...leadConditions, eq(leads.etape, 'vente_finalisee')))
  ])

  const totalLeads = leadsTotalData?.count || 0
  const convertedLeads = leadsConvertedData?.count || 0
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0

  // 3. Réservations et Taux d'Expiration
  const [[resTotalData], [resExpiredData]] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` })
      .from(reservations)
      .where(and(...reservationConditions)),
    db.select({ count: sql<number>`count(*)::int` })
      .from(reservations)
      .where(and(...reservationConditions, eq(reservations.statut, 'expire')))
  ])

  const totalReservations = resTotalData?.count || 0
  const expiredReservations = resExpiredData?.count || 0
  const expirationRate = totalReservations > 0 ? Math.round((expiredReservations / totalReservations) * 100) : 0

  // 4. Visites Physiques menées
  const [visTotalData] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(visites)
    .where(and(...visitConditions, eq(visites.statut, 'effectuee')))

  const totalVisits = visTotalData?.count || 0

  // 5. Distribution du Pipeline (Étapes)
  const pipelineStats = await db
    .select({
      etape: leads.etape,
      count: sql<number>`count(*)::int`
    })
    .from(leads)
    .where(and(...leadConditions))
    .groupBy(leads.etape)

  // 6. Répartition Géographique (Top Quartiers demandés)
  const geoStats = await db
    .select({
      quartier: biens.quartier,
      ville: biens.ville,
      count: sql<number>`count(*)::int`
    })
    .from(leads)
    .innerJoin(biens, eq(leads.bienInteresse, biens.id))
    .where(and(...leadConditions, isNull(biens.deletedAt)))
    .groupBy(biens.quartier, biens.ville)
    .orderBy(sql`count(*) desc`)
    .limit(10)

  const geographicDemand = geoStats.map(stat => ({
    zone: stat.quartier ? `${stat.quartier} (${stat.ville})` : stat.ville,
    count: stat.count,
    pourcentage: totalLeads > 0 ? Math.round((stat.count / totalLeads) * 100) : 0
  }))

  // 7. Historique mensuel du CA (12 derniers mois glissants)
  const pastYearDate = subMonths(new Date(), 11)
  pastYearDate.setDate(1) // Début de mois il y a 11 mois

  const revenueHistoryData = await db
    .select({
      monthYear: sql<string>`to_char(${paiements.paidAt}, 'YYYY-MM')`,
      sum: sql<string>`sum(${paiements.montant})`
    })
    .from(paiements)
    .where(and(
      eq(paiements.statut, 'paye'),
      isNull(paiements.deletedAt),
      gte(paiements.paidAt, pastYearDate)
    ))
    .groupBy(sql`to_char(${paiements.paidAt}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${paiements.paidAt}, 'YYYY-MM')`)

  // Construire la liste des 12 derniers mois avec des valeurs par défaut à 0
  const monthsList: { mois: string; ca: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = subMonths(new Date(), i)
    const formatted = format(d, 'yyyy-MM')
    const match = revenueHistoryData.find(h => h.monthYear === formatted)
    
    // Format français (ex: "Juin 2026")
    const frFormat = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    const label = frFormat.charAt(0).toUpperCase() + frFormat.slice(1)

    monthsList.push({
      mois: label,
      ca: match ? parseFloat(match.sum || '0') : 0,
    })
  }

  // 8. Performance des Agents
  // Sélectionner tous les profils de type 'agent' ou 'admin'
  const agentsList = await db
    .select({
      id: profiles.id,
      fullName: profiles.fullName,
      email: profiles.email,
      avatarUrl: profiles.avatarUrl
    })
    .from(profiles)
    .where(and(
      inArray(profiles.role, ['admin_agent', 'admin', 'admin_manager']),
      isNull(profiles.deletedAt)
    ))

  const agentPerformance = await Promise.all(
    agentsList.map(async (agent) => {
      const [[leadsCount], [visCount], [salesCount]] = await Promise.all([
        db.select({ count: sql<number>`count(*)::int` })
          .from(leads)
          .where(and(...leadConditions, eq(leads.agentId, agent.id))),
        db.select({ count: sql<number>`count(*)::int` })
          .from(visites)
          .where(and(...visitConditions, eq(visites.agentId, agent.id), eq(visites.statut, 'effectuee'))),
        db.select({ count: sql<number>`count(*)::int` })
          .from(leads)
          .where(and(...leadConditions, eq(leads.agentId, agent.id), eq(leads.etape, 'vente_finalisee')))
      ])

      const leadsAssignes = leadsCount?.count || 0
      const ventesCloses = salesCount?.count || 0
      const tauxConversion = leadsAssignes > 0 ? Math.round((ventesCloses / leadsAssignes) * 100) : 0

      // Calculer les KPIs additionnels sur la même période filtrée
      const agentKpis = await getAgentKPIsForPeriod(agent.id, from, to)

      return {
        agentId: agent.id,
        nom: agent.fullName || agent.email.split('@')[0],
        email: agent.email,
        avatar: agent.avatarUrl,
        leadsAssignes,
        visitesEffectuees: visCount?.count || 0,
        ventesCloses,
        tauxConversion,
        
        // Nouveaux KPIs
        occupationRate: agentKpis.occupationRate,
        occupiedHours: agentKpis.occupiedHours,
        totalWorkingHours: agentKpis.totalWorkingHours,
        totalHonorees: agentKpis.totalHonorees,
        totalAnnulees: agentKpis.totalAnnulees,
        totalHoursField: agentKpis.totalHoursField
      }
    })
  )

  // Load cookie stats for super admins
  const { createClient } = await import("@/utils/supabase/server")
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  let cookieStats = null
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      
    if (profile?.role === 'admin' || profile?.role === 'super_admin' || profile?.role === 'tech_super_admin') {
      const { cookieConsents } = await import("@/lib/db/schema")
      const rows = await db
        .select({
          consent: cookieConsents.consent,
          count: sql<number>`count(*)::int`
        })
        .from(cookieConsents)
        .groupBy(cookieConsents.consent)
        
      cookieStats = { accepted: 0, declined: 0 }
      for (const row of rows) {
        if (row.consent === 'accepted') cookieStats.accepted = row.count
        if (row.consent === 'declined') cookieStats.declined = row.count
      }
    }
  }

  return {
    cookieStats,
    kpis: {
      totalRevenue,
      periodRevenue,
      totalLeads,
      conversionRate,
      expirationRate,
      totalVisits,
    },
    revenueHistory: monthsList,
    pipelineDistribution: pipelineStats,
    geographicDemand,
    agentPerformance
  }
}

export async function exportDashboardDataAction(params: KPIParams, formatType: 'xlsx' | 'csv') {
  const { hasPermission } = await import("@/lib/auth/permissions")
  const canView = await hasPermission('view:paiements')
  if (!canView) throw new Error("Non autorisé à exporter les rapports financiers.")
  
  const data = await getDashboardKPIsAction(params)
  
  if (formatType === 'csv') {
    let csvContent = "\uFEFF"
    csvContent += "Chiffre d'Affaires total;Chiffre d'Affaires periode;Leads total;Taux de conversion;Taux d'expiration;Visites physiques\n"
    csvContent += `${data.kpis.totalRevenue};${data.kpis.periodRevenue};${data.kpis.totalLeads};${data.kpis.conversionRate}%;${data.kpis.expirationRate}%;${data.kpis.totalVisits}\n\n`
    
    csvContent += "REPARTITION GEOGRAPHIQUE\nZone;Nombre de Leads;Pourcentage\n"
    data.geographicDemand.forEach(item => {
      csvContent += `"${item.zone.replace(/"/g, '""')}";${item.count};${item.pourcentage}%\n`
    })
    
    csvContent += "\nHISTORIQUE MENSUEL DU CA\nMois;Chiffre d'affaires\n"
    data.revenueHistory.forEach(item => {
      csvContent += `"${item.mois}";${item.ca}\n`
    })

    csvContent += "\nPERFORMANCE DES AGENTS\nNom;Email;Leads Assignes;Visites Honorees;Visites Annulees;Heures Terrain;Taux Occupation;Ventes Closes;Taux de Conversion\n"
    data.agentPerformance.forEach(agent => {
      csvContent += `"${agent.nom.replace(/"/g, '""')}";"${agent.email.replace(/"/g, '""')}";${agent.leadsAssignes};${agent.totalHonorees};${agent.totalAnnulees};${agent.totalHoursField};${agent.occupationRate}%;${agent.ventesCloses};${agent.tauxConversion}%\n`
    })

    return {
      success: true,
      filename: `Rapport_CRM_FavorCompany_${new Date().toISOString().split('T')[0]}.csv`,
      data: Buffer.from(csvContent).toString('base64'),
      mimeType: 'text/csv;charset=utf-8;'
    }
  } else {
    const ExcelJS = await import('exceljs')
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'ImmOfika'
    workbook.created = new Date()

    const ws = workbook.addWorksheet('Rapport CRM', {
      properties: { tabColor: { argb: '10B981' } }
    })

    const BLEU_NUIT = '1A2A4A'
    const OR = '10B981'
    const OR_CLAIR = 'ECFDF5'
    const BLANC = 'FFFFFF'

    ws.columns = [
      { key: 'A', width: 25 },
      { key: 'B', width: 28 },
      { key: 'C', width: 16 },
      { key: 'D', width: 16 },
      { key: 'E', width: 16 },
      { key: 'F', width: 18 },
      { key: 'G', width: 18 },
      { key: 'H', width: 18 },
      { key: 'I', width: 18 }
    ]

    ws.mergeCells('A1:I1')
    const titleCell = ws.getCell('A1')
    titleCell.value = 'IMMOFIKA — RAPPORT CRM & KPIs'
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: BLANC } }
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLEU_NUIT } }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    ws.getRow(1).height = 36

    ws.mergeCells('A2:I2')
    const metaCell = ws.getCell('A2')
    metaCell.value = `Genere le ${new Date().toLocaleDateString('fr-FR')} — Periode : ${params.period}`
    metaCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: BLANC } }
    metaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: OR } }
    metaCell.alignment = { horizontal: 'center', vertical: 'middle' }
    ws.getRow(2).height = 20

    ws.addRow([])

    ws.addRow(['INDICATEURS CLES']).font = { name: 'Calibri', size: 12, bold: true, color: { argb: BLEU_NUIT } }
    ws.addRow(['Indicateur', 'Valeur'])
    ws.addRow(['CA de la periode', data.kpis.periodRevenue])
    ws.getCell('B6').numFmt = '#,##0 "FCFA"'
    ws.addRow(['CA Total historique', data.kpis.totalRevenue])
    ws.getCell('B7').numFmt = '#,##0 "FCFA"'
    ws.addRow(['Total des Leads', data.kpis.totalLeads])
    ws.addRow(['Taux de conversion global', `${data.kpis.conversionRate}%`])
    ws.addRow(['Taux d\'expiration des res.', `${data.kpis.expirationRate}%`])
    ws.addRow(['Visites physiques menees', data.kpis.totalVisits])

    for (let r = 5; r <= 11; r++) {
      ws.getRow(r).eachCell((cell) => {
        cell.font = { name: 'Calibri', size: 10, bold: r === 5 }
        if (r === 5) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLEU_NUIT } }
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: BLANC } }
          cell.alignment = { horizontal: 'center' }
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: r % 2 === 0 ? OR_CLAIR : BLANC } }
        }
        cell.border = { bottom: { style: 'thin', color: { argb: 'D1D5DB' } } }
      })
    }

    ws.addRow([])
    ws.addRow([])

    const startAgentRow = 14
    ws.addRow(['PERFORMANCE DES AGENTS']).font = { name: 'Calibri', size: 12, bold: true, color: { argb: BLEU_NUIT } }
    ws.addRow(['Nom', 'Email', 'Leads Assignés', 'Visites Honorées', 'Visites Annulées', 'Temps Terrain (h)', 'Taux Occupation', 'Ventes Closes', 'Taux de Conversion'])
    
    data.agentPerformance.forEach(agent => {
      ws.addRow([
        agent.nom, 
        agent.email, 
        agent.leadsAssignes, 
        agent.totalHonorees, 
        agent.totalAnnulees, 
        agent.totalHoursField, 
        `${agent.occupationRate}%`, 
        agent.ventesCloses, 
        `${agent.tauxConversion}%`
      ])
    })

    const endAgentRow = startAgentRow + 2 + data.agentPerformance.length
    for (let r = startAgentRow + 1; r < endAgentRow; r++) {
      ws.getRow(r).eachCell((cell) => {
        cell.font = { name: 'Calibri', size: 10, bold: r === startAgentRow + 1 }
        if (r === startAgentRow + 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLEU_NUIT } }
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: BLANC } }
          cell.alignment = { horizontal: 'center' }
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: r % 2 === 0 ? OR_CLAIR : BLANC } }
        }
        cell.border = { bottom: { style: 'thin', color: { argb: 'D1D5DB' } } }
      })
    }

    ws.addRow([])
    ws.addRow([])
    const startGeoRow = endAgentRow + 2
    ws.addRow(['REPARTITION GEOGRAPHIQUE']).font = { name: 'Calibri', size: 12, bold: true, color: { argb: BLEU_NUIT } }
    ws.addRow(['Zone (Quartier/Ville)', 'Nombre de Leads', 'Pourcentage'])

    data.geographicDemand.forEach(geo => {
      ws.addRow([geo.zone, geo.count, `${geo.pourcentage}%`])
    })

    const endGeoRow = startGeoRow + 2 + data.geographicDemand.length
    for (let r = startGeoRow + 1; r < endGeoRow; r++) {
      ws.getRow(r).eachCell((cell) => {
        cell.font = { name: 'Calibri', size: 10, bold: r === startGeoRow + 1 }
        if (r === startGeoRow + 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLEU_NUIT } }
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: BLANC } }
          cell.alignment = { horizontal: 'center' }
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: r % 2 === 0 ? OR_CLAIR : BLANC } }
        }
        cell.border = { bottom: { style: 'thin', color: { argb: 'D1D5DB' } } }
      })
    }

    const buffer = await workbook.xlsx.writeBuffer()
    return {
      success: true,
      filename: `Rapport_CRM_FavorCompany_${new Date().toISOString().split('T')[0]}.xlsx`,
      data: Buffer.from(buffer).toString('base64'),
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  }
}
