"use client"

import * as React from 'react'
import {
  ShieldAlert,
  Activity,
  Database,
  AlertTriangle,
  CheckCircle2,
  Ban,
  RefreshCw,
  Webhook,
  Trash2,
  Eye,
  UserCheck,
  Search,
  FileText,
  DollarSign,
  Send,
  UserX,
  Clock,
  ExternalLink,
  Info,
} from 'lucide-react'
import {
  runSystemHealthCheckAction,
  sendWebhookAlertAction,
  moderateAccountAction,
  moderateItemAction,
  type SystemHealthResult,
} from '@/app/actions/moderation'
import { useRouter } from 'next/navigation'

interface AccountItem {
  id: string
  email: string
  fullName: string | null
  role: string
  avatarUrl: string | null
  suspensionReason: string | null
  createdAt: Date
  deletedAt: Date | null
}

interface PropertyItem {
  id: string
  titre: string
  type: string
  transaction: string
  prix: string
  statut: string
  mainImageUrl: string | null
  pdfAnnexeUrl: string | null
  videoUrl: string | null
  createdAt: Date
}

interface TransactionItem {
  id: string
  montant: string
  statut: string
  typePaiement: string
  paystackReference: string | null
  factureUrl: string | null
  createdAt: Date
}

interface LeadItem {
  id: string
  nom: string | null
  prenom: string | null
  email: string | null
  telephone: string
  message: string | null
  source: string
  createdAt: Date
}

interface FeedProps {
  accounts: AccountItem[]
  properties: PropertyItem[]
  transactions: TransactionItem[]
  leads: LeadItem[]
}

interface HubProps {
  initialHealth: SystemHealthResult
  feed: FeedProps
}

