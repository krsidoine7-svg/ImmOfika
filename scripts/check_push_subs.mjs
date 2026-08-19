import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL)

const rows = await sql`
  SELECT ps.id, ps.profile_id, p.email, p.full_name, ps.subscription, ps.created_at, ps.deleted_at
  FROM push_subscriptions ps
  LEFT JOIN profiles p ON p.id = ps.profile_id
  ORDER BY ps.created_at DESC
`

console.log(`=== Abonnements Push trouvés en base (${rows.length}) ===`)
for (const r of rows) {
  console.log(`- ID: ${r.id} | Email: ${r.email || 'Anonyme'} | Nom: ${r.full_name || 'N/A'} | Actif: ${!r.deleted_at}`)
}

await sql.end()
