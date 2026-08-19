import { NextResponse } from 'next/server'
import { db } from "@/lib/db"
import { paiements, profiles, reservations, biens } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { checkAdminAccess } from "@/lib/auth/permissions"
import ExcelJS from 'exceljs'

// ─── Palette de couleurs Favor Company ────────────────────────────────────────
const BLEU_NUIT   = '1A2A4A'   // Bleu nuit (branding principal)
const OR          = 'C9A84C'   // Or Favor
const OR_CLAIR    = 'FDF6DC'   // Or clair (lignes alternées)
const BLANC       = 'FFFFFF'
const VERT        = 'D1FAE5'   // Vert pâle (statut payé)
const ROUGE       = 'FEE2E2'   // Rouge pâle (statut échoué)
const AMBER       = 'FEF3C7'   // Ambre pâle (statut en attente)
const VIOLET      = 'EDE9FE'   // Violet pâle (remboursé)
const VERT_EMERAUDE = '10B981' // Vert succès premium pour indicateurs

// ─── Outils Graphiques Textuels (Sparklines/Progress Bar en Unicode) ──────────
function getProgressBar(value: number, max: number, length = 8): string {
  if (!max || max === 0 || isNaN(value)) return '░░░░░░░░ 0%';
  const percent = Math.min(Math.max(value / max, 0), 1);
  const filledLength = Math.round(percent * length);
  const emptyLength = length - filledLength;
  const pctStr = `${Math.round(percent * 100)}%`;
  return '█'.repeat(filledLength) + '░'.repeat(emptyLength) + ` ${pctStr}`;
}

// ─── Helper de génération de cartes KPI ──────────────────────────────────────
function drawKpiCard(
  ws: ExcelJS.Worksheet,
  startColLetter: string,
  endColLetter: string,
  label: string,
  value: number,
  subtext: string,
  valColor: string,
  isMoney = false,
  isPercent = false
) {
  const rangeTitle = `${startColLetter}4:${endColLetter}4`
  const rangeVal = `${startColLetter}5:${endColLetter}5`
  const rangeSub = `${startColLetter}6:${endColLetter}6`
  
  ws.mergeCells(rangeTitle)
  ws.mergeCells(rangeVal)
  ws.mergeCells(rangeSub)
  
  const cellTitle = ws.getCell(`${startColLetter}4`)
  cellTitle.value = label
  cellTitle.font = { name: 'Calibri', size: 9, bold: true, color: { argb: '71717A' } }
  cellTitle.alignment = { horizontal: 'center', vertical: 'middle' }
  
  const cellVal = ws.getCell(`${startColLetter}5`)
  cellVal.value = value
  cellVal.font = { name: 'Calibri', size: 18, bold: true, color: { argb: valColor } }
  cellVal.alignment = { horizontal: 'center', vertical: 'middle' }
  
  if (isMoney) {
    cellVal.numFmt = '#,##0 "FCFA"'
  } else if (isPercent) {
    cellVal.numFmt = '0.0%'
  } else {
    cellVal.numFmt = '#,##0'
  }
  
  const cellSub = ws.getCell(`${startColLetter}6`)
  cellSub.value = subtext
  cellSub.font = { name: 'Calibri', size: 9, italic: true, color: { argb: '71717A' } }
  cellSub.alignment = { horizontal: 'center', vertical: 'middle' }
  
  const startColCode = startColLetter.charCodeAt(0)
  const endColCode = endColLetter.charCodeAt(0)
  
  for (let r = 4; r <= 6; r++) {
    for (let c = startColCode; c <= endColCode; c++) {
      const cell = ws.getCell(`${String.fromCharCode(c)}${r}`)
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F9FAFB' } }
      
      const border: any = {}
      if (r === 4) border.top = { style: 'thin', color: { argb: 'E4E4E7' } }
      if (r === 6) border.bottom = { style: 'thin', color: { argb: 'E4E4E7' } }
      if (c === startColCode) border.left = { style: 'thin', color: { argb: 'E4E4E7' } }
      if (c === endColCode) border.right = { style: 'thin', color: { argb: 'E4E4E7' } }
      
      cell.border = border
    }
  }
}

