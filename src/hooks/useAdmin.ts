import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/axios";
import toast from "react-hot-toast";
import type { AdminResponse } from "@/types/admin";

export const useAdminData = (page: number, limit: number) => {
  return useQuery({
    queryKey: ["admin-users", page, limit],
    queryFn: async () => {
      const { data } = await api.get<AdminResponse>("/admin/users/get-all", {
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
      return api.patch(`/admin/users/${id}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role updated successfully");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Failed to update role"),
  });

  const deleteAdmin = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Admin deleted successfully");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Failed to delete admin"),
  });

  return { updateRole, deleteAdmin };
};
