import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const sql = postgres(connectionString, { max: 1 })

async function checkDiopData() {
  const email = 'client.investisseur@gmail.com'
  console.log(`=== 👤 PROFILE CLIENT : ${email} ===`)
  
  const clientProfile = await sql`
    SELECT id, email, full_name, phone, role, kyc_status, created_at
    FROM profiles
    WHERE email = ${email};
  `
  console.log("Profil :", JSON.stringify(clientProfile, null, 2))

  if (clientProfile.length === 0) {
    console.log("Aucun profil trouvé avec cet email.")
    process.exit(0)
  }

  const clientId = clientProfile[0].id

  console.log("\n=== 🏠 BIENS RÉSERVÉS / RÉSERVATIONS DU CLIENT ===")
  const reservationsList = await sql`
    SELECT r.id, r.statut, r.date_expiration, r.notes, r.created_at,
           b.titre as bien_titre, b.prix as bien_prix, b.statut as bien_statut, b.ville as bien_ville,
           p.full_name as bien_agent_name, p.email as bien_agent_email
    FROM reservations r
    LEFT JOIN biens b ON r.bien_id = b.id
    LEFT JOIN profiles p ON b.agent_id = p.id
    WHERE r.client_id = ${clientId} AND r.deleted_at IS NULL
    ORDER BY r.created_at DESC;
  `
  console.log(JSON.stringify(reservationsList, null, 2))

  console.log("\n=== 📅 VISITES DU CLIENT ===")
  const visitesList = await sql`
    SELECT v.id, v.date_visite, v.statut, v.commentaires, v.created_at,
           b.titre as bien_titre, b.ville as bien_ville, b.quartier as bien_quartier,
           a.full_name as agent_name, a.email as agent_email
    FROM visites v
    LEFT JOIN biens b ON v.bien_id = b.id
    LEFT JOIN profiles a ON v.agent_id = a.id
    WHERE v.client_id = ${clientId} AND v.deleted_at IS NULL
    ORDER BY v.date_visite DESC;
  `
  console.log(JSON.stringify(visitesList, null, 2))

  console.log("\n=== 📁 DOSSIERS ACQUISITION DU CLIENT ===")
  const dossiersList = await sql`
    SELECT d.id, d.titre, d.description, d.statut, d.progression, d.priorite, d.deadline, d.created_at,
           b.titre as bien_titre,
           a.full_name as agent_name, a.email as agent_email
    FROM dossiers d
    LEFT JOIN biens b ON d.bien_id = b.id
    LEFT JOIN profiles a ON d.agent_id = a.id
    WHERE d.client_id = ${clientId} AND d.deleted_at IS NULL
    ORDER BY d.created_at DESC;
  `
  console.log(JSON.stringify(dossiersList, null, 2))

  console.log("\n=== 💳 PAIEMENTS / TRANSACTIONS DU CLIENT ===")
  const paiementsList = await sql`
    SELECT p.id, p.montant, p.devise, p.statut, p.type_paiement, p.paystack_reference, p.facture_numero, p.facture_url, p.created_at
    FROM paiements p
    WHERE p.client_id = ${clientId} AND p.deleted_at IS NULL
    ORDER BY p.created_at DESC;
  `
  console.log(JSON.stringify(paiementsList, null, 2))

  process.exit(0)
}

checkDiopData().catch((err) => {
  console.error("Erreur :", err)
  process.exit(1)
})
