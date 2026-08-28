import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '../src/lib/db/schema'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

// Interface pour le snapshot complet
interface FullDbSnapshot {
  timestamp: string
  version: string
  counts: Record<string, number>
  data: Record<string, any[]>
}

async function safeFetchTable(queryPromise: Promise<any[]>, tableName: string): Promise<any[]> {
  try {
    return await queryPromise
  } catch (err: any) {
    if (err?.cause?.code === '42P01' || err?.message?.includes('does not exist')) {
      console.warn(`  ⚠️ Table '${tableName}' non trouvée dans la base source (ignorée).`)
      return []
    }
    console.error(`  ❌ Erreur lors de la lecture de '${tableName}':`, err?.message || err)
    return []
  }
}

async function main() {
  console.log("===============================================================")
  console.log("🚀 IMMOFIKA — SCRIPT DE MIGRATION ET DUPLICATION COMPLÈTE BDD")
  console.log("===============================================================\n")

  const sourceUrl = process.env.DATABASE_URL
  const destUrl = process.env.DEST_DATABASE_URL || sourceUrl

  if (!sourceUrl) {
    console.error("❌ ERREUR : La variable DATABASE_URL n'est pas définie dans .env.local")
    process.exit(1)
  }

  const exportDir = path.join(process.cwd(), 'scripts', 'exports')
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true })
  }

  // Initialisation de la base source
  console.log("🔌 Connexion à la base de données source (DATABASE_URL)...")
  const sourceClient = postgres(sourceUrl, { max: 5, prepare: false })
  const sourceDb = drizzle(sourceClient, { schema })

  try {
    console.log("📥 [1/2] Extraction de toutes les données du projet source...\n")

    const snapshot: FullDbSnapshot = {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      counts: {},
      data: {}
    }

    const tablesToExport: { name: string; table: any }[] = [
      { name: 'roles', table: schema.roles },
      { name: 'permissions', table: schema.permissions },
      { name: 'rolePermissions', table: schema.rolePermissions },
      { name: 'profiles', table: schema.profiles },
      { name: 'biens', table: schema.biens },
      { name: 'bienImages', table: schema.bienImages },
      { name: 'favoris', table: schema.favoris },
      { name: 'reservations', table: schema.reservations },
      { name: 'paiements', table: schema.paiements },
      { name: 'newsletterSubscribers', table: schema.newsletterSubscribers },
      { name: 'leads', table: schema.leads },
      { name: 'leadInteractions', table: schema.leadInteractions },
      { name: 'dossiers', table: schema.dossiers },
      { name: 'taches', table: schema.taches },
      { name: 'visites', table: schema.visites },
      { name: 'visiteAvis', table: schema.visiteAvis },
      { name: 'notifications', table: schema.notifications },
      { name: 'agentCalendriers', table: schema.agentCalendriers },
      { name: 'agentIndisponibilites', table: schema.agentIndisponibilites },
      { name: 'homepageConfigs', table: schema.homepageConfigs },
      { name: 'cookieConsents', table: schema.cookieConsents },
      { name: 'pushSubscriptions', table: schema.pushSubscriptions },
      { name: 'systemSettings', table: schema.systemSettings },
      { name: 'suggestions', table: schema.suggestions },
      { name: 'bienConfies', table: schema.bienConfies },
      { name: 'formulaires', table: schema.formulaires },
      { name: 'formulaireReponses', table: schema.formulaireReponses },
    ]

    for (const t of tablesToExport) {
      const rows = await safeFetchTable(sourceDb.select().from(t.table), t.name)
      snapshot.data[t.name] = rows
      snapshot.counts[t.name] = rows.length
      console.log(`  ✓ ${t.name.padEnd(25)}: ${rows.length} enregistrements`)
    }

    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-')
    const jsonPath = path.join(exportDir, `snapshot_${timestampStr}.json`)
    const latestJsonPath = path.join(exportDir, `snapshot_latest.json`)

    fs.writeFileSync(jsonPath, JSON.stringify(snapshot, null, 2), 'utf-8')
    fs.writeFileSync(latestJsonPath, JSON.stringify(snapshot, null, 2), 'utf-8')

    console.log(`\n💾 Snapshot JSON généré avec succès dans /scripts/exports :`)
    console.log(`   - ${jsonPath}`)
    console.log(`   - ${latestJsonPath}`)

    // Fermer le client source
    await sourceClient.end()

    // Phase 2 : Ré-injection si DEST_DATABASE_URL est spécifié et différent de la source
    if (process.env.DEST_DATABASE_URL && process.env.DEST_DATABASE_URL !== sourceUrl) {
      console.log("\n---------------------------------------------------------------")
      console.log("📤 [2/2] Injection du snapshot dans la base destination (DEST_DATABASE_URL)...")
      console.log("---------------------------------------------------------------\n")

      const destClient = postgres(destUrl!, { max: 5, prepare: false })
      const destDb = drizzle(destClient, { schema })

      for (const item of tablesToExport) {
        const rows = snapshot.data[item.name]
        if (rows && rows.length > 0) {
          console.log(`  ↪ Injection de ${rows.length} lignes dans ${item.name}...`)
          const chunkSize = 50
          for (let i = 0; i < rows.length; i += chunkSize) {
            const chunk = rows.slice(i, i + chunkSize)
            try {
              await destDb.insert(item.table).values(chunk).onConflictDoNothing()
            } catch (err: any) {
              console.error(`  ⚠️ Erreur d'injection dans ${item.name}:`, err?.message || err)
            }
          }
        }
      }

      await destClient.end()
      console.log("\n✅ MIGRATION COMPLÈTE ET INJECTION RÉUSSIE VERS LA BASE DESTINATION !")
    } else {
      console.log("\n💡 Remarque : Pour injecter automatiquement vers un 2nd projet Supabase B :")
      console.log("   1. Définissez DEST_DATABASE_URL=\"postgresql://...\" dans votre fichier .env.local")
      console.log("   2. Réexécutez : npx tsx scripts/migrate_full_project.ts")
    }

    console.log("\n✨ OPÉRATION COMPLÉTÉE AVEC SUCCÈS ✨\n")
    process.exit(0)

  } catch (error) {
    console.error("\n❌ ERREUR LORS DE LA MIGRATION :", error)
    process.exit(1)
  }
}

main()
