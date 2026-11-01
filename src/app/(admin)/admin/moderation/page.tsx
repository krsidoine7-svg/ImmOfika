import * as React from 'react'
import { requireAdminAccess } from '@/lib/auth/permissions'
import { runSystemHealthCheckAction, getModerationFeedAction } from '@/app/actions/moderation'
import { getSignalementsAction } from '@/app/actions/signalementsActions'
import SuperAdminModerationHub from '@/components/admin/SuperAdminModerationHub'

export const metadata = {
  title: 'Supervision, Modération & Sécurité LBC-FT — Admin ImmOfika',
  description: 'Centre de contrôle d\'État pour les Administrateurs & Modérateurs : modération des signalements, diagnostic de santé serveur et prévention LBC-FT.',
}

export default async function ModerationPage() {
  await requireAdminAccess()

  const [initialHealth, feed, sigRes] = await Promise.all([
    runSystemHealthCheckAction(),
    getModerationFeedAction(),
    getSignalementsAction(),
  ])

  return (
    <SuperAdminModerationHub
      initialHealth={initialHealth}
      feed={feed}
      signalements={sigRes.signalements || []}
    />
  )
}
