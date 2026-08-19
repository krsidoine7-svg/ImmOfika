"use client"

import * as React from 'react'
import { validateKycAction } from '@/app/actions/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { 
  ShieldCheck, 
  ExternalLink, 
  FileText, 
  User, 
  AlertCircle,
  Check,
  X,
  Search,
  Mail,
  Phone
} from 'lucide-react'

interface PendingUser {
  id: string
  email: string
  fullName: string | null
  phone: string | null
  kycDocUrl: string | null
  kycDocType: string | null
  kycStatus: string
  createdAt: Date
}

interface KycModerationHubProps {
  pendingUsers: PendingUser[]
}

const PRESET_REJECTIONS = [
  "Image floue / illisible",
  "Pièce d'identité expirée",
  "Recto-verso manquant (CNI incomplète)",
  "Document non conforme (type invalide)"
]

interface CustomSelectProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (val: string) => void
}

function CustomSelect({ options, value, onChange }: CustomSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedOption = options.find(o => o.value === value)

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-white text-slate-800 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent font-bold transition-all text-left h-[38px]"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : "Sélectionner..."}</span>
        <svg className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-250 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <ul className="absolute z-[99] mt-1 w-full bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2.5 text-xs font-bold hover:bg-slate-50 transition-colors ${
                  opt.value === value ? "text-emerald-700 bg-emerald-50" : "text-slate-700"
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function KycModerationHub({ pendingUsers: initialUsers }: KycModerationHubProps) {
  const [users, setUsers] = React.useState<PendingUser[]>(initialUsers)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedUser, setSelectedUser] = React.useState<PendingUser | null>(null)
  const [customReason, setCustomReason] = React.useState('')
  const [selectedPreset, setSelectedPreset] = React.useState(PRESET_REJECTIONS[0])
  const [loadingId, setLoadingId] = React.useState<string | null>(null)

  const filteredUsers = users.filter(u => 
    (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleValidate = async (userId: string) => {
    setLoadingId(userId)
    const toastId = toast.loading("Validation de la pièce d'identité...")
    try {
      await validateKycAction(userId, 'verified')
      toast.success("KYC validé avec succès !", { id: toastId })
      setUsers(prev => prev.filter(u => u.id !== userId))
    } catch (err: any) {
      toast.error("Erreur : " + (err.message || String(err)), { id: toastId })
    } finally {
      setLoadingId(null)
    }
  }

  const handleRejectSubmit = async () => {
    if (!selectedUser) return
    const userId = selectedUser.id
    setLoadingId(userId)
    const finalReason = customReason.trim() 
      ? `${selectedPreset} - ${customReason.trim()}`
      : selectedPreset

    const toastId = toast.loading("Envoi du rejet KYC...")
    try {
      await validateKycAction(userId, 'none', finalReason)
      toast.success("KYC rejeté. Le client a été notifié par email.", { id: toastId })
      setUsers(prev => prev.filter(u => u.id !== userId))
      setSelectedUser(null)
      setCustomReason('')
    } catch (err: any) {
      toast.error("Erreur : " + (err.message || String(err)), { id: toastId })
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-1">
            administration.kyc
          </span>
          <h1 className="text-2xl font-black text-slate-900">
            Modération des Pièces d&apos;Identité (KYC)
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Examinez les documents d&apos;identité téléversés par les clients avant de valider la signature des contrats de réservation ImmOfika.
          </p>
        </div>

        <div className="relative rounded-xl shadow-xs shrink-0 w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Rechercher un client..."
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <ShieldCheck className="h-10 w-10 text-emerald-600 mx-auto mb-4" />
          <p className="font-extrabold text-slate-900 text-sm">Toutes les pièces d&apos;identité ont été traitées !</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Aucune demande de validation KYC en attente pour le moment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">
                  <th className="py-4 px-6">Client</th>
                  <th className="py-4 px-6">Type de Pièce</th>
                  <th className="py-4 px-6">Fichier</th>
                  <th className="py-4 px-6">Soumis le</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                          <User className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.fullName || 'Client sans nom'}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-medium">
                            <span className="flex items-center gap-0.5"><Mail className="h-3 w-3" /> {user.email}</span>
                            {user.phone && <span className="flex items-center gap-0.5"><Phone className="h-3 w-3" /> {user.phone}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-100 text-emerald-700">
                        <FileText className="h-3 w-3 text-emerald-600" />
                        {user.kycDocType || 'Pièce'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {user.kycDocUrl ? (
                        <a
                          href={user.kycDocUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold hover:underline"
                        >
                          Ouvrir le document
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic font-medium">Aucun fichier</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleValidate(user.id)}
                          disabled={loadingId === user.id}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-xl px-3 py-2 flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUser(user)}
                          disabled={loadingId === user.id}
                          className="border-red-200 hover:bg-red-50 text-red-600 font-bold text-[10px] rounded-xl px-3 py-2 flex items-center gap-1 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                          Rejeter
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Custom Rejection Dialog Modal Overlay */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in-0 duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Rejeter la pièce d&apos;identité
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Spécifiez la raison pour laquelle le document de <strong>{selectedUser.fullName || selectedUser.email}</strong> est rejeté.
                </p>
              </div>
              <button 
                onClick={() => setSelectedUser(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Motif principal de refus</label>
                <CustomSelect
                  value={selectedPreset}
                  onChange={setSelectedPreset}
                  options={PRESET_REJECTIONS.map(p => ({ value: p, label: p }))}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Détails ou instructions additionnelles (Optionnel)</label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Ex: L'image du verso est floue et la date d'expiration est illisible. Veuillez reprendre la photo sous un bon éclairage."
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="ghost"
                onClick={() => setSelectedUser(null)}
                className="rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                onClick={handleRejectSubmit}
                disabled={loadingId === selectedUser.id}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Confirmer le Rejet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
