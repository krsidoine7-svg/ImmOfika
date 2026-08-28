-- ===============================================================
-- IMMOFIKA — SCRIPT DE SÉCURISATION ROW LEVEL SECURITY (RLS) SUPABASE
-- 100% des tables du schéma public protégées
-- ===============================================================

-- 1. Helper Functions pour la vérification des rôles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (role IN ('admin', 'super_admin', 'tech_super_admin') OR role LIKE '%admin%')
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (role IN ('admin', 'super_admin', 'tech_super_admin', 'agent', 'gestionnaire') OR role LIKE '%admin%' OR role LIKE '%agent%')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Activation de RLS sur l'intégralité des tables
ALTER TABLE "public"."bien_confies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."bien_images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."cookie_consents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."biens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."favoris" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."agent_indisponibilites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."analytics_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."agent_calendriers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."homepage_configs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."newsletter_subscribers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."paiements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."formulaires" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."lead_interactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."push_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."reservation_relances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."reservations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."suggestions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."taches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."system_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."todos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."dossiers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."formulaire_reponses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."visites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."visite_avis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."contract_templates" ENABLE ROW LEVEL SECURITY;

-- 3. Exemples de Politiques RLS (Public, Clients & Staff)

-- Biens & Contenus publics (Lecture publique, Modification Staff)
CREATE POLICY "Public_Read_biens" ON "public"."biens" FOR SELECT USING (true);
CREATE POLICY "Staff_Full_Access_biens" ON "public"."biens" FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "Public_Read_bien_images" ON "public"."bien_images" FOR SELECT USING (true);
CREATE POLICY "Staff_Full_Access_bien_images" ON "public"."bien_images" FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Profils utilisateurs
CREATE POLICY "User_Own_Profile_Select" ON "public"."profiles" FOR SELECT USING (auth.uid() = id OR public.is_staff());
CREATE POLICY "User_Own_Profile_Update" ON "public"."profiles" FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Réservations & Paiements
CREATE POLICY "User_Own_Reservations" ON "public"."reservations" FOR ALL USING (auth.uid() = client_id OR public.is_staff());
CREATE POLICY "User_Own_Paiements" ON "public"."paiements" FOR ALL USING (auth.uid() = client_id OR public.is_staff());
