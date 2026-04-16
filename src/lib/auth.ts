import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/axios";
import type { AdminUser } from "@/types/admin";
import toast from "react-hot-toast";

export const AUTH_ME_QUERY_KEY = ["auth-me"] as const;

export type AuthSession = {
  user: AdminUser | null;
  mfa_pending: boolean;
};

export async function fetchAuthSession(): Promise<AuthSession> {
  try {
    const res = await api.get<{ data: AdminUser }>("/admin/me");
    return { user: res.data.data, mfa_pending: false };
  } catch (err: unknown) {
    const e = err as {
      response?: { status?: number; data?: { message?: string } };
    };
    if (e.response?.data?.message === "MFA_REQUIRED") {
      return { user: null, mfa_pending: true };
    }
    if (e.response?.status === 401) {
      return { user: null, mfa_pending: false };
    }
    throw err;
  }
}

export const authStorage = {
  getToken(): string | null {
    return null;
  },
  setToken(_token: string) {},
  clearToken() {
    api.post("/admin/logout").catch(() => {});
  },
}

export async function logout(): Promise<void> {
  try {
    authStorage.clearToken()
    toast.success('Berhasil logout')
    window.location.href = '/login'
  } catch (error) {
    console.error(error)
    toast.error('Gagal logout, coba lagi!')
  }
}

export function useAuthUser() {
  const { data, isLoading, error: _error } = useQuery({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: fetchAuthSession,
    retry: false,
    staleTime: 30000,
  });

  const isMfaRequired = data?.mfa_pending === true;
  const isFullyAuthenticated = !!data?.user && !isMfaRequired;

  return {
    isAuthenticated: isFullyAuthenticated,
    isMfaRequired,
    role: data?.user?.role ?? null,
    user: data?.user ?? null,
    isLoading
  };
}
