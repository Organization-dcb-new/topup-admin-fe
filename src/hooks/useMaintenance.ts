import { api } from '@/api/axios'
import i18n from '@/i18n'
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

export function useCreateMaintenance(onSuccessClose?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateMaintenancePayload) => {
      const res = await api.post('/maintenances/', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(i18n.t('maintenancePage.toasts.created'))
      void queryClient.invalidateQueries({ queryKey: maintenancesQueryKey })
      onSuccessClose?.()
    },
    onError: () => toast.error(i18n.t('maintenancePage.toasts.createError')),
  })
}

export function useUpdateMaintenance(onSuccessClose?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateMaintenancePayload }) => {
      const res = await api.patch(`/maintenances/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(i18n.t('maintenancePage.toasts.updated'))
      void queryClient.invalidateQueries({ queryKey: maintenancesQueryKey })
      onSuccessClose?.()
    },
    onError: () => toast.error(i18n.t('maintenancePage.toasts.updateError')),
  })
}

export function useDeleteMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/maintenances/${id}`)
    },
    onSuccess: () => {
      toast.success(i18n.t('maintenancePage.toasts.deleted'))
      void queryClient.invalidateQueries({ queryKey: maintenancesQueryKey })
    },
    onError: () => toast.error(i18n.t('maintenancePage.toasts.deleteError')),
  })
}
