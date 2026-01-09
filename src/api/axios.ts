import { authStorage } from '@/lib/auth'
import axios from 'axios'

// Dev
export const api = axios.create({
  baseURL: 'https://dev-api.pakargaming.id/v1',
})

// Local
// export const api = axios.create({
//   baseURL: 'https://dev-api.pakargaming.id/v1',
// })

function isTokenExpired(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return Date.now() >= payload.exp * 1000
  } catch {
    return true
  }
}

api.interceptors.request.use((config) => {
  const token = authStorage.getToken()

  if (token) {
    if (isTokenExpired(token)) {
      authStorage.clearToken()
      window.location.href = '/login'
      return Promise.reject(new Error('Token expired'))
    }

    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
