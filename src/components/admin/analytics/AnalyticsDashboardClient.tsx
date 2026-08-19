"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  BarChart3, Users, Clock, Eye, Download, Search, ShieldCheck, 
  Smartphone, Monitor, Tablet, MapPin, Settings, Check, ChevronRight,
  TrendingUp, Activity, HelpCircle, Layers, ArrowRight
} from "lucide-react"
import { toast } from "sonner"
import { updateHomepageSectionAction, getHomepageConfigsAction } from "@/app/actions/homepage"
import { updateUserRoleAction, toggleRolePermissionAction } from "@/app/actions/analytics-actions"
import { CustomSelect } from "@/components/ui/custom-select"

interface AnalyticsData {
  kpis: {
    visitorsCount: number
    pageViewsCount: number
    avgDurationSeconds: number
  }
  devices: Record<string, number>
  regions: Record<string, number>
  signupKanban: {
    stage: string
    label: string
    visitorsCount: number
    avgTimeSeconds: number
  }[]
  reservationKanban: {
    stage: string
    label: string
    visitorsCount: number
    avgTimeSeconds: number
  }[]
  pathStats: {
    path: string
    views: number
    avgDuration: number
  }[]
  rawLogs: any[]
}

interface UserProfile {
  id: string
  email: string
  fullName: string | null
  role: string
  createdAt: Date
}

interface RbacConfig {
  roles: { name: string; description: string | null }[]
  permissions: { code: string; description: string | null }[]
  rolePermissions: { roleName: string; permissionCode: string }[]
}

interface Props {
  currentUserRole: string
  initialAnalytics: AnalyticsData | null
  initialUsers: UserProfile[]
  initialRbac: RbacConfig | null
  defaultTab?: TabType
}

type TabType = "visites" | "flux" | "onboarding" | "rbac"

