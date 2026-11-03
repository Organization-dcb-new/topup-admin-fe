import { useQuery, type QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { api } from '@/api/axios'

export const AUTH_ME_QUERY_KEY = ['auth-me']

export interface AuthSession {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- /admin/me profile is untyped across the app
  user: any
  mfa_pending: boolean
}

const SIGNED_OUT: AuthSession = { user: null, mfa_pending: false }

/** Paths that must never be used as a post-login destination. */
const AUTH_PATHS = ['/login', '/verify-otp']

export const authStorage = {
  getToken(): string | null {
    return null
  },
  setToken(_token: string) {},
  async clearToken(): Promise<void> {
    try {
      await api.post('/admin/logout')
    } catch {
      /* ignore */
    }
  },
}

export async function fetchAuthSession(): Promise<AuthSession> {
  try {
    const res = await api.get('/admin/me')
    return { user: res.data.data, mfa_pending: false }
  } catch (err) {
    if (isAxiosError(err) && err.response?.data?.message === 'MFA_REQUIRED') {
      return { user: null, mfa_pending: true }
    }
    throw err
  }
}

/**
 * Re-reads the session from the server. A failed check is cached as signed out,
 * because React Query would otherwise keep serving the last successful session.
 */
export async function refreshAuthSession(queryClient: QueryClient): Promise<AuthSession> {
  try {
    return await queryClient.fetchQuery({
      queryKey: AUTH_ME_QUERY_KEY,
      queryFn: fetchAuthSession,
      staleTime: 0,
    })
  } catch {
    queryClient.setQueryData(AUTH_ME_QUERY_KEY, SIGNED_OUT)
    return SIGNED_OUT
  }
}

/** Ends the server session and updates the cache, so auth pages don't redirect on a stale session. */
export async function clearAuthSession(queryClient: QueryClient): Promise<void> {
  await authStorage.clearToken()
  queryClient.setQueryData(AUTH_ME_QUERY_KEY, SIGNED_OUT)
}

/** Accepts only in-app paths as a post-login destination, blocking open redirects such as `//evil.com`. */
export function getSafeRedirect(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return '/'
  }
  const pathname = value.split(/[?#]/)[0]
  return AUTH_PATHS.includes(pathname) ? '/' : value
}

export function withRedirect(path: string, redirectTo: string): string {
  return redirectTo === '/' ? path : `${path}?redirect=${encodeURIComponent(redirectTo)}`
}

export function useAuthUser() {
  const { data, isLoading } = useQuery({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: fetchAuthSession,
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
