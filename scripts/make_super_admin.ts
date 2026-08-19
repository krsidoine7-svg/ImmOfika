import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString)

async function run() {
  console.log('Mise à jour du compte admin.general@favorcompany.ci vers le rôle tech_super_admin...')

  // 1. Mettre à jour le rôle dans la table profiles
  const updateQuery = `
    UPDATE "public"."profiles" 
    SET "role" = 'tech_super_admin' 
    WHERE "email" = 'admin.general@favorcompany.ci';
  `

  await client.unsafe(updateQuery)
  console.log('Compte admin.general@favorcompany.ci mis à jour avec le rôle tech_super_admin !')
  process.exit(0)
}

run().catch((err) => {
  console.error('Erreur lors de la mise à jour du rôle :', err)
  process.exit(1)
})
