-- ==============================================================================
-- IMMOFIKA - Migration 0016 : Renforcement RBAC (Verrouillage et Expiration de Rôles)
-- ==============================================================================

-- 1. Ajout de is_locked sur la table roles (pour verrouiller SUPER_ADMIN)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'roles' AND column_name = 'is_locked'
  ) THEN
    ALTER TABLE "roles" ADD COLUMN "is_locked" BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

-- 2. Ajout de expires_at sur la table user_roles (pour l'expiration optionnelle de rôle)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_roles' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE "user_roles" ADD COLUMN "expires_at" TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- 3. Verrouiller explicitement le rôle super_admin
UPDATE "roles" SET "is_locked" = TRUE WHERE "name" IN ('super_admin', 'tech_super_admin', 'tech');

