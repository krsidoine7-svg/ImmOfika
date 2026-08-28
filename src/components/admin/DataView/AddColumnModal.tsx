"use client"

import * as React from "react"
import { Plus, Type, Hash, Calendar, CheckSquare, Tag, AlignLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface ColumnDef {
  key: string
  label: string
  type: "text" | "number" | "date" | "select" | "checkbox" | "tag"
  options?: string[]
}

interface AddColumnModalProps {
  isOpen: boolean
  onClose: () => void
  onAddColumn: (col: ColumnDef) => void
}

export function AddColumnModal({ isOpen, onClose, onAddColumn }: AddColumnModalProps) {
  const [label, setLabel] = React.useState("")
  const [type, setType] = React.useState<ColumnDef["type"]>("text")
  const [optionsStr, setOptionsStr] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return

    const key = label.toLowerCase().replace(/[^a-z0-9]/g, "_")
    const options = optionsStr
      ? optionsStr.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined

    onAddColumn({
      key,
      label: label.trim(),
      type,
      options,
    })

    setLabel("")
    setType("text")
    setOptionsStr("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
            <Plus className="h-5 w-5 text-emerald-600" />
            Ajouter une nouvelle colonne (Champ personnalisé)
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="col-label" className="text-xs font-semibold">Nom de la colonne</Label>
            <Input
              id="col-label"
              placeholder="Ex: Notes, Référence externe, Note agent..."
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="rounded-xl text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="col-type" className="text-xs font-semibold">Type de champ</Label>
            <Select value={type} onValueChange={(val) => { if (val) setType(val as ColumnDef["type"]) }}>
              <SelectTrigger className="rounded-xl text-xs">
                <SelectValue placeholder="Choisir le type..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl text-xs">
                <SelectItem value="text">
                  <span className="flex items-center gap-2">
                    <Type className="h-3.5 w-3.5 text-emerald-600" />
                    Texte court
                  </span>
                </SelectItem>
                <SelectItem value="number">
                  <span className="flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5 text-emerald-600" />
                    Nombre / Prix
                  </span>
                </SelectItem>
                <SelectItem value="date">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                    Date
                  </span>
                </SelectItem>
                <SelectItem value="select">
                  <span className="flex items-center gap-2">
                    <AlignLeft className="h-3.5 w-3.5 text-emerald-600" />
                    Liste déroulante (Select)
                  </span>
                </SelectItem>
                <SelectItem value="tag">
                  <span className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-emerald-600" />
                    Badge / Tag
                  </span>
                </SelectItem>
                <SelectItem value="checkbox">
                  <span className="flex items-center gap-2">
                    <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
                    Case à cocher (Oui/Non)
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(type === "select" || type === "tag") && (
            <div className="space-y-1.5">
              <Label htmlFor="col-options" className="text-xs font-semibold">Options (séparées par une virgule)</Label>
              <Input
                id="col-options"
                placeholder="Ex: Urgent, Normal, Faible"
                value={optionsStr}
                onChange={(e) => setOptionsStr(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl text-xs">
              Annuler
            </Button>
            <Button type="submit" className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              Ajouter la colonne
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