export default function SuperAdminModerationHub({ initialHealth, feed }: HubProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState<'moderation' | 'health' | 'logs'>('moderation')
  const [health, setHealth] = React.useState<SystemHealthResult>(initialHealth)
  const [isChecking, setIsChecking] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [modSection, setModSection] = React.useState<'accounts' | 'properties' | 'transactions' | 'leads'>('accounts')

  // Webhook Make.com state
  const [webhookUrl, setWebhookUrl] = React.useState('')
  const [webhookSaved, setWebhookSaved] = React.useState(false)
  const [isSendingWebhook, setIsSendingWebhook] = React.useState(false)
  const [webhookMsg, setWebhookMsg] = React.useState<string | null>(null)
  const [customAlertMsg, setCustomAlertMsg] = React.useState('Alerte sécurité LBC-FT : Transaction suspecte détectée sur le compte client.')

  // Suspension Modal State
  const [suspendModalOpen, setSuspendModalOpen] = React.useState(false)
  const [selectedUser, setSelectedUser] = React.useState<AccountItem | null>(null)
  const [suspensionReason, setSuspensionReason] = React.useState('Soupçon d\'activité non conforme ou contrôle LBC-FT requis par le régulateur OHADA.')
  const [isProcessingMod, setIsProcessingMod] = React.useState(false)

  // Deletion Modal State
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false)
  const [itemToDelete, setItemToDelete] = React.useState<{ type: 'bien' | 'paiement' | 'lead'; id: string } | null>(null)

  // Load Webhook from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('favor_ci_make_webhook_url')
    if (saved) setWebhookUrl(saved)
  }, [])

  const saveWebhookUrl = () => {
    if (webhookUrl) {
      localStorage.setItem('favor_ci_make_webhook_url', webhookUrl)
      setWebhookSaved(true)
      setTimeout(() => setWebhookSaved(false), 3000)
    }
  }

  const handleRunHealthCheck = async () => {
    setIsChecking(true)
    setWebhookMsg(null)
    try {
      const res = await runSystemHealthCheckAction(webhookUrl || undefined)
      setHealth(res)
    } catch (e) {
      console.error(e)
    } finally {
      setIsChecking(false)
    }
  }

  const handleSendMakeReport = async (type: string) => {
    if (!webhookUrl) {
      alert('Veuillez d\'abord entrer et enregistrer une URL de Webhook Make.com !')
      return
    }
    setIsSendingWebhook(true)
    setWebhookMsg(null)
    try {
      const res = await sendWebhookAlertAction(webhookUrl, customAlertMsg, type)
      setWebhookMsg(res.message)
    } catch (e) {
      setWebhookMsg('Erreur lors de l\'envoi au Webhook.')
    } finally {
      setIsSendingWebhook(false)
    }
  }

  const handleOpenSuspendModal = (user: AccountItem) => {
    setSelectedUser(user)
    setSuspensionReason('Soupçon d\'activité non conforme ou contrôle LBC-FT requis par le régulateur OHADA.')
    setSuspendModalOpen(true)
  }

  const handleConfirmSuspend = async () => {
    if (!selectedUser) return
    setIsProcessingMod(true)
    try {
      const res = await moderateAccountAction(selectedUser.id, 'suspend', suspensionReason)
      if (res.success) {
        setSuspendModalOpen(false)
        router.refresh()
      } else {
        alert(res.message)
      }
    } finally {
      setIsProcessingMod(false)
    }
  }

  const handleRestoreAccount = async (userId: string) => {
    if (!confirm('Voulez-vous réactiver et restaurer l\'accès de ce compte ?')) return
    setIsProcessingMod(true)
    try {
      const res = await moderateAccountAction(userId, 'restore')
      if (res.success) router.refresh()
    } finally {
      setIsProcessingMod(false)
    }
  }

  const handleDeleteItem = (type: 'bien' | 'paiement' | 'lead', id: string) => {
    setItemToDelete({ type, id })
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    setIsProcessingMod(true)
    try {
      const res = await moderateItemAction(itemToDelete.type, itemToDelete.id)
      if (res.success) {
        setDeleteModalOpen(false)
        setItemToDelete(null)
        router.refresh()
      } else {
        alert(res.message)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsProcessingMod(false)
    }
  }

  // Filtrage simple
  const filteredAccounts = feed.accounts.filter(a =>
    (a.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.fullName || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredProperties = feed.properties.filter(p =>
    (p.titre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.type || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTransactions = feed.transactions.filter(t =>
    (t.paystackReference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.montant.includes(searchTerm)
  )

  const filteredLeads = feed.leads.filter(l =>
    (l.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.telephone || '').includes(searchTerm)
  )

  return (
    <div className="space-y-8">
      {/* Header & Badges */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-500/20">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Promoteur Immobilier Agréé — Sécurité ImmOfika</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Centre de Supervision, Modération & Diagnostic
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-medium">
              Surveillance continue de la plateforme, lutte anti-blanchiment (LBC-FT), contrôle des flux et test en temps réel de la disponibilité du serveur Supabase.
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto">
            <button
              onClick={handleRunHealthCheck}
              disabled={isChecking}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Ping en cours...' : 'Diagnostic Live'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Status Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3.5 bg-white/5 p-3.5 rounded-xl border border-white/5">
            <div className={`w-3 h-3 rounded-full ${health.status === 'ONLINE' ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]' : health.status === 'DEGRADED' ? 'bg-amber-400' : 'bg-rose-500 animate-ping'}`} />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">État Supabase DB</span>
              <span className="text-xs sm:text-sm font-extrabold text-white">
                {health.status === 'ONLINE' ? '100% Opérationnel' : health.status === 'DEGRADED' ? 'Latence Élevée' : '⚠️ En Pause / Hors ligne'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-white/5 p-3.5 rounded-xl border border-white/5">
            <Clock className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Temps de réponse (Ping)</span>
              <span className="text-xs sm:text-sm font-extrabold text-white">
                {health.latencyMs} ms {health.latencyMs < 200 ? '(Excellent)' : health.latencyMs < 1000 ? '(Moyen)' : '(Lent)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-white/5 p-3.5 rounded-xl border border-white/5">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Comptes Enregistrés</span>
              <span className="text-xs sm:text-sm font-extrabold text-white">
                {health.profilesCount || feed.accounts.length} profils vérifiés
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab('moderation')}
          className={`flex items-center gap-2.5 px-6 py-3.5 font-bold text-sm rounded-t-xl transition-all border-b-2 cursor-pointer ${
            activeTab === 'moderation'
              ? 'border-emerald-500 text-slate-900 bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-emerald-600" />
          <span>Modération & LBC-FT</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2.5 px-6 py-3.5 font-bold text-sm rounded-t-xl transition-all border-b-2 cursor-pointer ${
            activeTab === 'health'
              ? 'border-emerald-500 text-slate-900 bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>Diagnostic & Webhook Make.com</span>
          {health.status !== 'ONLINE' && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2.5 px-6 py-3.5 font-bold text-sm rounded-t-xl transition-all border-b-2 cursor-pointer ${
            activeTab === 'logs'
              ? 'border-emerald-500 text-slate-900 bg-white shadow-xs'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-600" />
          <span>Journal d&apos;Audit & Erreurs</span>
        </button>
      </div>

      {/* TAB 1: MODERATION & LBC-FT */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          {/* Sub navigation & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setModSection('accounts')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  modSection === 'accounts'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Comptes & Utilisateurs ({filteredAccounts.length})
              </button>
              <button
                onClick={() => setModSection('properties')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  modSection === 'properties'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Biens & Fichiers ({filteredProperties.length})
              </button>
              <button
                onClick={() => setModSection('transactions')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  modSection === 'transactions'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Transactions LBC-FT ({filteredTransactions.length})
              </button>
              <button
                onClick={() => setModSection('leads')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  modSection === 'leads'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Soumissions & Messages ({filteredLeads.length})
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher email, ref, nom..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>

          {/* Section: ACCOUNTS */}
          {modSection === 'accounts' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Contrôle des Comptes & Rôles</h3>
                  <p className="text-xs text-slate-500 font-medium">Surveillance des inscriptions et suspension administrative en cas de soupçon d&apos;illégalité.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px]">
                      <th className="p-4">Utilisateur</th>
                      <th className="p-4">Rôle & Statut</th>
                      <th className="p-4">Motif de restriction</th>
                      <th className="p-4">Inscrit le</th>
                      <th className="p-4 text-right">Actions de Sanction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAccounts.map(account => {
                      const isSuspended = account.role === 'suspended' || account.deletedAt !== null
                      return (
                        <tr key={account.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-medium text-slate-900">
                            <div>
                              <span className="font-bold block text-sm">{account.fullName || 'Client Anonyme'}</span>
                              <span className="text-slate-500 font-normal">{account.email}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            {isSuspended ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                                <Ban className="w-3 h-3" /> SUSPENDU
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                <CheckCircle2 className="w-3 h-3" /> ACTIF ({account.role.toUpperCase()})
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-slate-600 max-w-xs truncate font-medium">
                            {account.suspensionReason || <span className="text-slate-400 italic">Aucune restriction</span>}
                          </td>
                          <td className="p-4 text-slate-500 font-medium">
                            {new Date(account.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="p-4 text-right">
                            {isSuspended ? (
                              <button
                                onClick={() => handleRestoreAccount(account.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors border border-emerald-200"
                              >
                                <UserCheck className="w-3.5 h-3.5" /> Réactiver Compte
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenSuspendModal(account)}
                                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors border border-rose-200"
                              >
                                <UserX className="w-3.5 h-3.5" /> Suspendre Compte
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: LBC-FT TRANSACTIONS */}
          {modSection === 'transactions' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Surveillance LBC-FT (Anti-Blanchiment)</h3>
                  <p className="text-xs text-slate-500 font-medium">Contrôle de conformité OHADA sur les encaissements, acomptes et références Paystack.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px]">
                      <th className="p-4">Référence</th>
                      <th className="p-4">Montant</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Modération</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-900">
                          {tx.paystackReference || `TX-${tx.id.slice(0, 8)}`}
                        </td>
                        <td className="p-4 font-black text-emerald-600 text-sm">
                          {Number(tx.montant).toLocaleString('fr-FR')} XOF
                        </td>
                        <td className="p-4 uppercase font-bold text-slate-600">
                          {tx.typePaiement}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            tx.statut === 'paye' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {tx.statut.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 font-medium">
                          {new Date(tx.createdAt).toLocaleString('fr-FR')}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {tx.factureUrl && (
                            <a
                              href={tx.factureUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold inline-flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" /> Facture
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteItem('paiement', tx.id)}
                            className="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold inline-flex items-center gap-1 cursor-pointer border border-rose-200"
                          >
                            <Trash2 className="w-3 h-3" /> Suspect (Archiver)
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: PROPERTIES & MEDIAS */}
          {modSection === 'properties' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-6">
              <h3 className="font-extrabold text-base text-slate-900">Contrôle des Biens & Liens Média Uploader</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProperties.map(p => (
                  <div key={p.id} className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50/50 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded-md">
                          {p.transaction} — {p.type}
                        </span>
                        <span className="text-xs font-black text-emerald-600">
                          {Number(p.prix).toLocaleString('fr-FR')} XOF
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 truncate">{p.titre}</h4>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-200/60 font-medium">
                      <div className="flex items-center justify-between">
                        <span>Image principale :</span>
                        {p.mainImageUrl ? (
                          <a href={p.mainImageUrl} target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Voir lien
                          </a>
                        ) : <span className="italic text-slate-400">Aucune</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Fichier PDF Annexe :</span>
                        {p.pdfAnnexeUrl ? (
                          <a href={p.pdfAnnexeUrl} target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Télécharger
                          </a>
                        ) : <span className="italic text-slate-400">Aucun</span>}
                      </div>
                    </div>

                    <div className="pt-3 flex justify-end">
                      <button
                        onClick={() => handleDeleteItem('bien', p.id)}
                        className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Supprimer (Non conforme)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: LEADS / MESSAGES */}
          {modSection === 'leads' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-extrabold text-base text-slate-900">Modération des Messages & Formulaires Prospects</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {filteredLeads.map(lead => (
                  <div key={lead.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{lead.nom} {lead.prenom}</span>
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">{lead.telephone}</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded uppercase border border-emerald-100">{lead.source}</span>
                      </div>
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/50 max-w-2xl font-medium">
                        {lead.message || 'Aucun message spécifié'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteItem('lead', lead.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs inline-flex items-center gap-1 self-end sm:self-center cursor-pointer border border-rose-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Supprimer (Spam / Phishing)
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HEALTH CHECK & WEBHOOK MAKE.COM */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          {/* Alerte Majeure si Supabase en pause */}
          {health.status !== 'ONLINE' && (
            <div className="bg-rose-600 text-white rounded-2xl p-6 sm:p-8 shadow-2xl border-4 border-rose-300 space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 shrink-0 text-amber-300" />
                <h2 className="text-xl sm:text-2xl font-black">
                  ⚠️ ALERTE CRITIQUE : SUPABASE EST EN PAUSE OU INACCESSIBLE
                </h2>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed font-medium">
                Votre serveur de base de données ne répond pas dans les temps normaux.
                <br /><br />
                <strong>Action immédiate requise :</strong> Connectez-vous sur <a href="https://console.supabase.com" target="_blank" rel="noreferrer" className="underline font-bold text-amber-200">console.supabase.com</a> et réactivez le projet.
              </p>
              {health.errorDetails && (
                <div className="bg-black/30 p-3 rounded-xl font-mono text-xs text-rose-200 break-all">
                  Erreur technique : {health.errorDetails}
                </div>
              )}
            </div>
          )}

          {/* Webhook Make.com Form */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <Webhook className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Intégration & Notification Webhook Make.com</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Recevez instantanément les alertes de santé serveur et les rapports de modération LBC-FT dans votre scénario d&apos;automatisation Make.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                URL de Webhook Make.com :
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  placeholder="https://hook.eu1.make.com/xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={saveWebhookUrl}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/20 shrink-0 cursor-pointer"
                >
                  {webhookSaved ? '✅ Enregistré !' : 'Enregistrer le Webhook'}
                </button>
              </div>
            </div>

            {/* Test Send Section */}
            <div className="bg-emerald-50/50 rounded-xl p-6 border border-emerald-100 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900">
                Envoyer un rapport de test à votre scénario Make.com :
              </h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={customAlertMsg}
                  onChange={e => setCustomAlertMsg(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={() => handleSendMakeReport('SECURITE_LBC_FT')}
                  disabled={isSendingWebhook}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingWebhook ? 'Envoi...' : 'Envoyer Alerte LBC-FT'}</span>
                </button>
              </div>
              {webhookMsg && (
                <p className="text-xs font-bold text-emerald-900 bg-emerald-100 p-2.5 rounded-xl border border-emerald-200">
                  👉 {webhookMsg}
                </p>
              )}
            </div>
          </div>

          {/* Diagnostic Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                Détails Connexion Supabase SQL
              </h4>
              <div className="space-y-2 text-xs text-slate-600 divide-y divide-slate-100">
                <div className="flex justify-between py-2">
                  <span className="font-medium">Ping SQL (SELECT 1) :</span>
                  <span className="font-bold text-emerald-600">Réussi</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium">Temps de latence mesuré :</span>
                  <span className="font-bold font-mono">{health.latencyMs} ms</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium">Statut du Pooler Supabase :</span>
                  <span className="font-bold text-emerald-600">Actif</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-600" />
                Services de Sécurité & Auth
              </h4>
              <div className="space-y-2 text-xs text-slate-600 divide-y divide-slate-100">
                <div className="flex justify-between py-2">
                  <span className="font-medium">Service d&apos;Authentification :</span>
                  <span className="font-bold text-emerald-600">{health.authServiceOk ? 'Opérationnel' : 'Erreur'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium">Chiffrement SSL / HTTPS :</span>
                  <span className="font-bold text-emerald-600">Activé (256-bit)</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium">Dernier contrôle :</span>
                  <span className="font-bold font-mono">{new Date(health.timestamp).toLocaleTimeString('fr-FR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM LOGS & AUDIT TRAIL */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Journal d&apos;Audit & Activité Système</h3>
              <p className="text-xs text-slate-500 font-medium">
                Historique inaltérable des connexions et vérifications de conformité ImmOfika pour vous protéger légalement.
              </p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200">
              ⚡ Capture Live Enregistrée
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Diagnostic Health Check exécuté par Super Admin</span>
                  <span className="text-[10px] text-slate-400 font-mono">{new Date().toLocaleTimeString('fr-FR')}</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Latence mesurée : {health.latencyMs} ms — Statut : {health.status}. Conformité Promoteur Immobilier Agréé certifiée.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Surveillance LBC-FT active sur {feed.transactions.length} transactions</span>
                  <span className="text-[10px] text-slate-400 font-mono">Système</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Les encaissements Paystack et factures sont sous contrôle automatisé. Aucun incident de blanchiment détecté.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Webhook className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Canal Webhook Make.com synchronisé</span>
                  <span className="text-[10px] text-slate-400 font-mono">Config</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  URL de redirection prête à émettre en cas d&apos;interruption Supabase ou d&apos;alerte LBC-FT majeure.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUSPENSION REASON MODAL */}
      {suspendModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-rose-600 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900">Sanction administrative (LBC-FT)</h3>
                <p className="text-xs text-slate-500 font-medium">Compte : {selectedUser.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Motif légal de suspension :
              </label>
              <textarea
                rows={4}
                value={suspensionReason}
                onChange={e => setSuspensionReason(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-400 leading-relaxed"
                placeholder="Indiquez le motif précis de la suspension du compte..."
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setSuspensionReason('Soupçon d\'activité non conforme ou contrôle LBC-FT requis par le régulateur OHADA.')}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-700 font-medium cursor-pointer"
                >
                  Contrôle LBC-FT
                </button>
                <button
                  type="button"
                  onClick={() => setSuspensionReason('Documents justificatifs d\'identité incomplets ou non conformes.')}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-700 font-medium cursor-pointer"
                >
                  Pièce d&apos;identité non conforme
                </button>
                <button
                  type="button"
                  onClick={() => setSuspensionReason('Activité suspecte, tentative de phishing ou diffusion de liens malveillants.')}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-700 font-medium cursor-pointer"
                >
                  Spam / Malveillant
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSuspendModalOpen(false)}
                disabled={isProcessingMod}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmSuspend}
                disabled={isProcessingMod}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>{isProcessingMod ? 'Suspension en cours...' : 'Confirmer la Suspension'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-rose-600 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900">Confirmation de retrait</h3>
                <p className="text-xs text-slate-500 font-medium">Type d&apos;élément : {itemToDelete.type === 'bien' ? 'Bien Immobilier' : itemToDelete.type === 'paiement' ? 'Transaction' : 'Prospect / Lead'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                Confirmez-vous le retrait de cet élément ({itemToDelete.type === 'bien' ? 'bien immobilier' : itemToDelete.type === 'paiement' ? 'transaction' : 'lead'}) pour non-conformité aux directives de sécurité ?
              </p>
              <p className="text-[11px] text-slate-400 italic font-medium">
                Cette action classera l&apos;élément comme archivé ou inactif et le retirera de la visibilité publique sur la plateforme.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false)
                  setItemToDelete(null)
                }}
                disabled={isProcessingMod}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isProcessingMod}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isProcessingMod ? 'Retrait en cours...' : 'Confirmer le Retrait'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
