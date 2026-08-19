"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, X, AlertTriangle, ShieldAlert, Sparkles, Loader2 } from "lucide-react"
import { GatingCondition } from "@/types/crm"
import { toggleManualConditionAction } from "@/app/actions/crm"
import { toast } from "sonner"

interface TransitionGatingModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  leadId: string
  leadNom: string
  currentEtapeLabel: string
  targetEtapeLabel: string
  targetEtapeCode?: string
  conditions: GatingCondition[]
  canBypass?: boolean
  peutForcer?: boolean
  onConditionsUpdated?: () => void
  onRefreshConditions?: () => void
}

export function TransitionGatingModal({
  isOpen,
  onClose,
  onConfirm,
  leadId,
  leadNom,
  currentEtapeLabel,
  targetEtapeLabel,
  conditions: initialConditions,
  canBypass: canBypassProp,
  peutForcer: peutForcerProp,
  onConditionsUpdated
}: TransitionGatingModalProps) {
  const canBypass = canBypassProp ?? peutForcerProp ?? false
  const [conditions, setConditions] = React.useState<GatingCondition[]>(initialConditions)
  const [isUpdating, setIsUpdating] = React.useState<string | null>(null)
  const [isConfirming, setIsConfirming] = React.useState(false)

  React.useEffect(() => {
    setConditions(initialConditions)
  }, [initialConditions])

  const hasInvalidConditions = conditions.some(c => !c.valid)
  const canConfirm = !hasInvalidConditions || canBypass
  const peutForcer = canBypass && hasInvalidConditions

  const handleToggleManual = async (conditionId: string, currentValid: boolean) => {
    setIsUpdating(conditionId)
    try {
      const res = await toggleManualConditionAction(leadId, conditionId, !currentValid)
      if (res.success) {
        setConditions(prev => prev.map(c => c.id === conditionId ? { ...c, valid: !currentValid } : c))
        toast.success(currentValid ? "Condition marquée non satisfaite" : "Condition validée avec succès !")
        if (onConditionsUpdated) onConditionsUpdated()
      } else {
        toast.error(res.error || "Impossible de mettre à jour la condition.")
      }
    } catch (err) {
      toast.error("Erreur serveur lors de la mise à jour.")
    } finally {
      setIsUpdating(null)
    }
  }

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onConfirm()
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-md bg-white border border-slate-100 text-slate-900 rounded-2xl p-6 shadow-2xl">
        {/* Modal Header */}
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Sparkles className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
              CRM Gating
            </span>
          </div>
          <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-900 mt-1">
            Validation de transition
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs font-medium leading-relaxed">
            Déplacement de <strong className="text-slate-900 font-extrabold">{leadNom}</strong> de{" "}
            <span className="text-emerald-700 font-bold underline underline-offset-4">{currentEtapeLabel}</span>{" "}
            ➔ <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{targetEtapeLabel}</span>.
          </DialogDescription>
        </DialogHeader>

        {/* Requirements list */}
        <div className="my-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Critères requis</span>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {conditions.filter(c => c.valid).length} / {conditions.length} validés
            </span>
          </div>
          
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
            {conditions.map((condition) => {
              const isManual = condition.type === 'manual'
              const isLoading = isUpdating === condition.id

              return (
                <div 
                  key={condition.id}
                  className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
                    condition.valid 
                      ? 'bg-emerald-50/50 border-emerald-200' 
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex gap-3 items-center">
                    <div className="shrink-0">
                      {condition.valid ? (
                        <div className="w-5.5 h-5.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3px]" />
                        </div>
                      ) : (
                        <div className="w-5.5 h-5.5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
                          <X className="w-3 h-3 stroke-[3px]" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-0.5">
                      <p className={`text-xs font-bold leading-snug ${condition.valid ? 'text-slate-900' : 'text-slate-600'}`}>
                        {condition.label}
                      </p>
                      <span className={`text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border inline-block ${
                        isManual 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {isManual ? 'Validation Manuelle' : 'Vérification Automatique'}
                      </span>
                    </div>
                  </div>

                  {/* Manual toggle */}
                  {isManual && (
                    <button
                      disabled={isLoading}
                      onClick={() => handleToggleManual(condition.id, condition.valid)}
                      className={`h-7 px-3 rounded-lg text-[9px] font-bold border transition-all shrink-0 cursor-pointer flex items-center gap-1 shadow-xs ${
                        condition.valid 
                          ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200' 
                          : 'bg-emerald-500 hover:bg-emerald-600 border-emerald-500 text-white'
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : condition.valid ? (
                        'Annuler'
                      ) : (
                        'Déclarer OK'
                      )}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Warning messages */}
        {hasInvalidConditions && !peutForcer && (
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs flex gap-2.5 items-start">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <p className="font-bold leading-relaxed">
              Le déplacement est bloqué car certaines conditions obligatoires ne sont pas satisfaites. Veuillez compléter les prérequis.
            </p>
          </div>
        )}

        {hasInvalidConditions && peutForcer && (
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-xs flex gap-2.5 items-start">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <p className="font-bold leading-relaxed">
              Certains critères manquent. En tant que <strong className="text-emerald-700">Super Administrateur</strong>, vous pouvez outrepasser ces blocages.
            </p>
          </div>
        )}

        {/* Modal Actions */}
        <div className="mt-5 border-t border-slate-100 pt-4 flex flex-col sm:flex-row justify-end gap-2 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full sm:w-auto text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs h-10 font-bold rounded-xl cursor-pointer"
          >
            Annuler
          </Button>

          {peutForcer && hasInvalidConditions && (
            <Button
              type="button"
              disabled={isConfirming}
              onClick={handleConfirm}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white text-xs h-10 font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isConfirming ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                'Forcer le transfert'
              )}
            </Button>
          )}

          <Button
            type="button"
            disabled={!canConfirm || isConfirming}
            onClick={handleConfirm}
            className={`w-full sm:w-auto text-xs h-10 font-black rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              canConfirm
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isConfirming ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              'Valider la transition'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
