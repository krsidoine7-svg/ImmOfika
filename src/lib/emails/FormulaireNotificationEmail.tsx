import React from 'react'
import { siteConfig } from '@/config/site'

export interface FormulaireNotificationEmailProps {
  formulaireTitre: string
  reponsesSummary: Array<{ label: string; value: string }>
  formulaireUrl: string
  submittedAt: string
}

export const FormulaireNotificationEmail = ({
  formulaireTitre,
  reponsesSummary,
  formulaireUrl,
  submittedAt,
}: FormulaireNotificationEmailProps) => {
  return (
    <html lang="fr">
      <body style={styles.body}>
        <div style={styles.container}>
          <div style={styles.headerBox}>
            <h1 style={styles.heading}>{siteConfig.company.name}</h1>
            <p style={styles.badge}>Nouvelle réponse reçue 📩</p>
          </div>

          <p style={styles.text}>Bonjour,</p>

          <p style={styles.text}>
            Une nouvelle réponse vient d'être soumise pour le formulaire <strong>"{formulaireTitre}"</strong> le {submittedAt}.
          </p>

          <div style={styles.summaryBox}>
            <h3 style={styles.summaryTitle}>Détail des informations saisies :</h3>
            {reponsesSummary.map((item, idx) => (
              <div key={idx} style={styles.row}>
                <span style={styles.label}>{item.label} :</span>
                <span style={styles.value}>{item.value || 'N/A'}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <a href={formulaireUrl} style={styles.button}>
              📊 Consulter toutes les réponses dans l'Admin
            </a>
          </div>

          <hr style={styles.divider} />

          <p style={styles.footer}>
            <strong>{siteConfig.company.name}</strong> — Notification automatique ImmOfika<br />
            {siteConfig.company.address}
          </p>
        </div>
      </body>
    </html>
  )
}

const styles = {
  body: {
    backgroundColor: '#F8FAFC',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
    padding: '30px 0',
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '35px',
    borderRadius: '12px',
    maxWidth: '620px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
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
  summaryBox: {
    backgroundColor: '#ECFDF5',
    padding: '20px',
    borderRadius: '8px',
    borderLeft: '4px solid #10B981',
    marginBottom: '25px',
  },
  summaryTitle: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#064E3B',
    margin: '0 0 14px 0',
  },
  row: {
    display: 'flex',
    marginBottom: '8px',
    fontSize: '13px',
  },
  label: {
    fontWeight: 'bold',
    color: '#0F172A',
    minWidth: '140px',
    paddingRight: '10px',
  },
  value: {
    color: '#334155',
    wordBreak: 'break-word' as const,
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
}
