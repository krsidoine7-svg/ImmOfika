'use client'

import * as React from 'react'
import { toggleRolePermissionAction, resetRolePermissionsAction } from '@/app/actions/adminPermissions'
import { assignUserRoleAction, revokeUserRoleAction } from '@/app/actions/adminUsers'
import {
  Shield,
  RotateCcw,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Filter,
  UserCheck,
  History,
  Grid,
  UserPlus,
  Trash2,
  Clock,
  KeyRound,
  ShieldAlert,
} from 'lucide-react'

interface RoleData {
  name: string
  label: string | null
  hierarchyLevel: number
  isSystem: boolean
  isLocked?: boolean
  description: string | null
}

interface PermissionData {
  code: string
  label: string | null
  resource: string | null
  action: string | null
  scope: string | null
  isSensitive: boolean
  description: string | null
}

interface AuditLogData {
  id: string
  userId: string | null
  userEmail: string | null
  userRole: string | null
  action: string
  entity: string | null
  entityId: string | null
  details: any
  ipAddress: string | null
  createdAt: Date
}

interface EnrichedUserData {
  id: string
  fullName: string
  email: string
  primaryRole: string | null
  isSuspended: boolean
  assignedRoles: Array<{ roleName: string; expiresAt: Date | null }>
}

interface Props {
  rolesList: RoleData[]
  permissionsList: PermissionData[]
  activeAssignments: { roleName: string; permissionCode: string }[]
  currentUserHierarchy: number
  currentUserRole: string
  currentUserRoles: string[]
  currentUserId: string
  auditLogsList?: AuditLogData[]
  usersList?: EnrichedUserData[]
}

const INCOMPATIBLE_PAIRS: [string, string][] = [
  ['COMPTA', 'LOGISTIQUE'],
  ['COMPTA', 'CATALOGUE'],
  ['SUPPORT', 'COMPTA'],
  ['ADMIN', 'SUPER_ADMIN'],
  ['compta', 'logistique'],
  ['compta', 'catalogue'],
  ['support', 'compta'],
  ['admin', 'super_admin'],
]

