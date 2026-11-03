import { useCallback } from 'react'

import type { Permission } from '@/constants/permissions'
import { useAuthUser } from '@/lib/auth'

/**
 * Permission checks for the signed-in admin. `can` is true when the admin holds ANY of the codes,
 * matching the backend's RequirePermission. The backend still enforces every request; this only
 * decides what the UI offers.
 */
export function usePermissions() {
  const { permissions } = useAuthUser()

  const can = useCallback(
    (...codes: Permission[]) => codes.some((code) => permissions.has(code)),
    [permissions]
  )

  return { permissions, can }
}
