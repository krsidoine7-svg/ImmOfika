'use client'

import { useState } from "react"
import { AlertTriangleIcon, Loader2, ShieldAlertIcon, CheckCircleIcon } from "lucide-react"
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
import { getUserImpact } from "@/app/actions/adminUsers"

interface SuspendUserDialogProps {
  userId: string
  userName: string
  isSuspended: boolean
  toggleAction: (formData: FormData) => void
}

export function SuspendUserDialog({ userId, userName, isSuspended, toggleAction }: SuspendUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [impact, setImpact] = useState<{
    reservations: number
    paiements: number
    favoris: number
  } | null>(null)

  const handleOpenChange = async (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen && !isSuspended) {
      // On charge l'impact uniquement pour la suspension (pas la réactivation)
      setIsLoading(true)
      try {
        const result = await getUserImpact(userId)
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

  const totalImpact = impact ? impact.reservations + impact.paiements + impact.favoris : 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant={isSuspended ? 'outline' : 'destructive'} size="sm" />
        }
      >
        {isSuspended ? 'Réactiver' : 'Suspendre'}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${isSuspended ? 'text-emerald-600' : 'text-red-600'}`}>
            {isSuspended ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <AlertTriangleIcon className="h-5 w-5" />
            )}
            {isSuspended ? 'Réactiver le compte' : 'Suspendre le compte'}
          </DialogTitle>
          <DialogDescription>
            {isSuspended ? (
              <>Vous êtes sur le point de réactiver le compte de <strong>{userName}</strong>. L&apos;utilisateur pourra à nouveau se connecter et utiliser la plateforme.</>
            ) : (
              <>Vous êtes sur le point de suspendre le compte de <strong>{userName}</strong>. L&apos;utilisateur ne pourra plus se connecter à la plateforme.</>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Radiographie d'impact (uniquement pour la suspension) */}
        {!isSuspended && (
          <div className="py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-4 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Analyse de l&apos;impact en cours...
              </div>
            ) : impact ? (
              <div className={`p-4 rounded-lg border ${totalImpact > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`font-semibold mb-3 text-sm ${totalImpact > 0 ? 'text-red-800' : 'text-gray-700'}`}>
                  <ShieldAlertIcon className="h-4 w-4 inline mr-1" />
                  Radiographie d&apos;impact
                </h4>
                
                {totalImpact === 0 ? (
                  <p className="text-sm text-gray-600">
                    Aucune donnée rattachée. La suspension se fera sans impact.
                  </p>
                ) : (
                  <ul className="text-sm space-y-2 text-red-700">
                    {impact.reservations > 0 && (
                      <li className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                        <strong>{impact.reservations}</strong> réservation(s) en cours seront bloquée(s)
                      </li>
                    )}
                    {impact.paiements > 0 && (
                      <li className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                        <strong>{impact.paiements}</strong> paiement(s) associé(s)
                      </li>
                    )}
                    {impact.favoris > 0 && (
                      <li className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                        <strong>{impact.favoris}</strong> bien(s) dans ses favoris
                      </li>
                    )}
                  </ul>
                )}
              </div>
            ) : null}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <form action={toggleAction} onSubmit={() => setOpen(false)}>
            <input type="hidden" name="id" value={userId} />
            <input type="hidden" name="currentStatus" value={isSuspended ? 'suspended' : 'active'} />
            <Button 
              type="submit" 
              variant={isSuspended ? 'default' : 'destructive'} 
              disabled={isLoading}
              className={isSuspended ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              {isSuspended ? 'Confirmer la réactivation' : 'Confirmer la suspension'}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
