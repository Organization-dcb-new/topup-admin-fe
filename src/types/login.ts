export interface LoginRequest {
  email_or_username: string
  password: string
}

export interface LoginResponse {
  message: string
  status: 'success' | 'error'
  /**
   * Autentikasi memakai cookie httpOnly; field ini tidak selalu ada dan tidak
   * dipakai klien. Dibiarkan opsional agar tipe tidak menjanjikan yang tidak ada.
   */
  token?: string
}
