"use client"

import { useRouter } from "next/navigation"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronsUpDownIcon, SparklesIcon, BadgeCheckIcon, CreditCardIcon, BellIcon, LogOutIcon } from "lucide-react"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
    role?: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()

  const isAgent = user.role === 'agent'
  const isClient = user.role === 'client'

  const profileUrl = isClient ? '/client/profil' : '/admin/profil'
  const billingUrl = isClient ? '/client/paiements' : '/admin/paiements'
  const notificationsUrl = '/admin/notifications'

  const handleLogout = async () => {
    try {
      await fetch('/auth/signout', { method: 'POST' })
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    } finally {
      window.location.href = '/auth/login'
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-gray-500">{user.email}</span>
                    {user.role && (
                      <span className="text-[9px] font-black uppercase text-[#C9A84C] mt-0.5 tracking-wider">
                        {user.role === 'super_admin' 
                          ? 'Super Administrateur' 
                          : user.role === 'tech_super_admin' 
                            ? 'Super Admin Technique' 
                            : user.role === 'admin' 
                              ? 'Administrateur' 
                              : user.role === 'agent' 
                                ? 'Agent Commercial' 
                                : 'Client'}
                      </span>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <SparklesIcon
                />
                Passer à la version Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push(profileUrl)} className="cursor-pointer">
                <BadgeCheckIcon />
                Mon Compte
              </DropdownMenuItem>
              {!isAgent && (
                <DropdownMenuItem onClick={() => router.push(billingUrl)} className="cursor-pointer">
                  <CreditCardIcon />
                  Facturation
                </DropdownMenuItem>
              )}
              {!isClient && (
                <DropdownMenuItem onClick={() => router.push(notificationsUrl)} className="cursor-pointer">
                  <BellIcon />
                  Notifications
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOutIcon
              />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
