import { useMemo } from 'react'
import { useQuery, type QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { api, MFA_SETUP_REQUIRED_MESSAGE, REQUIRED_2FA_PATH } from '@/api/axios'
import { defaultPermissionsForRole } from '@/constants/permissions'

export const AUTH_ME_QUERY_KEY = ['auth-me']

export interface AuthSession {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- /admin/me profile is untyped across the app
  user: any
  mfa_pending: boolean
  /** Signed in with the password, but the account must set up 2FA before anything else opens. */
  mfa_setup: boolean
}

const SIGNED_OUT: AuthSession = { user: null, mfa_pending: false, mfa_setup: false }

export { REQUIRED_2FA_PATH }

/** Paths that must never be used as a post-login destination. */
const AUTH_PATHS = ['/login', '/verify-otp', REQUIRED_2FA_PATH]

export const authStorage = {
  getToken(): string | null {
    return null
  },
  setToken() {},
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
    const user = res.data.data
    return { user, mfa_pending: false, mfa_setup: user?.two_factor_setup_required === true }
  } catch (err) {
    if (isAxiosError(err) && err.response?.data?.message === 'MFA_REQUIRED') {
      return { user: null, mfa_pending: true, mfa_setup: false }
    }
    if (isAxiosError(err) && err.response?.data?.message === MFA_SETUP_REQUIRED_MESSAGE) {
      return { user: null, mfa_pending: false, mfa_setup: true }
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
  const isMfaSetupRequired = data?.mfa_setup === true
  const isFullyAuthenticated = !!data?.user && !isMfaRequired && !isMfaSetupRequired
  const role: string | null = data?.user?.role ?? null
  const reported: unknown = data?.user?.permissions

  // `/admin/me` lists effective permissions since RBAC; older backends only send the role slug.
  const permissions = useMemo<ReadonlySet<string>>(
    () => new Set(Array.isArray(reported) ? (reported as string[]) : defaultPermissionsForRole(role)),
    [reported, role]
  )

  return {
    isAuthenticated: isFullyAuthenticated,
    isMfaRequired,
    isMfaSetupRequired,
    role,
    user: data?.user ?? null,
    permissions,
    isLoading
  }
}
