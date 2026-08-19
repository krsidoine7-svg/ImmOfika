'use client'

import { usePermissions } from '@/hooks/usePermissions'

interface PermissionGateProps {
  permission: string | string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, isLoading } = usePermissions()

  // Pendant le chargement, on évite les clignotements en n'affichant rien (ou un petit loader)
  if (isLoading) return null

  const allowed = Array.isArray(permission)
    ? hasAnyPermission(permission)
    : hasPermission(permission)

  return allowed ? <>{children}</> : <>{fallback}</>
}
