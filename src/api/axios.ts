import { authStorage } from '@/lib/auth'
import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://127.0.0.1:4000/v1',
})

api.interceptors.request.use((config) => {
  const token = authStorage.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
