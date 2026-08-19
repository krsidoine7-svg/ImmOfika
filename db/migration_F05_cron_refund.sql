-- ============================================================
-- Migration F05 — Relances & Remboursements 87%
-- Favor Company International
-- Date: 2026-05-18
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================

-- 1. Ajouter le compteur de relances sur les réservations si non présent
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS relances_count INT DEFAULT 0;

-- 2. Table pour l'historique des relances (afin de tracer les emails envoyés)
CREATE TABLE IF NOT EXISTS reservation_relances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  numero_relance INT NOT NULL, -- 1, 2 ou 3
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  email_destinateur TEXT NOT NULL
);

-- 3. Fonction principale traitant les relances et expirations quotidiennes
CREATE OR REPLACE FUNCTION traiter_relances_reservations()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_res RECORD;
  v_client_email TEXT;
  v_paid_amount DECIMAL(14, 2);
  v_refund_amount DECIMAL(14, 2);
BEGIN
  -- Boucler sur toutes les réservations actives (en_attente ou confirme) non encore soft-deleted
  FOR v_res IN
    SELECT r.id, r.bien_id, r.client_id, r.statut, r.date_expiration, r.relances_count, b.titre AS bien_titre
    FROM reservations r
    JOIN biens b ON r.bien_id = b.id
    WHERE r.statut IN ('en_attente', 'confirme')
      AND r.deleted_at IS NULL
  LOOP
    -- Récupérer l'email du client depuis son profil
    SELECT email INTO v_client_email
    FROM profiles
    WHERE id = v_res.client_id;

    -- Si pas d'email, utiliser une valeur par défaut
    IF v_client_email IS NULL THEN
      v_client_email := 'client@favorcompany.ci';
    END IF;

    -- ─── CAS 1 : Relance N°1 (30 jours ou moins avant expiration) ───
    IF (v_res.date_expiration - NOW()) <= INTERVAL '30 days' AND v_res.relances_count = 0 THEN
      -- Enregistrer l'envoi de la relance 1
      INSERT INTO reservation_relances (reservation_id, numero_relance, email_destinateur)
      VALUES (v_res.id, 1, v_client_email);

      -- Mettre à jour le compteur de relance
      UPDATE reservations SET relances_count = 1, updated_at = NOW() WHERE id = v_res.id;

    -- ─── CAS 2 : Relance N°2 (15 jours ou moins avant expiration) ───
    ELSIF (v_res.date_expiration - NOW()) <= INTERVAL '15 days' AND v_res.relances_count = 1 THEN
      -- Enregistrer l'envoi de la relance 2
      INSERT INTO reservation_relances (reservation_id, numero_relance, email_destinateur)
      VALUES (v_res.id, 2, v_client_email);

      -- Mettre à jour le compteur de relance
      UPDATE reservations SET relances_count = 2, updated_at = NOW() WHERE id = v_res.id;

    -- ─── CAS 3 : Relance N°3 (3 jours ou moins avant expiration) ───
    ELSIF (v_res.date_expiration - NOW()) <= INTERVAL '3 days' AND v_res.relances_count = 2 THEN
      -- Enregistrer l'envoi de la relance 3
      INSERT INTO reservation_relances (reservation_id, numero_relance, email_destinateur)
      VALUES (v_res.id, 3, v_client_email);

      -- Mettre à jour le compteur de relance
      UPDATE reservations SET relances_count = 3, updated_at = NOW() WHERE id = v_res.id;

    -- ─── CAS 4 : Expiration atteinte (date_expiration dépassée) ───
    ELSIF v_res.date_expiration <= NOW() THEN
      -- Mettre à jour le statut de la réservation à 'expire'
      UPDATE reservations 
      SET statut = 'expire', updated_at = NOW() 
      WHERE id = v_res.id;

      -- Remettre le bien à l'état 'disponible'
      UPDATE biens 
      SET statut = 'disponible', updated_at = NOW() 
      WHERE id = v_res.bien_id;

      -- Gestion du Remboursement de 87% si la réservation avait été confirmée (acompte payé)
      IF v_res.statut = 'confirme' THEN
        -- Récupérer la somme des paiements réussis ('paye') pour cette réservation
        SELECT COALESCE(SUM(montant), 0) INTO v_paid_amount
        FROM paiements
        WHERE reservation_id = v_res.id 
          AND statut = 'paye';

        IF v_paid_amount > 0 THEN
          -- Calculer les 87% à rembourser
          v_refund_amount := v_paid_amount * 0.87;

          -- Créer un enregistrement de paiement de type remboursement
          INSERT INTO paiements (reservation_id, client_id, montant, devise, statut, paystack_reference)
          VALUES (
            v_res.id,
            v_res.client_id,
            v_refund_amount,
            'XOF',
            'rembourse',
            'REFUND-87PCT-' || substring(v_res.id::text from 1 for 8) || '-' || extract(epoch from NOW())::int
          );
        END IF;
      END IF;

    END IF;
  END LOOP;
  RETURN;
END;
$$;

-- Révoquer l'accès public/anonyme car cette fonction n'est exécutée que via pg_cron ou par le système
REVOKE EXECUTE ON FUNCTION traiter_relances_reservations() FROM PUBLIC;

-- 4. Activer pg_cron et planifier le job quotidien (Optionnel / Nécessite les droits superuser)
-- À n'exécuter que si pg_cron est activé sur votre instance Supabase.
-- SELECT cron.schedule(
--   'traiter-relances-reservations-quotidien',
--   '0 1 * * *', -- Tous les jours à 01h00 du matin
--   $$ SELECT traiter_relances_reservations(); $$
-- );
