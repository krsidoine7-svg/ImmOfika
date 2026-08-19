"use client"

import * as React from "react"
import { useEffect, useState, useTransition } from "react"
import { 
  Bell as BellIcon, 
  Check as CheckIcon, 
  Trash as TrashIcon, 
  Calendar as CalendarIcon, 
  CreditCard as CreditCardIcon, 
  Users as UsersIcon, 
  Sparkles as SparklesIcon,
  CheckCheck as CheckCheckIcon,
  Circle as CircleIcon
} from "lucide-react"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { createClient } from "@/utils/supabase/client"
import { 
  getNotificationsAction, 
  marquerLueAction, 
  marquerToutesLuesAction, 
  supprimerNotificationAction 
} from "@/app/actions/notifications"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'reservation' | 'paiement' | 'visite' | 'lead' | 'system'
  link: string | null
  lu: boolean
  createdAt: string
}

interface NotificationsBellProps {
  userId?: string
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMins = Math.floor(diffInMs / 60000)
  const diffInHours = Math.floor(diffInMs / 3600000)
  const diffInDays = Math.floor(diffInMs / 86400000)

  if (diffInMins < 1) return "À l'instant"
  if (diffInMins < 60) return `Il y a ${diffInMins} min`
  if (diffInHours < 24) return `Il y a ${diffInHours} h`
  if (diffInDays === 1) return "Hier"
  if (diffInDays < 7) return `Il y a ${diffInDays} j`
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

export function NotificationsBell({ userId }: NotificationsBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Charger les notifications initiales
  const fetchNotifications = async () => {
    const res = await getNotificationsAction()
    if (res.success && res.notifications) {
      const formatted = (res.notifications as any[]).map(n => ({
        ...n,
        createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : String(n.createdAt)
      })) as Notification[]
      setNotifications(formatted)
      setUnreadCount(formatted.filter(n => !n.lu).length)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Abonnement Supabase Realtime
  useEffect(() => {
    if (!userId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`realtime-notifications-user-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotif = payload.new as any
          const formatted: Notification = {
            id: newNotif.id,
            userId: newNotif.user_id,
            title: newNotif.title,
            message: newNotif.message,
            type: newNotif.type,
            link: newNotif.link,
            lu: newNotif.lu,
            createdAt: newNotif.created_at
          }
          setNotifications(prev => [formatted, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const handleMarquerLue = (id: string) => {
    startTransition(async () => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))

      const res = await marquerLueAction(id)
      if (res.error) {
        fetchNotifications()
      }
    })
  }

  const handleMarquerToutesLues = () => {
    startTransition(async () => {
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })))
      setUnreadCount(0)

      const res = await marquerToutesLuesAction()
      if (res.error) {
        fetchNotifications()
      }
    })
  }

  const handleSupprimer = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      const target = notifications.find(n => n.id === id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (target && !target.lu) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }

      const res = await supprimerNotificationAction(id)
      if (res.error) {
        fetchNotifications()
      }
    })
  }

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "reservation":
        return <CalendarIcon className="h-4 w-4 text-emerald-600" />
      case "paiement":
        return <CreditCardIcon className="h-4 w-4 text-emerald-600" />
      case "lead":
        return <UsersIcon className="h-4 w-4 text-blue-600" />
      case "system":
        return <SparklesIcon className="h-4 w-4 text-emerald-600" />
      default:
        return <CircleIcon className="h-4 w-4 text-slate-400" />
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger 
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs transition-all hover:bg-slate-50 focus:outline-hidden hover:scale-105 active:scale-95 cursor-pointer"
        nativeButton={true}
      >
        <BellIcon className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-xs ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </PopoverTrigger>
      
      <PopoverContent className="w-[calc(100vw-24px)] xs:w-80 sm:w-96 max-w-md rounded-xl border border-slate-200 bg-white p-0 shadow-xl overflow-hidden" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm sm:text-base">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-emerald-700">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarquerToutesLues}
              disabled={isPending}
              className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors focus:outline-hidden disabled:opacity-50 cursor-pointer"
            >
              <CheckCheckIcon className="h-3.5 w-3.5" />
              Tout lire
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <BellIcon className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-bold text-slate-700">Aucune notification</p>
              <p className="mt-1 text-xs text-slate-400 font-medium">Vous serez notifié des événements clés d&apos;ImmOfika.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "group relative flex gap-3 p-4 transition-all hover:bg-slate-50/60",
                  !notif.lu && "bg-emerald-50/30 border-l-2 border-l-emerald-500"
                )}
              >
                {/* Icon wrapper */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  {getIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  {notif.link ? (
                    <Link
                      href={notif.link}
                      onClick={() => {
                        if (!notif.lu) handleMarquerLue(notif.id)
                        setIsOpen(false)
                      }}
                      className="block hover:underline"
                    >
                      <p className={cn("text-sm font-bold text-slate-800 break-words", !notif.lu && "text-slate-900")}>
                        {notif.title}
                      </p>
                    </Link>
                  ) : (
                    <p className={cn("text-sm font-bold text-slate-800 break-words", !notif.lu && "text-slate-900")}>
                      {notif.title}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-slate-500 font-medium leading-normal line-clamp-3 break-words">
                    {notif.message}
                  </p>
                  <p className="mt-1.5 text-[10px] font-bold text-slate-400">
                    {formatRelativeTime(notif.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="absolute right-3 top-4 flex flex-col gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  {!notif.lu && (
                    <button
                      onClick={() => handleMarquerLue(notif.id)}
                      disabled={isPending}
                      title="Marquer comme lu"
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 shadow-xs hover:text-emerald-600 hover:border-emerald-500 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <CheckIcon className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleSupprimer(e, notif.id)}
                    disabled={isPending}
                    title="Supprimer"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 shadow-xs hover:text-red-500 hover:border-red-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
