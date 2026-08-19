/**
 * Utilitaire léger pour parser les fichiers iCalendar (.ics) de Google Calendar
 * et extraire les plages horaires d'indisponibilité.
 */

export interface ICalEvent {
  start: Date
  end: Date
  summary: string
}

/**
 * Parse une chaîne de caractères représentant un flux iCal et extrait les dates de début et fin d'événements.
 */
export function parseICal(icsContent: string): ICalEvent[] {
  const events: ICalEvent[] = []
  
  // 1. Déplier les lignes (line folding) : les lignes commençant par un espace ou une tabulation
  // font partie de la ligne précédente.
  const unfolded = icsContent.replace(/\r?\n[ \t]/g, "")
  const lines = unfolded.split(/\r?\n/)
  
  let currentEvent: Partial<ICalEvent> & { startStr?: string; endStr?: string } | null = null
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    
    if (trimmed === "BEGIN:VEVENT") {
      currentEvent = {}
    } else if (trimmed === "END:VEVENT") {
      if (currentEvent && currentEvent.startStr && currentEvent.endStr) {
        const start = parseICalDate(currentEvent.startStr)
        const end = parseICalDate(currentEvent.endStr)
        
        if (start && end) {
          events.push({
            start,
            end,
            summary: currentEvent.summary || "Occupé",
          })
        }
      }
      currentEvent = null
    } else if (currentEvent) {
      // Séparer la clé et la valeur par le premier deux-points (:) ou point-virgule (;)
      const colonIndex = trimmed.indexOf(":")
      if (colonIndex !== -1) {
        const keyPart = trimmed.substring(0, colonIndex)
        const value = trimmed.substring(colonIndex + 1)
        
        // Nettoyer la clé (retirer les attributs optionnels comme ;TZID=...)
        const key = keyPart.split(";")[0]
        
        if (key === "DTSTART") {
          currentEvent.startStr = value
        } else if (key === "DTEND") {
          currentEvent.endStr = value
        } else if (key === "SUMMARY") {
          currentEvent.summary = value
        }
      }
    }
  }
  
  return events
}

/**
 * Convertit une chaîne de date au format iCal en objet Date JS.
 * Supporte :
 * - Format DateTime UTC : 20260605T143000Z
 * - Format DateTime Local : 20260605T143000 (sans Z)
 * - Format Date seule (journée entière) : 20260605
 */
function parseICalDate(dateStr: string): Date | null {
  const clean = dateStr.trim()
  
  // Format DateTime standard : YYYYMMDDTHHMMSS ou YYYYMMDDTHHMMSSZ
  const matchLong = clean.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/)
  if (matchLong) {
    const [_, year, month, day, hour, minute, second, isUtc] = matchLong
    
    if (isUtc) {
      return new Date(Date.UTC(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        parseInt(hour, 10),
        parseInt(minute, 10),
        parseInt(second, 10)
      ))
    } else {
      // Local date mapping
      return new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        parseInt(hour, 10),
        parseInt(minute, 10),
        parseInt(second, 10)
      )
    }
  }
  
  // Format Date seule (ex: Journée entière comme 20260605)
  const matchShort = clean.match(/^(\d{4})(\d{2})(\d{2})$/)
  if (matchShort) {
    const [_, year, month, day] = matchShort
    return new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      0, 0, 0
    )
  }
  
  return null
}
