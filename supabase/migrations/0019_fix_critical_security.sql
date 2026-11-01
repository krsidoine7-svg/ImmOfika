-- ==============================================================================
-- IMMOFIKA - Migration 0019 : Sécurisation Critique RLS & Verrouillage Profils
-- ==============================================================================

-- 1. Activer RLS sur les tables encore exposées
ALTER TABLE IF EXISTS "public"."user_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."default_role_permissions" ENABLE ROW LEVEL SECURITY;

-- 2. Politiques RLS strictes sur user_roles
DROP POLICY IF EXISTS "user_roles_read_own_or_admin" ON "public"."user_roles";
CREATE POLICY "user_roles_read_own_or_admin" ON "public"."user_roles"
FOR SELECT USING (
  auth.uid() = user_id OR public.is_admin()
);

DROP POLICY IF EXISTS "user_roles_admin_manage" ON "public"."user_roles";
CREATE POLICY "user_roles_admin_manage" ON "public"."user_roles"
FOR ALL USING (
  public.is_admin()
) WITH CHECK (
  public.is_admin()
);

-- 3. Politiques RLS sur default_role_permissions (lecture publique, écriture admin)
DROP POLICY IF EXISTS "default_role_permissions_read" ON "public"."default_role_permissions";
CREATE POLICY "default_role_permissions_read" ON "public"."default_role_permissions"
FOR SELECT USING (true);

DROP POLICY IF EXISTS "default_role_permissions_admin_write" ON "public"."default_role_permissions";
CREATE POLICY "default_role_permissions_admin_write" ON "public"."default_role_permissions"
FOR ALL USING (
  public.is_admin()
) WITH CHECK (
  public.is_admin()
);

-- 4. Protection absolue anti-élévation de privilège sur profiles.role
-- Empêche tout utilisateur standard de modifier son propre champ 'role'
CREATE OR REPLACE FUNCTION public.protect_profile_role_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Si le rôle est modifié
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Vérifier si l'acteur actuel est administrateur
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Tentative d élévation de privilège interdite : la modification du rôle est réservée aux administrateurs.'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON "public"."profiles";
CREATE TRIGGER trg_protect_profile_role
BEFORE UPDATE ON "public"."profiles"
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_role_update();

-- 5. Renforcement de la politique User_Own_Profile_Update sur profiles
DROP POLICY IF EXISTS "User_Own_Profile_Update" ON "public"."profiles";
CREATE POLICY "User_Own_Profile_Update" ON "public"."profiles"
FOR UPDATE USING (
  auth.uid() = id
) WITH CHECK (
  auth.uid() = id
);

