import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/axios'
import type { AdminProfile, AdminProfileResponse } from '@/types/admin'

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

interface ProfileError {
  response?: { status?: number; data?: { message?: string } }
}

/** Sesi ada tapi OTP belum diverifikasi. BE membalasnya 403, bukan 401. */
const isMfaPending = (err: unknown) =>
  (err as ProfileError)?.response?.data?.message === 'MFA_REQUIRED'

/** Tidak ada sesi yang sah. */
const isUnauthenticated = (err: unknown) =>
  (err as ProfileError)?.response?.status === 401

interface Session {
  user: AdminProfile | null
  mfa_pending: boolean
}

const ANONYMOUS: Session = { user: null, mfa_pending: false }

export function useAuthUser() {
  const { data, isLoading, isError, refetch } = useQuery<Session>({
    queryKey: ['auth-me'],
    queryFn: async () => {
      try {
        const res = await api.get<AdminProfileResponse>('/admin/me')
        return { user: res.data.data, mfa_pending: false }
      } catch (err: unknown) {
        if (isMfaPending(err)) return { user: null, mfa_pending: true }
        // 401 adalah JAWABAN, bukan kegagalan: backend sudah memastikan tidak
        // ada sesi. Yang lolos ke `throw` hanyalah gangguan sungguhan —
        // jaringan putus, 5xx, timeout — dan itu wajib dibedakan. Kalau
        // keduanya disamakan, satu blip cukup untuk membuat guard menyimpulkan
        // "belum login" lalu melempar user ke /login padahal sesinya masih sah.
        if (isUnauthenticated(err)) return ANONYMOUS
        throw err
      }
    },
    // Blip sesaat tidak boleh berujung logout semu. Jedanya sengaja pendek:
    // halaman login menahan render form selama query ini berjalan.
    retry: 2,
    retryDelay: (attempt) => 400 * (attempt + 1),
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
    permissions: data?.user?.permissions ?? [],
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
