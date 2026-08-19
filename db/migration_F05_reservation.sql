-- ============================================================
-- Migration F05 — Réservation Atomique
-- Favor Company International
-- Date: 2026-05-17
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================

-- Fonction RPC atomique pour réserver un bien
-- Utilise FOR UPDATE NOWAIT pour éviter les double-réservations concurrentes
CREATE OR REPLACE FUNCTION reserver_bien_atomic(
  p_bien_id UUID,
  p_client_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_statut TEXT;
  v_reservation_id UUID;
  v_titre TEXT;
BEGIN
  -- Verrouiller la ligne pour éviter concurrence
  SELECT statut, titre INTO v_statut, v_titre
  FROM biens
  WHERE id = p_bien_id
    AND deleted_at IS NULL
  FOR UPDATE NOWAIT;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bien introuvable');
  END IF;

  IF v_statut != 'disponible' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ce bien n''est plus disponible à la réservation',
      'statut', v_statut
    );
  END IF;

  -- Vérifier si le client a déjà une réservation active sur ce bien
  IF EXISTS (
    SELECT 1 FROM reservations
    WHERE bien_id = p_bien_id
      AND client_id = p_client_id
      AND statut IN ('en_attente', 'confirme')
      AND deleted_at IS NULL
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Vous avez déjà une réservation active sur ce bien');
  END IF;

  -- Créer la réservation
  INSERT INTO reservations (bien_id, client_id, statut, date_expiration)
  VALUES (
    p_bien_id,
    p_client_id,
    'en_attente',
    NOW() + INTERVAL '3 months'
  )
  RETURNING id INTO v_reservation_id;

  -- Mettre à jour le statut du bien → réservé
  UPDATE biens
  SET statut = 'reserve', updated_at = NOW()
  WHERE id = p_bien_id;

  RETURN jsonb_build_object(
    'success', true,
    'reservation_id', v_reservation_id,
    'bien_titre', v_titre
  );

EXCEPTION
  WHEN lock_not_available THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ce bien est en cours de réservation par un autre utilisateur. Veuillez réessayer dans quelques secondes.'
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Révoquer l'accès public/anonyme et l'autoriser uniquement pour les utilisateurs authentifiés
REVOKE EXECUTE ON FUNCTION reserver_bien_atomic(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION reserver_bien_atomic(UUID, UUID) TO authenticated;

-- Policy : seul le client concerné peut voir ses propres réservations
-- (déjà créée dans la migration F04, on ajoute la policy d'insertion pour les clients)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'reservations' AND policyname = 'reservations_insert_own'
  ) THEN
    CREATE POLICY "reservations_insert_own" ON "reservations"
      FOR INSERT WITH CHECK (auth.uid() = client_id);
  END IF;
END $$;
