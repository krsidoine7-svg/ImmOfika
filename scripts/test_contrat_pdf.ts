import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const sql = postgres(connectionString, { max: 1 })

async function testContrat() {
  const email = 'client.investisseur@gmail.com'
  const reservations = await sql`
    SELECT r.id, r.bien_id, b.titre
    FROM reservations r
    JOIN profiles c ON r.client_id = c.id
    JOIN biens b ON r.bien_id = b.id
    WHERE c.email = ${email};
  `
  console.log("Réservation trouvée :", reservations)
  if (reservations.length > 0) {
    console.log(`Lien direct de téléchargement du Contrat PDF pour l'agent ou le client :`)
    console.log(`👉 http://localhost:3000/api/export/contrat/${reservations[0].id}`)
  }
  process.exit(0)
}

testContrat().catch((err) => {
  console.error(err)
  process.exit(1)
})
