-- Custom SQL migration file, put your code below! --
CREATE TABLE IF NOT EXISTS "public"."agent_calendriers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "agent_id" uuid NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
  "ical_url" text NOT NULL,
  "last_synced_at" timestamp,
  "created_at" timestamp DEFAULT NOW() NOT NULL,
  "updated_at" timestamp DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."agent_indisponibilites" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "agent_id" uuid NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
  "titre" text NOT NULL,
  "date_debut" timestamp NOT NULL,
  "date_fin" timestamp NOT NULL,
  "created_at" timestamp DEFAULT NOW() NOT NULL,
  "updated_at" timestamp DEFAULT NOW() NOT NULL,
  "deleted_at" timestamp
);

-- Index pour accélérer les jointures et requêtes de disponibilité
CREATE INDEX IF NOT EXISTS "agent_calendriers_agent_idx" ON "public"."agent_calendriers" ("agent_id");
CREATE INDEX IF NOT EXISTS "agent_indisponibilites_agent_idx" ON "public"."agent_indisponibilites" ("agent_id");
CREATE INDEX IF NOT EXISTS "agent_indisponibilites_dates_idx" ON "public"."agent_indisponibilites" ("date_debut", "date_fin");

-- Activer RLS (Row Level Security)
ALTER TABLE "public"."agent_calendriers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."agent_indisponibilites" ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour agent_calendriers
DROP POLICY IF EXISTS "lecture_agent_calendriers" ON "public"."agent_calendriers";
CREATE POLICY "lecture_agent_calendriers" ON "public"."agent_calendriers"
  FOR SELECT USING (
    auth.uid() = agent_id 
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

DROP POLICY IF EXISTS "ecriture_agent_calendriers" ON "public"."agent_calendriers";
CREATE POLICY "ecriture_agent_calendriers" ON "public"."agent_calendriers"
  FOR ALL USING (
    auth.uid() = agent_id 
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- Politiques RLS pour agent_indisponibilites
DROP POLICY IF EXISTS "lecture_agent_indisponibilites" ON "public"."agent_indisponibilites";
CREATE POLICY "lecture_agent_indisponibilites" ON "public"."agent_indisponibilites"
  FOR SELECT USING (
    auth.uid() = agent_id 
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

DROP POLICY IF EXISTS "ecriture_agent_indisponibilites" ON "public"."agent_indisponibilites";
CREATE POLICY "ecriture_agent_indisponibilites" ON "public"."agent_indisponibilites"
  FOR ALL USING (
    auth.uid() = agent_id 
    OR (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );
