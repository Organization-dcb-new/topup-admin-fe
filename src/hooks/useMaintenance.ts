import { api } from '@/api/axios'
import type {
  CreateMaintenancePayload,
  MaintenanceListResponse,
  UpdateMaintenancePayload,
} from '@/types/maintenance'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export const maintenancesQueryKey = ['maintenances'] as const

export function useGetMaintenances() {
  return useQuery({
    queryKey: maintenancesQueryKey,
    queryFn: async (): Promise<MaintenanceListResponse> => {
      const res = await api.get('/maintenances/admin')
      return res.data
    },
  })
}

export function useCreateMaintenance(onSuccessClose: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateMaintenancePayload) => {
      const res = await api.post('/maintenances/', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Jadwal pemeliharaan dibuat')
      queryClient.invalidateQueries({ queryKey: maintenancesQueryKey })
      onSuccessClose()
    },
    onError: () => toast.error('Gagal membuat pemeliharaan'),
  })
}

export function useUpdateMaintenance(id: string, onSuccessClose?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateMaintenancePayload) => {
      const res = await api.patch(`/maintenances/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Pemeliharaan diperbarui')
      queryClient.invalidateQueries({ queryKey: maintenancesQueryKey })
      onSuccessClose?.()
    },
    onError: () => toast.error('Gagal memperbarui pemeliharaan'),
  })
}

export function useDeleteMaintenance(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await api.delete(`/maintenances/${id}`)
    },
    onSuccess: () => {
      toast.success('Pemeliharaan dihapus')
      queryClient.invalidateQueries({ queryKey: maintenancesQueryKey })
    },
    onError: () => toast.error('Gagal menghapus pemeliharaan'),
  })
}
