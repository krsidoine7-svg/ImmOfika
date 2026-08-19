import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { todos } from './src/lib/db/schema'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString)
const db = drizzle(client)

async function seed() {
  console.log('Seeding data...')
  await db.insert(todos).values([
    { name: 'Installer le projet Favor Company' },
    { name: 'Configurer Supabase SSR' },
    { name: 'Lancer le premier test via Drizzle' },
  ])
  console.log('Seed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
