import * as React from 'react'
import { assertCan } from '@/lib/auth/permissions'
import { db } from '@/lib/db'
import { auditLogs } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  User,
  Clock,
  Terminal,
  AlertTriangle,
  FileCheck2,
  Trash2,
  Lock
} from 'lucide-react'

export const metadata = {
  title: 'Journal d\'Audit de Sécurité — Administration ImmOfika',
  description: 'Traçabilité et surveillance des actions critiques sur la plateforme.',
}

export default async function AuditLogsPage() {
  // Sécurité : Seuls les administrateurs et super-administrateurs ont accès
  await assertCan('audit:view')

  const logs = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(100)

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
            Sécurité & Conformité Applicative
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Journal d&apos;Audit de Sécurité
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Traçabilité en temps réel des connexions, modérations, modifications de biens et accès refusés.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            {logs.length} Événements récents
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Date & Heure</th>
                <th className="py-3.5 px-4">Utilisateur / Auteur</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Cible / Entité</th>
                <th className="py-3.5 px-4">Adresse IP</th>
                <th className="py-3.5 px-4">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-50" />
                    Aucun événement de sécurité consigné pour le moment.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isDenied = log.action.includes('denied') || log.action.includes('failed')
                  const isDelete = log.action.includes('deleted')
                  const isModerate = log.action.includes('moderated')
                  const isCreate = log.action.includes('created')

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>
                            {new Date(log.createdAt).toLocaleString('fr-FR', {
                              dateStyle: 'short',
                              timeStyle: 'medium',
                            })}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">
                          {log.userEmail || 'Anonyme / Non connecté'}
                        </div>
                        {log.userRole && (
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                            {log.userRole}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {isDenied && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <Lock className="w-3 h-3 text-rose-600" />
                            {log.action}
                          </span>
                        )}
                        {isDelete && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <Trash2 className="w-3 h-3 text-rose-600" />
                            {log.action}
                          </span>
                        )}
                        {isModerate && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <FileCheck2 className="w-3 h-3 text-amber-600" />
                            {log.action}
                          </span>
                        )}
                        {isCreate && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            {log.action}
                          </span>
                        )}
                        {!isDenied && !isDelete && !isModerate && !isCreate && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {log.action}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-gray-600 whitespace-nowrap">
                        {log.entity ? (
                          <span>
                            {log.entity} {log.entityId ? `(#${log.entityId.slice(0, 8)})` : ''}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">
                        {log.ipAddress || '127.0.0.1'}
                      </td>

                      <td className="py-3 px-4 max-w-xs truncate text-gray-500 font-mono text-[11px]">
                        {log.details ? JSON.stringify(log.details) : '—'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
