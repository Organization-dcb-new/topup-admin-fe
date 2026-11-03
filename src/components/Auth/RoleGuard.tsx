import { Navigate, useLocation } from 'react-router-dom'

import { firstAccessiblePath, visibleMenus } from '@/components/Layout/sidebar-nav'
import type { Permission } from '@/constants/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuthUser, withRedirect } from '@/lib/auth'

interface RoleGuardProps {
  children: React.ReactNode
  /** Passes when the admin holds any of these, like the backend's RequirePermission. */
  permission?: Permission | Permission[]
  /** Role slugs, only for pages that have no permission in the backend catalog yet. */
  allowedRoles?: string[]
}

export const RoleGuard = ({ children, permission, allowedRoles }: RoleGuardProps) => {
  const { role, isAuthenticated, isMfaRequired, isLoading } = useAuthUser()
  const { can } = usePermissions()
  const location = useLocation()

  if (isLoading) return <div className='flex h-screen items-center justify-center'>Loading...</div>

  if (!isAuthenticated) {
    // Remember the requested page so login can bring the admin back to it.
    const redirectTo = location.pathname + location.search
    if (isMfaRequired) {
      return <Navigate to={withRedirect('/verify-otp', redirectTo)} replace />
    }
    return <Navigate to={withRedirect('/login', redirectTo)} replace />
  }

  const codes = permission === undefined ? [] : Array.isArray(permission) ? permission : [permission]
  const allowed =
    (codes.length === 0 || can(...codes)) && (!allowedRoles || (!!role && allowedRoles.includes(role)))

  if (!allowed) {
    // Landing on the dashboard without access to it (e.g. a content-only role): open the
    // first page the admin can use instead of a dead end.
    const fallback = location.pathname === '/' ? firstAccessiblePath(visibleMenus(can, role)) : undefined
    return <Navigate to={fallback ?? '/unauthorized'} replace />
  }

  return <>{children}</>
}