export function RolesManagementMatrix({
  rolesList,
  permissionsList,
  activeAssignments,
  currentUserHierarchy,
  currentUserRole,
  currentUserRoles,
  currentUserId,
  auditLogsList = [],
  usersList = [],
}: Props) {
  const [activeTab, setActiveTab] = React.useState<'matrix' | 'assignment' | 'audit'>('matrix')
  const [selectedResource, setSelectedResource] = React.useState<string>('all')
  const [searchQuery, setSearchQuery] = React.useState<string>('')
  const [grantedKeys, setGrantedKeys] = React.useState<Set<string>>(
    () => new Set(activeAssignments.map(a => `${a.roleName}:${a.permissionCode}`))
  )
  const [isPending, startTransition] = React.useTransition()
  const [resettingRole, setResettingRole] = React.useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // États pour l'attribution de rôle
  const [selectedUserId, setSelectedUserId] = React.useState<string>(usersList[0]?.id || '')
  const [roleToAssign, setRoleToAssign] = React.useState<string>('CLIENT')
  const [expirationDate, setExpirationDate] = React.useState<string>('')
  const [userSearchQuery, setUserSearchQuery] = React.useState<string>('')

  // Synchroniser les assignations
  React.useEffect(() => {
    setGrantedKeys(new Set(activeAssignments.map(a => `${a.roleName}:${a.permissionCode}`)))
  }, [activeAssignments])

  // Catégories / ressources uniques
  const resources = React.useMemo(() => {
    const set = new Set<string>()
    permissionsList.forEach(p => {
      if (p.resource) set.add(p.resource)
    })
    return Array.from(set).sort()
  }, [permissionsList])

  // Filtrer les permissions
  const filteredPermissions = React.useMemo(() => {
    return permissionsList.filter(p => {
      const matchResource = selectedResource === 'all' || p.resource === selectedResource
      const matchQuery =
        !searchQuery ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.label && p.label.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchResource && matchQuery
    })
  }, [permissionsList, selectedResource, searchQuery])

  // Utilisateur sélectionné pour l'attribution
  const selectedUser = React.useMemo(() => {
    return usersList.find(u => u.id === selectedUserId)
  }, [usersList, selectedUserId])

  // Rôles filtrés par hiérarchie pour l'attribution
  const assignableRoles = React.useMemo(() => {
    return rolesList.filter(r => {
      if (currentUserHierarchy >= 8) return true
      return r.hierarchyLevel < currentUserHierarchy
    })
  }, [rolesList, currentUserHierarchy])

  // Vérification de compatibilité en temps réel pour l'attribution
  const compatibilityValidation = React.useMemo(() => {
    if (!selectedUser) return { valid: true }

    const normNew = roleToAssign.toUpperCase()
    const existing = selectedUser.assignedRoles.map(r => r.roleName.toUpperCase())

    // Déjà attribué
    if (existing.includes(normNew)) {
      return { valid: false, reason: `L'utilisateur possède déjà le rôle ${roleToAssign}.` }
    }

    // Plafond de 2 rôles
    if (existing.length >= 2) {
      return { valid: false, reason: 'Plafond atteint : un utilisateur ne peut pas cumuler plus de 2 rôles actifs.' }
    }

    // Incompatibilité mutuelle
    if ((normNew === 'SUPER_ADMIN' && existing.includes('ADMIN')) || (normNew === 'ADMIN' && existing.includes('SUPER_ADMIN'))) {
      return { valid: false, reason: 'Les rôles ADMIN et SUPER_ADMIN sont mutuellement exclusifs.' }
    }

    for (const [r1, r2] of INCOMPATIBLE_PAIRS) {
      const nr1 = r1.toUpperCase()
      const nr2 = r2.toUpperCase()
      if ((normNew === nr1 && existing.includes(nr2)) || (normNew === nr2 && existing.includes(nr1))) {
        return { valid: false, reason: `Incompatibilité de séparation des tâches entre ${r1} et ${r2}.` }
      }
    }

    return { valid: true }
  }, [selectedUser, roleToAssign])

  // Garde-fous #1, #2, #3 : Déterminer si un rôle est modifiable
  const isRoleEditable = (role: RoleData) => {
    if (role.isLocked || role.name === 'SUPER_ADMIN' || role.name === 'super_admin') {
      return false
    }
    if (currentUserRoles.includes(role.name) || currentUserRole === role.name) {
      return false
    }
    if (currentUserHierarchy >= 8) {
      return true
    }
    return role.hierarchyLevel < currentUserHierarchy
  }

  // Toggle de permission
  const handleToggle = (roleName: string, permissionCode: string, isSensitive: boolean, canEditRole: boolean) => {
    if (!canEditRole) return

    if (isSensitive && currentUserHierarchy < 8) {
      setFeedbackMessage({
        type: 'error',
        text: 'Action bloquée : Seul un Super Administrateur peut modifier cette permission sensible 🔒.',
      })
      setTimeout(() => setFeedbackMessage(null), 4000)
      return
    }

    const key = `${roleName}:${permissionCode}`
    const currentlyGranted = grantedKeys.has(key)
    const nextGranted = !currentlyGranted

    const nextSet = new Set(grantedKeys)
    if (nextGranted) {
      nextSet.add(key)
    } else {
      nextSet.delete(key)
    }
    setGrantedKeys(nextSet)

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('roleName', roleName)
        formData.append('permissionCode', permissionCode)
        formData.append('action', nextGranted ? 'grant' : 'revoke')

        await toggleRolePermissionAction(formData)
        setFeedbackMessage({
          type: 'success',
          text: `Permission ${nextGranted ? 'accordée' : 'retirée'} pour le rôle ${roleName}. ${
            isSensitive ? '(Alerte email envoyée au Super Admin)' : ''
          }`,
        })
        setTimeout(() => setFeedbackMessage(null), 3000)
      } catch (err: unknown) {
        setGrantedKeys(grantedKeys)
        const errMsg = err instanceof Error ? err.message : 'Erreur de mise à jour'
        setFeedbackMessage({ type: 'error', text: errMsg })
        setTimeout(() => setFeedbackMessage(null), 4000)
      }
    })
  }

  // Réinitialiser un rôle aux valeurs par défaut
  const handleResetRole = (roleName: string) => {
    if (!confirm(`Voulez-vous vraiment réinitialiser toutes les permissions du rôle "${roleName}" à leurs valeurs par défaut minimales ?`)) {
      return
    }

    setResettingRole(roleName)
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('roleName', roleName)
        await resetRolePermissionsAction(formData)
        setFeedbackMessage({
          type: 'success',
          text: `Permissions du rôle ${roleName} réinitialisées avec succès aux valeurs par défaut minimales !`,
        })
        setTimeout(() => setFeedbackMessage(null), 3000)
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Échec de la réinitialisation'
        setFeedbackMessage({ type: 'error', text: errMsg })
        setTimeout(() => setFeedbackMessage(null), 4000)
      } finally {
        setResettingRole(null)
      }
    })
  }

  // Assigner un rôle
  const handleAssignRole = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId || !roleToAssign) return
    if (!compatibilityValidation.valid) {
      setFeedbackMessage({ type: 'error', text: compatibilityValidation.reason || 'Attribution invalide' })
      return
    }

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('userId', selectedUserId)
        formData.append('roleName', roleToAssign)
        if (expirationDate) {
          formData.append('expiresAt', new Date(expirationDate).toISOString())
        }

        await assignUserRoleAction(formData)
        setFeedbackMessage({
          type: 'success',
          text: `Rôle ${roleToAssign} assigné avec succès à l'utilisateur.`,
        })
        setExpirationDate('')
        setTimeout(() => setFeedbackMessage(null), 3000)
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Erreur lors de l\'attribution du rôle'
        setFeedbackMessage({ type: 'error', text: errMsg })
        setTimeout(() => setFeedbackMessage(null), 4000)
      }
    })
  }

  // Révoquer un rôle
  const handleRevokeRole = (userId: string, roleName: string) => {
    if (!confirm(`Voulez-vous retirer le rôle "${roleName}" à cet utilisateur ?`)) return

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('userId', userId)
        formData.append('roleName', roleName)

        await revokeUserRoleAction(formData)
        setFeedbackMessage({
          type: 'success',
          text: `Rôle ${roleName} retiré avec succès.`,
        })
        setTimeout(() => setFeedbackMessage(null), 3000)
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Erreur lors de la révocation du rôle'
        setFeedbackMessage({ type: 'error', text: errMsg })
        setTimeout(() => setFeedbackMessage(null), 4000)
      }
    })
  }

  // Filtrer les utilisateurs par recherche
  const filteredUsers = React.useMemo(() => {
    return usersList.filter(u => {
      if (!userSearchQuery) return true
      const q = userSearchQuery.toLowerCase()
      return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    })
  }, [usersList, userSearchQuery])

  return (
    <div className="space-y-6">
      {/* Toast Notification Feedback */}
      {feedbackMessage && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Onglets Principaux */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'matrix'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Grid className="w-4 h-4" />
          Matrice des Permissions
        </button>
        <button
          onClick={() => setActiveTab('assignment')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'assignment'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Attribution des Rôles (Multi-Rôles)
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          Journal d&apos;Audit ({auditLogsList.length})
        </button>
      </div>

      {/* ─── ONGLET 1 : MATRICE DES PERMISSIONS ──────────────────────────── */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Barre de contrôle : Recherche et filtres par ressource */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mr-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" /> Ressource :
              </span>
              <button
                onClick={() => setSelectedResource('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedResource === 'all'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Toutes ({permissionsList.length})
              </button>
              {resources.map(res => (
                <button
                  key={res}
                  onClick={() => setSelectedResource(res)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                    selectedResource === res
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>

            <div className="w-full md:w-64">
              <input
                type="text"
                placeholder="Rechercher une permission..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              />
            </div>
          </div>

          {/* Tableau Matrice RBAC */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50/90 text-slate-500 font-extrabold text-[11px] uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 min-w-[280px]">Permission</th>
                    {rolesList.map(role => {
                      const editable = isRoleEditable(role)
                      const isLockedRole = role.isLocked || role.name === 'SUPER_ADMIN' || role.name === 'super_admin'
                      return (
                        <th key={role.name} className="px-4 py-4 text-center min-w-[120px]">
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="font-black text-slate-900 capitalize text-xs flex items-center gap-1">
                              {role.label || role.name}
                              {isLockedRole && <Lock className="w-3 h-3 text-slate-400" />}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600 font-bold">
                                Niv. {role.hierarchyLevel}
                              </span>
                              {editable && (
                                <button
                                  onClick={() => handleResetRole(role.name)}
                                  disabled={isPending || resettingRole === role.name}
                                  title="Réinitialiser aux valeurs par défaut minimales"
                                  className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                                >
                                  <RotateCcw className={`w-3 h-3 ${resettingRole === role.name ? 'animate-spin' : ''}`} />
                                </button>
                              )}
                            </div>
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPermissions.map(perm => (
                    <tr key={perm.code} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {perm.code}
                          </span>
                          {perm.isSensitive && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200">
                              <Lock className="w-2.5 h-2.5" /> 🔒 Sensible
                            </span>
                          )}
                          {perm.scope === 'own' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              :own
                            </span>
                          )}
                        </div>
                        {perm.label && (
                          <p className="text-xs text-slate-600 font-medium mt-0.5">{perm.label}</p>
                        )}
                        {perm.description && (
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{perm.description}</p>
                        )}
                      </td>
                      {rolesList.map(role => {
                        const key = `${role.name}:${perm.code}`
                        const isGranted = grantedKeys.has(key)
                        const canEditRole = isRoleEditable(role)
                        const isSensitiveLocked = perm.isSensitive && currentUserHierarchy < 8
                        const isDisabled = !canEditRole || isSensitiveLocked || isPending

                        return (
                          <td key={key} className="px-4 py-3.5 text-center">
                            <label className="inline-flex items-center justify-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isGranted}
                                disabled={isDisabled}
                                onChange={() => handleToggle(role.name, perm.code, perm.isSensitive, canEditRole)}
                                className={`w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-all ${
                                  isDisabled
                                    ? 'opacity-40 cursor-not-allowed bg-slate-100'
                                    : 'cursor-pointer hover:border-emerald-500'
                                }`}
                              />
                            </label>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── ONGLET 2 : ATTRIBUTION DE RÔLES & MULTI-RÔLES ─────────────── */}
      {activeTab === 'assignment' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire d'attribution sécurisé */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              Attribuer un Rôle
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Garde-fous stricts : maximum 2 rôles, vérification d&apos;incompatibilité et niveau strictement inférieur.
            </p>

            <form onSubmit={handleAssignRole} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Utilisateur Cible</label>
                <select
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {usersList.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.email}) {u.id === currentUserId ? '— [Vous-même]' : ''}
                    </option>
                  ))}
                </select>
                {selectedUserId === currentUserId && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1">
                    ⚠️ Vous ne pouvez pas modifier vos propres rôles.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rôle à Attribuer</label>
                <select
                  value={roleToAssign}
                  onChange={e => setRoleToAssign(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {assignableRoles.map(r => (
                    <option key={r.name} value={r.name}>
                      {r.label || r.name} (Niveau {r.hierarchyLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expiration Optionnelle (Temporaire)
                </label>
                <input
                  type="datetime-local"
                  value={expirationDate}
                  onChange={e => setExpirationDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700"
                />
              </div>

              {/* Validation en direct */}
              {!compatibilityValidation.valid && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{compatibilityValidation.reason}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  isPending ||
                  !compatibilityValidation.valid ||
                  selectedUserId === currentUserId
                }
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all"
              >
                {isPending ? 'Application...' : 'Confirmer l\'Attribution'}
              </button>
            </form>
          </div>

          {/* Liste des utilisateurs et rôles actifs */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                Rôles Actifs des Utilisateurs
              </h2>
              <input
                type="text"
                placeholder="Filtrer un utilisateur..."
                value={userSearchQuery}
                onChange={e => setUserSearchQuery(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
              {filteredUsers.map(u => (
                <div key={u.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900">{u.fullName}</span>
                      {u.id === currentUserId && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                          Vous
                        </span>
                      )}
                      {u.isSuspended && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold">
                          Suspendu
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {u.assignedRoles.map(ar => (
                      <div
                        key={ar.roleName}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200"
                      >
                        <KeyRound className="w-3 h-3 text-emerald-600" />
                        <span>{ar.roleName}</span>
                        {ar.expiresAt && (
                          <span className="text-[10px] text-amber-600 flex items-center gap-0.5 font-normal">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(ar.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                        {u.id !== currentUserId && (
                          <button
                            onClick={() => handleRevokeRole(u.id, ar.roleName)}
                            title="Révoquer ce rôle"
                            disabled={isPending}
                            className="p-0.5 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors ml-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── ONGLET 3 : JOURNAL D'AUDIT RBAC ───────────────────────────── */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" />
                Journal d&apos;Audit Immuable des Rôles & Permissions
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Traçabilité complète des attributions, révocations et modifications de droits.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold">
              {auditLogsList.length} événements récents
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Date & Heure</th>
                  <th className="px-4 py-3">Acteur</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Cible / Détails</th>
                  <th className="px-4 py-3">Adresse IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogsList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">
                      Aucun événement d&apos;audit enregistré pour le moment.
                    </td>
                  </tr>
                ) : (
                  auditLogsList.map(log => {
                    const isGrant = log.action.includes('grant') || log.action.includes('assigned')
                    const isRevoke = log.action.includes('revoke')
                    const isDenied = log.action.includes('denied')

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-slate-500 font-mono whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-800">{log.userEmail || log.userId || 'Système'}</span>
                          {log.userRole && (
                            <span className="text-[10px] text-slate-400 block uppercase">
                              [{log.userRole}]
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] ${
                              isGrant
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isRevoke
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : isDenied
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-mono">
                          {log.details ? JSON.stringify(log.details) : '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-400 font-mono">
                          {log.ipAddress || '—'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Guide des légendes de sécurité */}
      <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 text-xs text-slate-600 space-y-2">
        <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-600" /> Principes de Sécurité Actifs (12 Garde-fous) :
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
          <li>• <strong>Principe du moindre privilège</strong> : Tout est refusé par défaut si la case n&apos;est pas cochée.</li>
          <li>• <strong>Contrôle de propriété (:own)</strong> : Même autorisée, l&apos;action n&apos;agit que sur les données du propriétaire.</li>
          <li>• <strong>Anti-escalade hiérarchique</strong> : Vous ne pouvez modifier que les rôles de niveau strictement inférieur au vôtre.</li>
          <li>• <strong>Permissions 🔒 Sensibles</strong> : Réservées au Super Admin racine avec alerte email immédiate.</li>
          <li>• <strong>Ségrégation des tâches</strong> : Incompatibilités strictes COMPTA+LOGISTIQUE, COMPTA+CATALOGUE, SUPPORT+COMPTA.</li>
          <li>• <strong>Plafond Multi-Rôles</strong> : Limité à un maximum de 2 rôles simultanés par compte.</li>
        </ul>
      </div>
    </div>
  )
}
