import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString, { max: 1 })

async function run() {
  console.log("=== DEBUG PERMISSIONS ===")

  // 1. Liste des profils et leurs rôles
  const users = await client`
    SELECT id, email, role FROM profiles 
    WHERE deleted_at IS NULL
    LIMIT 20;
  `
  console.log("\nProfiles found:")
  console.table(users)

  // 2. Liste des permissions dans la table role_permissions
  const rp = await client`
    SELECT role_name, permission_code FROM role_permissions;
  `
  console.log("\nRole permissions:")
  console.table(rp)

  // 3. Liste de toutes les permissions définies
  const p = await client`
    SELECT code, description FROM permissions;
  `
  console.log("\nAll permissions registered:")
  console.table(p)

  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
