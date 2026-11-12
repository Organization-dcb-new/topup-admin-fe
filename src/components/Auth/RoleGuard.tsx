import { Navigate, useLocation } from 'react-router-dom'

import { AppSplash } from '@/components/Layout/app-shell'
import { firstAccessiblePath, visibleMenus } from '@/components/Layout/sidebar-nav'
import type { Permission } from '@/constants/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import { REQUIRED_2FA_PATH, useAuthUser, withRedirect } from '@/lib/auth'

interface RoleGuardProps {
  children: React.ReactNode
  /** Passes when the admin holds any of these, like the backend's RequirePermission. */
  permission?: Permission | Permission[]
}

export const RoleGuard = ({ children, permission }: RoleGuardProps) => {
  const { isAuthenticated, isMfaRequired, isMfaSetupRequired, isLoading } = useAuthUser()
  const { can } = usePermissions()
  const location = useLocation()

  if (isLoading) return <AppSplash />

  if (!isAuthenticated) {
    // Remember the requested page so login can bring the admin back to it.
    const redirectTo = location.pathname + location.search
    if (isMfaRequired) {
      return <Navigate to={withRedirect('/verify-otp', redirectTo)} replace />
    }
    if (isMfaSetupRequired) {
      return <Navigate to={withRedirect(REQUIRED_2FA_PATH, redirectTo)} replace />
    }
    return <Navigate to={withRedirect('/login', redirectTo)} replace />
  }

  const codes = permission === undefined ? [] : Array.isArray(permission) ? permission : [permission]
  const allowed = codes.length === 0 || can(...codes)

  if (!allowed) {
    // Landing on the dashboard without access to it (e.g. a content-only role): open the
    // first page the admin can use instead of a dead end.
    const fallback = location.pathname === '/' ? firstAccessiblePath(visibleMenus(can)) : undefined
    return <Navigate to={fallback ?? '/unauthorized'} replace />
  }

  return <>{children}</>
}
