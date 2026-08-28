"use client"

import * as React from "react"
import {
  ArrowUpDown,
  Plus,
  Type,
  Hash,
  Calendar as CalendarIcon,
  CheckSquare,
  Tag,
  AlignLeft,
  Check,
  X,
  Edit2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ColumnDef } from "./AddColumnModal"

interface GridViewProps {
  columns: ColumnDef[]
  data: Record<string, any>[]
  onCellEdit: (rowId: string, field: string, value: any) => void
  onAddRow: () => void
  onOpenAddColumn: () => void
}

export function GridView({
  columns,
  data,
  onCellEdit,
  onAddRow,
  onOpenAddColumn,
}: GridViewProps) {
  const [editingCell, setEditingCell] = React.useState<{ rowId: string; field: string } | null>(null)
  const [editValue, setEditValue] = React.useState<any>("")
  const [sortField, setSortField] = React.useState<string | null>(null)
  const [sortAsc, setSortAsc] = React.useState(true)

  const handleSort = (key: string) => {
    if (sortField === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(key)
      setSortAsc(true)
    }
  }

  const sortedData = React.useMemo(() => {
    if (!sortField) return data
    return [...data].sort((a, b) => {
      const valA = a[sortField] ?? ""
      const valB = b[sortField] ?? ""
      if (valA < valB) return sortAsc ? -1 : 1
      if (valA > valB) return sortAsc ? 1 : -1
      return 0
    })
  }, [data, sortField, sortAsc])

  const startEditing = (rowId: string, field: string, currentValue: any) => {
    setEditingCell({ rowId, field })
    setEditValue(currentValue ?? "")
  }

  const saveEditing = (rowId: string, field: string) => {
    onCellEdit(rowId, field, editValue)
    setEditingCell(null)
  }

  const getColIcon = (type: ColumnDef["type"]) => {
    switch (type) {
      case "number":
        return <Hash className="h-3 w-3 text-emerald-600 shrink-0" />
      case "date":
        return <CalendarIcon className="h-3 w-3 text-emerald-600 shrink-0" />
      case "select":
        return <AlignLeft className="h-3 w-3 text-emerald-600 shrink-0" />
      case "tag":
        return <Tag className="h-3 w-3 text-emerald-600 shrink-0" />
      case "checkbox":
        return <CheckSquare className="h-3 w-3 text-emerald-600 shrink-0" />
      default:
        return <Type className="h-3 w-3 text-emerald-600 shrink-0" />
    }
  }

  return (
    <div className="flex flex-col h-full border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
      {/* Barre de contrôle du tableau */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <Edit2 className="h-3.5 w-3.5 text-emerald-600" />
          Astuce : Double-cliquez sur une cellule pour modifier la valeur en direct
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenAddColumn}
          className="h-7 px-2.5 rounded-xl border-emerald-200 hover:bg-emerald-50 text-emerald-700 font-bold text-[11px]"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Nouvelle Colonne
        </Button>
      </div>

      {/* Grille de données défilante */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/80 dark:bg-zinc-800/80 sticky top-0 z-10 border-b border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 font-bold">
              <th className="p-3 w-12 text-center text-slate-400 font-normal">#</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="p-3 min-w-[150px] max-w-[250px] border-r border-slate-200/60 dark:border-zinc-800 cursor-pointer hover:bg-slate-200/50 dark:hover:bg-zinc-700/50 transition-colors"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="flex items-center gap-1.5 truncate">
                      {getColIcon(col.type)}
                      <span className="truncate">{col.label}</span>
                    </span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400 shrink-0 opacity-60 hover:opacity-100" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
            {sortedData.map((row, index) => (
              <tr
                key={row.id || index}
                className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors group"
              >
                {/* Index */}
                <td className="p-3 text-center text-slate-400 font-mono text-[11px] select-none">
                  {index + 1}
                </td>

                {/* Cellules dynamiques */}
                {columns.map((col) => {
                  const isEditing = editingCell?.rowId === row.id && editingCell?.field === col.key
                  const cellValue = row[col.key]

                  return (
                    <td
                      key={col.key}
                      className="p-2.5 min-w-[150px] max-w-[250px] border-r border-slate-100 dark:border-zinc-800/60 cursor-pointer select-none"
                      onDoubleClick={() => startEditing(row.id, col.key, cellValue)}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          {col.type === "select" && col.options ? (
                            <select
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-full text-xs p-1 rounded-lg border border-emerald-500 bg-white dark:bg-zinc-800 focus:outline-none"
                              autoFocus
                            >
                              {col.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : col.type === "checkbox" ? (
                            <input
                              type="checkbox"
                              checked={Boolean(editValue)}
                              onChange={(e) => setEditValue(e.target.checked)}
                              className="h-4 w-4 accent-emerald-600 rounded"
                              autoFocus
                            />
                          ) : (
                            <Input
                              type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="h-7 text-xs rounded-lg border-emerald-500"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEditing(row.id, col.key)
                                if (e.key === "Escape") setEditingCell(null)
                              }}
                              autoFocus
                            />
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-emerald-600 hover:bg-emerald-100"
                            onClick={() => saveEditing(row.id, col.key)}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-rose-500 hover:bg-rose-100"
                            onClick={() => setEditingCell(null)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between group-hover:text-slate-900 dark:group-hover:text-white">
                          {col.type === "tag" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 capitalize">
                              {String(cellValue ?? "-")}
                            </span>
                          ) : col.type === "checkbox" ? (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${cellValue ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                              {cellValue ? "Oui" : "Non"}
                            </span>
                          ) : col.type === "number" ? (
                            <span className="font-mono font-medium">
                              {cellValue ? Number(cellValue).toLocaleString("fr-FR") : "-"}
                            </span>
                          ) : (
                            <span className="truncate">{cellValue ? String(cellValue) : "-"}</span>
                          )}
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer d'ajout de ligne */}
      <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/60 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddRow}
          className="text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/60 font-bold"
        >
          <Plus className="h-4 w-4 mr-1.5 text-emerald-600" />
          Ajouter une nouvelle ligne
        </Button>
        <span className="text-[11px] text-slate-400 font-mono">
          {data.length} enregistrements au total
        </span>
      </div>
    </div>
  )
}
