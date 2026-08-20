/**
 * Dipisah dari `@/lib/auth` supaya `@/api/axios` bisa memakainya tanpa
 * membuat siklus impor (auth.ts sendiri mengimpor api).
 */
export const AUTH_QUERY_KEY = ['auth-me'] as const

export interface AuthUser {
  role?: string | null
  two_factor_enabled?: boolean
  [key: string]: unknown
}

export interface AuthMe {
  user: AuthUser | null
  mfa_pending: boolean
}

/** Bentuk data untuk "sesi sudah tidak valid" — bukan loading, bukan MFA. */
export const SESSION_DEAD: AuthMe = { user: null, mfa_pending: false }
