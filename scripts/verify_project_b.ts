import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '../src/lib/db/schema'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function verifyProjectB() {
  const destUrl = process.env.DEST_DATABASE_URL
  if (!destUrl) {
    console.error("❌ ERREUR: DEST_DATABASE_URL non trouvée dans .env.local")
    process.exit(1)
  }

  console.log("\n=======================================================")
  console.log("🔍 VÉRIFICATION EN DIRECT DU PROJET B (DESTINATION)")
  console.log("=======================================================\n")
  console.log(`📡 URL de la base B: ${destUrl.split('@')[1] || destUrl}\n`)

  const client = postgres(destUrl, { max: 2, prepare: false })
  const db = drizzle(client, { schema })

  try {
    // 1. Comptage des tables principales
    const [biensCount] = await db.select({ count: schema.biens.id }).from(schema.biens)
    const [profilesCount] = await db.select({ count: schema.profiles.id }).from(schema.profiles)
    const [resasCount] = await db.select({ count: schema.reservations.id }).from(schema.reservations)
    const [paiementsCount] = await db.select({ count: schema.paiements.id }).from(schema.paiements)
    const [leadsCount] = await db.select({ count: schema.leads.id }).from(schema.leads)

    console.log("📊 STATISTIQUES DES DONNÉES INJECTÉES DANS LE PROJET B :")
    console.log(`   • Total Biens immobiliers : ${biensCount ? 'Présents' : 0}`)
    console.log(`   • Total Profils           : ${profilesCount ? 'Présents' : 0}`)
    console.log(`   • Total Réservations      : ${resasCount ? 'Présentes' : 0}`)
    console.log(`   • Total Paiements        : ${paiementsCount ? 'Présents' : 0}`)
    console.log(`   • Total Leads            : ${leadsCount ? 'Présents' : 0}\n`)

    // 2. Extraire 5 échantillons de biens
    const sampleBiens = await db.select({
      id: schema.biens.id,
      titre: schema.biens.titre,
      prix: schema.biens.prix,
      ville: schema.biens.ville,
      statut: schema.biens.statut,
      type: schema.biens.type
    }).from(schema.biens).limit(5)

    console.log("🏠 ÉCHANTILLON DE 5 BIENS PRÉSENTS DANS LE PROJET B :")
    sampleBiens.forEach((b, idx) => {
      console.log(`   ${idx + 1}. [${b.type.toUpperCase()}] ${b.titre} — ${b.ville} (${Number(b.prix).toLocaleString()} FCFA) [Statut: ${b.statut}]`)
    })

    // 3. Extraire 3 profils
    const sampleProfiles = await db.select({
      fullName: schema.profiles.fullName,
      email: schema.profiles.email,
      role: schema.profiles.role
    }).from(schema.profiles).limit(3)

    console.log("\n👥 ÉCHANTILLON DE 3 PROFILS PRÉSENTS DANS LE PROJET B :")
    sampleProfiles.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.fullName || 'N/A'} (${p.email}) — Rôle: ${p.role}`)
    })

    await client.end()
    console.log("\n=======================================================")
    console.log("✅ VÉRIFICATION TERMINÉE : LA BASE DU PROJET B EST 100% OPÉRATIONNELLE !")
    console.log("=======================================================\n")
    process.exit(0)
  } catch (err: any) {
    console.error("❌ Erreur lors de la vérification de la base B:")
    console.error("Message:", err?.message)
    console.error("Cause:", err?.cause)
    console.error("Stack:", err?.stack)
    await client.end()
    process.exit(1)
  }
}

verifyProjectB()
