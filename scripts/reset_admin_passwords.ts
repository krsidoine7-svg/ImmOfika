import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import postgres from 'postgres'
import crypto from 'crypto'

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  console.error("❌ ERREUR : DATABASE_URL non trouvé dans .env.local")
  process.exit(1)
}

const sql = postgres(dbUrl)

async function resetAdminPasswords() {
  console.log("===============================================================")
  console.log("🔑 REINITIALISATION DES MOTS DE PASSE ADMIN FAVOR COMPANY")
  console.log("===============================================================\n")

  try {
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`
  } catch (e: any) {
    console.log("ℹ️ pgcrypto :", e.message)
  }

  const adminsToSet = [
    {
      email: 'admin.general@favorcompany.ci',
      pass: 'Admin!',
      name: 'Kouassi Jean-Baptiste',
      phone: '+225 0701020304',
      role: 'tech_super_admin'
    },
    {
      email: 'admin.juridique@favorcompany.ci',
      pass: 'Admin123!',
      name: 'Me Koné Aminata',
      phone: '+225 0705060708',
      role: 'admin'
    }
  ]

  for (const acc of adminsToSet) {
    console.log(`➔ Traitement de ${acc.email} avec mot de passe "${acc.pass}"...`)
    
    // 1. Chercher d'abord dans public.profiles ou auth.users par email
    const existingProfile = await sql`SELECT id FROM public.profiles WHERE email = ${acc.email}::text`
    const existingAuth = await sql`SELECT id FROM auth.users WHERE email = ${acc.email}::text`

    let userId: string

    if (existingProfile.length > 0) {
      userId = existingProfile[0].id
    } else if (existingAuth.length > 0) {
      userId = existingAuth[0].id
    } else {
      userId = crypto.randomUUID()
    }

    // 2. Assurer que auth.users existe & mettre à jour le mot de passe
    if (existingAuth.length > 0) {
      console.log(`   -> Mise à jour du mot de passe dans auth.users (ID: ${userId})...`)
      await sql`
        UPDATE auth.users
        SET encrypted_password = crypt(${acc.pass}::text, gen_salt('bf')),
            email_confirmed_at = COALESCE(email_confirmed_at, now()),
            raw_user_meta_data = jsonb_build_object('full_name', ${acc.name}::text, 'role', ${acc.role}::text, 'phone', ${acc.phone}::text),
            updated_at = now()
        WHERE id = ${userId}::uuid
      `
    } else {
      console.log(`   -> Création dans auth.users (ID: ${userId})...`)
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
          '', '', '', '', '', '', '', '',
          false, false, 0
        )
      `
    }

    // 3. Synchroniser public.profiles
    console.log(`   -> Synchronisation de public.profiles...`)
    await sql`
      INSERT INTO public.profiles (id, email, full_name, phone, role, created_at, updated_at)
      VALUES (${userId}::uuid, ${acc.email}::text, ${acc.name}::text, ${acc.phone}::text, ${acc.role}::text, now(), now())
      ON CONFLICT (email) DO UPDATE
      SET id = EXCLUDED.id,
          full_name = EXCLUDED.full_name,
          phone = EXCLUDED.phone,
          role = EXCLUDED.role,
          updated_at = now();
    `

    console.log(`   ✅ Compte ${acc.email} est opérationnel !\n`)
  }

  console.log("===============================================================")
  console.log("🎉 MOTS DE PASSE REINITIALISES AVEC SUCCES !")
  console.log("===============================================================")
  await sql.end()
}

resetAdminPasswords()
