const TOKEN_KEY = 'access_token'

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY)
  },
}

export function isAuthenticated(): boolean {
  return !!authStorage.getToken()
}

export function useAuth() {
  const token = authStorage.getToken()

  return {
    isAuthenticated: !!token,
  }
}
