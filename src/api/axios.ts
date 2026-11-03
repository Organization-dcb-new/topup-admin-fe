import axios from 'axios'
import toast from 'react-hot-toast'

import i18n from '@/i18n'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Handle a 401 in the caller instead of redirecting to /login, e.g. a wrong 2FA code. */
    skipAuthRedirect?: boolean
  }
}

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

/** Auth pages handle their own 401s (a wrong OTP answers 401), so they must not trigger the global redirect. */
const AUTH_PAGES = ['/login', '/verify-otp']

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error is 401 Unauthorized, handle session expiration
    if (
      error.response?.status === 401 &&
      !error.config?.skipAuthRedirect &&
      !AUTH_PAGES.includes(window.location.pathname)
    ) {
      const redirect = encodeURIComponent(window.location.pathname + window.location.search)
      window.location.href = `/login?redirect=${redirect}`
    }
    // RBAC refusal (not the MFA gate, which is also a 403). One shared toast id, so a page whose
    // queries all fail says it once.
    if (
      error.response?.status === 403 &&
      error.response.data?.message === 'access denied: insufficient permissions'
    ) {
      toast.error(i18n.t('authErrors.forbidden'), { id: 'forbidden' })
    }
    return Promise.reject(error)
  }
)
