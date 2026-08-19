import * as React from 'react'
import { requireSuperAdminAccess } from '@/lib/auth/permissions'
import { runSystemHealthCheckAction, getModerationFeedAction } from '@/app/actions/moderation'
import SuperAdminModerationHub from '@/components/admin/SuperAdminModerationHub'

export const metadata = {
  title: 'Supervision, Modération & Sécurité LBC-FT — Admin Favor Company',
  description: 'Centre de contrôle d\'État pour le Super Administrateur : modération des flux, diagnostic de santé serveur et prévention LBC-FT.',
}

export default async function ModerationPage() {
  await requireSuperAdminAccess()

  const [initialHealth, feed] = await Promise.all([
    runSystemHealthCheckAction(),
    getModerationFeedAction(),
  ])

  return <SuperAdminModerationHub initialHealth={initialHealth} feed={feed} />
}
