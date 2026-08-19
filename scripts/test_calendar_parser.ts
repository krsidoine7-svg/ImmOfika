import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { parseICal } from "../src/lib/calendar/ical-parser"

const dummyIcs = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Google Inc//Google Calendar 70.9054//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART:20260615T083000Z
DTEND:20260615T093000Z
SUMMARY:Réunion client (Format UTC Z)
END:VEVENT
BEGIN:VEVENT
DTSTART:20260615T140000
DTEND:20260615T150000
SUMMARY:Visite terrain Bingerville (Format Local)
END:VEVENT
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260616
DTEND;VALUE=DATE:20260617
SUMMARY:Journée de formation
END:VEVENT
END:VCALENDAR
`.trim()

async function runTests() {
  console.log("=== TEST 1: Parsing iCal ===")
  const events = parseICal(dummyIcs)
  console.log(`Nombre d'événements parsés : ${events.length}`)
  
  for (const event of events) {
    console.log(`- Titre : ${event.summary}`)
    console.log(`  Début : ${event.start.toISOString()} (Local: ${event.start.toLocaleString('fr-FR')})`)
    console.log(`  Fin   : ${event.end.toISOString()} (Local: ${event.end.toLocaleString('fr-FR')})`)
  }

  console.log("\n=== TEST 2: getDisponibilitesAction ===")
  const { getDisponibilitesAction } = await import("../src/app/actions/disponibilites")
  // On passe un mois et un bien ID bidon pour tester l'action
  const result = await getDisponibilitesAction("2026-06", "00000000-0000-0000-0000-000000000000")
  if (result.success) {
    console.log("Action exécutée avec succès !")
    console.log(`Nombre de créneaux indisponibles calculés : ${result.indisponibles?.length || 0}`)
    console.log("Exemples de créneaux bloqués :", result.indisponibles?.slice(0, 10))
  } else {
    console.error("Erreur de l'action :", result.error)
  }
}

runTests().then(() => {
  console.log("\nTests terminés.")
  process.exit(0)
}).catch((err) => {
  console.error("Erreur durant l'exécution des tests :", err)
  process.exit(1)
})
