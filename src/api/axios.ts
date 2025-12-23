import { authStorage } from '@/lib/auth'
import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://103.119.54.139:4444/v1',
})

api.interceptors.request.use((config) => {
  const token = authStorage.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
