import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const sql = postgres(connectionString, { max: 1 })

async function checkData() {
  console.log("=== 🏠 1. BIENS RÉSERVÉS OU VENDUS ===")
  const biensReserves = await sql`
    SELECT b.id, b.slug, b.titre, b.type, b.transaction, b.prix, b.statut, b.ville, b.quartier, p.full_name as agent_name, p.email as agent_email
    FROM biens b
    LEFT JOIN profiles p ON b.agent_id = p.id
    WHERE b.statut IN ('reserve', 'vendu') AND b.deleted_at IS NULL
    ORDER BY b.created_at DESC;
  `
  console.log(JSON.stringify(biensReserves, null, 2))

  console.log("\n=== 📋 2. TOUTES LES RÉSERVATIONS ===")
  const reservationsList = await sql`
    SELECT r.id, r.statut, r.date_expiration, r.notes, r.created_at,
           b.titre as bien_titre, b.prix as bien_prix, b.statut as bien_statut,
           c.full_name as client_name, c.email as client_email
    FROM reservations r
    LEFT JOIN biens b ON r.bien_id = b.id
    LEFT JOIN profiles c ON r.client_id = c.id
    WHERE r.deleted_at IS NULL
    ORDER BY r.created_at DESC;
  `
  console.log(JSON.stringify(reservationsList, null, 2))

  console.log("\n=== 📅 3. TOUTES LES VISITES PLANIFIÉES / CONFIRMÉES ===")
  const visitesList = await sql`
    SELECT v.id, v.date_visite, v.statut, v.commentaires, v.created_at,
           b.titre as bien_titre, b.ville as bien_ville,
           c.full_name as client_name, c.email as client_email,
           l.nom as lead_nom, l.prenom as lead_prenom, l.telephone as lead_phone,
           a.full_name as agent_name
    FROM visites v
    LEFT JOIN biens b ON v.bien_id = b.id
    LEFT JOIN profiles c ON v.client_id = c.id
    LEFT JOIN leads l ON v.lead_id = l.id
    LEFT JOIN profiles a ON v.agent_id = a.id
    WHERE v.deleted_at IS NULL
    ORDER BY v.date_visite DESC;
  `
  console.log(JSON.stringify(visitesList, null, 2))

  process.exit(0)
}

checkData().catch((err) => {
  console.error("Erreur :", err)
  process.exit(1)
})
