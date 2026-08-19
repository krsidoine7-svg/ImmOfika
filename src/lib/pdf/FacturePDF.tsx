import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// You can load custom fonts if you want, but for now we'll use standard fonts.
// Font.register({ family: 'Helvetica', src: '...' })

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1A2A4A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#C9A84C',
    paddingBottom: 20,
  },
  companyInfo: {
    flexDirection: 'column',
    width: '50%',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#C9A84C',
  },
  companyDetails: {
    fontSize: 9,
    color: '#666',
    lineHeight: 1.4,
  },
  invoiceMeta: {
    width: '40%',
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1A2A4A',
  },
  metaText: {
    fontSize: 10,
    marginBottom: 4,
  },
  clientSection: {
    marginBottom: 40,
    padding: 15,
    backgroundColor: '#F8F6F1',
    borderRadius: 4,
  },
  clientHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1A2A4A',
  },
  clientText: {
    fontSize: 10,
    marginBottom: 4,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: 'auto',
    marginBottom: 30,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    minHeight: 30,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#1A2A4A',
    color: 'white',
    fontWeight: 'bold',
  },
  col1: { width: '40%', paddingLeft: 8 },
  col2: { width: '20%', textAlign: 'center' },
  col3: { width: '20%', textAlign: 'right' },
  col4: { width: '20%', textAlign: 'right', paddingRight: 8 },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 40,
  },
  summaryBox: {
    width: '40%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#1A2A4A',
    fontWeight: 'bold',
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#999',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
  },
  paymentInfo: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 4,
  },
  signatureBox: {
    marginTop: 40,
    alignItems: 'flex-end',
  },
  signatureLine: {
    width: 150,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2A4A',
    marginTop: 40,
  }
})

export interface FactureData {
  numero: string
  date: string
  client: {
    nom: string
    email: string
    telephone: string
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
}

export const FacturePDF = ({ data }: { data: FactureData }) => {
  const formatAmount = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num).replace(/[\u202F\u00A0]/g, ' ') + ' FCFA'
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>IMMO PRO INTERNATIONAL</Text>
            <Text style={styles.companyDetails}>Promoteur Immobilier & Gestion Agréée</Text>
            <Text style={styles.companyDetails}>Abidjan - Côte d'Ivoire</Text>
            <Text style={styles.companyDetails}>Tél : +225 27 24 00 00 00</Text>
            <Text style={styles.companyDetails}>Email : contact@immopro.ci</Text>
            <Text style={{ ...styles.companyDetails, marginTop: 4 }}>CC : 0000000X</Text>
            <Text style={styles.companyDetails}>RC : CI-ABJ-202X-B-XXXX</Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceTitle}>FACTURE</Text>
            <Text style={styles.metaText}>N° : {data.numero}</Text>
            <Text style={styles.metaText}>Date : {data.date}</Text>
            <Text style={styles.metaText}>Numéro FNE : EN-COURS</Text>
          </View>
        </View>

        {/* Client Section */}
        <View style={styles.clientSection}>
          <Text style={styles.clientHeader}>FACTURÉ À :</Text>
          <Text style={styles.clientText}>Nom : {data.client.nom}</Text>
          <Text style={styles.clientText}>Email : {data.client.email}</Text>
          <Text style={styles.clientText}>Téléphone : {data.client.telephone}</Text>
        </View>

        {/* Table Section */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.col1}>Désignation</Text>
            <Text style={styles.col2}>Qté</Text>
            <Text style={styles.col3}>P.U. HT</Text>
            <Text style={styles.col4}>Total HT</Text>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.col1}>
              <Text>{data.bien.titre}</Text>
              <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>Type: {data.bien.type} | Loc: {data.bien.localisation}</Text>
            </View>
            <Text style={styles.col2}>1</Text>
            <Text style={styles.col3}>{formatAmount(data.montants.ht)}</Text>
            <Text style={styles.col4}>{formatAmount(data.montants.ht)}</Text>
          </View>
        </View>

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text>Sous-total HT :</Text>
              <Text>{formatAmount(data.montants.ht)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>TVA (18%) :</Text>
              <Text>{formatAmount(data.montants.tva)}</Text>
            </View>
            <View style={styles.summaryTotal}>
              <Text>TOTAL TTC :</Text>
              <Text>{formatAmount(data.montants.ttc)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.paymentInfo}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Informations de Paiement :</Text>
          <Text style={styles.metaText}>Acompte versé : {formatAmount(data.montants.dejaPaye || 0)}</Text>
          {data.montants.resteAPayer !== undefined && (
            <Text style={styles.metaText}>Reste à payer : {formatAmount(data.montants.resteAPayer)}</Text>
          )}
          <Text style={{ ...styles.metaText, marginTop: 4 }}>Mode de paiement : {data.paiement.mode}</Text>
          <Text style={styles.metaText}>Référence transaction : {data.paiement.reference}</Text>
        </View>

        {/* Signature */}
        <View style={styles.signatureBox}>
          <Text style={{ fontWeight: 'bold' }}>La Direction Immo Pro</Text>
          <View style={styles.signatureLine} />
          <Text style={{ fontSize: 8, marginTop: 4, color: '#666' }}>Cachet et Signature</Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          IMMO PRO INTERNATIONAL - Document officiel de facturation
          Conformément aux dispositions du droit OHADA - Document valable comme reçu de paiement - Conservation : 10 ans minimum
        </Text>
      </Page>
    </Document>
  )
}
