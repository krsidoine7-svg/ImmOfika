import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const dbUrl = process.env.DATABASE_URL

if (!dbUrl) {
  console.error("❌ ERREUR : DATABASE_URL est introuvable dans .env.local")
  process.exit(1)
}

const sql = postgres(dbUrl, { max: 1 })

async function main() {
  console.log("===============================================================")
  console.log("🛡️ IMMOFIKA — SCRIPT DE SÉCURISATION RLS POSTGRESQL & SUPABASE")
  console.log("===============================================================\n")

  try {
    // 1. Lister toutes les tables du schéma public
    const tables = await sql<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public';
    `

    console.log(`📋 Total de ${tables.length} tables trouvées dans le schéma public.`)
    console.log("🔒 Activation de Row Level Security (RLS) sur chaque table...\n")

    // 2. Activer RLS sur chaque table
    for (const table of tables) {
      const name = table.tablename
      console.log(`  ➔ Enabling RLS on table "public"."${name}"...`)
      await sql.unsafe(`ALTER TABLE "public"."${name}" ENABLE ROW LEVEL SECURITY;`)
    }

    console.log("\n✅ RLS activé avec succès sur toutes les tables.")

    // 3. Création des fonctions helpers de sécurité
    console.log("\n🛠️ Création des fonctions de sécurité helper is_admin() et is_staff()...")
    await sql`
      CREATE OR REPLACE FUNCTION public.is_admin()
      RETURNS BOOLEAN
      SET search_path = public, pg_temp
      AS $$
        SELECT EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() 
          AND (role IN ('admin', 'super_admin', 'tech_super_admin') OR role LIKE '%admin%')
        );
      $$ LANGUAGE sql SECURITY DEFINER;
    `

    await sql`
      CREATE OR REPLACE FUNCTION public.is_staff()
      RETURNS BOOLEAN
      SET search_path = public, pg_temp
      AS $$
        SELECT EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() 
          AND (role IN ('admin', 'super_admin', 'tech_super_admin', 'agent', 'gestionnaire') OR role LIKE '%admin%' OR role LIKE '%agent%')
        );
      $$ LANGUAGE sql SECURITY DEFINER;
    `

    console.log("✅ Fonctions helpers RLS créées avec succès.")

    // 4. Définir des politiques RLS globales et sûres
    console.log("\n🛡️ Application des politiques de sécurité RLS sur chaque table...")

    // Helper pour créer proprement des politiques sans planter si elles existent déjà
    const createPolicy = async (tableName: string, policyName: string, sqlBody: string) => {
      try {
        await sql.unsafe(`DROP POLICY IF EXISTS "${policyName}" ON "public"."${tableName}";`)
        await sql.unsafe(`CREATE POLICY "${policyName}" ON "public"."${tableName}" ${sqlBody};`)
        console.log(`   ✔ Policy "${policyName}" appliquée sur "${tableName}"`)
      } catch (err: any) {
        console.warn(`   ⚠️ Attention policy "${policyName}" sur "${tableName}": ${err.message}`)
      }
    }

    // LISTE DES TABLES
    const allTableNames = tables.map(t => t.tablename)

    for (const table of allTableNames) {
      // Politique Administrateur / Staff universelle (Permet au staff de tout gérer en admin)
      await createPolicy(table, `Staff_Full_Access_${table}`, `FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff())`)

      // Politiques spécifiques selon la nature de la table
      if (['biens', 'bien_images', 'homepage_configs', 'cookie_consents', 'formulaires', 'roles', 'permissions', 'role_permissions', 'contract_templates'].includes(table)) {
        // Lecture publique autorisée
        await createPolicy(table, `Public_Read_${table}`, `FOR SELECT USING (true)`)
      }

      if (['newsletter_subscribers', 'lead_interactions', 'analytics_events', 'suggestions', 'bien_confies', 'cookie_consents'].includes(table)) {
        // Insertion publique autorisée (Soumission de formulaires/leads/cookies)
        await createPolicy(table, `Public_Insert_${table}`, `FOR INSERT WITH CHECK (true)`)
      }

      if (['profiles'].includes(table)) {
        // Les utilisateurs gèrent leur propre profil
        await createPolicy(table, `User_Own_Profile_Select`, `FOR SELECT USING (auth.uid() = id)`)
        await createPolicy(table, `User_Own_Profile_Update`, `FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id)`)
        await createPolicy(table, `User_Own_Profile_Insert`, `FOR INSERT WITH CHECK (auth.uid() = id)`)
      }

      if (['reservations', 'paiements', 'favoris', 'notifications', 'push_subscriptions', 'dossiers', 'visites', 'visite_avis', 'formulaire_reponses'].includes(table)) {
        // Les utilisateurs accèdent à leurs propres enregistrements (via client_id ou profile_id ou user_id)
        // Vérification dynamique des colonnes de propriété
        const columnsRes = await sql<{ column_name: string }[]>`
          SELECT column_name FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = ${table};
        `
        const cols = columnsRes.map(c => c.column_name)
        const ownerCol = cols.find(c => ['client_id', 'profile_id', 'user_id', 'created_by'].includes(c))

        if (ownerCol) {
          await createPolicy(table, `User_Own_Data_Select_${table}`, `FOR SELECT USING (auth.uid() = "${ownerCol}")`)
          await createPolicy(table, `User_Own_Data_Insert_${table}`, `FOR INSERT WITH CHECK (auth.uid() = "${ownerCol}")`)
          await createPolicy(table, `User_Own_Data_Update_${table}`, `FOR UPDATE USING (auth.uid() = "${ownerCol}") WITH CHECK (auth.uid() = "${ownerCol}")`)
        }
      }
    }

    console.log("\n===============================================================")
    console.log("🎉 AUDIT DE SÉCURITÉ REUSSIT — 100% DES TABLES SONT PROTÉGÉES PAR RLS !")
    console.log("===============================================================\n")

  } catch (err: any) {
    console.error("❌ ERREUR lors de l'exécution du script RLS :", err)
  } finally {
    await sql.end()
  }
}

main()
