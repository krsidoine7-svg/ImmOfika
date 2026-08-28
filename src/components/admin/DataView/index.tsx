"use client"

import * as React from "react"
import {
  Table as TableIcon,
  LayoutGrid,
  Kanban as KanbanIcon,
  Calendar as CalendarIcon,
  Image as GalleryIcon,
  BarChart3 as GraphIcon,
  Search,
  Download,
  Plus,
  Building,
  Users,
  CreditCard,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GridView } from "./GridView"
import { KanbanView } from "./KanbanView"
import { CalendarView } from "./CalendarView"
import { GalleryView } from "./GalleryView"
import { GraphView } from "./GraphView"
import { AddColumnModal, ColumnDef } from "./AddColumnModal"
import { updateInlineCellAction, addRowAirtableAction } from "@/app/actions/airtableDatabase"
import { toast } from "sonner"

type ViewType = "grid" | "kanban" | "calendar" | "gallery" | "graph"
type TableType = "biens" | "leads" | "reservations" | "paiements"

interface DataViewContainerProps {
  initialData: {
    biens: Record<string, any>[]
    leads: Record<string, any>[]
    reservations: Record<string, any>[]
    paiements: Record<string, any>[]
  }
}

// Configuration des colonnes par défaut pour chaque table
const DEFAULT_COLUMNS: Record<TableType, ColumnDef[]> = {
  biens: [
    { key: "titre", label: "Titre du Bien", type: "text" },
    { key: "prix", label: "Prix (FCFA)", type: "number" },
    { key: "type", label: "Type de Bien", type: "select", options: ["villa", "appartement", "terrain", "bureau", "immeuble"] },
    { key: "transaction", label: "Transaction", type: "select", options: ["vente", "location"] },
    { key: "ville", label: "Ville", type: "text" },
    { key: "quartier", label: "Quartier", type: "text" },
    { key: "statut", label: "Statut", type: "tag", options: ["disponible", "reserve", "vendu", "loue"] },
    { key: "surface", label: "Surface (m²)", type: "number" },
  ],
  leads: [
    { key: "nom", label: "Nom Complet", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "telephone", label: "Téléphone", type: "text" },
    { key: "statut", label: "Statut Lead", type: "tag", options: ["nouveau", "contacte", "gagne", "perdu"] },
    { key: "source", label: "Source", type: "text" },
  ],
  reservations: [
    { key: "id", label: "ID Réservation", type: "text" },
    { key: "statut", label: "Statut Réservation", type: "tag", options: ["en_attente", "confirmee", "annulee"] },
    { key: "montantAcompte", label: "Acompte (FCFA)", type: "number" },
    { key: "dateExpiration", label: "Date Expiration", type: "date" },
  ],
  paiements: [
    { key: "referencePaystack", label: "Réf. Paystack", type: "text" },
    { key: "montant", label: "Montant (FCFA)", type: "number" },
    { key: "statut", label: "Statut Paiement", type: "tag", options: ["succes", "en_attente", "echec"] },
    { key: "moyenPaiement", label: "Moyen", type: "text" },
  ],
}

