import { NextResponse } from "next/server"
import { parseICal } from "@/lib/calendar/ical-parser"

export async function GET() {
  const dummyIcs = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Google Inc//Google Calendar 70.9054//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART:20260605T083000Z
DTEND:20260605T093000Z
SUMMARY:Réunion client (Format UTC Z)
END:VEVENT
BEGIN:VEVENT
DTSTART:20260605T140000
DTEND:20260605T150000
SUMMARY:Visite terrain Bingerville (Format Local)
END:VEVENT
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260606
DTEND;VALUE=DATE:20260607
SUMMARY:Journée de formation
END:VEVENT
END:VCALENDAR
  `.trim()

  try {
    const events = parseICal(dummyIcs)
    
    return NextResponse.json({
      success: true,
      parsedCount: events.length,
      events: events.map(e => ({
        summary: e.summary,
        start: e.start.toISOString(),
        startLocalString: e.start.toString(),
        end: e.end.toISOString(),
        endLocalString: e.end.toString()
      }))
    })
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 })
  }
}
