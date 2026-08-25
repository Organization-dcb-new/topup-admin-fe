import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/axios'
import toast from 'react-hot-toast'
import { apiErrorMessage } from '@/lib/api-error'
import type { AdminBriefListResponse, AdminResponse } from '@/types/admin'

/** Daftar admin ringkas (id + name) untuk filter, dll. */
export function useGetAdminBrief() {
  return useQuery({
    queryKey: ['admin-brief'],
    queryFn: async () => {
      const { data } = await api.get<AdminBriefListResponse>('/admin/brief')
      return data.data ?? []
    },
    staleTime: 60_000,
  })
}

export const useAdminData = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['admin-users', page, limit],
    queryFn: async () => {
      const { data } = await api.get<AdminResponse>('/admin/users/', {
        params: { page, limit },
      })
      return data
    },
  })
}

export const useAdminMutation = () => {
  const queryClient = useQueryClient()

  // Backend mendaftarkan endpoint ini sebagai PUT, bukan PATCH.
  // Sebelumnya FE mengirim PATCH dan selalu ditolak 405.
  const updateRole = useMutation({
    mutationFn: async ({ id, roleId }: { id: string; roleId: string }) => {
      return api.put(`/admin/users/${id}`, { role_id: roleId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      // Hak akses bisa berubah untuk diri sendiri juga.
      queryClient.invalidateQueries({ queryKey: ['auth-me'] })
      toast.success('Peran berhasil diperbarui')
    },
    onError: (err: unknown) => toast.error(apiErrorMessage(err, 'Gagal memperbarui peran')),
  })

  const deleteAdmin = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/admin/users/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('Admin berhasil dihapus')
    },
    onError: (err: unknown) => toast.error(apiErrorMessage(err, 'Gagal menghapus admin')),
  })

  return { updateRole, deleteAdmin }
}
