import React from 'react'
import { siteConfig } from '@/config/site'

export interface ContratEmailProps {
  clientNom: string
  numeroContrat: string
  bienTitre: string
  montantTotal: number
  acomptePaye: number
  resteAPayer: number
  contratUrl: string
  clausesParticulieres?: string
}

export const ContratEmail = ({
  clientNom,
  numeroContrat,
  bienTitre,
  montantTotal,
  acomptePaye,
  resteAPayer,
  contratUrl,
  clausesParticulieres,
}: ContratEmailProps) => {
  const formatAmount = (num: number) => new Intl.NumberFormat('fr-CI').format(num) + ' FCFA'

  return (
    <html lang="fr">
      <body style={styles.body}>
        <div style={styles.container}>
          <div style={styles.headerBox}>
            <h1 style={styles.heading}>{siteConfig.company.name}</h1>
            <p style={styles.badge}>{siteConfig.company.legalStatus}</p>
          </div>

          <p style={styles.text}>Cher(e) <strong>{clientNom}</strong>,</p>
          
          <p style={styles.text}>
            Nous avons le plaisir de vous transmettre votre **Contrat de Réservation et d'Engagement Foncier** officiel N° <strong>{numeroContrat}</strong> concernant le bien :
          </p>

          <div style={styles.propertyBox}>
            <p style={styles.propertyTitle}>🏡 {bienTitre}</p>
            <p style={styles.detailText}><strong>Prix Total du Bien :</strong> {formatAmount(montantTotal)}</p>
            <p style={styles.detailText}><strong>Acompte Versé :</strong> {formatAmount(acomptePaye)}</p>
            <p style={styles.detailText}><strong>Solde Restant à Payer :</strong> {formatAmount(resteAPayer)}</p>
          </div>

          {clausesParticulieres && (
            <div style={styles.clausesBox}>
              <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', color: '#0F172A', fontSize: '13px' }}>
                📌 Conditions Spécifiques & Consignes :
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#475569', fontStyle: 'italic' }}>
                "{clausesParticulieres}"
              </p>
            </div>
          )}

          <p style={styles.text}>
            Veuillez consulter le contrat PDF certifié en pièce jointe ou cliquer sur le bouton ci-dessous pour procéder à sa relecture et validation :
          </p>

          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <a href={contratUrl} style={styles.button}>
              📄 Consulter & Télécharger mon Contrat PDF
            </a>
          </div>

          <p style={styles.text}>
            Pour toute question ou pour convenir du rendez-vous notarié, votre conseiller commercial attitré reste à votre entière disposition.
          </p>

          <hr style={styles.divider} />

          <p style={styles.footer}>
            <strong>{siteConfig.company.name}</strong> — {siteConfig.company.legalStatus}<br />
            {siteConfig.company.address}<br />
            Tél : {siteConfig.company.phone} | Email : <a href={`mailto:${siteConfig.company.email}`} style={styles.link}>{siteConfig.company.email}</a>
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
    padding: '30px 0',
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '35px',
    borderRadius: '12px',
    maxWidth: '620px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
    border: '1px solid #E2E8F0',
  },
  headerBox: {
    textAlign: 'center' as const,
    borderBottom: '2px solid #10B981',
    paddingBottom: '20px',
    marginBottom: '25px',
  },
  heading: {
    color: '#0F172A',
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '0 0 6px 0',
  },
  badge: {
    color: '#10B981',
    fontSize: '12px',
    fontWeight: 'bold',
    margin: 0,
    textTransform: 'uppercase' as const,
  },
  text: {
    color: '#334155',
    fontSize: '14px',
    lineHeight: '1.6',
    marginBottom: '18px',
  },
  propertyBox: {
    backgroundColor: '#ECFDF5',
    padding: '18px',
    borderRadius: '8px',
    borderLeft: '4px solid #10B981',
    marginBottom: '20px',
  },
  propertyTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#0F172A',
    margin: '0 0 12px 0',
  },
  detailText: {
    margin: '0 0 6px 0',
    color: '#064E3B',
    fontSize: '13px',
  },
  clausesBox: {
    backgroundColor: '#F0FDF4',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #A7F3D0',
    marginBottom: '25px',
  },
  button: {
    backgroundColor: '#10B981',
    color: '#ffffff',
    padding: '14px 28px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '14px',
    display: 'inline-block',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  divider: {
    borderTop: '1px solid #E2E8F0',
    margin: '25px 0',
  },
  footer: {
    color: '#64748B',
    fontSize: '11px',
    lineHeight: '1.5',
    textAlign: 'center' as const,
  },
  link: {
    color: '#10B981',
    textDecoration: 'none',
  },
}
