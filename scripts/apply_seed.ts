import postgres from 'postgres'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString, { max: 1 })

async function run() {
  console.log("Lecture du fichier seed...")
  const sqlPath = path.join(process.cwd(), 'INFO_MOCKER', 'seed_all_mock_data.sql')
  const sqlContent = fs.readFileSync(sqlPath, 'utf8')

  console.log("Application du seed complet v1.2 sur la base de données...")
  
  // Note: Drizzle / PostgreSQL command execution
  await client.unsafe(sqlContent)
  console.log("Seed v1.2 appliqué avec succès !")
  process.exit(0)
}

run().catch((err) => {
  console.error("Erreur lors de l'application du seed :", err)
  process.exit(1)
})
