import { db } from '@/lib/db'
import { auditLogs } from '@/lib/db/schema'
import { headers } from 'next/headers'

export interface LogAuditParams {
  userId?: string | null
  userEmail?: string | null
  userRole?: string | null
  action: string
  entity?: string
  entityId?: string | null
  details?: Record<string, any> | null
}

/**
 * Enregistre un événement de sécurité de manière résiliente et non-bloquante.
 * Ne fait jamais crasher l'action principale si l'écriture échoue.
 */
export async function logAuditEvent(params: LogAuditParams): Promise<void> {
  try {
    let ipAddress: string | null = null
    let userAgent: string | null = null

    try {
      const headerList = await headers()
      ipAddress =
        headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        headerList.get('x-real-ip') ||
        null
      userAgent = headerList.get('user-agent') || null
    } catch {
      // headers() peut échouer dans certains contextes d'exécution sans requête HTTP
    }

    await db.insert(auditLogs).values({
      userId: params.userId || null,
      userEmail: params.userEmail || null,
      userRole: params.userRole || null,
      action: params.action,
      entity: params.entity || null,
      entityId: params.entityId ? String(params.entityId) : null,
      details: params.details || null,
      ipAddress,
      userAgent,
    })
  } catch (error) {
    // Journalisation silencieuse de secours pour ne pas bloquer l'utilisateur
    console.error('[logAuditEvent Error]', error)
  }
}
