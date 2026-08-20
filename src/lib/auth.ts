import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import { api } from '@/api/axios'
import { AUTH_QUERY_KEY, type AuthMe } from '@/lib/auth-state'
import { queryClient } from '@/lib/query-client'

export { AUTH_QUERY_KEY } from '@/lib/auth-state'

/**
 * Backend membalas 403 dengan message MFA_REQUIRED saat sesi masih mfa_pending.
 * Dicek lewat status sekaligus isi pesan supaya tidak bergantung pada satu
 * perbandingan string persis.
 */
function isMfaRequiredError(err: unknown): boolean {
  const e = err as AxiosError<{ message?: string }>
  const status = e?.response?.status
  const message = String(e?.response?.data?.message ?? '').toUpperCase()

  if (!message.includes('MFA_REQUIRED')) return false
  return status === 403 || status === 401 || status === undefined
}

/**
 * Mengakhiri sesi di server lalu mengosongkan seluruh cache.
 * Sengaja melempar bila gagal — pemanggil yang memberi tahu user, karena
 * sebelumnya kegagalan ditelan dan logout yang gagal tetap dilaporkan sukses.
 */
export async function logout(): Promise<void> {
  await api.post('/admin/logout')
  queryClient.clear()
}

/**
 * Membuang jejak sesi tanpa memutus sesi di server. Dipakai saat user mundur
 * dari layar OTP: tanpa ini cache mfa_pending yang masih segar akan melempar
 * user balik ke /verify-otp.
 */
export async function abandonMfaSession(): Promise<void> {
  try {
    await api.post('/admin/logout')
  } catch {
    /* sesi memang sudah tidak berlaku — tidak ada yang perlu diberitahukan */
  }
  queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY })
}

export function useAuthUser() {
  const { data, isLoading, isError } = useQuery<AuthMe>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await api.get('/admin/me')
        return { user: res.data.data, mfa_pending: false }
      } catch (err) {
        if (isMfaRequiredError(err)) return { user: null, mfa_pending: true }
        throw err
      }
    },
    /**
     * 401/403 adalah jawaban pasti dan tidak perlu diulang. Sisanya (gangguan
     * jaringan, 5xx) boleh dicoba lagi supaya satu blip tidak melempar user
     * bersesi valid ke halaman login.
     */
    retry: (failureCount, error) => {
      const status = (error as AxiosError)?.response?.status
      if (status === 401 || status === 403) return false
      return failureCount < 2
    },
    staleTime: 30_000,
  })

  const isMfaRequired = data?.mfa_pending === true
  const isFullyAuthenticated = !!data?.user && !isMfaRequired

  return {
    isAuthenticated: isFullyAuthenticated,
    isMfaRequired,
    role: data?.user?.role ?? null,
    user: data?.user ?? null,
    isLoading,
    isError,
  }
}
