import axios from 'axios'

import { AUTH_QUERY_KEY, SESSION_DEAD } from '@/lib/auth-state'
import { queryClient } from '@/lib/query-client'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  /** Tanpa ini, request yang menggantung mengunci tombol login selamanya. */
  timeout: 30_000,
})

/**
 * Di endpoint ini 401 berarti "kredensial atau kode salah", bukan "sesi mati".
 * Pemanggilnya yang menampilkan pesan; interceptor tidak boleh ikut campur.
 */
const CREDENTIAL_ENDPOINTS = [
  '/admin/login',
  '/admin/verify-otp',
  '/admin/recover',
  '/admin/logout',
]

function isCredentialEndpoint(url: string | undefined): boolean {
  if (!url) return false
  return CREDENTIAL_ENDPOINTS.some((path) => url.includes(path))
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const url = error?.config?.url as string | undefined

    if (status === 401 && !isCredentialEndpoint(url)) {
      /**
       * Sesi benar-benar mati. Cukup tandai di cache — RoleGuard yang
       * memindahkan halaman lewat router. Navigasi dokumen di sini yang dulu
       * menyebabkan kedipan dan menghapus toast sebelum sempat terbaca.
       */
      queryClient.setQueryData(AUTH_QUERY_KEY, SESSION_DEAD)
    }

    return Promise.reject(error)
  }
)
