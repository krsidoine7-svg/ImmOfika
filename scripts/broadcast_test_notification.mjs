import postgres from 'postgres'
import webpush from 'web-push'

const sql = postgres(process.env.DATABASE_URL)

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

if (!vapidPublicKey || !vapidPrivateKey) {
  console.error("❌ Clés VAPID manquantes dans .env.local !")
  process.exit(1)
}

webpush.setVapidDetails(
  'mailto:contact@favorcompany.ci',
  vapidPublicKey,
  vapidPrivateKey
)

console.log("🚀 Lancement de la diffusion de notification générale...")

// 1. Récupérer TOUS les profils actifs de la plateforme sans exception
const allProfiles = await sql`
  SELECT id, email, full_name, role 
  FROM profiles 
  WHERE deleted_at IS NULL
`

console.log(`\n👥 Nombre total d'utilisateurs ciblés : ${allProfiles.length}`)

const title = "📢 Annonce Officielle Favor Company"
const message = "Bienvenue sur la plateforme officielle de Favor Company International (Promoteur Immobilier Agréé). Votre espace client et vos notifications sont actifs."
const link = "/client/dashboard"

// 2. Insérer une notification in-app (cloche) pour CHAQUE utilisateur sans exception
const notifValues = allProfiles.map(p => ({
  user_id: p.id,
  title: title,
  message: message,
  type: 'system',
  link: link,
  lu: false
}))

const inserted = await sql`
  INSERT INTO notifications ${sql(notifValues, 'user_id', 'title', 'message', 'type', 'link', 'lu')}
  RETURNING id
`

console.log(`✅ ${inserted.length} notifications In-App insérées avec succès en base de données pour TOUS les utilisateurs !`)

// 3. Récupérer tous les abonnements Web Push actifs
const pushSubs = await sql`
  SELECT ps.id, ps.profile_id, p.email, p.full_name, ps.subscription
  FROM push_subscriptions ps
  LEFT JOIN profiles p ON p.id = ps.profile_id
  WHERE ps.deleted_at IS NULL
`

console.log(`\n📲 Envoi du Web Push aux ${pushSubs.length} appareils/navigateurs abonnés...`)

const pushPayload = JSON.stringify({
  title: title,
  body: message,
  url: 'http://localhost:5000/client/dashboard',
  image: '/logo-favor.jpeg',
  tag: 'broadcast-annonce'
})

let pushSuccess = 0
let pushFail = 0

for (const sub of pushSubs) {
  try {
    await webpush.sendNotification(sub.subscription, pushPayload)
    console.log(`   - 🔔 Push envoyé à : ${sub.email || 'Anonyme'} (${sub.full_name || 'N/A'})`)
    pushSuccess++
  } catch (err) {
    console.log(`   - ⚠️ Échec Push pour : ${sub.email || 'Anonyme'} (Code HTTP: ${err.statusCode || err.message})`)
    pushFail++
  }
}

console.log(`\n==================================================`)
console.log(`🎉 BILAN DE LA DIFFUSION GLOBALE :`)
console.log(`- Notifications In-App générées : ${inserted.length} / ${allProfiles.length} utilisateurs`)
console.log(`- Web Push délivrés sur navigateur/mobile : ${pushSuccess} réceptifs (${pushFail} expirés)`)
console.log(`- Sonnerie d'alerte : Active (/sounds/notification.mp3)`)
console.log(`==================================================\n`)

await sql.end()
