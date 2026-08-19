import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString)

async function run() {
  console.log('Applique la migration des colonnes de gating CRM...')

  const sql = `
    ALTER TABLE "public"."leads" ADD COLUMN IF NOT EXISTS "visite_confirmee" boolean DEFAULT false NOT NULL;
    ALTER TABLE "public"."leads" ADD COLUMN IF NOT EXISTS "offre_validee" boolean DEFAULT false NOT NULL;
    ALTER TABLE "public"."leads" ADD COLUMN IF NOT EXISTS "engagement_signe" boolean DEFAULT false NOT NULL;
  `

  await client.unsafe(sql)
  console.log('Migration appliquée avec succès en base de données !')
  process.exit(0)
}

run().catch((err) => {
  console.error('Erreur lors de l\'application de la migration :', err)
  process.exit(1)
})
