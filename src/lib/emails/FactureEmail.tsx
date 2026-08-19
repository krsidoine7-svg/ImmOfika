import React from 'react'
import { siteConfig } from '@/config/site'

export interface FactureEmailProps {
  clientNom: string
  factureNumero: string
  bienNom: string
  montant: number
  datePaiement: string
  factureUrl: string
}

export const FactureEmail = ({
  clientNom,
  factureNumero,
  bienNom,
  montant,
  datePaiement,
  factureUrl,
}: FactureEmailProps) => {
  return (
    <html lang="fr">
      <body style={styles.body}>
        <div style={styles.container}>
          <h1 style={styles.heading}>{siteConfig.name}</h1>
          <p style={styles.text}>Bonjour {clientNom},</p>
          <p style={styles.text}>
            Nous avons le plaisir de vous confirmer la bonne réception de votre paiement pour le bien <strong>"{bienNom}"</strong>.
          </p>
          <p style={styles.text}>
            Votre facture N° <strong>{factureNumero}</strong> est disponible. Vous pouvez la consulter et la télécharger en cliquant sur le bouton ci-dessous, ou la retrouver dans votre espace client.
          </p>
          
          <div style={styles.detailsBox}>
            <p style={styles.detailText}><strong>Montant versé :</strong> {new Intl.NumberFormat('fr-CI').format(montant)} FCFA</p>
            <p style={styles.detailText}><strong>Date du paiement :</strong> {datePaiement}</p>
          </div>

          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <a href={factureUrl} style={styles.button}>
              Télécharger ma facture PDF
            </a>
          </div>

          <hr style={styles.divider} />

          <p style={styles.footer}>
            <strong>{siteConfig.company.name}</strong> — {siteConfig.company.legalStatus}<br />
            {siteConfig.company.address}<br />
            {siteConfig.company.phone}<br />
            <a href={`mailto:${siteConfig.company.email}`} style={styles.link}>{siteConfig.company.email}</a>
          </p>
        </div>
      </body>
    </html>
  )
}

const styles = {
  body: {
    backgroundColor: '#F0FDF4',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
    padding: '40px 0',
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '40px',
    borderRadius: '12px',
    maxWidth: '600px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  },
  heading: {
    color: '#0F172A',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    marginBottom: '30px',
    borderBottom: '2px solid #10B981',
    paddingBottom: '15px',
  },
  text: {
    color: '#334155',
    fontSize: '15px',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  detailsBox: {
    backgroundColor: '#ECFDF5',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #A7F3D0',
    marginBottom: '30px',
  },
  detailText: {
    margin: '0 0 10px 0',
    color: '#064E3B',
    fontSize: '14px',
  },
  button: {
    backgroundColor: '#10B981',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
    display: 'inline-block',
  },
  divider: {
    borderTop: '1px solid #E2E8F0',
    margin: '30px 0',
  },
  footer: {
    color: '#64748B',
    fontSize: '12px',
    lineHeight: '1.5',
    textAlign: 'center' as const,
  },
  link: {
    color: '#10B981',
    textDecoration: 'none',
  },
}
