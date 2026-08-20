import { Navigate, useLocation } from 'react-router-dom'

import { AuthLoadingScreen } from '@/components/Auth/AuthLoadingScreen'
import { useAuthUser } from '@/lib/auth'

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

/**
 * Satu-satunya tempat yang memutuskan perpindahan halaman karena auth.
 * DashboardLayout dan Sidebar sengaja tidak lagi ikut memutuskan supaya tidak
 * ada dua redirect yang berlomba pada render yang sama.
 */
export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { role, isAuthenticated, isMfaRequired, isLoading } = useAuthUser()
  const location = useLocation()

  if (isLoading) return <AuthLoadingScreen />

  if (!isAuthenticated) {
    if (isMfaRequired) return <Navigate to='/verify-otp' replace />
    /** Halaman tujuan disimpan supaya user kembali ke sana setelah login. */
    return (
      <Navigate
        to='/login'
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to='/unauthorized' replace />
  }

  return <>{children}</>
}
