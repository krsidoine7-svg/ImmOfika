import React from 'react'
import { siteConfig } from '@/config/site'

export interface FormulaireShareEmailProps {
  destinataireNom?: string
  formulaireTitre: string
  formulaireDescription?: string
  formulaireUrl: string
  messagePersonalise?: string
}

export const FormulaireShareEmail = ({
  destinataireNom,
  formulaireTitre,
  formulaireDescription,
  formulaireUrl,
  messagePersonalise,
}: FormulaireShareEmailProps) => {
  return (
    <html lang="fr">
      <body style={styles.body}>
        <div style={styles.container}>
          <div style={styles.headerBox}>
            <h1 style={styles.heading}>{siteConfig.company.name}</h1>
            <p style={styles.badge}>Formulaire à compléter 📝</p>
          </div>

          <p style={styles.text}>
            Bonjour {destinataireNom ? <strong>{destinataireNom}</strong> : ''},
          </p>

          <p style={styles.text}>
            L'équipe <strong>{siteConfig.company.name}</strong> vous invite à remplir le formulaire : <strong>"{formulaireTitre}"</strong>.
          </p>

          {formulaireDescription && (
            <p style={{ ...styles.text, fontStyle: 'italic', color: '#475569' }}>
              "{formulaireDescription}"
            </p>
          )}

          {messagePersonalise && (
            <div style={styles.messageBox}>
              <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#0F172A', fontSize: '12px' }}>
                Note de votre conseiller :
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#334155' }}>
                "{messagePersonalise}"
              </p>
            </div>
          )}

          <p style={styles.text}>
            Merci de cliquer sur le bouton ci-dessous pour accéder au formulaire sécurisé en ligne :
          </p>

          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <a href={formulaireUrl} style={styles.button}>
              👉 Remplir le formulaire en ligne
            </a>
          </div>

          <p style={styles.text}>
            Si le bouton ne fonctionne pas, vous pouvez également copier/coller ce lien dans votre navigateur :<br />
            <a href={formulaireUrl} style={styles.link}>{formulaireUrl}</a>
          </p>

          <hr style={styles.divider} />

          <p style={styles.footer}>
            <strong>{siteConfig.company.name}</strong> — {siteConfig.company.legalStatus}<br />
            {siteConfig.company.address}<br />
            Tél : {siteConfig.company.phone} | Email : {siteConfig.company.email}
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
  messageBox: {
    backgroundColor: '#F0FDF4',
    padding: '16px',
    borderRadius: '8px',
    borderLeft: '4px solid #10B981',
    marginBottom: '22px',
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
  link: {
    color: '#10B981',
    wordBreak: 'break-all' as const,
    fontSize: '12px',
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
