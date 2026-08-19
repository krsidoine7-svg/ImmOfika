import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString)
const db = drizzle(client)

async function setup() {
  console.log('Setting up reserver_bien_atomic RPC...')

  const sql = `
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
      v_titre TEXT;
      v_reservation_id UUID;
    BEGIN
      -- Verrouiller la ligne pour éviter concurrence
      SELECT statut, titre INTO v_statut, v_titre
      FROM biens
      WHERE id = p_bien_id
      FOR UPDATE NOWAIT;

      IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Bien introuvable');
      END IF;

      IF v_statut != 'disponible' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Bien non disponible');
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

      -- Mettre à jour le statut du bien
      UPDATE biens SET statut = 'reserve', updated_at = NOW()
      WHERE id = p_bien_id;

      RETURN jsonb_build_object(
        'success', true,
        'reservation_id', v_reservation_id,
        'bien_titre', v_titre
      );

    EXCEPTION
      WHEN lock_not_available THEN
        RETURN jsonb_build_object('success', false, 'error', 'Bien en cours de réservation par un autre utilisateur');
    END;
    $$;

    REVOKE EXECUTE ON FUNCTION reserver_bien_atomic(UUID, UUID) FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION reserver_bien_atomic(UUID, UUID) TO authenticated;
  `

  await client.unsafe(sql)

  console.log('RPC reserver_bien_atomic created successfully!')
  process.exit(0)
}

setup().catch((err) => {
  console.error('Error creating RPC:', err)
  process.exit(1)
})
