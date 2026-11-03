export interface LoginRequest {
  email_or_username: string
  password: string
}

/** The session itself is set as an httpOnly cookie, so the body carries no token. */
export interface LoginResponse {
  message: string
  status: 'success' | 'error'
  data: null
}
