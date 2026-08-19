"use client"

import * as React from "react"
import { TrendingUp, MapPin, Layers } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Bar, BarChart, LabelList, Pie, PieChart, Sector, Label } from "recharts"
import type { PieSectorShapeProps } from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RevenueData {
  mois: string
  ca: number
}

interface PipelineData {
  etape: string
  count: number
}

interface GeoData {
  zone: string
  count: number
  pourcentage: number
}

interface DashboardChartsProps {
  revenueHistory: RevenueData[]
  pipelineDistribution: PipelineData[]
  geographicDemand: GeoData[]
}

const revenueChartConfig = {
  ca: {
    label: "CA Réel",
    color: "#10B981",
  },
} satisfies ChartConfig

const pipelineChartConfig = {
  count: {
    label: "Prospects & Clients",
    color: "#10B981",
  },
} satisfies ChartConfig

const zoneColorsMap = [
  "#10B981", // Emerald
  "#059669", // Dark Emerald
  "#047857", // Deep Emerald
  "#34D399", // Light Emerald
  "#6EE7B7", // Menthe Soft
  "#3B82F6", // Blue
  "#6366F1", // Indigo
]

export default function DashboardCharts({
  revenueHistory,
  pipelineDistribution,
  geographicDemand,
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Graphique du Chiffre d'Affaires - Interactive Area Chart */}
      <div className="lg:col-span-2">
        <RevenueInteractiveAreaChart data={revenueHistory} />
      </div>

      {/* 2. Répartition Géographique - Interactive Donut Chart */}
      <div className="lg:col-span-1">
        <GeoInteractiveDonutChart data={geographicDemand} />
      </div>

      {/* 3. Entonnoir du Pipeline CRM - Custom Bar Chart */}
      <div className="lg:col-span-3">
        <PipelineCustomBarChart data={pipelineDistribution} />
      </div>
    </div>
  )
}

/* ============================================================================
   1. REVENUE INTERACTIVE AREA CHART
   ============================================================================ */
function RevenueInteractiveAreaChart({ data }: { data: RevenueData[] }) {
  const [timeRange, setTimeRange] = React.useState("12m")

  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return []
    let count = 12
    if (timeRange === "6m") count = 6
    if (timeRange === "3m") count = 3
    return data.slice(-count)
  }, [data, timeRange])

  const currentMonthCA = filteredData.length > 0 ? filteredData[filteredData.length - 1].ca : 0
  const previousMonthCA = filteredData.length > 1 ? filteredData[filteredData.length - 2].ca : currentMonthCA
  const growthRate = previousMonthCA > 0 ? ((currentMonthCA - previousMonthCA) / previousMonthCA) * 100 : 0

  return (
    <Card className="rounded-2xl border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between overflow-hidden bg-white">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-extrabold text-slate-900 tracking-tight">
              Évolution du Chiffre d&apos;Affaires (FCFA)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-medium mt-0.5">
              Évolution des encaissements réels par mois
            </CardDescription>
          </div>
        </div>

        <Select value={timeRange} onValueChange={(val) => val && setTimeRange(val)}>
          <SelectTrigger
            className="w-[140px] rounded-xl border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 h-9 focus:ring-emerald-500"
            aria-label="Sélectionner la période"
          >
            <SelectValue placeholder="12 derniers mois" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200 shadow-lg">
            <SelectItem value="12m" className="text-xs font-semibold py-2">
              12 derniers mois
            </SelectItem>
            <SelectItem value="6m" className="text-xs font-semibold py-2">
              6 derniers mois
            </SelectItem>
            <SelectItem value="3m" className="text-xs font-semibold py-2">
              3 derniers mois
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="pt-6 px-2 sm:px-6 flex-1">
        <ChartContainer config={revenueChartConfig} className="aspect-auto h-[260px] w-full">
          <AreaChart
            data={filteredData}
            margin={{
              left: -10,
              right: 12,
              top: 10,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="fillCA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
            <XAxis
              dataKey="mois"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
              tickFormatter={(value) => value ? value.split(' ')[0] : ''}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={4}
              tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
              tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
            />
            <ChartTooltip
              cursor={{ stroke: "#10B981", strokeWidth: 1, strokeDasharray: "4 4" }}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value) => [
                    `${new Intl.NumberFormat("fr-CI").format(Number(value))} FCFA`,
                    "Chiffre d'affaires"
                  ]}
                />
              }
            />
            <Area
              dataKey="ca"
              type="natural"
              fill="url(#fillCA)"
              stroke="#10B981"
              strokeWidth={2.5}
              activeDot={{ r: 6, fill: "#10B981", stroke: "#ffffff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] ${
            growthRate >= 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}>
            {growthRate >= 0 ? `+${growthRate.toFixed(1)}%` : `${growthRate.toFixed(1)}%`}
          </span>
          <span className="text-slate-500 font-medium">par rapport au mois précédent</span>
        </div>
      </CardFooter>
    </Card>
  )
}

