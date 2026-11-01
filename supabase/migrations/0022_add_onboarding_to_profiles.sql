-- ==============================================================================
-- IMMOFIKA - Migration 0022 : Colonnes Onboarding & Organisation sur profiles
-- ==============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_onboarded'
  ) THEN
    ALTER TABLE "public"."profiles" ADD COLUMN "is_onboarded" BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE "public"."profiles" ADD COLUMN "organization_id" UUID REFERENCES "public"."organizations"("id") ON DELETE SET NULL;
  END IF;
END $$;

-- Les comptes administrateurs et managers existants sont marqués onboarded par défaut
UPDATE "public"."profiles" 
SET "is_onboarded" = TRUE 
WHERE "role" IN ('admin', 'super_admin', 'tech_super_admin', 'agent') 
   OR "phone" IS NOT NULL;

