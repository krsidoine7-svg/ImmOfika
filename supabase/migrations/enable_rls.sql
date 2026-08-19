-- 1. Activer RLS sur toutes les tables
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."reservations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."paiements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."favoris" ENABLE ROW LEVEL SECURITY;

-- 2. Création des Policies (Règles d'accès)

-- PROFILES
-- Les clients ne peuvent voir et modifier que leur propre profil
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil"
ON "public"."profiles" FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
ON "public"."profiles" FOR UPDATE
USING (auth.uid() = id);

-- RESERVATIONS
-- Les clients ne peuvent voir que leurs propres réservations
CREATE POLICY "Les clients voient leurs propres réservations"
ON "public"."reservations" FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Les clients peuvent créer une réservation"
ON "public"."reservations" FOR INSERT
WITH CHECK (auth.uid() = client_id);

-- PAIEMENTS
-- Les clients ne peuvent voir que leurs propres paiements
CREATE POLICY "Les clients voient leurs propres paiements"
ON "public"."paiements" FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Les clients peuvent insérer un paiement"
ON "public"."paiements" FOR INSERT
WITH CHECK (auth.uid() = client_id);

-- FAVORIS
-- Les clients gèrent leurs favoris
CREATE POLICY "Les clients voient leurs favoris"
ON "public"."favoris" FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Les clients gèrent leurs favoris"
ON "public"."favoris" FOR ALL
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

-- 3. Exception pour les Administrateurs
-- On donne l'accès complet aux administrateurs pour TOUTES les tables.
-- On crée d'abord une fonction pour vérifier si l'utilisateur courant est admin.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY INVOKER;

-- Ajout des accès Admin
CREATE POLICY "Admin full access - profiles" ON "public"."profiles" FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access - reservations" ON "public"."reservations" FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access - paiements" ON "public"."paiements" FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access - favoris" ON "public"."favoris" FOR ALL USING (public.is_admin());
