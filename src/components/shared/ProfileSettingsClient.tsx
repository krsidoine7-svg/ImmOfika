"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Save, Key, Trash2, 
  AlertTriangle, ShieldAlert, FileText, X, CheckCircle, Clock, ShieldCheck
} from 'lucide-react'
import { updateProfileAction, updateKycAction } from '@/app/actions/client'
import { updatePasswordAction, softDeleteAccountAction } from '@/app/actions/profile-actions'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CustomSelect } from '@/components/ui/custom-select'

interface ProfileSettingsClientProps {
  user: {
    email: string
    id: string
  }
  profile: {
    full_name: string | null
    phone: string | null
    avatar_url: string | null
    role: string
    kyc_doc_url?: string | null
    kyc_doc_type?: string | null
    kyc_status?: string | null
  }
  redirectPathAfterDelete: string
  allowEmailChange?: boolean
}

type TabType = 'info' | 'kyc' | 'security' | 'danger'

export default function ProfileSettingsClient({ 
  user, 
  profile, 
  redirectPathAfterDelete,
  allowEmailChange = true
}: ProfileSettingsClientProps) {
  const [activeTab, setActiveTab] = React.useState<TabType>('info')

  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [isSubmittingPassword, setIsSubmittingPassword] = React.useState(false)
  
  // Deletion state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)
  const [confirmEmailInput, setConfirmEmailInput] = React.useState('')
  const [isDeleting, setIsDeleting] = React.useState(false)

  const [isSavingInfo, setIsSavingInfo] = React.useState(false)
  const [isSavingKyc, setIsSavingKyc] = React.useState(false)
  const [emailValue, setEmailValue] = React.useState(user.email)
  const [kycDocType, setKycDocType] = React.useState('CNI')

  React.useEffect(() => {
    setEmailValue(user.email)
  }, [user.email])

  const handleInfoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSavingInfo(true)
    const formData = new FormData(e.currentTarget)
    try {
      await updateProfileAction(formData)
      toast.success("Profil mis à jour avec succès")
    } catch (err: any) {
      toast.error("Erreur lors de la mise à jour : " + (err.message || String(err)))
    } finally {
      setIsSavingInfo(false)
    }
  }

  const handleKycSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSavingKyc(true)
    const formData = new FormData(e.currentTarget)
    try {
      await updateKycAction(formData)
      toast.success("Pièce d'identité téléversée. Vos informations sont en cours de validation.")
    } catch (err: any) {
      toast.error("Erreur lors du téléversement : " + (err.message || String(err)))
    } finally {
      setIsSavingKyc(false)
    }
  }

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword) {
      toast.error("Veuillez saisir un mot de passe")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }
    if (newPassword.length < 6) {
      toast.error("Le mot de passe doit faire au moins 6 caractères")
      return
    }

    setIsSubmittingPassword(true)
    try {
      const res = await updatePasswordAction(newPassword)
      if (res.success) {
        toast.success("Mot de passe mis à jour avec succès")
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error("Erreur : " + res.error)
      }
    } catch (err) {
      toast.error("Erreur technique inattendue")
    } finally {
      setIsSubmittingPassword(false)
    }
  }

  const handleSoftDelete = async () => {
    if (confirmEmailInput !== user.email) {
      toast.error("L'adresse e-mail saisie ne correspond pas")
      return
    }

    setIsDeleting(true)
    try {
      const res = await softDeleteAccountAction()
      if (res.success) {
        toast.success("Compte désactivé. Redirection...")
        setTimeout(() => {
          window.location.href = redirectPathAfterDelete
        }, 1500)
      } else {
        toast.error("Erreur lors de la désactivation : " + res.error)
        setIsDeleting(false)
      }
    } catch (err) {
      toast.error("Erreur technique inattendue")
      setIsDeleting(false)
    }
  }

  const tabs = [
    { id: 'info' as TabType, label: 'Informations Personnelles', icon: User },
    { id: 'kyc' as TabType, label: 'Vérification KYC', icon: FileText, badge: profile.kyc_status === 'verified' ? 'Vérifié' : profile.kyc_status === 'pending' ? 'En cours' : undefined },
    { id: 'security' as TabType, label: 'Sécurité', icon: Key },
    { id: 'danger' as TabType, label: 'Zone de Danger', icon: ShieldAlert, isDanger: true },
  ]

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      
      {/* Header section */}
      <div>
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
          Espace Personnel
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Mon Profil & Paramètres
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Gérez vos coordonnées, vérifiez vos pièces d&apos;identité et sécurisez votre compte ImmOfika.
        </p>
      </div>

      {/* Horizontal Pill Tabs */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl flex flex-wrap gap-1.5 border border-slate-200/60 shadow-xs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
                isActive
                  ? tab.isDanger
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                    : 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : tab.isDanger
                    ? 'text-red-600 hover:bg-red-50/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>

              {tab.badge && (
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : tab.badge === 'Vérifié' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {/* TAB 1: Personal Info */}
        {activeTab === 'info' && (
          <motion.section
            key="info"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover rounded-2xl" />
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">Informations Personnelles</p>
                  <h2 className="text-lg font-black text-slate-900">Profil Acquéreur</h2>
                </div>
              </div>
            </div>

            <form onSubmit={handleInfoSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Nom complet</label>
                  <input
                    type="text"
                    name="fullName"
                    defaultValue={profile.full_name || ''}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium"
                    placeholder="Votre nom et prénoms"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Téléphone</label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={profile.phone || ''}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium"
                    placeholder="+225 07 00 00 00 00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Adresse E-mail {allowEmailChange ? '' : '(Non modifiable)'}
                </label>
                <input
                  type="email"
                  name="email"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  disabled={!allowEmailChange}
                  className={`w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-mono transition-all ${
                    allowEmailChange 
                      ? "bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800" 
                      : "bg-slate-100 text-slate-500 cursor-not-allowed"
                  }`}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Changer de photo de profil</label>
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  className="w-full block text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all cursor-pointer"
                />
              </div>

              <div className="pt-4 border-t border-slate-50 flex justify-end">
                <Button type="submit" disabled={isSavingInfo} className="px-6 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer">
                  <Save className="h-4 w-4 text-white mr-1.5" />
                  {isSavingInfo ? "Modification..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </form>
          </motion.section>
        )}

        {/* TAB 2: KYC Verification */}
        {activeTab === 'kyc' && (
          <motion.section
            key="kyc"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">Conformité Légale</p>
                  <h2 className="text-lg font-black text-slate-900">Vérification d&apos;Identité KYC</h2>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-2 sm:mt-0">
                {profile.kyc_status === 'verified' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <CheckCircle className="h-3.5 w-3.5" /> Profil Vérifié
                  </span>
                )}
                {profile.kyc_status === 'pending' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
                    <Clock className="h-3.5 w-3.5" /> Validation en cours
                  </span>
                )}
                {(!profile.kyc_status || profile.kyc_status === 'none') && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-500 border border-slate-100">
                    Non vérifié
                  </span>
                )}
              </div>
            </div>

            {profile.kyc_status === 'verified' ? (
              <div className="p-4 bg-emerald-50/50 text-emerald-800 border border-emerald-100 rounded-2xl text-xs sm:text-sm font-light leading-relaxed">
                <p className="font-bold flex items-center gap-1.5 mb-1 text-emerald-900">
                  <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                  Vos informations KYC ont été validées officiellement.
                </p>
                Vous êtes certifié pour signer des contrats électroniques juridiquement valides avec ImmOfika.
              </div>
            ) : profile.kyc_status === 'pending' ? (
              <div className="p-4 bg-amber-50/50 text-amber-800 border border-amber-100 rounded-2xl text-xs sm:text-sm font-light leading-relaxed">
                <p className="font-bold flex items-center gap-1.5 mb-1 text-amber-900">
                  <Clock className="h-4.5 w-4.5 text-amber-500" />
                  Pièce d&apos;identité en attente de relecture.
                </p>
                Nos agents valideront votre document sous 24 heures ouvrées. Vous pouvez continuer à utiliser votre espace.
              </div>
            ) : (
              <form onSubmit={handleKycSubmit} className="space-y-6">
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  Pour des raisons réglementaires de conformité promoteur foncier, veuillez téléverser un document officiel d&apos;identité (CNI ou Passeport).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Type de pièce</label>
                    <input type="hidden" name="kycDocType" value={kycDocType} />
                    <CustomSelect
                      value={kycDocType}
                      onChange={setKycDocType}
                      options={[
                        { value: 'CNI', label: "Carte Nationale d'Identité (CNI)" },
                        { value: 'Passeport', label: 'Passeport' },
                        { value: 'Attestation', label: 'Attestation de Cession / Foncier' },
                      ]}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Document (PDF ou Image)</label>
                    <input
                      type="file"
                      name="kycDoc"
                      accept="image/*,application/pdf"
                      required
                      className="w-full block text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <button 
                    type="button"
                    onClick={() => {
                      toast.info("Vous pourrez compléter ces informations plus tard.")
                    }}
                    className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    Remplir plus tard
                  </button>

                  <Button type="submit" disabled={isSavingKyc} className="px-6 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer">
                    {isSavingKyc ? "Téléversement..." : "Envoyer pour validation"}
                  </Button>
                </div>
              </form>
            )}
          </motion.section>
        )}

        {/* TAB 3: Security */}
        {activeTab === 'security' && (
          <motion.section
            key="security"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6"
          >
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
                <Key className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">Sécurité</p>
                <h2 className="text-lg font-black text-slate-900">Sécurité du Compte</h2>
              </div>
            </div>

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium"
                    placeholder="Minimum 6 caractères"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium"
                    placeholder="Confirmer à l&apos;identique"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex justify-end">
                <Button type="submit" disabled={isSubmittingPassword} className="px-6 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer">
                  <Save className="h-4 w-4 text-white mr-1.5" />
                  Mettre à jour le mot de passe
                </Button>
              </div>
            </form>
          </motion.section>
        )}

        {/* TAB 4: Danger Zone */}
        {activeTab === 'danger' && (
          <motion.section
            key="danger"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-red-100 shadow-sm space-y-6"
          >
            <div className="flex items-center gap-3 border-b border-red-50 pb-4">
              <div className="h-12 w-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center font-bold">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-widest">Zone à risque</p>
                <h2 className="text-lg font-black text-red-600">Zone de Danger</h2>
              </div>
            </div>

            <div className="bg-red-50/50 p-4 border border-red-100 rounded-2xl text-xs text-red-800 leading-relaxed font-medium space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-red-900">
                <AlertTriangle className="h-4 w-4" /> Action irréversible
              </p>
              En clôturant votre compte, vos données d&apos;accès seront immédiatement archivées et suspendues. Toutes vos visites en cours seront annulées. Vos factures et contrats déjà signés restent cryptés et archivés pour conformité juridique nationale.
            </div>

            <div className="pt-4 border-t border-slate-50 flex justify-end">
              <Button 
                type="button" 
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-6 py-5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md shadow-red-600/20"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Clôturer le Compte
              </Button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal Overlay */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-red-100 relative overflow-hidden"
            >
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setConfirmEmailInput('')
                }}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3.5 mb-4">
                <div className="h-12 w-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shrink-0 border border-red-100">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-red-600 tracking-tight">Confirmer la clôture du compte</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Vérification de sécurité</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Veuillez saisir votre adresse e-mail exacte pour valider la suspension définitive de vos accès :
                </p>

                <div className="p-3 bg-red-50/30 rounded-xl border border-red-100 text-xs text-red-800 font-bold font-mono">
                  {user.email}
                </div>

                <input
                  type="text"
                  value={confirmEmailInput}
                  onChange={(e) => setConfirmEmailInput(e.target.value)}
                  placeholder="Saisissez votre e-mail"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/40 text-sm font-mono"
                />

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDeleteModalOpen(false)
                      setConfirmEmailInput('')
                    }}
                    className="px-5 py-3 border border-slate-200 text-slate-600 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSoftDelete}
                    disabled={isDeleting || confirmEmailInput !== user.email}
                    className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs sm:text-sm disabled:opacity-40 cursor-pointer shadow-md shadow-red-600/20"
                  >
                    {isDeleting ? 'Clôture en cours...' : 'Confirmer la suppression'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
