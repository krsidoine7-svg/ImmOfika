import postgres from 'postgres'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString, { max: 1 })

async function run() {
  console.log("Lecture et application de la migration homepage...")
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '0010_create_homepage_configs.sql')
  const migrationSql = fs.readFileSync(migrationPath, 'utf8')
  
  await client.unsafe(migrationSql)
  console.log("Migration 0010_create_homepage_configs.sql appliquée avec succès !")

  console.log("Lecture et application du seed de la page d'accueil...")
  const seedPath = path.join(process.cwd(), 'INFO_MOCKER', 'seed_homepage_v1.0.sql')
  const seedSql = fs.readFileSync(seedPath, 'utf8')

  await client.unsafe(seedSql)
  console.log("Seeding seed_homepage_v1.0.sql appliqué avec succès !")

  process.exit(0)
}

run().catch((err) => {
  console.error("Erreur lors de l'application de la migration et du seed :", err)
  process.exit(1)
})
