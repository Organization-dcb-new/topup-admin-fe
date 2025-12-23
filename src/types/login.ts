export interface LoginRequest {
  email_or_username: string
  password: string
}

export interface LoginResponse {
  message: string
  status: 'success' | 'error'
  token: string
}
