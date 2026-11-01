const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

const allAccounts = [
  // Clients
  {
    id: '7639417c-c2dc-4334-8a45-300c8a0913fd',
    email: 'client.investisseur@gmail.com',
    password: 'ImmOfikaClient2026!#1',
    fullName: 'Diop Aboubacar',
    phone: '+33 601020304',
    role: 'client'
  },
  {
    id: '05064991-3f27-4cd1-8f97-93c7c6d7968f',
    email: 'client.particulier@yahoo.fr',
    password: 'ImmOfikaClient2026!#2',
    fullName: 'Kassi Marie-Laure',
    phone: '+225 0101020304',
    role: 'client'
  },
  {
    id: '41997fd5-6524-4b8c-9d28-cefe3bda8b65',
    email: 'client.societe@afrique-invest.com',
    password: 'ImmOfikaClient2026!#3',
    fullName: 'Société Afrique Invest SARL',
    phone: '+225 0105060708',
    role: 'client'
  },

  // Managers / Agents
  {
    id: 'c1e9e40e-b814-49c1-826c-2d2955e7e2e0',
    email: 'manager.cocody@immofika.ci',
    password: 'ImmOfikaManager2026!#1',
    fullName: 'Bamba Sékou',
    phone: '+225 0501020304',
    role: 'agent'
  },
  {
    id: 'c96b33e0-9f5d-48d1-aa4f-0902ce9ea6f8',
    email: 'manager.zone4@immofika.ci',
    password: 'ImmOfikaManager2026!#2',
    fullName: 'Diallo Fatou',
    phone: '+225 0505060708',
    role: 'agent'
  },
  {
    id: '3c1c8119-c4fb-46d7-9f95-801e52e6b343',
    email: 'manager.assinie@immofika.ci',
    password: 'ImmOfikaManager2026!#3',
    fullName: 'Touré Yacouba',
    phone: '+225 0509101112',
    role: 'agent'
  },
  {
    id: 'd1365437-8d06-418c-8e4d-a39b7d5e1dfe',
    email: 'manager.bingerville@immofika.ci',
    password: 'ImmOfikaManager2026!#4',
    fullName: "N'Guessan Aya",
    phone: '+225 0513141516',
    role: 'agent'
  },
  {
    id: '7697d561-f1b4-4cca-9c3a-eb96154de53a',
    email: 'manager.yamoussoukro@immofika.ci',
    password: 'ImmOfikaManager2026!#5',
    fullName: 'Yao Koffi',
    phone: '+225 0517181920',
    role: 'agent'
  }
];

async function applyCleanSync() {
  console.log(`Synchronisation propre des ${allAccounts.length} comptes...`);

  for (const acc of allAccounts) {
    console.log(`Traitement de ${acc.email}...`);

    // 1. auth.users
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
        is_sso_user,
        is_anonymous,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change,
        phone_change,
        phone_change_token,
        reauthentication_token,
        email_change_token_current,
        email_change_confirm_status,
        created_at,
        updated_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        ${acc.id}::uuid,
        'authenticated',
        'authenticated',
        ${acc.email},
        extensions.crypt(${acc.password}, extensions.gen_salt('bf')),
        now(),
        ${sql.json({ provider: 'email', providers: ['email'] })},
        ${sql.json({ role: acc.role, email: acc.email, phone: acc.phone, full_name: acc.fullName })},
        false,
        false,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        0,
        now(),
        now()
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        encrypted_password = EXCLUDED.encrypted_password,
        email_confirmed_at = now(),
        raw_app_meta_data = EXCLUDED.raw_app_meta_data,
        raw_user_meta_data = EXCLUDED.raw_user_meta_data,
        confirmation_token = '',
        recovery_token = '',
        email_change_token_new = '',
        email_change = '',
        phone_change = '',
        phone_change_token = '',
        reauthentication_token = '',
        email_change_token_current = '',
        email_change_confirm_status = 0,
        updated_at = now();
    `;

    // 2. auth.identities
    await sql`
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        ${acc.id}::uuid,
        ${sql.json({ sub: acc.id, email: acc.email })},
        'email',
        ${acc.id},
        now(),
        now()
      )
      ON CONFLICT (provider, provider_id) DO UPDATE SET
        identity_data = EXCLUDED.identity_data,
        updated_at = now();
    `;

    // 3. public.profiles
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
        ${acc.id}::uuid,
        ${acc.email},
        ${acc.fullName},
        ${acc.phone},
        ${acc.role},
        now(),
        now()
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        updated_at = now();
    `;

    // 4. public.user_roles
    await sql`
      INSERT INTO public.user_roles (
        user_id,
        role_name,
        assigned_at
      ) VALUES (
        ${acc.id}::uuid,
        ${acc.role},
        now()
      )
      ON CONFLICT (user_id, role_name) DO NOTHING;
    `;

    console.log(`✓ ${acc.email} synchronisé !`);
  }

  console.log('Synchronisation propre terminée avec succès.');
  process.exit(0);
}

applyCleanSync().catch(e => {
  console.error(e);
  process.exit(1);
});

