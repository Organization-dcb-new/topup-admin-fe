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

/** Where an admin who must set up 2FA first is sent; only /admin/me and the 2FA setup work until then. */
export const REQUIRED_2FA_PATH = '/2fa-required'

/** The backend's answer to every other admin route while that setup is pending. */
export const MFA_SETUP_REQUIRED_MESSAGE = 'Two-factor setup required'

/** Auth pages handle their own 401s (a wrong OTP answers 401), so they must not trigger the global redirect. */
const AUTH_PAGES = ['/login', '/verify-otp', REQUIRED_2FA_PATH]

function currentPath() {
  return encodeURIComponent(window.location.pathname + window.location.search)
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error is 401 Unauthorized, handle session expiration
    if (
      error.response?.status === 401 &&
      !error.config?.skipAuthRedirect &&
      !AUTH_PAGES.includes(window.location.pathname)
    ) {
      window.location.href = `/login?redirect=${currentPath()}`
    }
    // The account must set up 2FA before anything else answers; the setup page brings the admin back.
    if (
      error.response?.status === 403 &&
      error.response.data?.message === MFA_SETUP_REQUIRED_MESSAGE &&
      !AUTH_PAGES.includes(window.location.pathname)
    ) {
      window.location.href = `${REQUIRED_2FA_PATH}?redirect=${currentPath()}`
    }
    // RBAC refusal (not the MFA gates, which are also 403s). One shared toast id, so a page whose
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
