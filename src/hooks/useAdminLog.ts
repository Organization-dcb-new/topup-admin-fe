import { api } from '@/api/axios'
import type { AdminLogDetailResponse, AdminLogResponse } from '@/types/admin-log'
import { useQuery } from '@tanstack/react-query'

export function useGetAdminLogs(page: number, limit: number) {
  return useQuery({
    queryKey: ['admin-logs', page, limit],
    queryFn: async (): Promise<AdminLogResponse> => {
      const res = await api.get('/admin-logs/', {
        params: { page, limit },
      })
      return res.data
    },
  })
}

export function useGetAdminLogById(id?: string) {
  return useQuery({
    queryKey: ['admin-log-detail', id],
    queryFn: async () => {
      const res = await api.get<AdminLogDetailResponse>(`/admin-logs/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}
