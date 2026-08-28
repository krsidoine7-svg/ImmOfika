"use client"

import * as React from "react"
import { 
  BuildingIcon, 
  UsersIcon, 
  CalendarIcon, 
  CreditCardIcon, 
  HomeIcon,
  CrownIcon,
  ShieldCheckIcon,
  ContactIcon,
  BookOpenIcon,
  MapPinIcon,
  SettingsIcon,
  BellIcon,
  ShieldAlertIcon,
  SlidersIcon,
  ActivityIcon,
  TableIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

const favorData = {
  navMain: [
    {
      title: "Tableau de Bord & Stats",
      url: "/admin",
      icon: <HomeIcon />,
      isActive: true,
    },
    {
      title: "Base de Données Visuelle",
      url: "/admin/database",
      icon: <TableIcon />,
      permission: "view:biens",
    },
    {
      title: "Formulaires (Tally)",
      url: "/admin/formulaires",
      icon: <BookOpenIcon />,
      permission: "view:biens",
    },
    {
      title: "Biens Immobiliers",
      url: "/admin/biens",
      icon: <BuildingIcon />,
      permission: "view:biens",
    },
    {
      title: "Utilisateurs",
      url: "/admin/utilisateurs",
      icon: <UsersIcon />,
      permission: "view:users",
    },
    {
      title: "Leads",
      url: "/admin/leads",
      icon: <ContactIcon />,
      permission: "view:leads",
    },
    {
      title: "Dossiers & Tâches",
      url: "/admin/dossiers",
      icon: <BookOpenIcon />,
      permission: "view:dossiers",
    },
    {
      title: "Visites",
      url: "/admin/visites",
      icon: <MapPinIcon />,
      permission: "view:visites",
    },
    {
      title: "Mon Agenda",
      url: "/admin/agenda",
      icon: <CalendarIcon />,
      permission: "view:visites",
    },
    {
      title: "Réservations",
      url: "/admin/reservations",
      icon: <CalendarIcon />,
      permission: "view:reservations",
    },
    {
      title: "Paiements",
      url: "/admin/paiements",
      icon: <CreditCardIcon />,
      permission: "view:paiements",
    },
    {
      title: "Rôles & Accès",
      url: "/admin/roles",
      icon: <ShieldCheckIcon />,
      permission: "manage:roles",
    },
    {
      title: "Validation KYC",
      url: "/admin/kyc",
      icon: <ShieldCheckIcon />,
      permission: "view:users",
    },
    {
      title: "Supervision & Modération",
      url: "/admin/moderation",
      icon: <ShieldAlertIcon />,
      permission: "manage:roles",
    },
    {
      title: "Configuration Accueil",
      url: "/admin/configuration",
      icon: <SettingsIcon />,
      permission: "manage:config",
    },
    {
      title: "Paramètres Système",
      url: "#",
      icon: <SlidersIcon />,
      permission: "manage:config",
      items: [
        { title: "Entreprise", url: "/admin/parametres/entreprise" },
        { title: "Transactions", url: "/admin/parametres/transactions" },
        { title: "Automatisation", url: "/admin/parametres/automatisation" },
        { title: "Sécurité", url: "/admin/parametres/securite" },
      ]
    },
    {
      title: "Analytiques & Rôles",
      url: "#",
      icon: <ActivityIcon />,
      permission: "manage:roles",
      items: [
        { title: "Audiences & Pixels", url: "/admin/analytics/audiences" },
        { title: "Flux de Pages & Liens", url: "/admin/analytics/flux" },
        { title: "Tunnels & Kanban", url: "/admin/analytics/tunnels" },
        { title: "Rôles & Permissions", url: "/admin/analytics/permissions" },
      ]
    },
    {
      title: "Envoyer Notification",
      url: "/admin/notifications",
      icon: <BellIcon />,
      permission: "view:users",
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string
    email: string
    avatar: string
    role?: string
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const filteredNavMain = favorData.navMain
    .filter(item => {
      const isSuperRole = user.role === "super_admin" || user.role === "tech_super_admin"
      if (item.title === "Analytiques & Rôles") return isSuperRole
      if (item.title === "Supervision & Modération") return isSuperRole
      if (item.title === "Rôles & Accès") return isSuperRole
      return true
    })
    .map(item => {
      const isSuperRole = user.role === "super_admin" || user.role === "tech_super_admin"
      if (item.items) {
        return {
          ...item,
          items: item.items.filter(subItem => {
            if (subItem.title === "Sécurité") return isSuperRole
            return true
          })
        }
      }
      return item
    })

  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-gray-200">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
                <CrownIcon className="size-5" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-extrabold text-slate-900">ImmOfika</span>
                <span className="truncate text-xs font-semibold text-emerald-600">Promotion & Agence</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="mt-2">
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
