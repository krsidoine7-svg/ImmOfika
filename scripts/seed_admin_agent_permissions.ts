import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function run() {
  const { db } = await import("../src/lib/db/index")
  const { roles, rolePermissions } = await import("../src/lib/db/schema")
  const { eq } = await import("drizzle-orm")

  console.log("=== SYNCHRONISATION DES PERMISSIONS POUR admin_agent ===")

  // 1. S'assurer que le rôle admin_agent existe dans la table roles
  await db
    .insert(roles)
    .values({
      name: 'admin_agent',
      description: 'Agent commercial terrain avec accès restreint'
    })
    .onConflictDoNothing()
  console.log("Rôle 'admin_agent' inséré ou déjà existant.")

  // 2. Récupérer toutes les permissions associées au rôle 'agent'
  const agentPerms = await db
    .select({ permissionCode: rolePermissions.permissionCode })
    .from(rolePermissions)
    .where(eq(rolePermissions.roleName, 'agent'))

  console.log(`Trouvé ${agentPerms.length} permissions pour le rôle 'agent'.`)

  // 3. Associer ces permissions au rôle 'admin_agent'
  let insertedCount = 0
  for (const perm of agentPerms) {
    await db
      .insert(rolePermissions)
      .values({
        roleName: 'admin_agent',
        permissionCode: perm.permissionCode
      })
      .onConflictDoNothing()
    insertedCount++
  }

  console.log(`Synchronisation terminée ! ${insertedCount} permissions associées à 'admin_agent'.`)
  process.exit(0)
}

run().catch((err) => {
  console.error("Erreur de synchronisation des permissions :", err)
  process.exit(1)
})
