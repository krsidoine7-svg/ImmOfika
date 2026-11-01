import { NextResponse } from 'next/server'
import { db } from "@/lib/db/index"
import { analyticsEvents } from "@/lib/db/schema"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 1. Si c'est un tableau d'événements (Batching optimisé)
    if (Array.isArray(body)) {
      if (body.length === 0) {
        return NextResponse.json({ success: true, count: 0 })
      }

      // Filtrer et structurer les événements
      const validEvents = body
        .filter(evt => evt && evt.visitorId && evt.sessionId && evt.eventType && evt.path)
        .map(evt => ({
          visitorId: evt.visitorId,
          sessionId: evt.sessionId,
          eventType: evt.eventType,
          path: evt.path,
          details: evt.details || {},
          duration: typeof evt.duration === 'number' ? evt.duration : 0,
          createdAt: evt.createdAt ? new Date(evt.createdAt) : new Date(),
        }))

      if (validEvents.length === 0) {
        return NextResponse.json({ success: false, error: "No valid events in batch" }, { status: 400 })
      }

      // Insertion SQL groupée optimisée avec tolérance aux pannes
      try {
        await db.insert(analyticsEvents).values(validEvents)
      } catch (dbErr: any) {
        console.warn('[API Analytics Warning] Base inaccessible pour l\'insertion par lot:', dbErr?.message || dbErr)
        return NextResponse.json({ success: false, warning: "Database unavailable" }, { status: 200 })
      }
      
      return NextResponse.json({ success: true, count: validEvents.length })
    }

    // 2. Si c'est un événement unique (Rétrocompatibilité)
    const { visitorId, sessionId, eventType, path, details, duration } = body

    if (!visitorId || !sessionId || !eventType || !path) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    try {
      await db.insert(analyticsEvents).values({
        visitorId,
        sessionId,
        eventType,
        path,
        details: details || {},
        duration: typeof duration === 'number' ? duration : 0,
        createdAt: new Date(),
      })
    } catch (dbErr: any) {
      console.warn('[API Analytics Warning] Base inaccessible pour l\'insertion unitaire:', dbErr?.message || dbErr)
      return NextResponse.json({ success: false, warning: "Database unavailable" }, { status: 200 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.warn('[API Analytics Warning] Erreur générale payload:', error?.message || error)
    return NextResponse.json({ success: false, error: error?.message || "Invalid payload" }, { status: 400 })
  }
}
