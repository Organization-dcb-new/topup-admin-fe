import { useAuthUser } from '@/lib/auth'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { role, isAuthenticated, isMfaRequired, isLoading } = useAuthUser()

  if (isLoading)
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' aria-hidden />
      </div>
    )

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
