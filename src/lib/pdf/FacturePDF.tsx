import React from 'react'
import { Document, Page, Text, View, StyleSheet, Svg, Rect } from '@react-pdf/renderer'
import type { QrMatrix } from '@/lib/fne/qrcode'
import { siteConfig } from '@/config/site'

const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1.5,
    borderBottomColor: '#10B981',
    paddingBottom: 15,
  },
  companyInfo: {
    flexDirection: 'column',
    width: '52%',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#065F46',
  },
  companySubtitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 8,
    color: '#475569',
    lineHeight: 1.35,
  },
  fiscalBadge: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: '#E2E8F0',
  },
  fiscalText: {
    fontSize: 7.5,
    color: '#334155',
    fontWeight: 'bold',
    lineHeight: 1.3,
  },
  invoiceMeta: {
    width: '45%',
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#0F172A',
    textAlign: 'right',
  },
  metaText: {
    fontSize: 8,
    marginBottom: 2,
    color: '#334155',
    textAlign: 'right',
  },
  // ─── Sticker Électronique Officiel (Art. 4 Arrêté 0337) ───────────────
  stickerContainer: {
    marginTop: 6,
    padding: 6,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  stickerInfo: {
    flexDirection: 'column',
    width: '65%',
  },
  stickerTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#047857',
    marginBottom: 2,
  },
  stickerNumero: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  stickerSig: {
    fontSize: 6,
    color: '#64748B',
    fontFamily: 'Helvetica',
  },
  qrCodeWrapper: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    padding: 2,
    borderWidth: 0.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ─── Sections Client & Détails ─────────────────────────────────────────
  partiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 15,
  },
  partyBox: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  partyHeader: {
    fontSize: 8.5,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#0F172A',
    borderBottomWidth: 0.5,
    borderBottomColor: '#CBD5E1',
    paddingBottom: 3,
  },
  partyText: {
    fontSize: 8,
    marginBottom: 2.5,
    color: '#334155',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: 'auto',
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
    minHeight: 24,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#065F46',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 8,
  },
  col1: { width: '45%', paddingLeft: 8, paddingRight: 4 },
  col2: { width: '10%', textAlign: 'center' },
  col3: { width: '15%', textAlign: 'right' },
  col4: { width: '12%', textAlign: 'center' },
  col5: { width: '18%', textAlign: 'right', paddingRight: 8 },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  summaryBox: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    fontSize: 8,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1.5,
    borderTopColor: '#10B981',
    fontWeight: 'bold',
    fontSize: 10,
    color: '#065F46',
  },
  paymentInfo: {
    marginBottom: 20,
    padding: 8,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  signatureBox: {
    alignItems: 'center',
    width: '40%',
  },
  signatureLine: {
    width: 130,
    borderBottomWidth: 0.8,
    borderBottomColor: '#0F172A',
    marginTop: 35,
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 35,
    right: 35,
    fontSize: 7,
    color: '#64748B',
    textAlign: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#CBD5E1',
    paddingTop: 8,
    lineHeight: 1.3,
  },
})

export interface FactureFneDetails {
  numero: string
  type: string
  signature: string
  verificationUrl: string
  certifieLe: string
  qrMatrix?: QrMatrix
}

export interface FactureData {
  numero: string
  date: string
  client: {
    nom: string
    email: string
    telephone: string
    ncc?: string | null
    adresse?: string | null
  }
  bien: {
    titre: string
    type: string
    localisation: string
  }
  montants: {
    ht: number
    tva: number
    ttc: number
    dejaPaye?: number
    resteAPayer?: number
  }
  paiement: {
    mode: string
    reference: string
  }
  fne?: FactureFneDetails
}

