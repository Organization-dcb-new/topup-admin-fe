import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 30000,
})

// Halaman yang menangani 401 sendiri: /login menampilkan error form,
// /verify-otp menampilkan pesan kode salah (BE membalas 401 untuk OTP/recovery yang keliru)
const authPages = ['/login', '/verify-otp']

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error is 401 Unauthorized, handle session expiration
    if (error.response?.status === 401 && !authPages.includes(window.location.pathname)) {
      window.location.href = '/login?session=expired'
    }
    return Promise.reject(error)
  }
)
