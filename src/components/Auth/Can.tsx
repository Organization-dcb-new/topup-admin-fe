import type { ReactNode } from 'react'

import type { Permission } from '@/constants/permissions'
import { usePermissions } from '@/hooks/usePermissions'

interface CanProps {
  /** One code or a list; a list passes when the admin holds any of them. */
  permission: Permission | Permission[]
  fallback?: ReactNode
  children: ReactNode
}

/** Renders its children only when the admin may perform the action. */
export function Can({ permission, fallback = null, children }: CanProps) {
  const { can } = usePermissions()
  const codes = Array.isArray(permission) ? permission : [permission]
  return <>{can(...codes) ? children : fallback}</>
}
