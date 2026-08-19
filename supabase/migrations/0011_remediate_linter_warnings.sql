-- Migration: 0011_remediate_linter_warnings.sql
-- Remediate database linter warnings regarding function search paths, execution privileges, and permissive RLS policies.

-- 1. Remediate mutable search path warnings
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.is_admin() SET search_path = public, pg_temp;
ALTER FUNCTION public.reserver_bien_atomic(UUID, UUID) SET search_path = public, pg_temp;
ALTER FUNCTION public.traiter_relances_reservations() SET search_path = public, pg_temp;

-- 2. Convert public.is_admin() to SECURITY INVOKER (resolves executable warning safely)
ALTER FUNCTION public.is_admin() SECURITY INVOKER;

-- 3. Remediate anonymous/authenticated security definer function execution warnings
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reserver_bien_atomic(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.traiter_relances_reservations() FROM PUBLIC;

-- Grant execution privileges back to correct roles
GRANT EXECUTE ON FUNCTION public.reserver_bien_atomic(UUID, UUID) TO authenticated;

-- 4. Remediate permissive RLS policies with check (true)
DROP POLICY IF EXISTS "Allow anonymous lead insertion" ON "public"."leads";
CREATE POLICY "Allow anonymous lead insertion" ON "public"."leads"
  FOR INSERT WITH CHECK (telephone IS NOT NULL AND telephone <> '');

DROP POLICY IF EXISTS "Public insert - newsletter" ON "public"."newsletter_subscribers";
CREATE POLICY "Public insert - newsletter" ON "public"."newsletter_subscribers"
  FOR INSERT WITH CHECK (email IS NOT NULL AND email <> '');

-- 5. Remediate "RLS Enabled No Policy" warnings
-- Admin-only tables (Internal/CRM management)
DROP POLICY IF EXISTS "Admin full access" ON "public"."dossiers";
CREATE POLICY "Admin full access" ON "public"."dossiers" FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access" ON "public"."taches";
CREATE POLICY "Admin full access" ON "public"."taches" FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access" ON "public"."visites";
CREATE POLICY "Admin full access" ON "public"."visites" FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access" ON "public"."reservation_relances";
CREATE POLICY "Admin full access" ON "public"."reservation_relances" FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access" ON "public"."permissions";
CREATE POLICY "Admin full access" ON "public"."permissions" FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access" ON "public"."roles";
CREATE POLICY "Admin full access" ON "public"."roles" FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access" ON "public"."role_permissions";
CREATE POLICY "Admin full access" ON "public"."role_permissions" FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access" ON "public"."info_mocker";
CREATE POLICY "Admin full access" ON "public"."info_mocker" FOR ALL USING (public.is_admin());

-- Publicly readable tables
DROP POLICY IF EXISTS "Public read access" ON "public"."properties";
CREATE POLICY "Public read access" ON "public"."properties" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin full access" ON "public"."properties";
CREATE POLICY "Admin full access" ON "public"."properties" FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public read access" ON "public"."team_members";
CREATE POLICY "Public read access" ON "public"."team_members" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin full access" ON "public"."team_members";
CREATE POLICY "Admin full access" ON "public"."team_members" FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public read access" ON "public"."todos";
CREATE POLICY "Public read access" ON "public"."todos" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin full access" ON "public"."todos";
CREATE POLICY "Admin full access" ON "public"."todos" FOR ALL USING (public.is_admin());
