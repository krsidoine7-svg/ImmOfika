-- ============================================================
-- Migration F04 — Catalogue & Détail Biens
-- Favor Company International
-- Date: 2026-05-17
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================

-- 1. Table principale des biens immobiliers
-- (Remplace la table 'properties' créée précédemment)
-- Si 'properties' existe déjà, l'exécuter après un DROP ou renommer.

CREATE TABLE IF NOT EXISTS "biens" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug"            TEXT NOT NULL UNIQUE,
  "titre"           TEXT NOT NULL,
  "description"     TEXT NOT NULL,
  "prix"            NUMERIC(14, 2) NOT NULL,
  "type"            TEXT NOT NULL,       -- terrain, villa, appartement, bureau, commerce, entrepot
  "transaction"     TEXT NOT NULL,       -- vente, location
  "statut"          TEXT NOT NULL DEFAULT 'disponible', -- disponible, reserve, vendu, loue

  -- Localisation
  "ville"           TEXT NOT NULL,
  "quartier"        TEXT,
  "adresse"         TEXT,
  "latitude"        NUMERIC(10, 7),
  "longitude"       NUMERIC(10, 7),

  -- Caractéristiques
  "surface"         NUMERIC(10, 2),     -- en m²
  "chambres"        INTEGER,
  "salles_de_bain"  INTEGER,
  "etages"          INTEGER,
  "parking"         BOOLEAN DEFAULT FALSE,
  "piscine"         BOOLEAN DEFAULT FALSE,
  "jardin"          BOOLEAN DEFAULT FALSE,
  "meuble"          BOOLEAN DEFAULT FALSE,
  "gardiennage"     BOOLEAN DEFAULT FALSE,

  -- Médias
  "main_image_url"  TEXT,
  "video_url"       TEXT,
  "pdf_annexe_url"  TEXT,

  -- Méta
  "vues"            INTEGER DEFAULT 0 NOT NULL,
  "agent_id"        UUID,               -- FK vers profiles
  "featured_until"  TIMESTAMPTZ,

  "created_at"      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updated_at"      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "deleted_at"      TIMESTAMPTZ          -- Soft Delete
);

-- 2. Images additionnelles d'un bien
CREATE TABLE IF NOT EXISTS "bien_images" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "bien_id"   UUID NOT NULL REFERENCES "biens"("id") ON DELETE CASCADE,
  "url"       TEXT NOT NULL,
  "caption"   TEXT,
  "order"     INTEGER DEFAULT 0 NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Favoris des clients
CREATE TABLE IF NOT EXISTS "favoris" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "client_id"  UUID NOT NULL,           -- FK vers profiles (auth.users)
  "bien_id"    UUID NOT NULL REFERENCES "biens"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE ("client_id", "bien_id")       -- Un favori par client par bien
);

-- 4. Réservations
CREATE TABLE IF NOT EXISTS "reservations" (
  "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "bien_id"          UUID NOT NULL REFERENCES "biens"("id") ON DELETE RESTRICT,
  "client_id"        UUID NOT NULL,
  "statut"           TEXT NOT NULL DEFAULT 'en_attente', -- en_attente, confirme, expire, annule
  "date_expiration"  TIMESTAMPTZ NOT NULL,
  "notes"            TEXT,
  "created_at"       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updated_at"       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "deleted_at"       TIMESTAMPTZ          -- Soft Delete
);

-- 5. Paiements
CREATE TABLE IF NOT EXISTS "paiements" (
  "id"                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "reservation_id"       UUID NOT NULL REFERENCES "reservations"("id") ON DELETE RESTRICT,
  "client_id"            UUID NOT NULL,
  "montant"              NUMERIC(14, 2) NOT NULL,
  "devise"               TEXT NOT NULL DEFAULT 'XOF',
  "statut"               TEXT NOT NULL DEFAULT 'en_attente', -- en_attente, paye, rembourse, echoue
  "paystack_reference"   TEXT UNIQUE,
  "paystack_channel"     TEXT,          -- mobile_money, card, bank_transfer
  "facture_numero"       TEXT UNIQUE,
  "facture_url"          TEXT,
  "paid_at"              TIMESTAMPTZ,
  "created_at"           TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updated_at"           TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "deleted_at"           TIMESTAMPTZ          -- Soft Delete
);

