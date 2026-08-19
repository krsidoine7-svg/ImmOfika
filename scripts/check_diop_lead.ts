import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const sql = postgres(connectionString, { max: 1 })

async function checkDiopLead() {
  console.log("=== 1. VÉRIFICATION OFIKA IN PROFILES ===")
  const ofikaProfiles = await sql`
    SELECT id, email, full_name, role FROM profiles WHERE email ILIKE '%ofika%' OR full_name ILIKE '%ofika%';
  `
  console.log("Profils OFIKA :", JSON.stringify(ofikaProfiles, null, 2))

  console.log("\n=== 2. VÉRIFICATION DIOP IN LEADS TABLE ===")
  const diopLeads = await sql`
    SELECT * FROM leads WHERE email ILIKE '%client.investisseur@gmail.com%' OR nom ILIKE '%Diop%' OR telephone ILIKE '%33601020304%';
  `
  console.log("Leads pour Diop :", JSON.stringify(diopLeads, null, 2))

  console.log("\n=== 3. TOUS LES LEADS DE LA TABLE LEADS ===")
  const allLeads = await sql`
    SELECT l.id, l.nom, l.prenom, l.email, l.telephone, l.agent_id, l.statut, l.etape, p.full_name as agent_name
    FROM leads l
    LEFT JOIN profiles p ON l.agent_id = p.id
    WHERE l.deleted_at IS NULL;
  `
  console.log("Nombre total de leads :", allLeads.length)
  console.log(JSON.stringify(allLeads, null, 2))

  process.exit(0)
}

checkDiopLead().catch((err) => {
  console.error(err)
  process.exit(1)
})
