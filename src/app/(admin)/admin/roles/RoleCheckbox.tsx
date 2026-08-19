'use client'

import * as React from 'react'
import { toggleRolePermissionAction } from '@/app/actions/adminPermissions'

export function RoleCheckbox({ 
  roleName,
  permissionCode,
  isGranted, 
  currentUserRole 
}: { 
  roleName: string;
  permissionCode: string;
  isGranted: boolean; 
  currentUserRole: string;
}) {
  const [optimisticGranted, setOptimisticGranted] = React.useState(isGranted)
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    setOptimisticGranted(isGranted)
  }, [isGranted])

  const isSuperRole = roleName === 'super_admin' || roleName === 'tech_super_admin'

  const isDisabled = isSuperRole || (roleName === 'admin' && currentUserRole !== 'tech_super_admin')
  const isChecked = isSuperRole || (roleName === 'admin' && isDisabled) ? true : optimisticGranted

  if (isDisabled) {
    return (
      <input 
        type="checkbox" 
        checked={isChecked} 
        disabled={true}
        className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 disabled:opacity-50 cursor-not-allowed"
      />
    )
  }

  const handleChange = () => {
    const nextState = !optimisticGranted
    setOptimisticGranted(nextState)

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('roleName', roleName)
        formData.append('permissionCode', permissionCode)
        formData.append('action', nextState ? 'grant' : 'revoke')
        
        await toggleRolePermissionAction(formData)
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la permission :", error)
        setOptimisticGranted(!nextState)
      }
    })
  }

  return (
    <input 
      type="checkbox" 
      checked={isChecked} 
      onChange={isPending ? undefined : handleChange}
      className={`h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer transition-all duration-200 ${
        isPending ? 'pointer-events-none opacity-90' : ''
      }`}
    />
  )
}
