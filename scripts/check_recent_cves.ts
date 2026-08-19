import { exec } from "child_process"

// Calcul de la date d'il y a 2 semaines au format ISO
const dateTwoWeeksAgo = new Date()
dateTwoWeeksAgo.setDate(dateTwoWeeksAgo.getDate() - 14)
const isoDate = dateTwoWeeksAgo.toISOString().split('T')[0] // AAAA-MM-JJ

console.log(`🔍 Lancement de la revue des CVE publiées depuis le : ${isoDate}...\n`)

// Commande npm audit pour sortir un format JSON et filtrer programmatiquement
exec("npm audit --json", (error, stdout, stderr) => {
  if (!stdout) {
    console.log("❌ Aucun retour de npm audit.")
    return
  }
  
  try {
    const report = JSON.parse(stdout)
    const vulnerabilities = report.vulnerabilities || {}
    let foundRecent = 0

    console.log("🛡️ ANALYSE DES VULNÉRABILITÉS DE MOINS DE 2 SEMAINES :")
    
    for (const [name, data] of Object.entries(vulnerabilities) as any) {
      const advisories = data.via || []
      const isRecent = advisories.some((adv: any) => {
        if (typeof adv === 'object' && adv.updated) {
          const updateDate = new Date(adv.updated)
          return updateDate >= dateTwoWeeksAgo
        }
        return false
      })

      if (isRecent) {
        foundRecent++
        console.log(`\n🚨 [ALERTE CVE RÉCENTE] Package: ${name}`)
        console.log(`   - Gravité : ${data.severity?.toUpperCase()}`)
        console.log(`   - Version installée : ${data.range}`)
        console.log(`   - Détails : ${advisories.map((a: any) => a.title || a.source).join(", ")}`)
        console.log(`   - Lien : ${advisories.map((a: any) => a.url).filter(Boolean).join("\n            ")}`)
      }
    }

    if (foundRecent === 0) {
      console.log("\n✅ Félicitations : Aucune faille de moins de 2 semaines détectée dans vos dépendances.")
    } else {
      console.log(`\n⚠️ Total : ${foundRecent} alerte(s) de moins de 2 semaines à corriger d'urgence !`)
    }
  } catch (err) {
    console.error("❌ Erreur d'analyse du JSON de npm audit :", err)
  }
})
