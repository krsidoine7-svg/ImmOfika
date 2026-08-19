import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import postgres from 'postgres'
import crypto from 'crypto'

const sql = postgres(process.env.DATABASE_URL!)

interface AccountToSeed {
  email: string
  pass: string
  name: string
  phone: string
  role: 'admin' | 'agent' | 'client' | 'manager'
  description: string
}

const accounts: AccountToSeed[] = [
  // 👑 2 COMPTES ADMINS
  {
    email: 'admin.general@favorcompany.ci',
    pass: 'FavorAdmin2026!#1',
    name: 'Kouassi Jean-Baptiste',
    phone: '+225 0701020304',
    role: 'admin',
    description: 'Directeur Général — Administration Globale & Finances'
  },
  {
    email: 'admin.juridique@favorcompany.ci',
    pass: 'FavorAdmin2026!#2',
    name: 'Me Koné Aminata',
    phone: '+225 0705060708',
    role: 'admin',
    description: 'Directrice Juridique & Conformité OHADA — Validation ACD & Contrats'
  },

  // 👔 5 COMPTES MANAGERS / AGENTS COMMERCIAUX
  {
    email: 'manager.cocody@favorcompany.ci',
    pass: 'FavorManager2026!#1',
    name: 'Bamba Sékou',
    phone: '+225 0501020304',
    role: 'agent',
    description: 'Responsable Agence Cocody Riviera & Ambassades'
  },
  {
    email: 'manager.zone4@favorcompany.ci',
    pass: 'FavorManager2026!#2',
    name: 'Diallo Fatou',
    phone: '+225 0505060708',
    role: 'agent',
    description: 'Responsable Agence Zone 4 & Marcory Résidentiel'
  },
  {
    email: 'manager.assinie@favorcompany.ci',
    pass: 'FavorManager2026!#3',
    name: 'Touré Yacouba',
    phone: '+225 0509101112',
    role: 'agent',
    description: 'Responsable Projets Balnéaires Assinie & Grand-Bassam'
  },
  {
    email: 'manager.bingerville@favorcompany.ci',
    pass: 'FavorManager2026!#4',
    name: "N'Guessan Aya",
    phone: '+225 0513141516',
    role: 'agent',
    description: 'Responsable Lotissements Agréés & Terrains Bingerville'
  },
  {
    email: 'manager.yamoussoukro@favorcompany.ci',
    pass: 'FavorManager2026!#5',
    name: 'Yao Koffi',
    phone: '+225 0517181920',
    role: 'agent',
    description: 'Responsable Régional Yamoussoukro & Bouaké'
  },

  // 👤 3 COMPTES CLIENTS
  {
    email: 'client.investisseur@gmail.com',
    pass: 'FavorClient2026!#1',
    name: 'Diop Aboubacar',
    phone: '+33 601020304',
    role: 'client',
    description: 'Investisseur Diaspora (Paris) — Acquisition Villas & Immeubles'
  },
  {
    email: 'client.particulier@yahoo.fr',
    pass: 'FavorClient2026!#2',
    name: 'Kassi Marie-Laure',
    phone: '+225 0101020304',
    role: 'client',
    description: 'Particulier Résidence Principale (Abidjan Cocody)'
  },
  {
    email: 'client.societe@afrique-invest.com',
    pass: 'FavorClient2026!#3',
    name: 'Société Afrique Invest SARL',
    phone: '+225 0105060708',
    role: 'client',
    description: 'Client Entreprise — Acquisition Bureaux & Terrains Industriels'
  }
]

