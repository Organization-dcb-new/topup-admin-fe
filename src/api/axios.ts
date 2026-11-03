import axios from 'axios'

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
    return Promise.reject(error)
  }
)
