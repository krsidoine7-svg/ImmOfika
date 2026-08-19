"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getDashboardKPIsAction, exportDashboardDataAction, KPIParams } from "@/app/actions/kpis"
import DashboardFilters from "./DashboardFilters"
import DashboardCharts from "./DashboardCharts"
import AgentLeaderboard from "./AgentLeaderboard"
import { 
  TrendingUp, 
  Users, 
  Percent, 
  CalendarDays, 
  FileSpreadsheet, 
  FileText,
  Loader2,
  AlertCircle,
  Award,
  Compass,
  UserCheck
} from "lucide-react"
import { toast } from "sonner"

interface DashboardClientProps {
  initialData: Awaited<ReturnType<typeof getDashboardKPIsAction>>
  initialFilters: KPIParams
  userRole?: string
}

export default function DashboardClient({ initialData, initialFilters, userRole }: DashboardClientProps) {
  const [filters, setFilters] = React.useState<KPIParams>(initialFilters)
  const [data, setData] = React.useState(initialData)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [exporting, setExporting] = React.useState<'xlsx' | 'csv' | null>(null)

  // Fetch data whenever filters change
  React.useEffect(() => {
    if (filters === initialFilters) return

    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await getDashboardKPIsAction(filters)
        setData(res)
      } catch (err: any) {
        console.error(err)
        setError(err.message || "Impossible de charger les données du tableau de bord.")
        toast.error("Erreur de chargement des statistiques.")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [filters, initialFilters])

  // File download trigger
  const handleExport = async (format: 'xlsx' | 'csv') => {
    setExporting(format)
    try {
      const res = await exportDashboardDataAction(filters, format)
      if (!res.success || !res.data) {
        throw new Error("Erreur de génération du fichier.")
      }

      const byteCharacters = atob(res.data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: res.mimeType })

      const link = document.createElement("a")
      link.href = window.URL.createObjectURL(blob)
      link.download = res.filename || `Rapport_CRM.${format}`
      link.click()
      
      toast.success(`Export ${format.toUpperCase()} réussi !`)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Échec de la génération de l'export.")
    } finally {
      setExporting(null)
    }
  }

  const { kpis, revenueHistory, pipelineDistribution, geographicDemand, agentPerformance, cookieStats } = data as any

  if (data && 'notAuthorized' in data && data.notAuthorized) {
    const agentKPIs = (data as any).agentKPIs

    return (
      <div className="space-y-8 max-w-6xl mx-auto py-4">
        {/* Welcome Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Espace Commercial</h1>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Bienvenue sur votre espace d&apos;administration ImmOfika. Vous pouvez gérer vos prospects, vos rendez-vous de visites et configurer vos disponibilités.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 border border-emerald-200 text-emerald-700 uppercase tracking-wider">
                Rôle : Agent Commercial
              </span>
            </div>
          </div>
        </motion.div>

        {/* Agent RH Stats */}
        {agentKPIs && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Occupation Rate */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md hover:border-emerald-200 transition-all group duration-300">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Taux d&apos;occupation</span>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                    {agentKPIs.occupationRate}%
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    De votre temps de travail réservé ce mois-ci.
                  </p>
                </div>
                <div className="text-[9px] text-slate-400 font-bold">
                  {agentKPIs.occupiedHours}h occupées / {agentKPIs.totalWorkingHours}h ouvrables
                </div>
              </div>

              {/* Gold/Emerald progress ring */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r={28}
                    className="stroke-slate-100 fill-none"
                    strokeWidth={5}
                  />
                  <motion.circle
                    cx="40"
                    cy="40"
                    r={28}
                    className="stroke-emerald-500 fill-none"
                    strokeWidth={5}
                    strokeDasharray={2 * Math.PI * 28}
                    initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 28 - (agentKPIs.occupationRate / 100) * 2 * Math.PI * 28 }}
                    transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-[10px] font-black text-slate-900">
                  {agentKPIs.occupationRate}%
                </div>
              </div>
            </div>

            {/* Visits Conducted */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-emerald-200 transition-all duration-300 group">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visites menées</span>
                </div>

                <div className="flex justify-between items-baseline">
                  <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                    {agentKPIs.totalHonorees} <span className="text-xs font-semibold text-slate-400">honorées</span>
                  </h4>
                  <div className="text-[10px] text-red-600 font-bold bg-red-50 border border-red-100 px-2 py-0.5 rounded-lg">
                    {agentKPIs.totalAnnulees} annulée{agentKPIs.totalAnnulees > 1 ? 's' : ''}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                    {agentKPIs.totalHonorees + agentKPIs.totalAnnulees > 0 ? (
                      <>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(agentKPIs.totalHonorees / (agentKPIs.totalHonorees + agentKPIs.totalAnnulees)) * 100}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full bg-emerald-500" 
                        />
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(agentKPIs.totalAnnulees / (agentKPIs.totalHonorees + agentKPIs.totalAnnulees)) * 100}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full bg-rose-500" 
                        />
                      </>
                    ) : (
                      <div className="w-full h-full bg-slate-200" />
                    )}
                  </div>
                  <div className="flex justify-between text-[8px] text-slate-400 font-medium">
                    <span>
                      {agentKPIs.totalHonorees + agentKPIs.totalAnnulees > 0 
                        ? Math.round((agentKPIs.totalHonorees / (agentKPIs.totalHonorees + agentKPIs.totalAnnulees)) * 100) 
                        : 0}% honorées
                    </span>
                    <span>
                      {agentKPIs.totalHonorees + agentKPIs.totalAnnulees > 0 
                        ? Math.round((agentKPIs.totalAnnulees / (agentKPIs.totalHonorees + agentKPIs.totalAnnulees)) * 100) 
                        : 0}% annulées
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Time on field */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md hover:border-emerald-200 transition-all duration-300 group">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                    <Compass className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temps sur le terrain</span>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                    {agentKPIs.totalHoursField} {agentKPIs.totalHoursField > 1 ? 'heures' : 'heure'}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Temps physique cumulé de visites sur site.
                  </p>
                </div>
                <div className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Basé sur {agentKPIs.totalHonorees} rdv honoré{agentKPIs.totalHonorees > 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 border border-emerald-100">
                <CalendarDays className="w-7 h-7" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick links to modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Leads */}
          <motion.a
            href="/admin/leads"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 group flex flex-col justify-between h-[180px]"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Gestion des Leads</h4>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Suivez votre portefeuille de prospects, qualifiez vos leads et faites progresser les affaires dans le pipeline.
              </p>
            </div>
            <div className="text-[10px] font-bold text-emerald-600 group-hover:translate-x-1 transition-transform duration-300 flex items-center gap-1 mt-2">
              <span>Accéder aux Leads</span>
              <span>→</span>
            </div>
          </motion.a>

          {/* Visites */}
          <motion.a
            href="/admin/visites"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 group flex flex-col justify-between h-[180px]"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Gestion des Visites</h4>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Visualisez vos rendez-vous de visites sur le terrain, planifiez de nouveaux créneaux et saisissez vos comptes-rendus.
              </p>
            </div>
            <div className="text-[10px] font-bold text-emerald-600 group-hover:translate-x-1 transition-transform duration-300 flex items-center gap-1 mt-2">
              <span>Accéder aux Visites</span>
              <span>→</span>
            </div>
          </motion.a>

          {/* Agenda */}
          <motion.a
            href="/admin/agenda"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 group flex flex-col justify-between h-[180px]"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Mon Agenda</h4>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Configurez votre lien d&apos;intégration Google Calendar (iCal), bloquez vos absences et consultez votre taux d&apos;occupation mensuel.
              </p>
            </div>
            <div className="text-[10px] font-bold text-emerald-600 group-hover:translate-x-1 transition-transform duration-300 flex items-center gap-1 mt-2">
              <span>Accéder à l&apos;Agenda</span>
              <span>→</span>
            </div>
          </motion.a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Performances & Analytiques</h1>
            {userRole && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${
                userRole === 'super_admin' 
                  ? 'bg-purple-50 border-purple-200 text-purple-700' 
                  : userRole === 'tech_super_admin' 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}>
                Rôle : {userRole === 'super_admin' ? 'Super Administrateur' : userRole === 'tech_super_admin' ? 'Super Admin Technique' : userRole === 'agent' ? 'Agent Commercial' : 'Administrateur'}
              </span>
            )}
          </div>
          <p className="text-slate-500 mt-1 text-xs font-medium leading-relaxed">
            {userRole === 'agent' 
              ? "Statistiques commerciales et suivi de vos dossiers clients en temps réel." 
              : "Statistiques commerciales, RH, et financières consolidées en temps réel sur ImmOfika."}
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={exporting !== null || isLoading}
            onClick={() => handleExport('xlsx')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:cursor-not-allowed"
          >
            {exporting === 'xlsx' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5" />
            )}
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            disabled={exporting !== null || isLoading}
            onClick={() => handleExport('csv')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-slate-900/10 cursor-pointer disabled:cursor-not-allowed"
          >
            {exporting === 'csv' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <DashboardFilters filters={filters} onFiltersChange={setFilters} />

      {/* Loading / Error State */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-64 border border-slate-100 bg-white rounded-2xl flex flex-col items-center justify-center gap-3 shadow-xs"
          >
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-xs text-slate-500 font-bold">Mise à jour des analyses en cours...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 border border-rose-200 bg-rose-50/50 rounded-2xl flex items-center gap-4 text-rose-800"
          >
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <h5 className="font-bold text-sm">Une erreur est survenue</h5>
              <p className="text-xs text-rose-700 font-medium">{error}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* Primary KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Revenue */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md hover:border-slate-200 transition-all duration-300 group">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                    <span>Revenus</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {new Intl.NumberFormat("fr-CI").format(kpis.periodRevenue)} <span className="text-[10px] text-slate-400">FCFA</span>
                  </h3>
                  <p className="text-[9px] text-slate-400 font-medium">
                    CA Encaissé sur la période sélectionnée
                  </p>
                </div>
                <div className="w-9 h-9 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300 shrink-0">
                  <TrendingUp className="w-4.5 h-4.5" />
                </div>
              </div>

              {/* Total Leads */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md hover:border-slate-200 transition-all duration-300 group">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                    <span>Leads captés</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {kpis.totalLeads}
                  </h3>
                  <p className="text-[9px] text-slate-400 font-medium">
                    Nombre total de prospects enregistrés
                  </p>
                </div>
                <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300 shrink-0">
                  <Users className="w-4.5 h-4.5" />
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md hover:border-slate-200 transition-all duration-300 group">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                    <span>Taux de conversion</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {kpis.conversionRate}%
                  </h3>
                  <p className="text-[9px] text-slate-400 font-medium">
                    Ratio leads qualifiés convertis en ventes
                  </p>
                </div>
                <div className="w-9 h-9 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300 shrink-0">
                  <Percent className="w-4.5 h-4.5" />
                </div>
              </div>

              {/* Expiration Rate */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md hover:border-slate-200 transition-all duration-300 group">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                    <span>Taux d&apos;expiration</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {kpis.expirationRate}%
                  </h3>
                  <p className="text-[9px] text-slate-400 font-medium">
                    Réservations annulées ou expirées (J+90)
                  </p>
                </div>
                <div className="w-9 h-9 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform duration-300 shrink-0">
                  <CalendarDays className="w-4.5 h-4.5" />
                </div>
              </div>
            </div>

            {/* Cookie Consent Stats */}
            {cookieStats && (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Statistiques de Consentement RGPD (Cookies)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Cookies Acceptés</p>
                      <h3 className="text-2xl font-black text-emerald-600 mt-1">{cookieStats.accepted}</h3>
                    </div>
                    <span className="text-xl">✅</span>
                  </div>
                  <div className="bg-rose-50/60 border border-rose-100 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Cookies Refusés</p>
                      <h3 className="text-2xl font-black text-rose-600 mt-1">{cookieStats.declined}</h3>
                    </div>
                    <span className="text-xl">❌</span>
                  </div>
                </div>
              </div>
            )}

            {/* Charts & Geographic demand */}
            <DashboardCharts
              revenueHistory={revenueHistory}
              pipelineDistribution={pipelineDistribution}
              geographicDemand={geographicDemand}
            />

            {/* Leaderboard & Agent performance */}
            <AgentLeaderboard performance={agentPerformance} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
