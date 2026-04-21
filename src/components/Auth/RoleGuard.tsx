import { useAuthUser } from '@/lib/auth'
import { Navigate } from 'react-router-dom'

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { role, isAuthenticated, isMfaRequired, isLoading } = useAuthUser()

  if (isLoading) return <div className='flex h-screen items-center justify-center'>Loading...</div>

  if (!isAuthenticated) {
    if (isMfaRequired) {
      return <Navigate to='/verify-otp' replace />
    }
    return <Navigate to='/login' replace />
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to='/unauthorized' replace />
  }

  return <>{children}</>
}
