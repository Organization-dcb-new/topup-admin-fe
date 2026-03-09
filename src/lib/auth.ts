const TOKEN_KEY = "access_token";

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },
};

export function isAuthenticated(): boolean {
  return !!authStorage.getToken();
}

export function useAuth() {
  const token = authStorage.getToken();

  return {
    isAuthenticated: !!token,
  };
}

export type JwtPayload = {
  admin_id: string;
  email: string;
  role: "admin" | "noc";
  status: "full" | "mfa_pending";
  exp: number;
  iat: number;
};

export function decodeJwt<T = any>(token: string): T | null {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function useAuthUser() {
  const token = authStorage.getToken();
  const payload = token ? decodeJwt<JwtPayload>(token) : null;

  const isFullyAuthenticated = !!token && payload?.status === "full";

  const isMfaRequired = !!token && payload?.status === "mfa_pending";

  return {
    isAuthenticated: isFullyAuthenticated,
    isMfaRequired: isMfaRequired,
    role: payload?.role ?? null,
    user: payload,
    token,
  };
}
