import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const sql = postgres(connectionString, { max: 1 })

async function migrate() {
  console.log("=== 🚀 MIGRATION: CRÉATION TABLE CONTRACT_TEMPLATES ===")

  await sql`
    CREATE TABLE IF NOT EXISTS contract_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nom TEXT NOT NULL,
      description TEXT,
      type_bien TEXT NOT NULL DEFAULT 'foncier',
      fichier_url TEXT NOT NULL,
      fichier_nom TEXT NOT NULL,
      is_default BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    );
  `

  console.log("✅ Table contract_templates créée ou déjà existante.")

  // Seed un template par défaut si la table est vide
  const count = await sql`SELECT count(*) FROM contract_templates;`
  if (parseInt(count[0].count, 10) === 0) {
    await sql`
      INSERT INTO contract_templates (id, nom, description, type_bien, fichier_url, fichier_nom, is_default)
      VALUES (
        gen_random_uuid(),
        'Contrat de Réservation Foncier Officiel OHADA (Promoteur Agréé)',
        'Modèle standard d''engagement foncier avec agrément ministériel N° 049/MCU/DGUF, clauses suspensives et réserve de propriété.',
        'foncier',
        '/templates/Contrat_Reservation_Foncier_OHADA.docx',
        'Contrat_Reservation_Foncier_OHADA.docx',
        true
      );
    `
    console.log("✅ Modèle par défaut inséré en base avec succès !")
  }

  process.exit(0)
}

migrate().catch((err) => {
  console.error("❌ Erreur migration :", err)
  process.exit(1)
})
