'use client'

import { useQuery } from '@tanstack/react-query'

export function usePermissions() {
  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['user-permissions'],
    queryFn: async () => {
      const res = await fetch('/api/me/permissions')
      if (!res.ok) throw new Error('Erreur de chargement des permissions')
      return res.json()
    },
  })

  function hasPermission(code: string): boolean {
    return permissions.some(
      (p: { code: string; granted: boolean }) =>
        p.code === code && p.granted
    )
  }

  function hasAnyPermission(codes: string[]): boolean {
    return codes.some(code => hasPermission(code))
  }

  return { permissions, hasPermission, hasAnyPermission, isLoading }
}
