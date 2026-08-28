"use client"

import * as React from "react"
import { Building, MapPin, ExternalLink } from "lucide-react"
import Link from "next/link"

interface KanbanViewProps {
  data: Record<string, any>[]
  statusField?: string
  statusOptions?: string[]
  onStatusChange: (rowId: string, newStatus: string) => void
}

export function KanbanView({
  data,
  statusField = "statut",
  statusOptions = ["disponible", "reserve", "vendu", "loue"],
  onStatusChange,
}: KanbanViewProps) {

  const groupedData = React.useMemo(() => {
    const groups: Record<string, Record<string, any>[]> = {}
    statusOptions.forEach((opt) => {
      groups[opt] = []
    })

    data.forEach((row) => {
      const st = row[statusField] || statusOptions[0]
      if (!groups[st]) {
        groups[st] = []
      }
      groups[st].push(row)
    })

    return groups
  }, [data, statusField, statusOptions])

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-full">
      {statusOptions.map((status) => {
        const items = groupedData[status] || []

        return (
          <div
            key={status}
            className="w-72 shrink-0 bg-slate-100/70 dark:bg-zinc-800/60 rounded-2xl p-3 border border-slate-200 dark:border-zinc-800 flex flex-col h-full"
          >
            {/* Header de colonne */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-700/60 mb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 capitalize flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                {status}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white dark:bg-zinc-700 text-[10px] font-extrabold text-slate-600 dark:text-slate-300">
                {items.length}
              </span>
            </div>

            {/* Liste des cartes Kanban */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-zinc-800 rounded-xl p-3.5 shadow-xs border border-slate-200 dark:border-zinc-700 hover:border-emerald-500 transition-all space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-2">
                      {item.titre || item.nom || item.numero || "Sans titre"}
                    </h4>
                    {item.slug && (
                      <Link
                        href={`/biens/${item.slug}`}
                        target="_blank"
                        className="text-slate-400 hover:text-emerald-600 shrink-0"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>

                  {/* Détails secondaires */}
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                    {item.prix && (
                      <p className="font-bold text-emerald-700 dark:text-emerald-400">
                        {Number(item.prix).toLocaleString("fr-FR")} FCFA
                      </p>
                    )}
                    {item.ville && (
                      <p className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-emerald-600" />
                        {item.ville} {item.quartier ? `(${item.quartier})` : ""}
                      </p>
                    )}
                    {item.email && <p className="truncate">{item.email}</p>}
                    {item.telephone && <p>{item.telephone}</p>}
                  </div>

                  {/* Déplacer vers une autre colonne */}
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-700/50 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">Changer statut :</span>
                    <select
                      value={status}
                      onChange={(e) => onStatusChange(item.id, e.target.value)}
                      className="text-[10px] font-bold p-1 rounded-md border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 capitalize text-slate-700 dark:text-slate-300 focus:outline-none"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400 italic">
                  Aucun élément
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
