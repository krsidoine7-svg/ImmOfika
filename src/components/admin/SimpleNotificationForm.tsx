"use client"

import * as React from "react"
import { Bell, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { envoyerNotificationLibreAction } from "@/app/actions/notifications"
import { CustomSelect } from "@/components/ui/custom-select"

interface UserOption {
  id: string
  fullName: string | null
  email: string
  role: string
}

interface SimpleNotificationFormProps {
  users: UserOption[]
}

export default function SimpleNotificationForm({ users }: SimpleNotificationFormProps) {
  const [cible, setCible] = React.useState<'ALL' | 'CLIENTS' | 'AGENTS' | 'ADMINS' | 'USER'>('ALL')
  const [userId, setUserId] = React.useState<string>('')
  const [titre, setTitre] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [type, setType] = React.useState('system')
  const [lien, setLien] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!titre.trim() || !message.trim()) {
      toast.error("Le titre et le message sont obligatoires.")
      return
    }

    if (cible === 'USER' && !userId) {
      toast.error("Veuillez sélectionner un destinataire.")
      return
    }

    setLoading(true)

    try {
      const res = await envoyerNotificationLibreAction({
        cible,
        userId: cible === 'USER' ? userId : undefined,
        titre: titre.trim(),
        message: message.trim(),
        type,
        lien: lien.trim() || undefined,
      })

      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`Notification envoyée avec succès à ${res.count} utilisateur(s) !`)
        setTitre("")
        setMessage("")
        setLien("")
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'envoi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Envoyer une Notification / Message</h2>
          <p className="text-xs text-slate-500 font-medium">Diffusion instantanée dans la cloche des utilisateurs ImmOfika</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Target */}
        <div className="space-y-3">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
            1. À qui souhaitez-vous envoyer ce message ?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'ALL', label: 'Tous', desc: 'Tout le monde' },
              { id: 'CLIENTS', label: 'Clients', desc: 'Acheteurs / Prospects' },
              { id: 'AGENTS', label: 'Managers', desc: 'Équipe terrain' },
              { id: 'ADMINS', label: 'Admins', desc: 'Administrateurs' },
              { id: 'USER', label: 'Spécifique', desc: '1 utilisateur' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCible(item.id as any)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  cible === item.id 
                    ? 'border-emerald-500 bg-emerald-50/50 text-slate-900 ring-2 ring-emerald-500/20 font-bold' 
                    : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs font-black">{item.label}</span>
                <span className="text-[10px] opacity-75 font-medium">{item.desc}</span>
              </button>
            ))}
          </div>

          {cible === 'USER' && (
            <div className="mt-3">
              <CustomSelect
                value={userId}
                onChange={setUserId}
                placeholder="-- Sélectionnez un utilisateur --"
                options={users.map(u => ({
                  value: u.id,
                  label: `${u.fullName ? `${u.fullName} (${u.email})` : u.email} [${u.role.toUpperCase()}]`
                }))}
              />
            </div>
          )}
        </div>

        {/* Badge type */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
            2. Type de message
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'system', label: '📢 Information / Général', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
              { id: 'commercial', label: '🌟 Promotion / Lotissement', color: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
              { id: 'alerte', label: '🚨 Alerte / Important', color: 'bg-rose-50 border-rose-200 text-rose-800' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                  type === t.id ? `${t.color} ring-2 ring-offset-1 ring-slate-400 font-black` : 'bg-slate-50 border-slate-200 text-slate-600 opacity-70 hover:opacity-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
            3. Contenu de la notification
          </label>
          
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Titre de l&apos;alerte *</label>
            <input
              type="text"
              required
              placeholder="Ex: Lancement du nouveau lotissement à Assinie !"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Message détaillé *</label>
            <textarea
              required
              rows={4}
              placeholder="Ex: Profitez de notre offre de lancement avec 10% de réduction sur les 5 premières parcelles..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Lien de redirection (Optionnel)</label>
            <input
              type="text"
              placeholder="Ex: /biens ou /client/reservations"
              value={lien}
              onChange={(e) => setLien(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">
              Si renseigné, l&apos;utilisateur sera redirigé vers cette page en cliquant sur sa notification.
            </span>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2.5 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Envoi en cours...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-white" />
                <span>Envoyer la notification</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
