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
  const { data, isLoading, isError, refetch } = useQuery({
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
    /**
     * Slug role. Hanya untuk keperluan tampilan/diagnostik — JANGAN dipakai
     * untuk menentukan hak akses. Sejak RBAC, gating memakai `permissions`.
     */
    role: data?.user?.role ?? null,
    roleName: data?.user?.role_name ?? null,
    /** Hak akses efektif. Satu-satunya sumber kebenaran untuk gating. */
    permissions: (data?.user?.permissions ?? []) as string[],
    user: data?.user ?? null,
    isLoading,
    /** Profil gagal dimuat. Halaman yang menyimpulkan status dari `user`
     *  harus membedakannya dari "data ada tapi nilainya false". */
    isError,
    /** Sengaja bertipe sederhana: pemanggil hanya butuh "coba lagi". */
    refetchProfile: (): void => {
      void refetch()
    },
  }
}
