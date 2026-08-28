"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { BarChart3, PieChart as PieChartIcon, Building, TrendingUp } from "lucide-react"

interface GraphViewProps {
  data: Record<string, any>[]
}

const COLORS = ["#10B981", "#059669", "#047857", "#065F46", "#34D399", "#6EE7B7"]

export function GraphView({ data }: GraphViewProps) {
  // Répartition par ville
  const cityData = React.useMemo(() => {
    const counts: Record<string, number> = {}
    data.forEach((item) => {
      const v = item.ville || "Non spécifié"
      counts[v] = (counts[v] || 0) + 1
    })
    return Object.entries(counts).map(([name, val]) => ({ name, val }))
  }, [data])

  // Répartition par statut
  const statusData = React.useMemo(() => {
    const counts: Record<string, number> = {}
    data.forEach((item) => {
      const s = item.statut || "disponible"
      counts[s] = (counts[s] || 0) + 1
    })
    return Object.entries(counts).map(([name, val]) => ({ name, val }))
  }, [data])

  // Valeur totale portefeuille
  const totalValue = React.useMemo(() => {
    return data.reduce((acc, item) => acc + (Number(item.prix) || 0), 0)
  }, [data])

  return (
    <div className="space-y-4 overflow-y-auto h-full pr-1">
      {/* KPIs analytiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Total Enregistrements</p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">{data.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Valeur Cumulée</p>
            <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
              {totalValue.toLocaleString("fr-FR")} FCFA
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
            <PieChartIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Zones Couvertes</p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">{cityData.length} Villes</p>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Répartition par Ville (BarChart) */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3">
          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-600" />
            Répartition par Ville
          </h4>
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderRadius: "12px",
                    border: "none",
                    color: "#FFF",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="val" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition par Statut (PieChart) */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3">
          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-emerald-600" />
            Répartition par Statut
          </h4>
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="val"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderRadius: "12px",
                    border: "none",
                    color: "#FFF",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
