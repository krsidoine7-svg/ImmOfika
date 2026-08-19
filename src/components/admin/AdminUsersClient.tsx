'use client'

import * as React from 'react'
import { UserIcon, ShieldAlertIcon, CheckCircleIcon, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SuspendUserDialog } from '@/components/admin/SuspendUserDialog'
import { CustomSelect } from '@/components/ui/custom-select'

interface UserItem {
  id: string
  fullName: string | null
  email: string
  role: string
  createdAt: Date | string
  deletedAt: Date | string | null
  suspensionReason?: string | null
  affiliatedAgentId?: string | null
}

interface AgentItem {
  id: string
  fullName: string | null
  email: string
}

interface AdminUsersClientProps {
  usersList: UserItem[]
  agentsList?: AgentItem[]
  currentUserRole?: string
}

const formatRoleBadge = (role: string) => {
  switch (role) {
    case 'client':
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
          👤 Client Acquéreur
        </span>
      )
    case 'admin_agent':
    case 'agent':
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-teal-50 text-teal-800 border border-teal-200">
          💼 Agent Commercial
        </span>
      )
    case 'admin_manager':
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-sky-50 text-sky-800 border border-sky-200">
          🏢 Manager Admin
        </span>
      )
    case 'admin':
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-900 text-emerald-400 border border-slate-700 font-bold shadow-xs">
          🏛️ Administrateur
        </span>
      )
    case 'super_admin':
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-600 text-white font-extrabold shadow-xs">
          👑 Super Admin
        </span>
      )
    case 'tech_super_admin':
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-950 text-emerald-400 border border-emerald-500/40 font-bold shadow-xs">
          ⚡ Tech Super Admin
        </span>
      )
    default:
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700">
          {role}
        </span>
      )
  }
}

export function AdminUsersClient({ usersList, agentsList = [], currentUserRole = 'admin' }: AdminUsersClientProps) {
  // Search, Filter & Pagination state
  const [searchTerm, setSearchTerm] = React.useState('')
  const [roleFilter, setRoleFilter] = React.useState('all')
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [selectedAgentId, setSelectedAgentId] = React.useState('all')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(6)

  const isAgentRole = currentUserRole === 'admin_agent' || currentUserRole === 'agent'

  // Reset page on filter change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, roleFilter, statusFilter, selectedAgentId, pageSize])

  // Filtering Logic
  const filteredUsers = React.useMemo(() => {
    return usersList.filter((user) => {
      // 1. Search Query
      const query = searchTerm.toLowerCase().trim()
      const matchesSearch =
        !query ||
        (user.fullName && user.fullName.toLowerCase().includes(query)) ||
        (user.email && user.email.toLowerCase().includes(query)) ||
        (user.role && user.role.toLowerCase().includes(query))

      // 2. Role Filter
      const matchesRole = roleFilter === 'all' || user.role === roleFilter

      // 3. Status Filter
      const isSuspended = !!user.deletedAt
      let matchesStatus = true
      if (statusFilter === 'active') matchesStatus = !isSuspended
      if (statusFilter === 'suspended') matchesStatus = isSuspended

      // 4. Agent Filter
      const matchesAgent = selectedAgentId === 'all' || user.affiliatedAgentId === selectedAgentId

      return matchesSearch && matchesRole && matchesStatus && matchesAgent
    })
  }, [usersList, searchTerm, roleFilter, statusFilter, selectedAgentId])

  // Pagination Calculations
  const totalItems = filteredUsers.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages)
  const startIndex = (validCurrentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize)

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold w-fit mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>ImmOfika — Espace Administration</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-500 text-sm">Gérez les comptes clients, agents et administrateurs de la plateforme.</p>
        </div>
      </div>

      {/* BARRE DE RECHERCHE & FILTRES */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, e-mail..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Agent Commercial Filter Dropdown (Visible uniquement pour Admins/SuperAdmins) */}
          {agentsList.length > 0 && !isAgentRole && (
            <div>
              <CustomSelect
                value={selectedAgentId}
                onChange={setSelectedAgentId}
                options={[
                  { value: 'all', label: `👨‍💼 Tous les Agents Commercials (${agentsList.length})` },
                  ...agentsList.map((ag) => ({
                    value: ag.id,
                    label: `👤 ${ag.fullName || ag.email}`
                  }))
                ]}
              />
            </div>
          )}

          {/* Role Filter (Masqué pour Agent Commercial qui ne gère que les clients) */}
          {!isAgentRole ? (
            <div>
              <CustomSelect
                value={roleFilter}
                onChange={setRoleFilter}
                options={[
                  { value: 'all', label: `👥 Tous les rôles (${usersList.length})` },
                  { value: 'client', label: '👤 Clients Acquéreurs' },
                  { value: 'admin_agent', label: '💼 Agents Commercials' },
                  { value: 'admin_manager', label: '🏢 Managers Admin' },
                  { value: 'admin', label: '🏛️ Administrateurs' },
                  { value: 'super_admin', label: '👑 Super Admins' },
                ]}
              />
            </div>
          ) : (
            <div>
              <div className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-600">
                👤 Filtré : Clients Acquéreurs Confiés
              </div>
            </div>
          )}
        </div>

        {/* Counter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
          <span>
            Résultats : <strong>{totalItems}</strong> utilisateur(s) affiché(s)
          </span>
          <span className="text-[11px] text-emerald-700 font-extrabold">
            Page {validCurrentPage} sur {totalPages}
          </span>
        </div>
      </div>

      {/* TABLE CONTAINER WITH SCROLLABLE VIEWPORT */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[650px] scrollbar-thin">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-gray-200/80 uppercase text-[11px] tracking-wider sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="px-6 py-3.5 bg-slate-50">Utilisateur</th>
                <th className="px-6 py-3.5 bg-slate-50">Rôle Officiel</th>
                <th className="px-6 py-3.5 bg-slate-50">Date d'inscription</th>
                <th className="px-6 py-3.5 bg-slate-50">Statut</th>
                <th className="px-6 py-3.5 text-right bg-slate-50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.map((user) => {
                const isSuspended = !!user.deletedAt
                return (
                  <tr key={user.id} className={`hover:bg-slate-50/70 transition-colors ${isSuspended ? 'bg-rose-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                          <UserIcon className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900">{user.fullName || 'Non renseigné'}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {formatRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      {isSuspended ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                            <ShieldAlertIcon className="h-3 w-3" /> Suspendu
                          </span>
                          {user.suspensionReason && (
                            <p className="text-[10px] text-rose-600 font-medium italic">Motif : {user.suspensionReason}</p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircleIcon className="h-3 w-3" /> Actif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <SuspendUserDialog
                        userId={user.id}
                        userName={user.fullName || user.email}
                        isSuspended={isSuspended}
                        toggleAction={async (formData) => {
                          const { toggleUserStatusAction } = await import('@/app/actions/adminUsers')
                          await toggleUserStatusAction(formData)
                        }}
                      />
                    </td>
                  </tr>
                )
              })}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 font-light italic">
                    Aucun utilisateur ne correspond à votre recherche ou filtre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* CONTROLES DE PAGINATION BAS DE TABLEAU */}
        <div className="px-6 py-4 bg-slate-50 border-t border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-600">
          <div>
            Affichage de <strong className="text-slate-900">{totalItems > 0 ? startIndex + 1 : 0}</strong> à{' '}
            <strong className="text-slate-900">{endIndex}</strong> sur <strong className="text-slate-900">{totalItems}</strong> utilisateurs
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              ◀ Précédent
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-xl font-extrabold transition-all cursor-pointer ${
                  validCurrentPage === page
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-500'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              Suivant ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
