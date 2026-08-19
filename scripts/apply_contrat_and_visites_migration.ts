import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
if (!connectionString) {
  console.error('DATABASE_URL absente dans .env.local')
  process.exit(1)
}

const client = postgres(connectionString)

async function run() {
  console.log('Applique les migrations pour les contrats, reçus, plages horaires et avis de visites...')

  const sql = `
    -- Reservations columns
    ALTER TABLE "public"."reservations" ADD COLUMN IF NOT EXISTS "contrat_genere_url" text;
    ALTER TABLE "public"."reservations" ADD COLUMN IF NOT EXISTS "contrat_genere_nom" text;
    ALTER TABLE "public"."reservations" ADD COLUMN IF NOT EXISTS "contrat_statut" text DEFAULT 'non_genere';
    ALTER TABLE "public"."reservations" ADD COLUMN IF NOT EXISTS "contrat_rejet_raison" text;
    ALTER TABLE "public"."reservations" ADD COLUMN IF NOT EXISTS "signature_client_url" text;
    ALTER TABLE "public"."reservations" ADD COLUMN IF NOT EXISTS "signed_at" timestamp;
    ALTER TABLE "public"."reservations" ADD COLUMN IF NOT EXISTS "signature_token" text;
    ALTER TABLE "public"."reservations" ADD COLUMN IF NOT EXISTS "agrement_numero" text;
    ALTER TABLE "public"."reservations" ADD COLUMN IF NOT EXISTS "notaire_nom" text;

    -- Paiements columns
    ALTER TABLE "public"."paiements" ADD COLUMN IF NOT EXISTS "recu_numero" text;
    ALTER TABLE "public"."paiements" ADD COLUMN IF NOT EXISTS "recu_url" text;
    ALTER TABLE "public"."paiements" ADD COLUMN IF NOT EXISTS "cumul_paye" numeric(14, 2);
    ALTER TABLE "public"."paiements" ADD COLUMN IF NOT EXISTS "reste_a_payer" numeric(14, 2);

    -- Visites columns
    ALTER TABLE "public"."visites" ADD COLUMN IF NOT EXISTS "plage_horaire" text DEFAULT 'matin';

    -- Table Visite Avis
    CREATE TABLE IF NOT EXISTS "public"."visite_avis" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "visite_id" uuid NOT NULL REFERENCES "public"."visites"("id") ON DELETE CASCADE,
      "client_id" uuid NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
      "agent_id" uuid REFERENCES "public"."profiles"("id") ON DELETE SET NULL,
      "note" integer NOT NULL,
      "commentaire" text,
      "is_public" boolean DEFAULT true NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `

  await client.unsafe(sql)
  console.log('✅ Migrations appliquées avec succès dans la base de données PostgreSQL !')
  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Erreur lors de l\'application de la migration :', err)
  process.exit(1)
})
