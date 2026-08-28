import React from 'react'
import { Document, Page, Text, View, StyleSheet, renderToStream } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1A2A4A',
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#C9A84C',
    paddingBottom: 15,
    marginBottom: 20,
  },
  logoSection: {
    width: '60%',
  },
  titleSection: {
    width: '40%',
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A2A4A',
    letterSpacing: 0.5,
  },
  companyBadge: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#C9A84C',
    marginTop: 2,
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 8,
    color: '#475569',
    lineHeight: 1.3,
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C9A84C',
  },
  receiptNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1A2A4A',
    marginTop: 4,
  },
  receiptDate: {
    fontSize: 8,
    color: '#64748B',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1A2A4A',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingBottom: 4,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    color: '#64748B',
    fontWeight: 'normal',
  },
  value: {
    color: '#0F172A',
    fontWeight: 'bold',
  },
  highlightBox: {
    backgroundColor: '#1A2A4A',
    borderRadius: 6,
    padding: 12,
    marginVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  highlightText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  highlightAmount: {
    color: '#C9A84C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 35,
    right: 35,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    textAlign: 'center',
    fontSize: 7,
    color: '#94A3B8',
    lineHeight: 1.4,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    paddingHorizontal: 10,
  },
  signatureBox: {
    width: '45%',
    alignItems: 'center',
  },
  signatureTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1A2A4A',
    marginBottom: 35,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#94A3B8',
    width: '80%',
  }
})

export interface RecuData {
  recuNumero: string
  dateEmission: string
  client: {
    nom: string
    email: string
    telephone: string
  }
  bien: {
    titre: string
    type: string
    prixTotal: number
    localisation: string
  }
  paiement: {
    montantVerse: number
    cumulPaye: number
    resteAPayer: number
    typePaiement: string // 'acompte', 'tranche', 'solde'
    modePaiement: string
    referenceTransaction: string
  }
  agrementNumero?: string
  notaireNom?: string
}

export const RecuPDF = ({ data }: { data: RecuData }) => {
  const formatAmount = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num).replace(/[\u202F\u00A0]/g, ' ') + ' FCFA'
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.logoSection}>
            <Text style={styles.companyName}>IMMOFIKA</Text>
            <Text style={styles.companyBadge}>PROMOTEUR IMMOBILIER AGRÉÉ PAR L'ÉTAT</Text>
            <Text style={styles.companyDetails}>Agrément Ministériel | Droit OHADA</Text>
            <Text style={styles.companyDetails}>Siège Social : Abidjan, Côte d'Ivoire | Tél : +225 27 24 00 00 00</Text>
            <Text style={styles.companyDetails}>Email : contact@immofika.ci | Web : www.immofika.ci</Text>
          </View>
          <View style={styles.titleSection}>
            <Text style={styles.receiptTitle}>REÇU DE PAIEMENT</Text>
            <Text style={styles.receiptNumber}>N° : {data.recuNumero}</Text>
            <Text style={styles.receiptDate}>Date : {data.dateEmission}</Text>
          </View>
        </View>

        {/* Client & Bien Section */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
          <View style={[styles.card, { width: '49%' }]}>
            <Text style={styles.sectionHeader}>INFORMATIONS CLIENT</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Nom complet :</Text>
              <Text style={styles.value}>{data.client.nom}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email :</Text>
              <Text style={styles.value}>{data.client.email}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Téléphone :</Text>
              <Text style={styles.value}>{data.client.telephone || 'Non renseigné'}</Text>
            </View>
          </View>

          <View style={[styles.card, { width: '49%' }]}>
            <Text style={styles.sectionHeader}>DÉSIGNATION DU BIEN</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Bien réservé :</Text>
              <Text style={styles.value}>{data.bien.titre}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Type :</Text>
              <Text style={styles.value}>{data.bien.type}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Prix Total du Bien :</Text>
              <Text style={styles.value}>{formatAmount(data.bien.prixTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Highlight Banner Amount Paid */}
        <View style={styles.highlightBox}>
          <Text style={styles.highlightText}>MONTANT VERSÉ CE JOUR ({data.paiement.typePaiement.toUpperCase()}) :</Text>
          <Text style={styles.highlightAmount}>{formatAmount(data.paiement.montantVerse)}</Text>
        </View>

        {/* Financial Breakdown Table */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>RÉCAPITULATIF DE LA TRANSACTION & ÉCHÉANCIER</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Référence Règlement / Paystack :</Text>
            <Text style={styles.value}>{data.paiement.referenceTransaction}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Mode de Règlement :</Text>
            <Text style={styles.value}>{data.paiement.modePaiement.toUpperCase()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Cumul Total des Versements Effectués :</Text>
            <Text style={[styles.value, { color: '#059669' }]}>{formatAmount(data.paiement.cumulPaye)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Reste à Payer / Solde Restant :</Text>
            <Text style={[styles.value, { color: '#DC2626' }]}>{formatAmount(data.paiement.resteAPayer)}</Text>
          </View>
          {data.notaireNom && (
            <View style={[styles.row, { marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#E2E8F0' }]}>
              <Text style={styles.label}>Étude Notariale Instrumentaire :</Text>
              <Text style={styles.value}>{data.notaireNom}</Text>
            </View>
          )}
        </View>

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>POUR LE CLIENT ACQUÉREUR</Text>
            <View style={styles.signatureLine} />
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>POUR IMMOFIKA (PROMOTEUR AGRÉÉ)</Text>
            <View style={styles.signatureLine} />
          </View>
        </View>

        {/* Legal Footer */}
        <View style={styles.footer}>
          <Text>
            IMMOFIKA — SA au Capital de 50 000 000 FCFA — RCCM: CI-ABJ-202X-B-XXXX — CC: 0000000X.
          </Text>
          <Text>
            Document certifié conforme émis sous le contrôle d'un Promoteur Immobilier Agréé par l'État. Toute contrefaçon est passible de poursuites.
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export async function genererRecuPdfBuffer(data: RecuData): Promise<Buffer> {
  const stream = await renderToStream(<RecuPDF data={data} />)
  const chunks: Uint8Array[] = []
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Uint8Array))
  }
  return Buffer.concat(chunks)
}
