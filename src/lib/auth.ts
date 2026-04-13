import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/axios";

export const authStorage = {
  getToken(): string | null {
    return null;
  },
  setToken(_token: string) {},
  clearToken() {
    api.post("/admin/logout").catch(() => {});
  },
};

export function useAuthUser() {
  const { data, isLoading, error: _error } = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/me');
        return { user: res.data.data, mfa_pending: false };
      } catch (err: any) {
        if (err.response?.data?.message === "MFA_REQUIRED") {
          return { user: null, mfa_pending: true };
        }
        throw err;
      }
    },
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