/* ============================================================================
   2. GEO INTERACTIVE DONUT CHART
   ============================================================================ */
function GeoInteractiveDonutChart({ data }: { data: GeoData[] }) {
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return []
    return data.map((item, idx) => ({
      zone: item.zone,
      count: item.count,
      fill: zoneColorsMap[idx % zoneColorsMap.length],
    }))
  }, [data])

  const totalDemand = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0)
  }, [chartData])

  const geoConfig = React.useMemo(() => {
    const config: ChartConfig = {
      count: { label: "Demandeurs" },
    }
    chartData.forEach((item) => {
      config[item.zone] = {
        label: item.zone,
        color: item.fill,
      }
    })
    return config
  }, [chartData])

  return (
    <Card className="rounded-2xl border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between overflow-hidden bg-white">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-extrabold text-slate-900 tracking-tight">
              Demande par Zone
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-medium mt-0.5">
              Répartition géographique des projets
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 flex-1 flex flex-col items-center justify-center">
        <ChartContainer
          config={geoConfig}
          className="mx-auto aspect-square max-h-[220px] w-full"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel indicator="line" />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="zone"
              innerRadius={60}
              outerRadius={85}
              strokeWidth={3}
              stroke="#ffffff"
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-slate-900 text-2xl font-black"
                        >
                          {totalDemand}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 18}
                          className="fill-slate-400 text-[10px] font-bold uppercase tracking-wider"
                        >
                          Prospects
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Legend pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2 px-2">
          {chartData.slice(0, 4).map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md"
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
              {item.zone} ({item.count})
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* ============================================================================
   3. PIPELINE CUSTOM BAR CHART
   ============================================================================ */
function PipelineCustomBarChart({ data }: { data: PipelineData[] }) {
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return []
    return data.map((item) => ({
      etape: item.etape,
      count: item.count,
    }))
  }, [data])

  return (
    <Card className="rounded-2xl border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-extrabold text-slate-900 tracking-tight">
              Entonnoir de Conversion CRM (Pipeline Ventes)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-medium mt-0.5">
              Volume de dossiers par étape de qualification
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <ChartContainer config={pipelineChartConfig} className="aspect-auto h-[240px] w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{
              left: 40,
              right: 30,
              top: 5,
              bottom: 5,
            }}
          >
            <CartesianGrid horizontal={false} stroke="#f1f5f9" strokeDasharray="3 3" />
            <YAxis
              dataKey="etape"
              type="category"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#0F172A", fontSize: 11, fontWeight: 700 }}
              width={120}
            />
            <XAxis type="number" hide />
            <ChartTooltip
              cursor={{ fill: "#f8fafc" }}
              content={
                <ChartTooltipContent
                  formatter={(val) => [`${val} dossiers`, "Volume"]}
                />
              }
            />
            <Bar
              dataKey="count"
              fill="#10B981"
              radius={[0, 8, 8, 0]}
              barSize={22}
            >
              <LabelList
                dataKey="count"
                position="right"
                offset={8}
                className="fill-slate-700 text-xs font-bold"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
