import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { biens } from './src/lib/db/schema'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString)
const db = drizzle(client)

async function seed() {
  console.log('Inserting mock bien...')
  
  await db.insert(biens).values([
    {
      slug: 'villa-test-video',
      titre: 'Superbe Villa avec Vidéo',
      description: 'Découvrez cette magnifique villa moderne, avec sa vidéo de présentation impressionnante. Parfait pour tester le nouveau lecteur natif !',
      prix: '150000000',
      type: 'villa',
      transaction: 'vente',
      statut: 'disponible',
      ville: 'Abidjan',
      quartier: 'Cocody Riviera 3',
      surface: '450',
      chambres: 5,
      sallesDeBain: 4,
      parking: true,
      piscine: true,
      mainImageUrl: 'https://images.unsplash.com/photo-1613490908592-1596562a1542?auto=format&fit=crop&w=1200&q=80',
      videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      pdfAnnexeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    }
  ])
  
  console.log('Mock bien inserted successfully!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Error inserting mock bien:', err)
  process.exit(1)
})
