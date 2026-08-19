"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, Clock, User, Phone, Mail, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import CalendrierDisponibilites from "@/components/client/CalendrierDisponibilites"
import { planifierVisiteAutonomeAction, getBiensDisponiblesAction } from "@/app/actions/visites"
import { CustomSelect } from "@/components/ui/custom-select"

interface PlanifierVisiteModalProps {
  isOpen: boolean
  onClose: () => void
  bienId?: string
  bienTitre?: string
  isConnected: boolean
}

interface BienOption {
  id: string
  titre: string
  ville: string
  quartier: string | null
}

export default function PlanifierVisiteModal({
  isOpen,
  onClose,
  bienId: propBienId,
  bienTitre: propBienTitre,
  isConnected,
}: PlanifierVisiteModalProps) {
  // Form States
  const [selectedBienId, setSelectedBienId] = React.useState<string>(propBienId || "")
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [time, setTime] = React.useState<string>("")
  const [commentaires, setCommentaires] = React.useState<string>("")

  // Unconnected Prospect States
  const [nom, setNom] = React.useState<string>("")
  const [prenom, setPrenom] = React.useState<string>("")
  const [email, setEmail] = React.useState<string>("")
  const [telephone, setTelephone] = React.useState<string>("")

  // UI States
  const [biensList, setBiensList] = React.useState<BienOption[]>([])
  const [loadingBiens, setLoadingBiens] = React.useState<boolean>(false)
  const [submitting, setSubmitting] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<boolean>(false)

  // Fetch properties if no bienId provided
  React.useEffect(() => {
    if (isOpen) {
      setDate(undefined)
      setTime("")
      setCommentaires("")
      setNom("")
      setPrenom("")
      setEmail("")
      setTelephone("")
      setError(null)
      setSuccess(false)

      if (!propBienId) {
        setLoadingBiens(true)
        getBiensDisponiblesAction()
          .then((res) => {
            if (res.success && res.biens) {
              setBiensList(res.biens)
              if (res.biens.length > 0) {
                setSelectedBienId(res.biens[0].id)
              }
            }
          })
          .finally(() => setLoadingBiens(false))
      } else {
        setSelectedBienId(propBienId)
      }
    }
  }, [isOpen, propBienId])

  const isEmailValid = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
  }

  const isFormValid = () => {
    if (!selectedBienId || !date || !time) return false
    if (!isConnected) {
      if (!nom.trim() || !prenom.trim() || !telephone.trim()) return false
      if (email && !isEmailValid(email)) return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid()) return

    setSubmitting(true)
    setError(null)

    try {
      const dateVisiteStr = `${date!.toISOString().split("T")[0]}T${time}:00`
      const inputObj = {
        bienId: selectedBienId,
        dateVisite: dateVisiteStr,
        commentaires: commentaires || undefined,
        nom: !isConnected ? nom : undefined,
        prenom: !isConnected ? prenom : undefined,
        email: !isConnected ? email : undefined,
        telephone: !isConnected ? telephone : undefined,
      }

      const res = await planifierVisiteAutonomeAction(inputObj)

      if (res.success) {
        setSuccess(true)
      } else {
        setError(res.error || "Une erreur est survenue lors de la réservation.")
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la réservation.")
    } finally {
      setSubmitting(false)
    }
  }

  const selectedBienLabel = React.useMemo(() => {
    if (propBienTitre) return propBienTitre
    const found = biensList.find((b) => b.id === selectedBienId)
    return found ? `${found.titre} (${found.ville})` : "Sélectionner un bien"
  }, [propBienTitre, biensList, selectedBienId])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Planifier une Visite</h3>
                  <p className="text-xs text-slate-400 font-medium truncate max-w-[240px]">
                    {selectedBienLabel}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
              {success ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900">Visite Planifiée avec Succès !</h4>
                  <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                    Votre rendez-vous a été enregistré. Notre conseiller vous contactera pour confirmer l&apos;heure et le point de rendez-vous.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    Fermer la fenêtre
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Property Selector if not pre-provided */}
                  {!propBienId && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Bien à visiter
                      </label>
                      {loadingBiens ? (
                        <div className="h-11 rounded-xl bg-slate-100 animate-pulse" />
                      ) : (
                        <CustomSelect
                          value={selectedBienId}
                          onChange={setSelectedBienId}
                          options={biensList.map((b) => ({
                            value: b.id,
                            label: `${b.titre} (${b.ville})`
                          }))}
                        />
                      )}
                    </div>
                  )}

                  {/* Prospect Info fields if not connected */}
                  {!isConnected && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                        <User className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Vos Coordonnées</h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nom</label>
                          <input
                            type="text"
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            placeholder="Nom"
                            required
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-500 text-xs font-medium text-slate-800"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prénom</label>
                          <input
                            type="text"
                            value={prenom}
                            onChange={(e) => setPrenom(e.target.value)}
                            placeholder="Prénom"
                            required
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-500 text-xs font-medium text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Téléphone</label>
                          <input
                            type="tel"
                            value={telephone}
                            onChange={(e) => setTelephone(e.target.value)}
                            placeholder="e.g. 07070707"
                            required
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-500 text-xs font-medium text-slate-800"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">E-mail (Recommandé)</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ex: nom@email.com"
                            className={`w-full h-10 px-3 rounded-xl border bg-white focus:outline-none text-xs font-medium text-slate-800 ${
                              email && !isEmailValid(email) ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Calendrier de disponibilité */}
                  <div className="space-y-2">
                    <CalendrierDisponibilites
                      selectedDate={date}
                      onSelect={setDate}
                      selectedTime={time}
                      onTimeSelect={setTime}
                      bienId={selectedBienId}
                    />
                  </div>

                  {/* Comments */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      Remarques ou Besoins spécifiques (Optionnel)
                    </label>
                    <textarea
                      value={commentaires}
                      onChange={(e) => setCommentaires(e.target.value)}
                      placeholder="Indiquez vos demandes particulières..."
                      rows={3}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs font-medium text-slate-800 resize-none bg-white"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting || !isFormValid()}
                      className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                        isFormValid() && !submitting
                          ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      }`}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          Planification en cours...
                        </>
                      ) : (
                        "Planifier la visite"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
