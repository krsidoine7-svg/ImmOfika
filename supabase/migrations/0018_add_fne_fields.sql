-- Migration 0018: Facture Normalisée Électronique (FNE — DGI Côte d'Ivoire / Arrêté 0337)
-- Ajout des champs de certification fiscale et table de séquences annuelles

DO $$ 
BEGIN
  -- 1. Ajout des colonnes FNE à la table paiements
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'paiements' AND column_name = 'fne_numero'
  ) THEN
    ALTER TABLE paiements ADD COLUMN fne_numero text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'paiements' AND column_name = 'fne_type'
  ) THEN
    ALTER TABLE paiements ADD COLUMN fne_type text NOT NULL DEFAULT 'VENTE';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'paiements' AND column_name = 'fne_qr_data'
  ) THEN
    ALTER TABLE paiements ADD COLUMN fne_qr_data text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'paiements' AND column_name = 'fne_signature'
  ) THEN
    ALTER TABLE paiements ADD COLUMN fne_signature text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'paiements' AND column_name = 'fne_statut'
  ) THEN
    ALTER TABLE paiements ADD COLUMN fne_statut text NOT NULL DEFAULT 'non_certifie';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'paiements' AND column_name = 'fne_certifie_le'
  ) THEN
    ALTER TABLE paiements ADD COLUMN fne_certifie_le timestamp with time zone;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'paiements' AND column_name = 'fne_original_id'
  ) THEN
    ALTER TABLE paiements ADD COLUMN fne_original_id uuid REFERENCES paiements(id) ON DELETE SET NULL;
  END IF;

END $$;

-- 2. Création de la table fne_sequences (séquence annuelle ininterrompue - Art. 5)
CREATE TABLE IF NOT EXISTS fne_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  annee integer NOT NULL,
  type text NOT NULL DEFAULT 'VENTE',
  derniere_sequence integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT uq_fne_annee_type UNIQUE (annee, type)
);

-- Index d'optimisation
CREATE INDEX IF NOT EXISTS idx_paiements_fne_numero ON paiements(fne_numero);
CREATE INDEX IF NOT EXISTS idx_paiements_fne_statut ON paiements(fne_statut);
CREATE INDEX IF NOT EXISTS idx_fne_sequences_annee_type ON fne_sequences(annee, type);

