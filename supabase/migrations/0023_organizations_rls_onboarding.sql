-- ==============================================================================
-- IMMOFIKA - Migration 0023 : Politiques RLS pour l'Onboarding Organisations
-- ==============================================================================

-- 1. Permettre aux utilisateurs authentifiés de créer leur organisation lors de l'onboarding
DROP POLICY IF EXISTS "organizations_insert_authenticated" ON "public"."organizations";
CREATE POLICY "organizations_insert_authenticated" ON "public"."organizations"
FOR INSERT TO authenticated
WITH CHECK (type IN ('agence', 'promoteur'));

-- 2. Permettre aux gérants de modifier les informations de leur organisation
DROP POLICY IF EXISTS "organizations_update_gerant" ON "public"."organizations";
CREATE POLICY "organizations_update_gerant" ON "public"."organizations"
FOR UPDATE TO authenticated
USING (
  id IN (
    SELECT organization_id 
    FROM "public"."organization_members" 
    WHERE user_id = auth.uid() AND role_in_org = 'gerant'
  ) OR public.is_admin()
)
WITH CHECK (
  id IN (
    SELECT organization_id 
    FROM "public"."organization_members" 
    WHERE user_id = auth.uid() AND role_in_org = 'gerant'
  ) OR public.is_admin()
);

-- 3. Permettre aux utilisateurs de s'enregistrer comme gérant de leur organisation
DROP POLICY IF EXISTS "organization_members_insert_own" ON "public"."organization_members";
CREATE POLICY "organization_members_insert_own" ON "public"."organization_members"
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- 4. Permettre aux gérants d'ajouter des membres dans leur organisation
DROP POLICY IF EXISTS "organization_members_manage_by_gerant" ON "public"."organization_members";
CREATE POLICY "organization_members_manage_by_gerant" ON "public"."organization_members"
FOR ALL TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM "public"."organization_members" 
    WHERE user_id = auth.uid() AND role_in_org = 'gerant'
  ) OR public.is_admin()
);

