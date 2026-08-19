import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString)

async function run() {
  console.log('Applique la migration pour la colonne suspension_reason...')

  const sql = `
    ALTER TABLE "public"."profiles" ADD COLUMN IF NOT EXISTS "suspension_reason" text;
  `

  await client.unsafe(sql)
  console.log('Migration suspension_reason appliquée avec succès en base de données !')
  process.exit(0)
}

run().catch((err) => {
  console.error('Erreur lors de l\'application de la migration :', err)
  process.exit(1)
})
