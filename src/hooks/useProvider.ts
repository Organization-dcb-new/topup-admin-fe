import { api } from '@/api/axios'
import i18n from '@/i18n'
import type {
  LapakGamingBalanceResponse,
  PpobBalanceResponse,
  Provider,
  ProviderCreatePayload,
  ProviderResponse,
  ProviderUpdatePayload,
} from '@/types/provider'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export const providersQueryKey = ['providers'] as const

export const useGetProvider = () =>
  useQuery<ProviderResponse>({
    queryKey: providersQueryKey,
    queryFn: async () => {
      const res = await api.get('/providers')
      return res.data
    },
  })

export const useGetLapakGamingBalance = (enabled = true) =>
  useQuery<LapakGamingBalanceResponse>({
    queryKey: ['lapak-gaming-balance'],
    queryFn: async () => {
      const res = await api.get('/lapak-gaming/balance')
      return res.data
    },
    enabled,
    retry: 1,
  })

export const useGetPpobBalance = (enabled = true) =>
  useQuery<PpobBalanceResponse>({
    queryKey: ['ppob-balance'],
    queryFn: async () => {
      const res = await api.get('/providers/ppob/balance')
      return res.data
    },
    enabled,
    retry: 1,
  })

/** Everything PUT /providers/:id needs, taken from the provider as it is now. */
export function toProviderUpdate(provider: Provider): ProviderUpdatePayload {
  return {
    name: provider.name,
    api_url: provider.api_url,
    api_key_encrypted: provider.api_key_encrypted,
    status: provider.status,
    priority: provider.priority,
    config: JSON.stringify(provider.config ?? {}),
  }
}

/** Backend error text, for the few messages the form maps onto a field. */
export function providerErrorMessage(err: unknown) {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message
}

export function useCreateProvider(onDone?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ProviderCreatePayload) => {
      const res = await api.post('/providers/', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(i18n.t('providerPage.toasts.created'))
      void queryClient.invalidateQueries({ queryKey: providersQueryKey })
      onDone?.()
    },
  })
}

export function useUpdateProvider(onDone?: () => void, successKey = 'providerPage.toasts.updated') {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ProviderUpdatePayload }) => {
      const res = await api.put(`/providers/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(i18n.t(successKey))
      void queryClient.invalidateQueries({ queryKey: providersQueryKey })
      onDone?.()
    },
    onError: () => toast.error(i18n.t('providerPage.toasts.updateError')),
  })
}

export function useDeleteProvider() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/providers/${id}`),
    onSuccess: () => {
      toast.success(i18n.t('providerPage.toasts.deleted'))
      void queryClient.invalidateQueries({ queryKey: providersQueryKey })
    },
    onError: () => toast.error(i18n.t('providerPage.toasts.deleteError')),
  })
}
