import postgres from 'postgres'
import webpush from 'web-push'

const sql = postgres(process.env.DATABASE_URL)

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

if (!vapidPublicKey || !vapidPrivateKey) {
  console.error("❌ Clés VAPID manquantes !")
  process.exit(1)
}

webpush.setVapidDetails(
  'mailto:contact@favorcompany.ci',
  vapidPublicKey,
  vapidPrivateKey
)

const rows = await sql`
  SELECT ps.id, ps.profile_id, p.email, p.full_name, ps.subscription
  FROM push_subscriptions ps
  LEFT JOIN profiles p ON p.id = ps.profile_id
  WHERE ps.deleted_at IS NULL
`

console.log(`=== Envoi Push Premium aux ${rows.length} abonnements ===`)

const payload = JSON.stringify({
  title: '✨ Favor Company International',
  body: 'Nouveau lotissement agréé disponible à Assinie avec suivi ACD garanti !',
  url: 'http://localhost:5000/biens'
})

for (const r of rows) {
  try {
    await webpush.sendNotification(r.subscription, payload)
    console.log(`✅ Push envoyé avec succès à : ${r.email || 'Anonyme'} (${r.full_name || 'N/A'})`)
  } catch (err) {
    console.log(`⚠️ Échec d'envoi pour : ${r.email || 'Anonyme'} (statusCode: ${err.statusCode || err.message})`)
  }
}

await sql.end()
