"use client"

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles, FileText, Upload, Download, Send, Loader2 } from 'lucide-react'
import { uploadContratScanneAction } from '@/app/actions/contrats'
import { toast } from 'sonner'

interface UploadContratModalProps {
  isOpen: boolean
  onClose: () => void
  reservation: {
    id: string
    bienTitre: string
    clientName: string
    clientEmail: string
    contratScanneUrl?: string | null
    contratStatut?: string | null
    statut?: string | null
  }
}

export function UploadContratModal({ isOpen, onClose, reservation }: UploadContratModalProps) {
  const [customFile, setCustomFile] = React.useState<File | null>(null)
  const [isSending, setIsSending] = React.useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type !== 'application/pdf') {
        toast.error("Format invalide. Seuls les fichiers PDF (.pdf) sont acceptés.")
        return
      }
      setCustomFile(file)
    }
  }

  const handleDownloadReceipt = () => {
    window.open(`/api/reservations/${reservation.id}/facture`, '_blank')
  }

  const handleUpload = async () => {
    if (!customFile) {
      toast.error("Veuillez sélectionner un fichier PDF scanné.")
      return
    }

    setIsSending(true)

    try {
      const formData = new FormData()
      formData.append('reservationId', reservation.id)
      formData.append('file', customFile)

      const result = await uploadContratScanneAction(formData)

      if (!result.success) {
        throw new Error(result.error || "Échec de l'envoi du contrat.")
      }

      toast.success("Contrat scanné sauvegardé et associé à la réservation avec succès !")
      setCustomFile(null)
      onClose()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Impossible d'uploader le contrat.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-white border border-slate-100 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6">
        <DialogHeader className="space-y-2 border-b border-slate-100 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Promoteur Immobilier Agréé — Espace Gestion Contrat (Manuel)</span>
          </div>
          <DialogTitle className="text-xl font-extrabold text-slate-900">
            Dossier & Signature Manuelle du Contrat
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-medium">
            Bien : <strong>{reservation.bienTitre}</strong> | Client : <strong>{reservation.clientName}</strong> ({reservation.clientEmail})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4 flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Étape 1 : Facture / Reçu</span>
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Reçu d&apos;Acompte
                </h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Téléchargez la facture officielle générée automatiquement.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadReceipt}
                className="w-full text-xs font-bold border-emerald-500/40 bg-white hover:bg-emerald-600 hover:text-white text-emerald-700 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Télécharger la Facture</span>
              </Button>
            </div>

            <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200/80 space-y-4 flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Étape 2 : Contrat Signé</span>
                <h4 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  Uploader le Contrat (Signé physiquement)
                </h4>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  {reservation.contratScanneUrl 
                    ? "Un contrat a déjà été uploadé. Vous pouvez le consulter ou le remplacer ci-dessous."
                    : customFile 
                      ? `Fichier PDF prêt : ${customFile.name}` 
                      : "Seuls les fichiers PDF (.pdf) sont autorisés."}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {reservation.contratScanneUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.open(reservation.contratScanneUrl!, '_blank')}
                    className="w-full text-xs font-bold border-emerald-500/40 bg-white hover:bg-emerald-50 text-emerald-700 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Consulter le Contrat Actuel</span>
                  </Button>
                )}
                <label className="w-full cursor-pointer inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs">
                  <Upload className="w-4 h-4" />
                  <span>{reservation.contratScanneUrl ? "Remplacer le PDF" : (customFile ? "Changer le PDF" : "Parcourir le PDF scanné")}</span>
                  <input type="file" accept="application/pdf,.pdf" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              onClick={handleUpload}
              disabled={isSending || !customFile}
              className={`w-full text-xs font-extrabold inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl shadow-md transition-all ml-auto ${
                customFile
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer shadow-emerald-500/20'
                  : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-70'
              }`}
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Sauvegarde en cours...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-white" />
                  <span>{customFile ? "Valider et Sauvegarder le contrat" : "Veuillez choisir un fichier d'abord"}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
