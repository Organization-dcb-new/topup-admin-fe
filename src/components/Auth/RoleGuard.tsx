import { useAuthUser, withRedirect } from '@/lib/auth'
import { Navigate, useLocation } from 'react-router-dom'

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { role, isAuthenticated, isMfaRequired, isLoading } = useAuthUser()
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

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to='/unauthorized' replace />
  }

  return <>{children}</>
}
