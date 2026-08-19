-- Migration F16 : Ajout de la colonne suspension_reason pour le suivi de modération et LBC-FT
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspension_reason TEXT;