export async function GET() {
  const hasAccess = await checkAdminAccess()
  if (!hasAccess) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ─── Récupération des données ────────────────────────────────────────────
  const allPaiements = await db
    .select({
      id: paiements.id,
      factureNumero: paiements.factureNumero,
      montant: paiements.montant,
      devise: paiements.devise,
      statut: paiements.statut,
      typePaiement: paiements.typePaiement,
      paystackReference: paiements.paystackReference,
      paystackChannel: paiements.paystackChannel,
      paidAt: paiements.paidAt,
      createdAt: paiements.createdAt,
      clientName: profiles.fullName,
      clientEmail: profiles.email,
      clientPhone: profiles.phone,
      bienTitre: biens.titre,
      bienVille: biens.ville,
      bienType: biens.type,
    })
    .from(paiements)
    .leftJoin(profiles, eq(paiements.clientId, profiles.id))
    .leftJoin(reservations, eq(paiements.reservationId, reservations.id))
    .leftJoin(biens, eq(reservations.bienId, biens.id))
    .orderBy(desc(paiements.createdAt))

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Favor Company International'
  workbook.lastModifiedBy = 'Système FavorCI'
  workbook.created = new Date()
  workbook.modified = new Date()

  // ─── Agrégations pour le Tableau de Bord ──────────────────────────────────
  const totalTransactions = allPaiements.length
  
  // Total payé (revenus) et en attente
  const totalPaye = allPaiements
    .filter(p => p.statut === 'paye')
    .reduce((sum, p) => sum + parseFloat(p.montant || '0'), 0)
    
  const totalAttente = allPaiements
    .filter(p => p.statut === 'en_attente')
    .reduce((sum, p) => sum + parseFloat(p.montant || '0'), 0)
    
  const payesCount = allPaiements.filter(p => p.statut === 'paye').length
  const attenteCount = allPaiements.filter(p => p.statut === 'en_attente').length
  const echouesCount = allPaiements.filter(p => p.statut === 'echoue').length
  const rembourseCount = allPaiements.filter(p => p.statut === 'rembourse').length
  
  const tauxReussite = totalTransactions > 0 ? (payesCount / totalTransactions) : 0

  // 1. Répartition par Ville (uniquement paiements payés)
  const villesMap: Record<string, { count: number, total: number }> = {}
  allPaiements.forEach(p => {
    if (p.statut !== 'paye') return
    const ville = p.bienVille || 'Non défini'
    const montant = parseFloat(p.montant || '0')
    if (!villesMap[ville]) {
      villesMap[ville] = { count: 0, total: 0 }
    }
    villesMap[ville].count += 1
    villesMap[ville].total += montant
  })
  const villesBreakdown = Object.entries(villesMap)
    .map(([ville, data]) => ({ ville, ...data }))
    .sort((a, b) => b.total - a.total)

  // 2. Répartition par Type de Bien (uniquement payés)
  const typesMap: Record<string, { count: number, total: number }> = {}
  allPaiements.forEach(p => {
    if (p.statut !== 'paye') return
    const type = p.bienType || 'Non défini'
    const montant = parseFloat(p.montant || '0')
    if (!typesMap[type]) {
      typesMap[type] = { count: 0, total: 0 }
    }
    typesMap[type].count += 1
    typesMap[type].total += montant
  })
  const typesBreakdown = Object.entries(typesMap)
    .map(([type, data]) => ({ type, ...data }))
    .sort((a, b) => b.total - a.total)

  // 3. Répartition par Statut (toutes transactions)
  const statusMap: Record<string, { count: number, total: number }> = {}
  allPaiements.forEach(p => {
    const status = p.statut || 'Inconnu'
    const montant = parseFloat(p.montant || '0')
    if (!statusMap[status]) {
      statusMap[status] = { count: 0, total: 0 }
    }
    statusMap[status].count += 1
    statusMap[status].total += montant
  })
  const statusLabels: Record<string, string> = {
    paye: 'Payé',
    en_attente: 'En attente',
    echoue: 'Échoué',
    rembourse: 'Remboursé'
  }
  const statusBreakdown = Object.entries(statusMap)
    .map(([status, data]) => ({
      status: statusLabels[status] || status,
      ...data
    }))
    .sort((a, b) => b.total - a.total)

  // ══════════════════════════════════════════════════════════════════════════
  // FEUILLE 1 — TABLEAU DE BORD DYNAMIQUE
  // ══════════════════════════════════════════════════════════════════════════
  const wsSummary = workbook.addWorksheet('Tableau de Bord', {
    properties: { tabColor: { argb: OR } },
  })

  // Largeurs des colonnes du Dashboard
  wsSummary.columns = [
    { key: 'A', width: 3 },
    { key: 'B', width: 16 }, // Ville
    { key: 'C', width: 11 }, // Paiements
    { key: 'D', width: 16 }, // Total (FCFA)
    { key: 'E', width: 15 }, // Part / Barre
    { key: 'F', width: 4 },  // Spacer
    { key: 'G', width: 16 }, // Type
    { key: 'H', width: 11 }, // Paiements
    { key: 'I', width: 16 }, // Total (FCFA)
    { key: 'J', width: 15 }, // Part / Barre
    { key: 'K', width: 4 },  // Spacer
    { key: 'L', width: 16 }, // Statut
    { key: 'M', width: 11 }, // Paiements
    { key: 'N', width: 16 }, // Montant (FCFA)
    { key: 'O', width: 15 }, // Part / Barre
  ]

  // En-têtes de titre
  wsSummary.mergeCells('B1:O1')
  const titleCell = wsSummary.getCell('B1')
  titleCell.value = 'FAVOR COMPANY — TABLEAU DE BORD DES PAIEMENTS'
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: BLANC } }
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLEU_NUIT } }
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  wsSummary.getRow(1).height = 36

  wsSummary.mergeCells('B2:O2')
  const subCell = wsSummary.getCell('B2')
  subCell.value = `Généré le ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} — Données Consolideés de Vente`
  subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: BLANC } }
  subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: OR } }
  subCell.alignment = { horizontal: 'center', vertical: 'middle' }
  wsSummary.getRow(2).height = 22

  // Dessin des 3 cartes KPI alignées sur la grille
  drawKpiCard(wsSummary, 'B', 'E', 'REVENUS CONFIRMÉS', totalPaye, 'Chiffre d\'affaires net encaissé (FCFA)', BLEU_NUIT, true, false)
  drawKpiCard(wsSummary, 'G', 'J', 'TAUX DE RÉUSSITE', tauxReussite, `${payesCount} payés sur ${totalTransactions} transactions`, VERT_EMERAUDE, false, true)
  drawKpiCard(wsSummary, 'L', 'O', 'TRANSACTIONS ENREGISTRÉES', totalTransactions, `${attenteCount} en attente, ${echouesCount} échouées`, OR, false, false)

  wsSummary.getRow(4).height = 18
  wsSummary.getRow(5).height = 28
  wsSummary.getRow(6).height = 18

  // Titres des 3 sections analytiques à la ligne 8
  wsSummary.mergeCells('B8:E8')
  const t1 = wsSummary.getCell('B8')
  t1.value = 'REVENUS PAR VILLE'
  t1.font = { name: 'Calibri', size: 11, bold: true, color: { argb: BLEU_NUIT } }
  t1.alignment = { horizontal: 'center', vertical: 'middle' }

  wsSummary.mergeCells('G8:J8')
  const t2 = wsSummary.getCell('G8')
  t2.value = 'REVENUS PAR TYPE DE BIEN'
  t2.font = { name: 'Calibri', size: 11, bold: true, color: { argb: BLEU_NUIT } }
  t2.alignment = { horizontal: 'center', vertical: 'middle' }

  wsSummary.mergeCells('L8:O8')
  const t3 = wsSummary.getCell('L8')
  t3.value = 'TRANSACTIONS PAR STATUT'
  t3.font = { name: 'Calibri', size: 11, bold: true, color: { argb: BLEU_NUIT } }
  t3.alignment = { horizontal: 'center', vertical: 'middle' }

  wsSummary.getRow(8).height = 24

  // En-têtes des tableaux à la ligne 9
  const row9 = wsSummary.getRow(9)
  row9.height = 24

  // Table 1
  wsSummary.getCell('B9').value = 'Ville'
  wsSummary.getCell('C9').value = 'Paiements'
  wsSummary.getCell('D9').value = 'Total (FCFA)'
  wsSummary.getCell('E9').value = 'Part share'

  // Table 2
  wsSummary.getCell('G9').value = 'Type de Bien'
  wsSummary.getCell('H9').value = 'Paiements'
  wsSummary.getCell('I9').value = 'Total (FCFA)'
  wsSummary.getCell('J9').value = 'Part share'

  // Table 3
  wsSummary.getCell('L9').value = 'Statut'
  wsSummary.getCell('M9').value = 'Paiements'
  wsSummary.getCell('N9').value = 'Montant (FCFA)'
  wsSummary.getCell('O9').value = 'Part share'

  // Style commun pour la ligne d'en-tête des tableaux
  const tableCols = [
    'B', 'C', 'D', 'E',
    'G', 'H', 'I', 'J',
    'L', 'M', 'N', 'O'
  ]
  tableCols.forEach(col => {
    const cell = wsSummary.getCell(`${col}9`)
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: BLANC } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLEU_NUIT } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = {
      top: { style: 'thin', color: { argb: BLEU_NUIT } },
      bottom: { style: 'medium', color: { argb: BLEU_NUIT } }
    }
  })

  // Remplissage dynamique côte-à-côte à partir de la ligne 10
  const maxRows = Math.max(villesBreakdown.length, typesBreakdown.length, statusBreakdown.length, 5)

  for (let i = 0; i < maxRows; i++) {
    const rowNum = 10 + i
    const r = wsSummary.getRow(rowNum)
    r.height = 20
    const isEven = i % 2 === 0
    const bgFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? OR_CLAIR : BLANC } }

    // ─── Ville (Table 1) ───
    const villeItem = villesBreakdown[i]
    if (villeItem) {
      const bar = getProgressBar(villeItem.total, totalPaye)
      
      wsSummary.getCell(`B${rowNum}`).value = villeItem.ville
      wsSummary.getCell(`C${rowNum}`).value = villeItem.count
      wsSummary.getCell(`D${rowNum}`).value = villeItem.total
      wsSummary.getCell(`E${rowNum}`).value = bar

      wsSummary.getCell(`B${rowNum}`).alignment = { horizontal: 'left', vertical: 'middle' }
      wsSummary.getCell(`C${rowNum}`).alignment = { horizontal: 'center', vertical: 'middle' }
      wsSummary.getCell(`D${rowNum}`).alignment = { horizontal: 'right', vertical: 'middle' }
      wsSummary.getCell(`E${rowNum}`).alignment = { horizontal: 'left', vertical: 'middle' }
      wsSummary.getCell(`D${rowNum}`).numFmt = '#,##0 "FCFA"'

      ;['B', 'C', 'D', 'E'].forEach(col => {
        const cell = wsSummary.getCell(`${col}${rowNum}`)
        cell.fill = bgFill
        cell.font = { name: 'Calibri', size: 9 }
        cell.border = { bottom: { style: 'hair', color: { argb: 'D1D5DB' } } }
      })
    } else {
      // Cellules vides si pas de ligne
      ;['B', 'C', 'D', 'E'].forEach(col => {
        const cell = wsSummary.getCell(`${col}${rowNum}`)
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLANC } }
        cell.border = { bottom: { style: 'hair', color: { argb: 'E5E7EB' } } }
      })
    }

    // ─── Type de bien (Table 2) ───
    const typeItem = typesBreakdown[i]
    if (typeItem) {
      const bar = getProgressBar(typeItem.total, totalPaye)

      wsSummary.getCell(`G${rowNum}`).value = typeItem.type
      wsSummary.getCell(`H${rowNum}`).value = typeItem.count
      wsSummary.getCell(`I${rowNum}`).value = typeItem.total
      wsSummary.getCell(`J${rowNum}`).value = bar

      wsSummary.getCell(`G${rowNum}`).alignment = { horizontal: 'left', vertical: 'middle' }
      wsSummary.getCell(`H${rowNum}`).alignment = { horizontal: 'center', vertical: 'middle' }
      wsSummary.getCell(`I${rowNum}`).alignment = { horizontal: 'right', vertical: 'middle' }
      wsSummary.getCell(`J${rowNum}`).alignment = { horizontal: 'left', vertical: 'middle' }
      wsSummary.getCell(`I${rowNum}`).numFmt = '#,##0 "FCFA"'

      ;['G', 'H', 'I', 'J'].forEach(col => {
        const cell = wsSummary.getCell(`${col}${rowNum}`)
        cell.fill = bgFill
        cell.font = { name: 'Calibri', size: 9 }
        cell.border = { bottom: { style: 'hair', color: { argb: 'D1D5DB' } } }
      })
    } else {
      ;['G', 'H', 'I', 'J'].forEach(col => {
        const cell = wsSummary.getCell(`${col}${rowNum}`)
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLANC } }
        cell.border = { bottom: { style: 'hair', color: { argb: 'E5E7EB' } } }
      })
    }

    // ─── Statut (Table 3) ───
    const statusItem = statusBreakdown[i]
    const totalAllMontant = allPaiements.reduce((sum, p) => sum + parseFloat(p.montant || '0'), 0)
    if (statusItem) {
      const bar = getProgressBar(statusItem.total, totalAllMontant)

      wsSummary.getCell(`L${rowNum}`).value = statusItem.status
      wsSummary.getCell(`M${rowNum}`).value = statusItem.count
      wsSummary.getCell(`N${rowNum}`).value = statusItem.total
      wsSummary.getCell(`O${rowNum}`).value = bar

      wsSummary.getCell(`L${rowNum}`).alignment = { horizontal: 'left', vertical: 'middle' }
      wsSummary.getCell(`M${rowNum}`).alignment = { horizontal: 'center', vertical: 'middle' }
      wsSummary.getCell(`N${rowNum}`).alignment = { horizontal: 'right', vertical: 'middle' }
      wsSummary.getCell(`O${rowNum}`).alignment = { horizontal: 'left', vertical: 'middle' }
      wsSummary.getCell(`N${rowNum}`).numFmt = '#,##0 "FCFA"'

      ;['L', 'M', 'N', 'O'].forEach(col => {
        const cell = wsSummary.getCell(`${col}${rowNum}`)
        cell.fill = bgFill
        cell.font = { name: 'Calibri', size: 9 }
        cell.border = { bottom: { style: 'hair', color: { argb: 'D1D5DB' } } }
      })
    } else {
      ;['L', 'M', 'N', 'O'].forEach(col => {
        const cell = wsSummary.getCell(`${col}${rowNum}`)
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLANC } }
        cell.border = { bottom: { style: 'hair', color: { argb: 'E5E7EB' } } }
      })
    }
  }

  // Ligne de Totaux à la fin des tableaux
  const totalRowNum = 10 + maxRows
  const totalRow = wsSummary.getRow(totalRowNum)
  totalRow.height = 22

  // --- Total Table 1 ---
  wsSummary.getCell(`B${totalRowNum}`).value = 'Total'
  wsSummary.getCell(`C${totalRowNum}`).value = payesCount
  wsSummary.getCell(`D${totalRowNum}`).value = totalPaye
  wsSummary.getCell(`E${totalRowNum}`).value = '100.0%'

  wsSummary.getCell(`B${totalRowNum}`).alignment = { horizontal: 'left', vertical: 'middle' }
  wsSummary.getCell(`C${totalRowNum}`).alignment = { horizontal: 'center', vertical: 'middle' }
  wsSummary.getCell(`D${totalRowNum}`).alignment = { horizontal: 'right', vertical: 'middle' }
  wsSummary.getCell(`E${totalRowNum}`).alignment = { horizontal: 'center', vertical: 'middle' }
  wsSummary.getCell(`D${totalRowNum}`).numFmt = '#,##0 "FCFA"'

  ;['B', 'C', 'D', 'E'].forEach(col => {
    const cell = wsSummary.getCell(`${col}${totalRowNum}`)
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: BLEU_NUIT } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E4E4E7' } }
    cell.border = {
      top: { style: 'thin', color: { argb: BLEU_NUIT } },
      bottom: { style: 'double', color: { argb: BLEU_NUIT } }
    }
  })

  // --- Total Table 2 ---
  wsSummary.getCell(`G${totalRowNum}`).value = 'Total'
  wsSummary.getCell(`H${totalRowNum}`).value = payesCount
  wsSummary.getCell(`I${totalRowNum}`).value = totalPaye
  wsSummary.getCell(`J${totalRowNum}`).value = '100.0%'

  wsSummary.getCell(`G${totalRowNum}`).alignment = { horizontal: 'left', vertical: 'middle' }
  wsSummary.getCell(`H${totalRowNum}`).alignment = { horizontal: 'center', vertical: 'middle' }
  wsSummary.getCell(`I${totalRowNum}`).alignment = { horizontal: 'right', vertical: 'middle' }
  wsSummary.getCell(`J${totalRowNum}`).alignment = { horizontal: 'center', vertical: 'middle' }
  wsSummary.getCell(`I${totalRowNum}`).numFmt = '#,##0 "FCFA"'

  ;['G', 'H', 'I', 'J'].forEach(col => {
    const cell = wsSummary.getCell(`${col}${totalRowNum}`)
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: BLEU_NUIT } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E4E4E7' } }
    cell.border = {
      top: { style: 'thin', color: { argb: BLEU_NUIT } },
      bottom: { style: 'double', color: { argb: BLEU_NUIT } }
    }
  })

  // --- Total Table 3 ---
  const totalAllMontant = allPaiements.reduce((sum, p) => sum + parseFloat(p.montant || '0'), 0)
  wsSummary.getCell(`L${totalRowNum}`).value = 'Total'
  wsSummary.getCell(`M${totalRowNum}`).value = totalTransactions
  wsSummary.getCell(`N${totalRowNum}`).value = totalAllMontant
  wsSummary.getCell(`O${totalRowNum}`).value = '100.0%'

  wsSummary.getCell(`L${totalRowNum}`).alignment = { horizontal: 'left', vertical: 'middle' }
  wsSummary.getCell(`M${totalRowNum}`).alignment = { horizontal: 'center', vertical: 'middle' }
  wsSummary.getCell(`N${totalRowNum}`).alignment = { horizontal: 'right', vertical: 'middle' }
  wsSummary.getCell(`O${totalRowNum}`).alignment = { horizontal: 'center', vertical: 'middle' }
  wsSummary.getCell(`N${totalRowNum}`).numFmt = '#,##0 "FCFA"'

  ;['L', 'M', 'N', 'O'].forEach(col => {
    const cell = wsSummary.getCell(`${col}${totalRowNum}`)
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: BLEU_NUIT } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E4E4E7' } }
    cell.border = {
      top: { style: 'thin', color: { argb: BLEU_NUIT } },
      bottom: { style: 'double', color: { argb: BLEU_NUIT } }
    }
  })


  // ══════════════════════════════════════════════════════════════════════════
  // FEUILLE 2 — PAIEMENTS DÉTAIL (AVEC FILTRES ET TRI)
  // ══════════════════════════════════════════════════════════════════════════
  const ws = workbook.addWorksheet('Paiements Détail', {
    properties: { tabColor: { argb: BLEU_NUIT } },
    views: [{ state: 'frozen', ySplit: 2 }], // Geler les 2 premières lignes (titre + en-têtes)
  })

  // ── Titre de la feuille ──
  ws.mergeCells('A1:P1')
  const mainTitle = ws.getCell('A1')
  mainTitle.value = 'HISTORIQUE COMPLET DES PAIEMENTS — FAVOR COMPANY INTERNATIONAL'
  mainTitle.font = { name: 'Calibri', size: 13, bold: true, color: { argb: BLANC } }
  mainTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BLEU_NUIT } }
  mainTitle.alignment = { horizontal: 'center', vertical: 'middle' }
  ws.getRow(1).height = 34

  // ── Colonnes avec largeurs ──
  ws.columns = [
    { key: 'num',         header: '#',                  width: 6 },
    { key: 'facture',     header: 'N° Facture',          width: 17 },
    { key: 'client',      header: 'Client',              width: 24 },
    { key: 'email',       header: 'Email',               width: 28 },
    { key: 'telephone',   header: 'Téléphone',           width: 16 },
    { key: 'bien',        header: 'Bien Immobilier',     width: 30 },
    { key: 'ville',       header: 'Ville',               width: 14 },
    { key: 'typeBien',    header: 'Type de Bien',        width: 14 },
    { key: 'montant',     header: 'Montant (FCFA)',      width: 20 },
    { key: 'devise',      header: 'Devise',              width: 9 },
    { key: 'typePaie',    header: 'Type Paiement',        width: 18 },
    { key: 'statut',      header: 'Statut',              width: 16 },
    { key: 'canal',       header: 'Canal Paystack',      width: 17 },
    { key: 'reference',   header: 'Référence Paystack',  width: 30 },
    { key: 'datePaie',    header: 'Date de Paiement',    width: 22 },
    { key: 'dateCreation',header: 'Date de Création',    width: 22 },
  ]

  // ── Style des en-têtes (ligne 2) ──
  const headerRowDetail = ws.getRow(2)
  const headerLabels: string[] = [
    '#', 'N° Facture', 'Client', 'Email', 'Téléphone',
    'Bien Immobilier', 'Ville', 'Type de Bien', 'Montant (FCFA)',
    'Devise', 'Type Paiement', 'Statut', 'Canal Paystack',
    'Référence Paystack', 'Date de Paiement', 'Date de Création',
  ]
  headerRowDetail.values = headerLabels
  headerRowDetail.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: BLANC } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: OR } }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: false }
    cell.border = {
      top:    { style: 'medium', color: { argb: BLEU_NUIT } },
      bottom: { style: 'medium', color: { argb: BLEU_NUIT } },
      left:   { style: 'thin',   color: { argb: BLANC } },
      right:  { style: 'thin',   color: { argb: BLANC } },
    }
  })
  headerRowDetail.height = 28

  // ── Données ──
  allPaiements.forEach((p, idx) => {
    const isEven = idx % 2 === 0

    // Couleur de statut
    let statutFill = isEven ? OR_CLAIR : BLANC
    if (p.statut === 'paye')       { statutFill = VERT;   }
    if (p.statut === 'echoue')     { statutFill = ROUGE;  }
    if (p.statut === 'en_attente') { statutFill = AMBER;  }
    if (p.statut === 'rembourse')  { statutFill = VIOLET; }

    const statutLabel =
      p.statut === 'paye'       ? 'Payé'        :
      p.statut === 'en_attente' ? 'En attente'  :
      p.statut === 'echoue'     ? 'Échoué'      :
      p.statut === 'rembourse'  ? 'Remboursé'  :
      p.statut || '—'

    const row = ws.addRow({
      num:          idx + 1,
      facture:      p.factureNumero || '—',
      client:       p.clientName || 'Inconnu',
      email:        p.clientEmail || '—',
      telephone:    p.clientPhone || '—',
      bien:         p.bienTitre || '—',
      ville:        p.bienVille || '—',
      typeBien:     p.bienType || '—',
      montant:      parseFloat(p.montant || '0'),
      devise:       p.devise || 'FCFA',
      typePaie:     p.typePaiement === 'acompte' ? 'Acompte (10%)' : (p.typePaiement || '—'),
      statut:       statutLabel,
      canal:        p.paystackChannel ? p.paystackChannel.replace('_', ' ') : '—',
      reference:    p.paystackReference || '—',
      datePaie:     p.paidAt ? new Date(p.paidAt).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—',
      dateCreation: p.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—',
    })

    // Style global de la ligne
    const bgFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? OR_CLAIR : BLANC } }
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { name: 'Calibri', size: 10 }
      cell.fill = bgFill
      cell.alignment = { vertical: 'middle', wrapText: false }
      cell.border = {
        bottom: { style: 'hair', color: { argb: 'D1D5DB' } },
        right:  { style: 'hair', color: { argb: 'D1D5DB' } },
      }
    })

    // Format monétaire pour le montant
    const montantCell = row.getCell('montant')
    montantCell.numFmt = '#,##0 "FCFA"'
    montantCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: BLEU_NUIT } }
    montantCell.alignment = { horizontal: 'right', vertical: 'middle' }

    // Couleur spécifique pour le statut
    const statutCell = row.getCell('statut')
    statutCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statutFill } }
    statutCell.font = { name: 'Calibri', size: 10, bold: true }
    statutCell.alignment = { horizontal: 'center', vertical: 'middle' }

    // Centrer les colonnes simples
    row.getCell('num').alignment    = { horizontal: 'center', vertical: 'middle' }
    row.getCell('devise').alignment = { horizontal: 'center', vertical: 'middle' }
    row.getCell('canal').alignment  = { horizontal: 'center', vertical: 'middle' }
    row.getCell('typeBien').alignment = { horizontal: 'center', vertical: 'middle' }

    row.height = 20
  })

  // ── Bordure basse du tableau ──
  const lastRow = ws.lastRow
  if (lastRow) {
    lastRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        ...cell.border,
        bottom: { style: 'medium', color: { argb: BLEU_NUIT } },
      }
    })
  }

  // ─── ACTIVATION DE L'AUTO-FILTRE ET TRI DYNAMIQUE (BOUTON DE TRI) ─────────
  if (allPaiements.length > 0) {
    ws.autoFilter = `A2:P${allPaiements.length + 2}`
  }

  // ─── Génération du buffer ─────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer()
  const today  = new Date().toISOString().split('T')[0]

  return new NextResponse(Buffer.from(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="Paiements_FavorCompany_${today}.xlsx"`,
    },
  })
}
