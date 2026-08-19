-- Custom SQL migration file, put your code below! --
ALTER TABLE "public"."leads" ADD COLUMN IF NOT EXISTS "visite_confirmee" boolean DEFAULT false NOT NULL;
ALTER TABLE "public"."leads" ADD COLUMN IF NOT EXISTS "offre_validee" boolean DEFAULT false NOT NULL;
ALTER TABLE "public"."leads" ADD COLUMN IF NOT EXISTS "engagement_signe" boolean DEFAULT false NOT NULL;