async function seedAccounts() {
  console.log("=== 🚀 DÉBUT DU SEEDING DES COMPTES OFFICIELS FAVOR COMPANY ===")
  
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`
    console.log("✅ Extension pgcrypto activée.")
  } catch (e: any) {
    console.log("ℹ️ pgcrypto :", e.message)
  }

  try {
    await sql`INSERT INTO public.roles (name, description) VALUES ('manager', 'Manager Commercial') ON CONFLICT DO NOTHING;`
  } catch (e) {}

  for (const acc of accounts) {
    console.log(`\nTraitements pour : ${acc.email} (${acc.role.toUpperCase()})...`)
    
    const existingUser = await sql`SELECT id FROM auth.users WHERE email = ${acc.email}::text`
    let userId: string

    if (existingUser.length > 0) {
      userId = existingUser[0].id
      console.log(` -> Utilisateur existant (ID: ${userId}). Mise à jour du mot de passe...`)
      
      await sql`
        UPDATE auth.users
        SET encrypted_password = crypt(${acc.pass}::text, gen_salt('bf')),
            email_confirmed_at = COALESCE(email_confirmed_at, now()),
            raw_user_meta_data = jsonb_build_object('full_name', ${acc.name}::text, 'role', ${acc.role}::text, 'phone', ${acc.phone}::text),
            email_change_token_new = COALESCE(email_change_token_new, ''),
            email_change = COALESCE(email_change, ''),
            email_change_token_current = COALESCE(email_change_token_current, ''),
            phone_change = COALESCE(phone_change, ''),
            phone_change_token = COALESCE(phone_change_token, ''),
            reauthentication_token = COALESCE(reauthentication_token, ''),
            confirmation_token = COALESCE(confirmation_token, ''),
            recovery_token = COALESCE(recovery_token, ''),
            is_sso_user = COALESCE(is_sso_user, false),
            is_anonymous = COALESCE(is_anonymous, false),
            email_change_confirm_status = COALESCE(email_change_confirm_status, 0),
            updated_at = now()
        WHERE id = ${userId}::uuid
      `
    } else {
      userId = crypto.randomUUID()
      console.log(` -> Création dans auth.users (ID: ${userId})...`)
      
      await sql`
        INSERT INTO auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          raw_app_meta_data,
          raw_user_meta_data,
          created_at,
          updated_at,
          confirmation_token,
          recovery_token,
          email_change_token_new,
          email_change,
          email_change_token_current,
          phone_change,
          phone_change_token,
          reauthentication_token,
          is_sso_user,
          is_anonymous,
          email_change_confirm_status
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          ${userId}::uuid,
          'authenticated',
          'authenticated',
          ${acc.email}::text,
          crypt(${acc.pass}::text, gen_salt('bf')),
          now(),
          '{"provider": "email", "providers": ["email"]}'::jsonb,
          jsonb_build_object('full_name', ${acc.name}::text, 'role', ${acc.role}::text, 'phone', ${acc.phone}::text),
          now(),
          now(),
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          false,
          false,
          0
        )
      `

      try {
        await sql`
          INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            last_sign_in_at,
            created_at,
            updated_at
          ) VALUES (
            gen_random_uuid(),
            ${userId}::uuid,
            jsonb_build_object('sub', ${userId}::text, 'email', ${acc.email}::text),
            'email',
            ${acc.email}::text,
            now(),
            now(),
            now()
          ) ON CONFLICT DO NOTHING
        `
      } catch (idErr: any) {
        console.log(`   [Info] auth.identities: ${idErr.message}`)
      }
    }

    console.log(` -> Synchronisation dans public.profiles...`)
    const profileExists = await sql`SELECT id FROM public.profiles WHERE id = ${userId}::uuid OR email = ${acc.email}::text`
    
    if (profileExists.length > 0) {
      await sql`
        UPDATE public.profiles
        SET full_name = ${acc.name}::text,
            phone = ${acc.phone}::text,
            role = ${acc.role}::text,
            email = ${acc.email}::text,
            deleted_at = NULL,
            updated_at = now()
        WHERE id = ${userId}::uuid OR email = ${acc.email}::text
      `
    } else {
      await sql`
        INSERT INTO public.profiles (
          id,
          email,
          full_name,
          phone,
          role,
          created_at,
          updated_at
        ) VALUES (
          ${userId}::uuid,
          ${acc.email}::text,
          ${acc.name}::text,
          ${acc.phone}::text,
          ${acc.role}::text,
          now(),
          now()
        )
      `
    }

    console.log(` ✅ Compte configuré avec succès : ${acc.name} (${acc.email})`)
  }

  // Réparation globale des tokens null dans auth.users
  console.log("\n -> 🛠️ Réparation des tokens NULL sur l'ensemble de la table auth.users...")
  await sql`
    UPDATE auth.users
    SET 
      email_change_token_new = COALESCE(email_change_token_new, ''),
      email_change = COALESCE(email_change, ''),
      email_change_token_current = COALESCE(email_change_token_current, ''),
      phone_change = COALESCE(phone_change, ''),
      phone_change_token = COALESCE(phone_change_token, ''),
      reauthentication_token = COALESCE(reauthentication_token, ''),
      confirmation_token = COALESCE(confirmation_token, ''),
      recovery_token = COALESCE(recovery_token, ''),
      is_sso_user = COALESCE(is_sso_user, false),
      is_anonymous = COALESCE(is_anonymous, false),
      email_change_confirm_status = COALESCE(email_change_confirm_status, 0)
    WHERE email_change IS NULL OR email_change_token_new IS NULL;
  `
  console.log(" ✅ Réparation globale terminée.")

  console.log("\n=== 🎉 TOUS LES 10 COMPTES ONT ÉTÉ CRÉÉS OU MIS À JOUR DANS LA BASE DE DONNÉES ===")
  process.exit(0)
}

seedAccounts().catch((err) => {
  console.error("❌ Erreur fatale :", err)
  process.exit(1)
})