-- ============================================================
-- INDEX pour les performances
-- ============================================================
CREATE INDEX IF NOT EXISTS "idx_biens_statut" ON "biens"("statut") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "idx_biens_type" ON "biens"("type") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "idx_biens_ville" ON "biens"("ville") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "idx_biens_prix" ON "biens"("prix") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "idx_biens_created" ON "biens"("created_at" DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "idx_bien_images_bien_id" ON "bien_images"("bien_id");
CREATE INDEX IF NOT EXISTS "idx_favoris_client" ON "favoris"("client_id");
CREATE INDEX IF NOT EXISTS "idx_reservations_client" ON "reservations"("client_id") WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS "idx_reservations_bien" ON "reservations"("bien_id") WHERE deleted_at IS NULL;

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
ALTER TABLE "biens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bien_images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "favoris" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reservations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "paiements" ENABLE ROW LEVEL SECURITY;

-- Biens : lecture publique des biens disponibles
CREATE POLICY "biens_public_read" ON "biens"
  FOR SELECT USING (deleted_at IS NULL);

-- Images : lecture publique
CREATE POLICY "bien_images_public_read" ON "bien_images"
  FOR SELECT USING (true);

-- Favoris : chaque client voit seulement les siens
CREATE POLICY "favoris_own" ON "favoris"
  FOR ALL USING (auth.uid() = client_id);

-- Réservations : chaque client voit les siennes
CREATE POLICY "reservations_own_client" ON "reservations"
  FOR SELECT USING (auth.uid() = client_id AND deleted_at IS NULL);

-- Paiements : chaque client voit les siens
CREATE POLICY "paiements_own_client" ON "paiements"
  FOR SELECT USING (auth.uid() = client_id AND deleted_at IS NULL);

-- ============================================================
-- Données de test (biens fictifs)
-- ============================================================
INSERT INTO "biens" (slug, titre, description, prix, type, transaction, statut, ville, quartier, surface, chambres, salles_de_bain, parking, main_image_url, vues)
VALUES
  ('terrain-cocody-1000m2-01', 'Terrain plat à Cocody — 1000 m²', 'Beau terrain plat de 1000 m² idéalement situé à Cocody, proche des grandes artères. Idéal pour construction villa ou immeuble R+3. Titre foncier disponible.', 45000000, 'terrain', 'vente', 'disponible', 'Abidjan', 'Cocody', 1000, NULL, NULL, false, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', 128),
  ('villa-duplex-riviera-4ch', 'Villa duplex Riviera — 4 chambres', 'Magnifique villa duplex en résidence sécurisée à la Riviera. 4 chambres avec dressing, 3 salles de bain, grande piscine, jardin, 2 parkings. Finitions haut de gamme.', 120000000, 'villa', 'vente', 'disponible', 'Abidjan', 'Riviera', 450, 4, 3, true, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', 312),
  ('appartement-2ch-marcory', 'Appartement 2 chambres — Marcory', 'Appartement moderne de 85 m² au 3ème étage, bien ventilé. Cuisine équipée, grand salon, 2 chambres avec placard intégré. Sécurité 24h/24.', 750000, 'appartement', 'location', 'disponible', 'Abidjan', 'Marcory', 85, 2, 1, true, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 87),
  ('bureau-plateau-180m2', 'Bureau open-space Plateau — 180 m²', 'Espace de bureau moderne et lumineux de 180 m² en plein cœur du Plateau financier. Idéal pour startup ou PME. Câblage réseau complet, salle de réunion incluse.', 3500000, 'bureau', 'location', 'disponible', 'Abidjan', 'Plateau', 180, NULL, 2, true, 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', 54),
  ('villa-3ch-yopougon', 'Villa 3 chambres — Yopougon', 'Belle villa de plain-pied avec jardin spacieux et gardiennage. 3 chambres, 2 salles de bain, cuisine américaine. Quartier calme et résidentiel.', 65000000, 'villa', 'vente', 'disponible', 'Abidjan', 'Yopougon', 200, 3, 2, true, 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800', 203),
  ('terrain-bingerville-500m2', 'Terrain bord de lagune Bingerville — 500 m²', 'Terrain de 500 m² avec vue imprenable sur la lagune. Documents en règle. Accès facile, idéal pour résidence secondaire ou villa de luxe.', 28000000, 'terrain', 'vente', 'reserve', 'Bingerville', NULL, 500, NULL, NULL, false, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', 176)
ON CONFLICT (slug) DO NOTHING;
