import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString)

async function run() {
  console.log('Insertion des rôles super_admin et tech_super_admin dans la table "roles"...')

  const query = `
    INSERT INTO "public"."roles" ("name", "description") 
    VALUES 
      ('super_admin', 'Super Administrateur avec droits de modération et supervision'),
      ('tech_super_admin', 'Super Administrateur Technique avec accès aux analytiques et permissions')
    ON CONFLICT ("name") DO NOTHING;
  `

  await client.unsafe(query)
  console.log('Rôles super_admin et tech_super_admin créés avec succès en base de données !')
  process.exit(0)
}

run().catch((err) => {
  console.error('Erreur lors de l\'insertion des rôles :', err)
  process.exit(1)
})
