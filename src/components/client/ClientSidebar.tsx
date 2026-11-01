"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Logo from "@/components/shared/Logo"
import { 
  Home, 
  CreditCard, 
  User, 
  HelpCircle, 
  Share2, 
  Crown,
  Bell,
  FileText
} from "lucide-react"

export interface MenuItem {
  name: string
  href: string
  icon: any
  isBeta?: boolean
}

export const menuItems: MenuItem[] = [
  { name: "Tableau de Bord", href: "/client/dashboard", icon: Home },
  { name: "Mes Alertes Immo", href: "/client/alertes", icon: Bell },
  { name: "Dossier Candidat", href: "/client/dossier", icon: FileText },
  { name: "Paiements & Factures", href: "/client/paiements", icon: CreditCard },
  { name: "Mon Profil & KYC", href: "/client/profil", icon: User },
  { name: "Niveau d'Offre", href: "/client/offres", icon: Crown },
  { name: "Suggestions & Retours", href: "/client/suggestions", icon: HelpCircle },
  { name: "Contacter l'Agent", href: "/client/contact", icon: Share2 }
]

export function SidebarContent({ 
  className = "", 
  pathname, 
  onNavigate 
}: { 
  className?: string
  pathname: string
  onNavigate?: () => void 
}) {
  return (
    <div className={`flex flex-col h-full bg-white text-slate-800 ${className}`}>
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-100">
        <Logo />
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-none">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <div key={item.name} className="relative group">
              <Link
                href={item.href}
                onClick={() => onNavigate?.()}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all relative ${
                  item.isBeta ? "opacity-60 cursor-not-allowed select-none" : "cursor-pointer"
                } ${
                  isActive 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" 
                    : "text-slate-700 hover:text-emerald-600 hover:bg-emerald-50/60"
                }`}
              >
                <item.icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-600"}`} />
                <span>{item.name}</span>
                
                {item.isBeta && (
                  <span className="ml-auto px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-100 text-emerald-700 uppercase">
                    Bêta
                  </span>
                )}

                {/* Active Indicator Dot */}
                {isActive && (
                  <div className="absolute right-3 h-2 w-2 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
                )}
              </Link>
            </div>
          )
        })}
      </nav>
    </div>
  )
}

export default function ClientSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:block w-72 h-screen shrink-0 border-r border-slate-100 bg-white">
      <SidebarContent className="h-full" pathname={pathname} />
    </aside>
  )
}
