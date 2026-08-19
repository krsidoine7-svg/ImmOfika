import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString)

async function run() {
  console.log('Applique la migration des visites CRM...')

  const sql = `
    CREATE TABLE IF NOT EXISTS "public"."visites" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "lead_id" uuid REFERENCES "public"."leads"("id") ON DELETE CASCADE,
      "client_id" uuid REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
      "bien_id" uuid NOT NULL REFERENCES "public"."biens"("id") ON DELETE CASCADE,
      "agent_id" uuid REFERENCES "public"."profiles"("id") ON DELETE SET NULL,
      "date_visite" timestamp NOT NULL,
      "statut" text DEFAULT 'planifiee' NOT NULL, -- 'planifiee', 'confirmee', 'effectuee', 'annulee', 'client_absent'
      "commentaires" text,
      "created_at" timestamp DEFAULT NOW() NOT NULL,
      "updated_at" timestamp DEFAULT NOW() NOT NULL,
      "deleted_at" timestamp
    );

    CREATE INDEX IF NOT EXISTS "visites_lead_idx" ON "public"."visites" ("lead_id");
    CREATE INDEX IF NOT EXISTS "visites_client_idx" ON "public"."visites" ("client_id");
    CREATE INDEX IF NOT EXISTS "visites_bien_idx" ON "public"."visites" ("bien_id");
    CREATE INDEX IF NOT EXISTS "visites_agent_idx" ON "public"."visites" ("agent_id");

    INSERT INTO "public"."permissions" (code, description) VALUES
      ('view:visites', 'Voir le calendrier et l''historique des visites de biens'),
      ('manage:visites', 'Créer, planifier, modifier et supprimer des visites')
    ON CONFLICT (code) DO NOTHING;

    INSERT INTO "public"."role_permissions" (role_name, permission_code) VALUES
      ('admin', 'view:visites'),
      ('admin', 'manage:visites')
    ON CONFLICT DO NOTHING;

    INSERT INTO "public"."role_permissions" (role_name, permission_code) VALUES
      ('agent', 'view:visites'),
      ('agent', 'manage:visites')
    ON CONFLICT DO NOTHING;
  `

  await client.unsafe(sql)
  console.log('Migration des visites appliquée avec succès !')
  process.exit(0)
}

run().catch((err) => {
  console.error('Erreur lors de l\'application de la migration :', err)
  process.exit(1)
})
