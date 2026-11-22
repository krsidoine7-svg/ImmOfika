const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const accounts = [
  // Admins
  { name: 'Directeur Général', email: 'admin.general@anyilo.com', pass: 'Admin!' },
  { name: 'Directrice Juridique', email: 'admin.juridique@anyilo.com', pass: 'Admin123!' },
  // Managers
  { name: 'Manager Cocody', email: 'manager.cocody@anyilo.com', pass: 'AnyiloManager2026!#1' },
  { name: 'Manager Zone 4', email: 'manager.zone4@anyilo.com', pass: 'AnyiloManager2026!#2' },
  { name: 'Manager Assinie', email: 'manager.assinie@anyilo.com', pass: 'AnyiloManager2026!#3' },
  { name: 'Manager Bingerville', email: 'manager.bingerville@anyilo.com', pass: 'AnyiloManager2026!#4' },
  { name: 'Manager Yamoussoukro', email: 'manager.yamoussoukro@anyilo.com', pass: 'AnyiloManager2026!#5' },
  // Clients
  { name: 'Client Diaspora Paris', email: 'client.investisseur@gmail.com', pass: 'AnyiloClient2026!#1' },
  { name: 'Client Particulier Cocody', email: 'client.particulier@yahoo.fr', pass: 'AnyiloClient2026!#2' },
  { name: 'Client B2B Entreprise', email: 'client.societe@afrique-invest.com', pass: 'AnyiloClient2026!#3' },
];

async function testAll() {
  console.log('=== TEST D\'AUTHENTIFICATION GLOBAL DES 10 COMPTES OFFICIELS ===\n');
  let passCount = 0;

  for (const acc of accounts) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: acc.email,
      password: acc.pass,
    });

    if (error) {
      console.error(`❌ [${acc.name}] ${acc.email} : ${error.message}`);
    } else {
      passCount++;
      console.log(`✅ [${acc.name}] ${acc.email} -> Connecté ! (User ID: ${data.user.id}, Role: ${data.user.user_metadata?.role})`);
    }
  }

  console.log(`\nRésultat : ${passCount}/${accounts.length} comptes validés avec succès !`);
  process.exit(passCount === accounts.length ? 0 : 1);
}

testAll().catch(e => {
  console.error(e);
  process.exit(1);
});

