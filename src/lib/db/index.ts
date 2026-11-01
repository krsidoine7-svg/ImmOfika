import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'

// Éviter de créer trop de connexions en développement avec le Hot Reload de Next.js
const globalForDb = globalThis as unknown as {
  pgClient: postgres.Sql | undefined
}

const connectionString = process.env.DATABASE_URL || ''

// prepare: false est indispensable lors de l'utilisation du pooler Supabase / PgBouncer
const pgClient = globalForDb.pgClient ?? postgres(connectionString, { 
  max: process.env.NODE_ENV === 'production' ? 10 : 5,
  prepare: false,
  idle_timeout: 20,
  connect_timeout: 10,
})

if (process.env.NODE_ENV !== 'production') globalForDb.pgClient = pgClient

export const db = drizzle(pgClient, { schema })
