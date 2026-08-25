import { useAuthUser } from '@/lib/auth'
import { usePermission } from '@/hooks/usePermission'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

interface PermissionGuardProps {
  children: React.ReactNode
  /**
   * Kode permission yang dibutuhkan, bersifat OR — pemegang salah satunya
   * lolos, sama seperti RequirePermission di backend.
   *
   * Wajib diisi, dan **daftar kosong berarti menolak**. Itu yang membuat
   * halaman tanpa entri di ROUTE_PERMISSIONS gagal-tertutup alih-alih
   * terbuka untuk siapa saja.
   */
  requires: string | string[]
}

export const PermissionGuard = ({ children, requires }: PermissionGuardProps) => {
  const { isAuthenticated, isMfaRequired, isLoading } = useAuthUser()
  const { canAny } = usePermission()

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

  const codes = Array.isArray(requires) ? requires : [requires]

  if (codes.length === 0 || !canAny(...codes)) {
    return <Navigate to='/unauthorized' replace />
  }

  return <>{children}</>
}
