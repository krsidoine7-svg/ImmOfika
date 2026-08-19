/**
 * Générateur de flux iCalendar (.ics) pour Favor Company International
 * Permet aux agents d'exporter leurs visites planifiées et de les synchroniser
 * dans Google Calendar, Outlook ou Apple Calendar.
 */

export interface ICalExportEvent {
  id: string
  start: Date
  end: Date
  summary: string
  description?: string
  location?: string
  status?: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED'
}

/**
 * Convertit une Date en chaîne au format iCal UTC (YYYYMMDDTHHMMSSZ)
 */
function formatICalDateUTC(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  const year = date.getUTCFullYear()
  const month = pad(date.getUTCMonth() + 1)
  const day = pad(date.getUTCDate())
  const hours = pad(date.getUTCHours())
  const minutes = pad(date.getUTCMinutes())
  const seconds = pad(date.getUTCSeconds())
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

/**
 * Échappe les caractères spéciaux pour les chaînes texte iCal
 */
function escapeICalText(text: string | undefined): string {
  if (!text) return ''
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/**
 * Génère le contenu d'un fichier .ics à partir d'une liste d'événements
 */
export function generateICalFeed(events: ICalExportEvent[], calendarName = "Visites Favor Company"): string {
  const nowUtc = formatICalDateUTC(new Date())
  
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Favor Company International//Immobilier CI//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICalText(calendarName)}`,
    'X-WR-TIMEZONE:UTC'
  ]

  for (const event of events) {
    const startUtc = formatICalDateUTC(event.start)
    const endUtc = formatICalDateUTC(event.end)
    const summary = escapeICalText(event.summary)
    const description = escapeICalText(event.description || '')
    const location = escapeICalText(event.location || "Abidjan, Côte d'Ivoire")
    const status = event.status || 'CONFIRMED'

    lines.push(
      'BEGIN:VEVENT',
      `UID:visite-${event.id}@favorcompany.ci`,
      `DTSTAMP:${nowUtc}`,
      `DTSTART:${startUtc}`,
      `DTEND:${endUtc}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      `STATUS:${status}`,
      'END:VEVENT'
    )
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}
