import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/axios'

// Recovery code digenerate BE dalam huruf besar dan dibandingkan
// case-sensitive, jadi input user dinormalisasi dulu sebelum dikirim
export const normalizeRecoveryCode = (code: string) => code.trim().toUpperCase()

// Sesi murni berbasis cookie httpOnly yang dikelola BE — FE tidak pernah
// menyimpan token, cukup memanggil endpoint logout untuk mengakhiri sesi.
// Sengaja melempar error: kalau permintaan gagal, cookie sesi masih hidup dan
// pemanggil berhak tahu alih-alih mengira sudah keluar.
export async function apiLogout(): Promise<void> {
  await api.post('/admin/logout')
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
