import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString)

async function run() {
  console.log('--- ROLES EXISTANTS DANS LA TABLE "roles" ---')
  const dbRoles = await client`SELECT * FROM "public"."roles";`
  console.table(dbRoles)

  console.log('\n--- PERMISSIONS EXISTANTES DANS LA TABLE "permissions" ---')
  const dbPermissions = await client`SELECT * FROM "public"."permissions" LIMIT 10;`
  console.table(dbPermissions)

  console.log('\n--- PROFIL ADMIN.GENERAL DANS LA TABLE "profiles" ---')
  const adminProfile = await client`SELECT id, email, role FROM "public"."profiles" WHERE email = 'admin.general@favorcompany.ci';`
  console.table(adminProfile)

  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
