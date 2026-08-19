import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString)

async function run() {
  console.log('Applique la migration pour la table system_settings...')

  const sql = `
    CREATE TABLE IF NOT EXISTS "public"."system_settings" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "key" text NOT NULL UNIQUE,
      "value" jsonb NOT NULL,
      "created_at" timestamp NOT NULL DEFAULT now(),
      "updated_at" timestamp NOT NULL DEFAULT now()
    );
  `

  await client.unsafe(sql)
  console.log('Table system_settings créée avec succès en base de données !')
  process.exit(0)
}

run().catch((err) => {
  console.error('Erreur lors de l\'application de la migration :', err)
  process.exit(1)
})
