'use client'

import { useState } from "react"
import { TrashIcon, AlertTriangleIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getBienImpact } from "@/app/actions/adminBiens"

interface DeleteConfirmDialogProps {
  id: string
  titre: string
  deleteAction: (formData: FormData) => void
}

export function DeleteConfirmDialog({ id, titre, deleteAction }: DeleteConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [impact, setImpact] = useState<{
    reservations: number
    images: number
    favoris: number
  } | null>(null)

  const handleOpenChange = async (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      setIsLoading(true)
      try {
        const result = await getBienImpact(id)
        setImpact(result)
      } catch (error) {
        console.error("Erreur lors de la récupération de l'impact:", error)
      } finally {
        setIsLoading(false)
      }
    } else {
      setImpact(null)
    }
  }

  const isImpactful = impact && (impact.reservations > 0 || impact.images > 0 || impact.favoris > 0)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" />
        }
      >
        <TrashIcon className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangleIcon className="h-5 w-5" />
            Confirmer la suppression
          </DialogTitle>
          <DialogDescription>
            Vous êtes sur le point de supprimer le bien <strong>{titre}</strong>.
            Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-4 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Calcul de l'impact...
            </div>
          ) : impact ? (
            <div className={`p-4 rounded-lg border ${isImpactful ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`font-semibold mb-2 ${isImpactful ? 'text-red-800' : 'text-gray-700'}`}>
                Radiographie d'impact
              </h4>
              
              {!isImpactful ? (
                <p className="text-sm text-gray-600">Aucun élément lié ne sera impacté. Vous pouvez supprimer ce bien en toute sécurité.</p>
              ) : (
                <ul className="text-sm space-y-2 text-red-700">
                  {impact.reservations > 0 && (
                    <li>• <strong>{impact.reservations}</strong> réservation(s) attachée(s)</li>
                  )}
                  {impact.images > 0 && (
                    <li>• <strong>{impact.images}</strong> image(s) additionnelle(s)</li>
                  )}
                  {impact.favoris > 0 && (
                    <li>• Ce bien est dans les favoris de <strong>{impact.favoris}</strong> utilisateur(s)</li>
                  )}
                </ul>
              )}
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <form action={deleteAction} onSubmit={() => setOpen(false)}>
            <input type="hidden" name="id" value={id} />
            <Button type="submit" variant="destructive" disabled={isLoading}>
              Supprimer définitivement
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
