"use client"

import * as React from "react"
import Link from "next/link"
import { Search, User, LogOut } from "lucide-react"
import { NotificationsBell } from "@/components/admin/NotificationsBell"

interface ClientHeaderProps {
  userId: string
  fullName: string | null
  email: string | undefined
  avatarUrl: string | null
}

export default function ClientHeader({ userId, fullName, email, avatarUrl }: ClientHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const initials = fullName
    ? fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : email?.charAt(0).toUpperCase() || "U"

  return (
    <header className="h-20 border-b border-slate-100 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 w-full">
      {/* Search Bar */}
      <div className="flex-1 max-w-lg mx-auto hidden sm:block relative">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-medium transition-all"
            placeholder="Rechercher un terrain, un paiement, un document..."
          />
        </div>
      </div>

      {/* Mobile spacing */}
      <div className="sm:hidden flex-1" />

      {/* User Actions */}
      <div className="flex items-center gap-4 shrink-0 ml-4">
        <NotificationsBell userId={userId} />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 focus:outline-none group cursor-pointer"
          >
            <div className="h-10 w-10 rounded-full border border-slate-200 overflow-hidden bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shadow-xs transition-all group-hover:border-emerald-500">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName || "User avatar"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors">
                {fullName || "Mon Espace"}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold leading-none mt-0.5">
                Client Privé
              </p>
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header info */}
              <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{fullName || "Mon Espace"}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">{email}</p>
              </div>

              {/* Menu options */}
              <div className="p-1">
                <Link
                  href="/client/profil"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs text-slate-700 hover:text-emerald-600 hover:bg-emerald-50/50 font-bold transition-colors"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  Voir mon profil & KYC
                </Link>
              </div>

              <div className="border-t border-slate-100 p-1 bg-red-50/30">
                <form action="/auth/signout" method="post" className="w-full">
                  <button
                    type="submit"
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-xs text-red-600 hover:bg-red-50 font-bold transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="h-4 w-4 text-red-500" />
                    Déconnexion
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
