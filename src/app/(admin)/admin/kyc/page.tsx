import * as React from 'react'
import { requireAdminAccess } from '@/lib/auth/permissions'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import KycModerationHub from '@/components/admin/KycModerationHub'

export const metadata = {
  title: 'Validation KYC — Admin ImmOfika',
  description: 'Vérifiez et validez les pièces d\'identité soumises par les clients.',
}

export default async function AdminKycPage() {
  // Check access (agent, admin, super_admin)
  await requireAdminAccess()

  // Retrieve profiles waiting for KYC validation
  const pendingKycUsers = await db
    .select({
      id: profiles.id,
      email: profiles.email,
      fullName: profiles.fullName,
      phone: profiles.phone,
      kycDocUrl: profiles.kycDocUrl,
      kycDocType: profiles.kycDocType,
      kycStatus: profiles.kycStatus,
      createdAt: profiles.createdAt,
    })
    .from(profiles)
    .where(
      and(
        eq(profiles.kycStatus, 'pending'),
        isNull(profiles.deletedAt)
      )
    )

  return (
    <div className="py-2 px-1 sm:px-2 lg:px-4">
      <KycModerationHub pendingUsers={pendingKycUsers} />
    </div>
  )
}