export function DataViewContainer({ initialData }: DataViewContainerProps) {
  const [activeTable, setActiveTable] = React.useState<TableType>("biens")
  const [activeView, setActiveView] = React.useState<ViewType>("grid")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isAddColModalOpen, setIsAddColModalOpen] = React.useState(false)

  // Données locales mutables
  const [dataStore, setDataStore] = React.useState(initialData)
  // Colonnes dynamiques par table
  const [columnsMap, setColumnsMap] = React.useState<Record<TableType, ColumnDef[]>>(DEFAULT_COLUMNS)

  const currentColumns = columnsMap[activeTable]
  const rawData = dataStore[activeTable] || []

  // Filtrage par mot-clé de recherche
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return rawData
    const q = searchQuery.toLowerCase()
    return rawData.filter((row) =>
      Object.values(row).some((val) =>
        val !== null && val !== undefined && String(val).toLowerCase().includes(q)
      )
    )
  }, [rawData, searchQuery])

  // Édition de cellule en direct
  const handleCellEdit = async (rowId: string, field: string, newValue: any) => {
    // 1. Mettre à jour localement immédiatement
    setDataStore((prev) => ({
      ...prev,
      [activeTable]: prev[activeTable].map((row) =>
        row.id === rowId ? { ...row, [field]: newValue } : row
      ),
    }))

    // 2. Persister côté serveur
    const res = await updateInlineCellAction(activeTable, rowId, field, newValue)
    if (res.success) {
      toast.success("Modifié en direct")
    } else {
      toast.error(res.error || "Erreur de mise à jour")
    }
  }

  // Changer statut Kanban
  const handleStatusChange = (rowId: string, newStatus: string) => {
    handleCellEdit(rowId, "statut", newStatus)
  }

  // Ajout de ligne
  const handleAddRow = async () => {
    const res = await addRowAirtableAction(activeTable, {
      titre: "Nouveau bien " + Date.now().toString().slice(-4),
      nom: "Nouveau client",
      statut: "disponible",
    })

    if (res.success && res.row) {
      setDataStore((prev) => ({
        ...prev,
        [activeTable]: [res.row, ...prev[activeTable]],
      }))
      toast.success("Nouvelle ligne ajoutée")
    } else {
      toast.error(res.error || "Erreur d'ajout")
    }
  }

  // Ajout de colonne personnalisée
  const handleAddColumn = (col: ColumnDef) => {
    setColumnsMap((prev) => ({
      ...prev,
      [activeTable]: [...prev[activeTable], col],
    }))
    toast.success(`Colonne "${col.label}" ajoutée`)
  }

  // Export CSV
  const exportToCSV = () => {
    if (filteredData.length === 0) {
      toast.error("Aucune donnée à exporter")
      return
    }

    const headers = currentColumns.map((c) => c.label).join(",")
    const rows = filteredData.map((row) =>
      currentColumns.map((c) => `"${String(row[c.key] ?? "").replace(/"/g, '""')}"`).join(",")
    )
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `export-${activeTable}-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Exportation CSV réussie")
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] gap-3 font-sans">
      
      {/* Header : Onglets Tables + Recherche & Actions */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        
        {/* Sélecteur d'Onglets Tables */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
          {[
            { key: "biens", label: "Biens Immobiliers", icon: Building },
            { key: "leads", label: "Leads & Contacts", icon: Users },
            { key: "reservations", label: "Réservations", icon: CalendarIcon },
            { key: "paiements", label: "Paiements", icon: CreditCard },
          ].map((tbl) => {
            const Icon = tbl.icon
            const isActive = activeTable === tbl.key

            return (
              <button
                key={tbl.key}
                onClick={() => setActiveTable(tbl.key as TableType)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-200/60 dark:hover:bg-zinc-700/60"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tbl.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? "bg-emerald-700 text-white" : "bg-slate-200 dark:bg-zinc-700 text-slate-600"}`}>
                  {dataStore[tbl.key as TableType]?.length || 0}
                </span>
              </button>
            )
          })}
        </div>

        {/* Barre de Recherche + Actions Export */}
        <div className="flex items-center gap-2 flex-1 max-w-xs sm:max-w-sm">
          <div className="relative w-full">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
            <Input
              placeholder="Rechercher dans la base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-8 rounded-xl border-slate-200"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            className="h-8 px-2.5 text-xs rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold shrink-0"
            title="Exporter en CSV"
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            CSV
          </Button>
        </div>

      </div>

      {/* Barre des Vues (Switcher Grid, Kanban, Calendar, Gallery, Graph) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3.5 py-2 shadow-xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1">
          {[
            { key: "grid", label: "Vue Grid (Tableau)", icon: TableIcon },
            { key: "kanban", label: "Vue Kanban", icon: KanbanIcon },
            { key: "calendar", label: "Vue Calendar", icon: CalendarIcon },
            { key: "gallery", label: "Vue Galerie", icon: GalleryIcon },
            { key: "graph", label: "Vue Graphiques", icon: GraphIcon },
          ].map((v) => {
            const Icon = v.icon
            const isActive = activeView === v.key

            return (
              <button
                key={v.key}
                onClick={() => setActiveView(v.key as ViewType)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon className="h-3.5 w-3.5 text-emerald-500" />
                <span>{v.label}</span>
              </button>
            )
          })}
        </div>

        <Button
          size="sm"
          onClick={handleAddRow}
          className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Ajouter une ligne
        </Button>
      </div>

      {/* Conteneur principal de la vue active */}
      <div className="flex-1 overflow-hidden">
        {activeView === "grid" && (
          <GridView
            columns={currentColumns}
            data={filteredData}
            onCellEdit={handleCellEdit}
            onAddRow={handleAddRow}
            onOpenAddColumn={() => setIsAddColModalOpen(true)}
          />
        )}

        {activeView === "kanban" && (
          <KanbanView
            data={filteredData}
            onStatusChange={handleStatusChange}
          />
        )}

        {activeView === "calendar" && (
          <CalendarView data={filteredData} />
        )}

        {activeView === "gallery" && (
          <GalleryView data={filteredData} />
        )}

        {activeView === "graph" && (
          <GraphView data={filteredData} />
        )}
      </div>

      {/* Modal Ajout de Colonne */}
      <AddColumnModal
        isOpen={isAddColModalOpen}
        onClose={() => setIsAddColModalOpen(false)}
        onAddColumn={handleAddColumn}
      />
    </div>
  )
}