export const FacturePDF = ({ data }: { data: FactureData }) => {
  const formatAmount = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num).replace(/[\u202F\u00A0]/g, ' ') + ' FCFA'
  }

  const isAvoir = data.fne?.type === 'AVOIR'
  const docTitle = isAvoir
    ? "FACTURE D'AVOIR NORMALISÉE"
    : "FACTURE NORMALISÉE ÉLECTRONIQUE"

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* En-tête : Émetteur & Méta Facture */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{siteConfig.company.name}</Text>
            <Text style={styles.companySubtitle}>{siteConfig.company.legalStatus}</Text>
            <Text style={styles.companyDetails}>{siteConfig.company.address}</Text>
            <Text style={styles.companyDetails}>Tél : {siteConfig.company.phone} | Email : {siteConfig.company.email}</Text>
            
            <View style={styles.fiscalBadge}>
              <Text style={styles.fiscalText}>NCC (Compte Contribuable) : {siteConfig.company.ncc}</Text>
              <Text style={styles.fiscalText}>Régime fiscal : {siteConfig.company.regime}</Text>
              <Text style={styles.fiscalText}>Centre de rattachement : {siteConfig.company.centreImpots}</Text>
              <Text style={styles.fiscalText}>RCCM : {siteConfig.company.rccm}</Text>
            </View>
          </View>

          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceTitle}>{docTitle}</Text>
            <Text style={styles.metaText}>Réf interne : {data.numero}</Text>
            <Text style={styles.metaText}>Date d&apos;émission : {data.date}</Text>

            {/* Sticker Électronique Officiel (Art. 4) */}
            {data.fne && (
              <View style={styles.stickerContainer}>
                <View style={styles.stickerInfo}>
                  <Text style={styles.stickerTitle}>🛡️ CERTIFIÉ DGI - CI (FNE)</Text>
                  <Text style={styles.stickerNumero}>N° : {data.fne.numero}</Text>
                  <Text style={styles.metaText}>Type : {data.fne.type}</Text>
                  <Text style={styles.stickerSig}>Empreinte : {data.fne.signature.slice(0, 16)}...</Text>
                </View>

                {/* QR Code de certification scannable */}
                {data.fne.qrMatrix && (
                  <View style={styles.qrCodeWrapper}>
                    <Svg viewBox={`0 0 ${data.fne.qrMatrix.size} ${data.fne.qrMatrix.size}`} width="44" height="44">
                      {data.fne.qrMatrix.modules.map((row, r) =>
                        row.map((cell, c) =>
                          cell ? (
                            <Rect
                              key={`${r}-${c}`}
                              x={c}
                              y={r}
                              width={1}
                              height={1}
                              fill="#065F46"
                            />
                          ) : null
                        )
                      )}
                    </Svg>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Détails Émetteur / Destinataire (Art. 6-1 & 6-2) */}
        <View style={styles.partiesRow}>
          <View style={styles.partyBox}>
            <Text style={styles.partyHeader}>ÉMETTEUR / REPRÉSENTANT</Text>
            <Text style={styles.partyText}>Raison sociale : {siteConfig.company.name}</Text>
            <Text style={styles.partyText}>Téléphone : {siteConfig.company.phone}</Text>
            <Text style={styles.partyText}>Commune : {siteConfig.company.commune}</Text>
            <Text style={styles.partyText}>Activité : Promotion & Transactions Immobilières</Text>
          </View>

          <View style={styles.partyBox}>
            <Text style={styles.partyHeader}>CLIENT / DESTINATAIRE (Art. 6-2)</Text>
            <Text style={styles.partyText}>Nom / Raison Sociale : {data.client.nom}</Text>
            <Text style={styles.partyText}>Email : {data.client.email || 'Non renseigné'}</Text>
            <Text style={styles.partyText}>Téléphone : {data.client.telephone || 'Non renseigné'}</Text>
            {data.client.ncc && (
              <Text style={styles.partyText}>NCC Client (B2B) : {data.client.ncc}</Text>
            )}
            {data.client.adresse && (
              <Text style={styles.partyText}>Adresse : {data.client.adresse}</Text>
            )}
          </View>
        </View>

        {/* Tableau des Biens / Prestations (Art. 6-6 & 6-7) */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.col1}>Désignation du Bien / Prestation</Text>
            <Text style={styles.col2}>Qté</Text>
            <Text style={styles.col3}>P.U. HT</Text>
            <Text style={styles.col4}>Taux TVA</Text>
            <Text style={styles.col5}>Total HT</Text>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.col1}>
              <Text style={{ fontWeight: 'bold' }}>{data.bien.titre}</Text>
              <Text style={{ fontSize: 7, color: '#64748B', marginTop: 1 }}>
                Type : {data.bien.type} | Emplacement : {data.bien.localisation}
              </Text>
            </View>
            <Text style={styles.col2}>1</Text>
            <Text style={styles.col3}>{formatAmount(data.montants.ht)}</Text>
            <Text style={styles.col4}>18%</Text>
            <Text style={styles.col5}>{formatAmount(data.montants.ht)}</Text>
          </View>
        </View>

        {/* Synthèse Financière & Fiscale (Art. 6-8) */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={{ color: '#475569' }}>Total Hors Taxes (HT) :</Text>
              <Text style={{ fontWeight: 'bold' }}>{formatAmount(data.montants.ht)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ color: '#475569' }}>TVA Déductible (18%) :</Text>
              <Text style={{ fontWeight: 'bold' }}>{formatAmount(data.montants.tva)}</Text>
            </View>
            <View style={styles.summaryTotal}>
              <Text>TOTAL TTC / NET À PAYER :</Text>
              <Text>{formatAmount(data.montants.ttc)}</Text>
            </View>
          </View>
        </View>

        {/* Informations de Paiement (Art. 6-9) */}
        <View style={styles.paymentInfo}>
          <Text style={{ fontWeight: 'bold', fontSize: 8.5, color: '#0F172A', marginBottom: 3 }}>
            Règlement & Traçabilité de Transaction (Art. 6-9) :
          </Text>
          <Text style={styles.metaText}>Montant réglé : {formatAmount(data.montants.dejaPaye || data.montants.ttc)}</Text>
          {data.montants.resteAPayer !== undefined && data.montants.resteAPayer > 0 && (
            <Text style={{ ...styles.metaText, color: '#DC2626', fontWeight: 'bold' }}>
              Solde restant à régler : {formatAmount(data.montants.resteAPayer)}
            </Text>
          )}
          <Text style={styles.metaText}>Canal de règlement : {data.paiement.mode} (Paystack CI)</Text>
          <Text style={styles.metaText}>Identifiant de transaction : {data.paiement.reference}</Text>
        </View>

        {/* Cachet & Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={{ fontWeight: 'bold', fontSize: 8 }}>Le Client / Destinataire</Text>
            <View style={styles.signatureLine} />
            <Text style={{ fontSize: 7, marginTop: 3, color: '#94A3B8' }}>Pour acceptation</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={{ fontWeight: 'bold', fontSize: 8 }}>Pour ImmOfika (Service Comptabilité)</Text>
            <View style={styles.signatureLine} />
            <Text style={{ fontSize: 7, marginTop: 3, color: '#94A3B8' }}>Signature et Sceau Fiscal Électronique</Text>
          </View>
        </View>

        {/* Footer Légal & Sanctions FNE */}
        <Text style={styles.footer}>
          Facture Normalisée Électronique certifiée conforme à l&apos;Arrêté n° 0337 MFB/DGI du 09 mai 2025 et aux articles 384, 385 du Code Général des Impôts (CGI) de Côte d&apos;Ivoire.
          Document officiel à valeur probante fiscale, commerciale et juridique OHADA. Scannable et contrôlable sur https://fne.dgi.gouv.ci — Conservation obligatoire : 10 ans.
        </Text>
      </Page>
    </Document>
  )
}
