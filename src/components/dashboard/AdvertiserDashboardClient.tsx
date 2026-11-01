'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Users,
  UserCheck,
  FileText,
  DollarSign,
  Phone,
  Mail,
  UserPlus,
  Lock,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { AdvertiserDashboardData, inviterMembreOrganisationAction } from '@/app/actions/advertiserActions'
import { TITRES_FONCIERS } from '@/lib/constants/abidjan'
import { cn } from '@/lib/utils'

interface Props {
  initialData: AdvertiserDashboardData
}

export default function AdvertiserDashboardClient({ initialData }: Props) {
  const { user, organization, isGerant, members, kpis, biens, candidatures } = initialData
  const [activeTab, setActiveTab] = React.useState<'biens' | 'candidatures' | 'equipe'>('biens')

  // Modal invitation
  const [showInviteModal, setShowInviteModal] = React.useState(false)
  const [inviteEmail, setInviteEmail] = React.useState('')
  const [inviteRole, setInviteRole] = React.useState<'negociateur' | 'assistant' | 'gerant'>('negociateur')
  const [inviting, setInviting] = React.useState(false)
  const [inviteMsg, setInviteMsg] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isPromoteur = organization?.type === 'promoteur' || user.role === 'promoteur'
  const isAgence = organization?.type === 'agence' || user.role === 'agence'

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    setInviteMsg(null)

    const res = await inviterMembreOrganisationAction({
      email: inviteEmail,
      roleInOrg: inviteRole,
    })

    setInviting(false)

    if (res.error) {
      setInviteMsg({ type: 'error', text: res.error })
    } else {
      setInviteMsg({ type: 'success', text: res.message || 'Collaborateur rattaché avec succès.' })
      setInviteEmail('')
      setTimeout(() => setShowInviteModal(false), 2000)
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner adapté au profil */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/15 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-extrabold tracking-widest text-emerald-300 uppercase px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/20">
              {isPromoteur
                ? 'Promoteur Immobilier Agréé (MCLU)'
                : isAgence
                ? 'Cabinet / Agence Immobilière'
                : 'Propriétaire Bailleur Particulier'}
            </span>
            {organization?.verifiedAt && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Compte Vérifié
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {organization?.name ? organization.name : `Espace Annonceur • ${user.fullName || 'Partenaire'}`}
          </h1>

          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
            {isPromoteur
              ? `Commercialisation sécurisée de programmes neufs et lotissements approuvés. N° Agrément MCLU : ${organization?.agrementNumero || 'En cours'}.`
              : isAgence
              ? `Gestion des mandats d'agence, suivi des candidatures solvables et coordination de votre équipe de négociateurs.`
              : `Gérez vos biens personnels en direct, suivez les visites et recevez les dossiers candidats vérifiés.`}
          </p>
        </div>

        <div className="relative z-10 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            href="/admin/biens/nouveau"
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-950/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Déposer une annonce</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Annonces */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Biens</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{kpis.totalBiens}</p>
          <span className="text-[10px] text-slate-400 font-semibold">{kpis.biensValides} en ligne</span>
        </div>

        {/* En Modération */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[10px] font-bold uppercase tracking-wider">En Modération</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">{kpis.biensEnAttente}</p>
          <span className="text-[10px] text-slate-400 font-semibold">Examen sous 24h</span>
        </div>

        {/* Vues Totales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Audience Cumulée</span>
            <Eye className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{kpis.totalVues.toLocaleString('fr-CI')}</p>
          <span className="text-[10px] text-slate-400 font-semibold">Vues uniques</span>
        </div>

        {/* Candidatures & Réservations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[10px] font-bold uppercase tracking-wider">Candidatures & Acomptes</span>
            <FileText className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{kpis.totalCandidatures}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">{kpis.reservationsActives} réservations en cours</span>
        </div>
      </div>

      {/* Navigation par Onglets */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('biens')}
            className={cn(
              'pb-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 cursor-pointer',
              activeTab === 'biens'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            <Building2 className="w-4 h-4" />
            <span>Mon Parc Immobilier ({kpis.totalBiens})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('candidatures')}
            className={cn(
              'pb-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 cursor-pointer',
              activeTab === 'candidatures'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            <FileText className="w-4 h-4" />
            <span>Candidatures & Réservations ({kpis.totalCandidatures})</span>
          </button>

          {(isAgence || isPromoteur) && (
            <button
              type="button"
              onClick={() => setActiveTab('equipe')}
              className={cn(
                'pb-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 cursor-pointer',
                activeTab === 'equipe'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              )}
            >
              <Users className="w-4 h-4" />
              <span>Organisation & Équipe ({members.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Contenu des Onglets */}
      <div>
        {/* ─── Onglet 1 : Mon Parc Immobilier ─────────────────────────────────── */}
        {activeTab === 'biens' && (
          <div className="space-y-6">
            {biens.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-2xs space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Aucune annonce enregistrée</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Publiez dès maintenant votre premier bien (villa, terrain avec ACD, appartement) sur ImmOfika.
                  </p>
                </div>
                <Link
                  href="/admin/biens/nouveau"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Publier une annonce</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {biens.map((bien) => {
                  const isValide = bien.statutModeration === 'valide'
                  const isAttente = bien.statutModeration === 'en_attente'
                  const isRejete = bien.statutModeration === 'rejete'
                  const titreInfo = bien.typeTitrePropriete ? TITRES_FONCIERS[bien.typeTitrePropriete] : null

                  return (
                    <div
                      key={bien.id}
                      className="rounded-3xl border border-slate-100 overflow-hidden bg-white hover:border-emerald-200 transition-all shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        {/* Image */}
                        <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                          {bien.mainImageUrl ? (
                            <img src={bien.mainImageUrl} alt={bien.titre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Building2 className="w-8 h-8" />
                            </div>
                          )}

                          {/* Statut modération */}
                          <div className="absolute top-3 right-3">
                            {isValide && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white shadow-xs">
                                <CheckCircle2 className="w-3 h-3" /> En ligne
                              </span>
                            )}
                            {isAttente && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-xs">
                                <Clock className="w-3 h-3" /> En modération
                              </span>
                            )}
                            {isRejete && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-red-600 text-white shadow-xs">
                                <XCircle className="w-3 h-3" /> Rejeté
                              </span>
                            )}
                          </div>

                          {/* Titre foncier */}
                          {titreInfo && (
                            <div className="absolute bottom-3 left-3">
                              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-900/80 text-white backdrop-blur-xs border border-white/10">
                                {titreInfo.badgeLabel}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Contenu */}
                        <div className="p-4 sm:p-5 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{bien.quartier ? `${bien.quartier}, ` : ''}{bien.ville}</span>
                          </div>

                          <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                            {bien.titre}
                          </h4>

                          <p className="text-emerald-600 font-extrabold text-base">
                            {Number(bien.prix).toLocaleString('fr-CI')} FCFA
                            {bien.transaction === 'location' && <span className="text-xs text-slate-400 font-normal"> / mois</span>}
                          </p>

                          {isRejete && bien.motifRejet && (
                            <div className="p-2.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700">
                              <strong>Motif de refus :</strong> {bien.motifRejet}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-slate-400" /> {bien.vues || 0} vues
                        </span>
                        <Link
                          href={`/biens/${bien.slug}`}
                          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold"
                        >
                          <span>Fiche publique</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── Onglet 2 : Candidatures & Réservations Reçues ─────────────────── */}
        {activeTab === 'candidatures' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xs space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Dossiers Candidats & Réservations Reçues
              </h2>
              <p className="text-xs text-slate-500">
                Consultez la solvabilité et les pièces justificatives des clients ayant réservé ou postulé sur vos annonces.
              </p>
            </div>

            {candidatures.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Aucune réservation ni candidature reçue pour le moment sur votre parc.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-y border-slate-200">
                    <tr>
                      <th className="p-3">Bien ciblé</th>
                      <th className="p-3">Candidat</th>
                      <th className="p-3">Solvabilité</th>
                      <th className="p-3">Statut Réservation</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {candidatures.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 font-bold text-slate-900">
                          <Link href={`/biens/${c.bienSlug}`} className="hover:text-emerald-600">
                            {c.bienTitre}
                          </Link>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{c.clientNom}</p>
                          <p className="text-[10px] text-slate-400">{c.clientPhone || c.clientEmail}</p>
                        </td>
                        <td className="p-3">
                          {c.dossier ? (
                            <div>
                              <p className="font-bold text-emerald-700">
                                {c.dossier.revenuMensuel ? `${Number(c.dossier.revenuMensuel).toLocaleString('fr-CI')} FCFA/m` : 'Revenu déclaré'}
                              </p>
                              <p className="text-[10px] text-slate-500">{c.dossier.profession || 'Profession non précisée'}</p>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Dossier en cours</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={cn(
                              'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold capitalize',
                              c.statutReservation === 'confirme'
                                ? 'bg-emerald-50 text-emerald-700'
                                : c.statutReservation === 'en_attente'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            )}
                          >
                            {c.statutReservation}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {c.clientPhone && (
                              <a
                                href={`https://wa.me/${c.clientPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors"
                              >
                                WhatsApp
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── Onglet 3 : Organisation & Équipe ───────────────────────────────── */}
        {(isAgence || isPromoteur) && activeTab === 'equipe' && organization && (
          <div className="space-y-6">
            {/* Fiche Entreprise */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-base">
                    {organization.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{organization.name}</h3>
                    <p className="text-xs text-slate-400">
                      {isPromoteur ? 'Promoteur Immobilier Agréé MCLU' : 'Cabinet d\'Agence Immobilière'}
                    </p>
                  </div>
                </div>

                {isGerant && (
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Rattacher un négociateur</span>
                  </button>
                )}
              </div>

              {/* Méta Légales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">RCCM</span>
                  <span className="font-extrabold text-slate-800">{organization.rccm || 'Non renseigné'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Compte Contribuable (NCC)</span>
                  <span className="font-extrabold text-slate-800">{organization.ncc || 'Non renseigné'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Agrément Ministériel MCLU</span>
                  <span className="font-extrabold text-emerald-700">{organization.agrementNumero || 'En cours de validation'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Commune du siège</span>
                  <span className="font-extrabold text-slate-800">{organization.commune || 'Abidjan'}</span>
                </div>
              </div>
            </div>

            {/* Liste des Négociateurs / Collaborateurs */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xs space-y-4">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Collaborateurs & Négociateurs ({members.length})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-y border-slate-200">
                    <tr>
                      <th className="p-3">Collaborateur</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Rôle dans la structure</th>
                      <th className="p-3">Rattaché le</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          <span>{m.fullName || 'Collaborateur'}</span>
                        </td>
                        <td className="p-3 text-slate-600">{m.email}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 capitalize">
                            {m.roleInOrg}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">
                          {new Date(m.assignedAt).toLocaleDateString('fr-CI')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Inviter Collaborateur */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Rattacher un Collaborateur</h3>
                  <p className="text-[11px] text-slate-400">{organization?.name}</p>
                </div>
              </div>

              {inviteMsg && (
                <div
                  className={cn(
                    'p-3 mb-4 rounded-xl text-xs font-bold',
                    inviteMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
                  )}
                >
                  {inviteMsg.text}
                </div>
              )}

              <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 mb-1.5 block">Adresse e-mail du collaborateur</label>
                  <input
                    type="email"
                    required
                    placeholder="negociateur@votrecabinet.ci"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Le collaborateur doit avoir créé un compte sur ImmOfika.</p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1.5 block">Rôle attribué</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none bg-white"
                  >
                    <option value="negociateur">Négociateur Immobilier</option>
                    <option value="assistant">Assistant Commercial</option>
                    <option value="gerant">Co-Gérant</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {inviting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Rattachement...</span>
                      </>
                    ) : (
                      <span>Confirmer le rattachement</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

