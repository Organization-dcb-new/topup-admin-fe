import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/axios'
import toast from 'react-hot-toast'
import i18n from '@/i18n'

// Recovery code digenerate BE dalam huruf besar dan dibandingkan
// case-sensitive, jadi input user dinormalisasi dulu sebelum dikirim
export const normalizeRecoveryCode = (code: string) => code.trim().toUpperCase()

// Sesi murni berbasis cookie httpOnly yang dikelola BE — FE tidak pernah
// menyimpan token, cukup memanggil endpoint logout untuk mengakhiri sesi.
export async function apiLogout(): Promise<void> {
  try {
    await api.post('/admin/logout')
  } catch {
    /* ignore */
  }
}

export async function logout(): Promise<void> {
  await apiLogout()
  toast.success(i18n.t('authToasts.logoutSuccess'))
  window.location.href = '/login'
}

export function useAuthUser() {
  const { data, isLoading } = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/me')
        return { user: res.data.data, mfa_pending: false }
      } catch (err: unknown) {
        const message = (
          err as { response?: { data?: { message?: string } } }
        )?.response?.data?.message
        if (message === 'MFA_REQUIRED') {
          return { user: null, mfa_pending: true }
        }
        throw err
      }
    },
    retry: false,
    staleTime: 30000,
  })

  const isMfaRequired = data?.mfa_pending === true
  const isFullyAuthenticated = !!data?.user && !isMfaRequired

  return {
    isAuthenticated: isFullyAuthenticated,
    isMfaRequired,
    role: data?.user?.role ?? null,
    user: data?.user ?? null,
    isLoading
  }
}
