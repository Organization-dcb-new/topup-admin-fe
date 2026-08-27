import axios from 'axios'
import { notifySessionExpired } from '@/lib/session-expiry'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 30000,
})

// Halaman yang menangani 401 sendiri: /login menampilkan error form,
// /verify-otp menampilkan pesan kode salah (BE membalas 401 untuk OTP/recovery yang keliru)
const authPages = ['/login', '/verify-otp']

// Endpoint yang 401-nya adalah jawaban yang diharapkan, bukan tanda sesi
// putus. `/admin/me` dipakai justru UNTUK menanyakan apakah sesi masih ada —
// menyeret user ke /login karena jawabannya "tidak ada" akan menutupi keadaan
// sebenarnya dan memunculkan toast "sesi berakhir" pada orang yang memang
// belum pernah login. Sisanya adalah endpoint yang memvalidasi kredensial.
const selfHandledEndpoints = [
  '/admin/me',
  '/admin/login',
  '/admin/verify-otp',
  '/admin/recover',
]

const isSelfHandled = (url: string | undefined) =>
  !!url && selfHandledEndpoints.some((endpoint) => url.startsWith(endpoint))

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 di sini berarti sesi yang tadinya sah sudah tidak berlaku lagi.
    // Penanganannya diserahkan ke router: lihat SessionExpiryWatcher.
    if (
      error.response?.status === 401 &&
      !authPages.includes(window.location.pathname) &&
      !isSelfHandled(error.config?.url)
    ) {
      notifySessionExpired()
    }
    return Promise.reject(error)
  }
)
