import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString)

async function run() {
  console.log('Applique la migration des dossiers et tâches CRM...')

  const sql = `
    CREATE TABLE IF NOT EXISTS "public"."dossiers" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "client_id" uuid NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
      "agent_id" uuid REFERENCES "public"."profiles"("id") ON DELETE SET NULL,
      "bien_id" uuid REFERENCES "public"."biens"("id") ON DELETE SET NULL,
      "titre" text NOT NULL,
      "description" text,
      "statut" text DEFAULT 'ouvert' NOT NULL,
      "progression" integer DEFAULT 0 NOT NULL,
      "priorite" text DEFAULT 'normale' NOT NULL,
      "deadline" timestamp,
      "created_at" timestamp DEFAULT NOW() NOT NULL,
      "updated_at" timestamp DEFAULT NOW() NOT NULL,
      "deleted_at" timestamp
    );

    CREATE TABLE IF NOT EXISTS "public"."taches" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "dossier_id" uuid NOT NULL REFERENCES "public"."dossiers"("id") ON DELETE CASCADE,
      "titre" text NOT NULL,
      "description" text,
      "assignee_id" uuid REFERENCES "public"."profiles"("id") ON DELETE SET NULL,
      "statut" text DEFAULT 'a_faire' NOT NULL,
      "priorite" text DEFAULT 'normale' NOT NULL,
      "deadline" timestamp,
      "bloque_commentaire" text,
      "created_at" timestamp DEFAULT NOW() NOT NULL,
      "updated_at" timestamp DEFAULT NOW() NOT NULL,
      "deleted_at" timestamp
    );

    CREATE INDEX IF NOT EXISTS "dossiers_client_idx" ON "public"."dossiers" ("client_id");
    CREATE INDEX IF NOT EXISTS "dossiers_agent_idx" ON "public"."dossiers" ("agent_id");
    CREATE INDEX IF NOT EXISTS "taches_dossier_idx" ON "public"."taches" ("dossier_id");

    INSERT INTO "public"."permissions" (code, description) VALUES
      ('view:dossiers', 'Voir la liste des dossiers de suivi et leurs tâches'),
      ('manage:dossiers', 'Créer, modifier, affecter et supprimer des dossiers et tâches')
    ON CONFLICT (code) DO NOTHING;

    INSERT INTO "public"."role_permissions" (role_name, permission_code) VALUES
      ('admin', 'view:dossiers'),
      ('admin', 'manage:dossiers')
    ON CONFLICT DO NOTHING;

    INSERT INTO "public"."role_permissions" (role_name, permission_code) VALUES
      ('agent', 'view:dossiers'),
      ('agent', 'manage:dossiers')
    ON CONFLICT DO NOTHING;
  `

  await client.unsafe(sql)
  console.log('Migration des dossiers et tâches appliquée avec succès !')
  process.exit(0)
}

run().catch((err) => {
  console.error('Erreur lors de l\'application de la migration :', err)
  process.exit(1)
})
