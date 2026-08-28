import { requireAdminAccess } from "@/lib/auth/permissions"
import { getUsersPourNotificationAction } from "@/app/actions/notifications"
import SimpleNotificationForm from "@/components/admin/SimpleNotificationForm"

export const metadata = {
  title: "Envoyer une Notification - Admin ImmOfika",
}

export default async function AdminNotificationsPage() {
  await requireAdminAccess()

  const res = await getUsersPourNotificationAction()
  const users = res.success && res.users ? res.users : []

  return (
    <div className="py-6 px-4 max-w-6xl mx-auto">
      <SimpleNotificationForm users={users} />
    </div>
  )
}