export default function AnalyticsDashboardClient({ currentUserRole, initialAnalytics, initialUsers, initialRbac, defaultTab = "visites" }: Props) {
  const [activeTab, setActiveTab] = React.useState<TabType>(defaultTab)
  const [analytics, setAnalytics] = React.useState<AnalyticsData | null>(initialAnalytics)
  const [users, setUsers] = React.useState<UserProfile[]>(initialUsers)
  const [rbac, setRbac] = React.useState<RbacConfig | null>(initialRbac)

  // Search & Filter state for Flux Tab
  const [fluxSearch, setFluxSearch] = React.useState("")
  const [fluxSortBy, setFluxSortBy] = React.useState<"views" | "duration" | "path">("views")
  const [fluxSortOrder, setFluxSortOrder] = React.useState<"asc" | "desc">("desc")

  // Search & Filter for RBAC Tab
  const [userSearch, setUserSearch] = React.useState("")

  // Facebook Pixel ID state
  const [fbPixelId, setFbPixelId] = React.useState("")
  const [gaId, setGaId] = React.useState("")
  const [isSavingPixel, setIsSavingPixel] = React.useState(false)

  // Load Pixel values on mount
  React.useEffect(() => {
    const fetchPixel = async () => {
      try {
        const res = await getHomepageConfigsAction()
        if (res.success && res.configs?.tracking) {
          setFbPixelId(res.configs.tracking.facebook_pixel_id || "")
          setGaId(res.configs.tracking.google_analytics_id || "")
        }
      } catch (err) {
        // fail silently
      }
    }
    fetchPixel()
  }, [])

  const handleSavePixel = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingPixel(true)
    try {
      const res = await updateHomepageSectionAction("tracking", {
        facebook_pixel_id: fbPixelId,
        google_analytics_id: gaId
      })
      if (res.success) {
        toast.success("Pixel Facebook & Google Analytics mis à jour avec succès !")
      } else {
        toast.error("Erreur de sauvegarde : " + res.error)
      }
    } catch (err) {
      toast.error("Erreur technique de sauvegarde.")
    } finally {
      setIsSavingPixel(false)
    }
  }

  // Handle user role update
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await updateUserRoleAction(userId, newRole)
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
        toast.success("Rôle utilisateur mis à jour avec succès !")
      } else {
        toast.error("Erreur lors de la modification du rôle : " + res.error)
      }
    } catch (err) {
      toast.error("Erreur technique de mise à jour.")
    }
  }

  // Handle permission toggle
  const handlePermissionToggle = async (roleName: string, permissionCode: string, granted: boolean) => {
    try {
      const res = await toggleRolePermissionAction(roleName, permissionCode, granted)
      if (res.success) {
        setRbac(prev => {
          if (!prev) return null
          let newRolePerms = [...prev.rolePermissions]
          if (granted) {
            newRolePerms.push({ roleName, permissionCode })
          } else {
            newRolePerms = newRolePerms.filter(rp => !(rp.roleName === roleName && rp.permissionCode === permissionCode))
          }
          return { ...prev, rolePermissions: newRolePerms }
        })
        toast.success(`Permission mise à jour pour le rôle ${roleName}`)
      } else {
        toast.error("Erreur de mise à jour de la permission : " + res.error)
      }
    } catch (err) {
      toast.error("Erreur technique de permission.")
    }
  }

  // CSV Exporter
  const handleExportCsv = () => {
    if (!analytics?.rawLogs || analytics.rawLogs.length === 0) {
      toast.error("Aucune donnée disponible pour l'export.")
      return
    }

    const headers = ["ID", "Visiteur ID", "Session ID", "Type d'evenement", "Chemin / URL", "Terminal", "Region", "Navigateur", "Duree (sec)", "Date"]
    const rows = analytics.rawLogs.map(l => [
      l.id,
      l.visitorId,
      l.sessionId,
      l.eventType,
      l.path,
      l.device,
      l.region,
      l.browser,
      l.duration,
      new Date(l.createdAt).toLocaleString('fr-FR')
    ])

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(";"), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(";"))].join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `analytics_favor_company_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Données exportées avec succès sous format CSV (Excel) !")
  }

  // Format second durations to string (e.g. 2m 15s)
  const formatDuration = (sec: number) => {
    if (sec < 60) return `${sec}s`
    const mins = Math.floor(sec / 60)
    const remainingSecs = sec % 60
    return remainingSecs > 0 ? `${mins}m ${remainingSecs}s` : `${mins}m`
  }

  // Sort and filter pages for Flux Tab
  const sortedPathStats = React.useMemo(() => {
    if (!analytics?.pathStats) return []
    return analytics.pathStats
      .filter(item => item.path.toLowerCase().includes(fluxSearch.toLowerCase()))
      .sort((a, b) => {
        let valA: any = fluxSortBy === "duration" ? a.avgDuration : a[fluxSortBy as "views" | "path"]
        let valB: any = fluxSortBy === "duration" ? b.avgDuration : b[fluxSortBy as "views" | "path"]
        if (typeof valA === "string") {
          return fluxSortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA)
        }
        return fluxSortOrder === "asc" ? valA - valB : valB - valA
      })
  }, [analytics, fluxSearch, fluxSortBy, fluxSortOrder])

  // Filter users for RBAC Tab
  const filteredUsers = React.useMemo(() => {
    return users.filter(u => 
      u.email.toLowerCase().includes(userSearch.toLowerCase()) || 
      (u.fullName && u.fullName.toLowerCase().includes(userSearch.toLowerCase()))
    )
  }, [users, userSearch])

  // Prepare device statistics data for Pie Chart
  const devicePieData = React.useMemo(() => {
    if (!analytics?.devices) return []
    const dev = analytics.devices
    return [
      { label: "Ordinateur", value: dev.ordinateur || 0, color: "#1A2A4A" },
      { label: "Tablette", value: dev.tablette || 0, color: "#C9A84C" },
      { label: "Mobile", value: dev.mobile || 0, color: "#10B981" }
    ].filter(item => item.value > 0)
  }, [analytics])

  // Prepare regions statistics data for Pie Chart (show top 5)
  const regionPieData = React.useMemo(() => {
    if (!analytics?.regions) return []
    const colors = ["#1A2A4A", "#C9A84C", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"]
    return Object.entries(analytics.regions)
      .map(([label, value], idx) => ({
        label,
        value,
        color: colors[idx % colors.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [analytics])

  return (
    <div className="space-y-6">
      {/* Title & En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A2A4A] tracking-tight flex items-center gap-3">
            <Activity className="h-7 w-7 text-[#C9A84C] animate-pulse" />
            Analytiques & Permissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-light mt-1">
            Suivi du trafic, comportement d&apos;onboarding et configuration de la matrice de rôles (RBAC).
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 bg-[#1A2A4A] hover:bg-[#111e36] text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
        >
          <Download className="h-4 w-4" /> Export Tableur (CSV)
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("visites")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "visites" ? "bg-white text-[#1A2A4A] shadow-sm" : "text-slate-500 hover:text-[#1A2A4A]"
          }`}
        >
          <BarChart3 className="h-4 w-4 text-[#C9A84C]" /> Audiences & Pixels
        </button>
        <button
          onClick={() => setActiveTab("flux")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "flux" ? "bg-white text-[#1A2A4A] shadow-sm" : "text-slate-500 hover:text-[#1A2A4A]"
          }`}
        >
          <Eye className="h-4 w-4 text-[#C9A84C]" /> Flux de Pages & Liens
        </button>
        <button
          onClick={() => setActiveTab("onboarding")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "onboarding" ? "bg-white text-[#1A2A4A] shadow-sm" : "text-slate-500 hover:text-[#1A2A4A]"
          }`}
        >
          <Layers className="h-4 w-4 text-[#C9A84C]" /> Tunnels & Kanban
        </button>
        <button
          onClick={() => setActiveTab("rbac")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "rbac" ? "bg-white text-[#1A2A4A] shadow-sm" : "text-slate-500 hover:text-[#1A2A4A]"
          }`}
        >
          <ShieldCheck className="h-4 w-4 text-[#C9A84C]" /> Rôles & Permissions
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Tab 1: Audiences & Pixels */}
        {activeTab === "visites" && (
          <motion.div
            key="visites"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="h-12 w-12 bg-[#C9A84C]/10 text-[#C9A84C] rounded-2xl flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Visiteurs uniques</p>
                  <p className="text-2xl font-black text-[#1A2A4A]">{analytics?.kpis.visitorsCount || 0}</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Eye className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Pages vues totales</p>
                  <p className="text-2xl font-black text-[#1A2A4A]">{analytics?.kpis.pageViewsCount || 0}</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Temps d&apos;attention moyen</p>
                  <p className="text-2xl font-black text-[#1A2A4A]">{formatDuration(analytics?.kpis.avgDurationSeconds || 0)}</p>
                </div>
              </div>
            </div>

            {/* Graphs Distribution Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Device Pie Chart */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                <h3 className="text-sm font-extrabold text-[#1A2A4A] uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-[#C9A84C]" /> Terminaux de Connexion
                </h3>
                {devicePieData.length > 0 ? (
                  <SvgPieChart data={devicePieData} />
                ) : (
                  <div className="h-32 flex items-center justify-center text-xs text-slate-400">Aucune donnée disponible</div>
                )}
              </div>

              {/* Region Pie Chart */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                <h3 className="text-sm font-extrabold text-[#1A2A4A] uppercase tracking-wider mb-6 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#C9A84C]" /> Zones Géographiques (Côte d&apos;Ivoire)
                </h3>
                {regionPieData.length > 0 ? (
                  <SvgPieChart data={regionPieData} />
                ) : (
                  <div className="h-32 flex items-center justify-center text-xs text-slate-400">Aucune donnée disponible</div>
                )}
              </div>
            </div>

            {/* Facebook Pixel Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm max-w-2xl">
              <h3 className="text-sm font-extrabold text-[#1A2A4A] uppercase tracking-wider mb-2 flex items-center gap-2">
                <Settings className="h-4 w-4 text-[#C9A84C]" /> Tracking Externe & Pixels
              </h3>
              <p className="text-xs text-slate-400 font-light mb-6">
                Injectez dynamiquement votre Pixel Facebook et l&apos;ID de suivi Google Analytics sur toutes les pages publiques de votre site.
              </p>
              <form onSubmit={handleSavePixel} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A2A4A] uppercase tracking-wider">ID Facebook Pixel</label>
                  <input
                    type="text"
                    value={fbPixelId}
                    onChange={(e) => setFbPixelId(e.target.value)}
                    placeholder="Ex: 832948293029302"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#C9A84C]/30 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A2A4A] uppercase tracking-wider">ID Google Analytics (G-XXXXX)</label>
                  <input
                    type="text"
                    value={gaId}
                    onChange={(e) => setGaId(e.target.value)}
                    placeholder="Ex: G-XXXXXXXXXX"
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#C9A84C]/30 outline-none"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingPixel}
                    className="px-6 py-3 bg-[#1A2A4A] hover:bg-[#111e36] text-white rounded-xl font-bold text-xs transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingPixel ? "Mise à jour..." : "Sauvegarder les codes de tracking"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Flux de Pages */}
        {activeTab === "flux" && (
          <motion.div
            key="flux"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Search and Sort Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm items-center justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={fluxSearch}
                  onChange={(e) => setFluxSearch(e.target.value)}
                  placeholder="Rechercher une URL / Lien..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-[#C9A84C]/30"
                />
              </div>

              <div className="flex gap-4 items-center shrink-0 w-full sm:w-auto justify-end min-w-[180px]">
                <CustomSelect
                  size="sm"
                  value={fluxSortBy}
                  onChange={(val) => setFluxSortBy(val as any)}
                  options={[
                    { value: 'views', label: 'Trier par Vues' },
                    { value: 'duration', label: 'Trier par Temps Passé' },
                    { value: 'path', label: 'Trier par URL' },
                  ]}
                />

                <button
                  onClick={() => setFluxSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                  className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-black text-[#1A2A4A] cursor-pointer"
                >
                  {fluxSortOrder === "asc" ? "⬆️ Croissant" : "⬇️ Décroissant"}
                </button>
              </div>
            </div>

            {/* Table layout */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-4 pl-6">Lien Visité</th>
                      <th className="p-4 text-center">Nombre de Vues</th>
                      <th className="p-4 text-center">Temps Moyen d&apos;Attention</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                    {sortedPathStats.length > 0 ? (
                      sortedPathStats.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50/40 transition-colors">
                          <td className="p-4 pl-6 font-mono text-[11px] text-[#1A2A4A] max-w-[400px] truncate">{item.path}</td>
                          <td className="p-4 text-center text-slate-900 font-bold">{item.views} vues</td>
                          <td className="p-4 text-center text-indigo-600 font-bold">{formatDuration(item.avgDuration)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-slate-400">Aucun lien correspondant trouvé.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Kanban Onboarding */}
        {activeTab === "onboarding" && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* Tunnel 1: Inscription */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Users className="h-5 w-5 text-[#C9A84C]" />
                <h3 className="font-extrabold text-[#1A2A4A] text-sm uppercase tracking-wider">Tunnel 1 : Inscription & Création de Compte</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analytics?.signupKanban.map((column, index) => (
                  <div key={index} className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3 border-b border-slate-200/80 pb-2">
                        <span className="text-xs font-bold text-[#1A2A4A] truncate max-w-[80%]">{column.label}</span>
                        <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-[#C9A84C]">
                          {column.visitorsCount}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-light">
                        {column.stage === 'visite_inscription' && "Utilisateurs restés sur la page d'inscription sans soumettre."}
                        {column.stage === 'attente_otp' && "Utilisateurs en attente ou bloqués à l'étape de validation OTP."}
                        {column.stage === 'compte_cree' && "Comptes finaux configurés et connectés avec succès."}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-200/40 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-light flex items-center gap-1"><Clock className="h-3 w-3" /> Temps de passage</span>
                      <span className="font-bold text-indigo-600">{column.avgTimeSeconds > 0 ? formatDuration(column.avgTimeSeconds) : "N/A"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tunnel 2: Réservation */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Layers className="h-5 w-5 text-[#C9A84C]" />
                <h3 className="font-extrabold text-[#1A2A4A] text-sm uppercase tracking-wider">Tunnel 2 : Réservation de Bien Immobilier</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analytics?.reservationKanban.map((column, index) => (
                  <div key={index} className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3 border-b border-slate-200/80 pb-2">
                        <span className="text-xs font-bold text-[#1A2A4A] truncate max-w-[80%]">{column.label}</span>
                        <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-[#C9A84C]">
                          {column.visitorsCount}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-light">
                        {column.stage === 'fiche_bien' && "Visiteurs bloqués à l'analyse de la fiche technique d'un bien."}
                        {column.stage === 'page_formulaire' && "Formulaire entamé mais abandonné lors de la rédaction ou acceptation."}
                        {column.stage === 'validation_reservation' && "Réservations enregistrées avec succès et paiement initié."}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-200/40 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-light flex items-center gap-1"><Clock className="h-3 w-3" /> Temps de passage</span>
                      <span className="font-bold text-indigo-600">{column.avgTimeSeconds > 0 ? formatDuration(column.avgTimeSeconds) : "N/A"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 4: RBAC & Permissions Matrix */}
        {activeTab === "rbac" && (
          <motion.div
            key="rbac"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* User Roles Assignment */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1A2A4A] uppercase tracking-wider">Affectation des Rôles Utilisateurs</h3>
                  <p className="text-[11px] text-slate-400 font-light mt-0.5">Modifiez instantanément les accréditations globales des membres de l&apos;équipe.</p>
                </div>
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Chercher un utilisateur..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-[#C9A84C]/30"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-50 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
                      <th className="p-3 pl-4">Nom Complet</th>
                      <th className="p-3">E-mail</th>
                      <th className="p-3 text-center">Rôle Actuel</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/20">
                          <td className="p-3 pl-4 font-bold text-[#1A2A4A]">{user.fullName || "—"}</td>
                          <td className="p-3 font-mono text-[11px]">{user.email}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              user.role.includes('admin') ? "bg-red-50 text-red-600 border border-red-100" :
                              user.role === 'agent' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                              "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="p-3 text-center min-w-[150px]">
                            <CustomSelect
                              size="sm"
                              value={user.role}
                              onChange={(val) => handleRoleChange(user.id, val)}
                              options={[
                                { value: 'client', label: 'Client' },
                                { value: 'agent', label: 'Agent' },
                                { value: 'admin', label: 'Admin' },
                                { value: 'super_admin', label: 'Super Admin' },
                                { value: 'tech_super_admin', label: 'Tech Super Admin' },
                              ]}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-400">Aucun utilisateur correspondant.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Permissions Matrix */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#1A2A4A] uppercase tracking-wider">Matrice des Permissions de Rôles</h3>
                <p className="text-[11px] text-slate-400 font-light mt-0.5">Associez ou retirez des autorisations d&apos;accès à chaque profil de rôle de la plateforme.</p>
              </div>

              <div className="overflow-x-auto border border-slate-50 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
                      <th className="p-4 pl-6">Permission</th>
                      {rbac?.roles.map(r => (
                        <th key={r.name} className="p-4 text-center capitalize">{r.name.replace('_', ' ')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                    {rbac?.permissions.map((perm) => (
                      <tr key={perm.code} className="hover:bg-slate-50/20">
                        <td className="p-4 pl-6">
                          <p className="font-bold text-[#1A2A4A]">{perm.code}</p>
                          <p className="text-[10px] text-slate-400 font-light mt-0.5">{perm.description || "Aucune description"}</p>
                        </td>
                        {rbac.roles.map((role) => {
                          const isGranted = rbac.rolePermissions.some(
                            rp => rp.roleName === role.name && rp.permissionCode === perm.code
                          )
                          const isSuperRole = role.name === 'super_admin' || role.name === 'tech_super_admin'
                          const isDisabled = isSuperRole || (role.name === 'admin' && currentUserRole !== 'tech_super_admin')
                          const isChecked = isSuperRole || (role.name === 'admin' && isDisabled) ? true : isGranted
                          return (
                            <td key={role.name} className="p-4 text-center">
                              <div className="inline-flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={isDisabled}
                                  onChange={(e) => isDisabled ? undefined : handlePermissionToggle(role.name, perm.code, e.target.checked)}
                                  className={`h-4 w-4 rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C] transition-all ${
                                    isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                  }`}
                                />
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Sub-Component: SvgPieChart
const SvgPieChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
  const total = data.reduce((acc, d) => acc + d.value, 0)
  let accumulatedPercent = 0

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-28 h-28 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {total === 0 ? (
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="12" />
          ) : (
            data.map((item, index) => {
              const percent = (item.value / total) * 100
              const strokeDasharray = `${(percent * 251.2) / 100} 251.2`
              const strokeDashoffset = -((accumulatedPercent * 251.2) / 100)
              accumulatedPercent += percent

              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="12"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transformOrigin: 'center' }}
                />
              )
            })
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-extrabold text-[#1A2A4A]">{total}</span>
          <span className="text-[9px] text-gray-400 font-light">Total</span>
        </div>
      </div>
      <div className="space-y-1.5 flex-grow w-full">
        {data.map((item, index) => {
          const percent = total > 0 ? Math.round((item.value / total) * 100) : 0
          return (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-gray-500 font-medium">{item.label}</span>
              </div>
              <span className="font-bold text-[#1A2A4A]">{item.value} ({percent}%)</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
