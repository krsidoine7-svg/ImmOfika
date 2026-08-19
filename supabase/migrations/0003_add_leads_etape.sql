-- Custom SQL migration file, put your code below! --
ALTER TABLE "public"."leads" ADD COLUMN IF NOT EXISTS "etape" text DEFAULT 'prospect' NOT NULL;
CREATE INDEX IF NOT EXISTS "leads_etape_idx" ON "public"."leads" ("etape");
