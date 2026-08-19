import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const sql = postgres(connectionString, { max: 1 })

async function assignDiopToManager() {
  console.log("=== 🚀 ATTRIBUTION DE DIOP ABOUBACAR À MANAGER.COCODY@FAVORCOMPANY.CI ===")

  // 1. Récupérer l'ID de manager.cocody@favorcompany.ci (Bamba Sékou)
  const agentProfiles = await sql`
    SELECT id, email, full_name, role FROM profiles WHERE email = 'manager.cocody@favorcompany.ci';
  `
  if (agentProfiles.length === 0) {
    console.error("❌ Agent manager.cocody@favorcompany.ci introuvable en base.")
    process.exit(1)
  }
  const managerAgent = agentProfiles[0]
  console.log(`✅ Agent trouvé : ${managerAgent.full_name} (${managerAgent.email}) | ID: ${managerAgent.id}`)

  // 2. Récupérer l'ID du client Diop Aboubacar (client.investisseur@gmail.com)
  const clientProfiles = await sql`
    SELECT id, email, full_name, phone FROM profiles WHERE email = 'client.investisseur@gmail.com';
  `
  if (clientProfiles.length === 0) {
    console.error("❌ Client client.investisseur@gmail.com introuvable en base.")
    process.exit(1)
  }
  const clientDiop = clientProfiles[0]
  console.log(`✅ Client trouvé : ${clientDiop.full_name} (${clientDiop.email}) | ID: ${clientDiop.id}`)

  // 3. Mettre à jour les Visites de Diop Aboubacar vers l'agent Bamba Sékou
  const updateVisites = await sql`
    UPDATE visites
    SET agent_id = ${managerAgent.id}::uuid, updated_at = now()
    WHERE client_id = ${clientDiop.id}::uuid;
  `
  console.log(`✅ Visites mises à jour : ${updateVisites.count} ligne(s) rattachée(s) à Bamba Sékou.`)

  // 4. Mettre à jour les Dossiers d'acquisition de Diop Aboubacar
  const updateDossiers = await sql`
    UPDATE dossiers
    SET agent_id = ${managerAgent.id}::uuid, updated_at = now()
    WHERE client_id = ${clientDiop.id}::uuid;
  `
  console.log(`✅ Dossiers mis à jour : ${updateDossiers.count} ligne(s) rattachée(s) à Bamba Sékou.`)

  // 5. Mettre à jour l'Agent référent du bien réservé par Diop Aboubacar
  const userReservations = await sql`
    SELECT bien_id FROM reservations WHERE client_id = ${clientDiop.id}::uuid AND deleted_at IS NULL;
  `
  for (const r of userReservations) {
    await sql`
      UPDATE biens
      SET agent_id = ${managerAgent.id}::uuid, updated_at = now()
      WHERE id = ${r.bien_id}::uuid;
    `
    console.log(`✅ Bien réservé (ID: ${r.bien_id}) réattribué à l'agent Bamba Sékou.`)
  }

  // 6. Créer ou Mettre à jour une ligne dans la table `leads` (Prospect CRM) pour Diop Aboubacar
  const existingLead = await sql`
    SELECT id FROM leads WHERE email = ${clientDiop.email} OR telephone = ${clientDiop.phone};
  `

  if (existingLead.length > 0) {
    await sql`
      UPDATE leads
      SET agent_id = ${managerAgent.id}::uuid,
          statut = 'converti',
          etape = 'contrat_signe',
          updated_at = now()
      WHERE id = ${existingLead[0].id}::uuid;
    `
    console.log(`✅ Lead existant (ID: ${existingLead[0].id}) mis à jour et attribué à Bamba Sékou.`)
  } else {
    const newLeadId = await sql`
      INSERT INTO leads (
        id,
        nom,
        prenom,
        email,
        telephone,
        source,
        statut,
        etape,
        score,
        agent_id,
        visite_confirmee,
        offre_validee,
        engagement_signe,
        message,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        'Diop',
        'Aboubacar',
        ${clientDiop.email},
        ${clientDiop.phone},
        'site_web',
        'converti',
        'contrat_signe',
        95,
        ${managerAgent.id}::uuid,
        true,
        true,
        true,
        'Client Investisseur Diaspora (Paris) - Réservation terrain confirmée avec acompte.',
        now(),
        now()
      ) RETURNING id;
    `
    console.log(`✅ Nouveau Lead CRM créé (ID: ${newLeadId[0].id}) et attribué à Bamba Sékou !`)
  }

  console.log("\n=== 🎉 ATTRIBUTION EFFECTUÉE AVEC SUCCÈS POUR BAMBA SÉKOU (MANAGER COCODY) ===")
  process.exit(0)
}

assignDiopToManager().catch((err) => {
  console.error("❌ Erreur :", err)
  process.exit(1)
})
