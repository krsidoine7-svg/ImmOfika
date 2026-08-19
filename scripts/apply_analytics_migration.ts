import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString)

async function run() {
  console.log('Applique la migration pour la table analytics_events...')

  const sql = `
    CREATE TABLE IF NOT EXISTS "public"."analytics_events" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "visitor_id" text NOT NULL,
      "session_id" text NOT NULL,
      "event_type" text NOT NULL,
      "path" text NOT NULL,
      "details" jsonb NOT NULL,
      "duration" integer NOT NULL DEFAULT 0,
      "created_at" timestamp NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "idx_analytics_events_visitor_id" ON "analytics_events" ("visitor_id");
    CREATE INDEX IF NOT EXISTS "idx_analytics_events_event_type" ON "analytics_events" ("event_type");
    CREATE INDEX IF NOT EXISTS "idx_analytics_events_path" ON "analytics_events" ("path");
  `

  await client.unsafe(sql)
  console.log('Table analytics_events et index créés avec succès en base de données !')
  process.exit(0)
}

run().catch((err) => {
  console.error('Erreur lors de l\'application de la migration analytics :', err)
  process.exit(1)
})
