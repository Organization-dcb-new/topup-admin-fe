import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/axios";
import toast from "react-hot-toast";
import type { AdminResponse } from "@/types/admin";

export const useAdminData = (page: number, limit: number) => {
  return useQuery({
    queryKey: ["admin-users", page, limit],
    queryFn: async () => {
      const { data } = await api.get<AdminResponse>("/admin/users/", {
        params: { page, limit },
      });
      return data;
    },
  });
};

export const useAdminMutation = () => {
  const queryClient = useQueryClient();

  const updateRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      return api.patch(`/admin/users/${id}`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Peran berhasil diperbarui");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Gagal memperbarui peran");
    },
  });

  const deleteAdmin = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Admin berhasil dihapus");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Gagal menghapus admin");
    },
  });

  return { updateRole, deleteAdmin };
};
