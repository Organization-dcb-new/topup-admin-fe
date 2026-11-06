import { api } from '@/api/axios'
import i18n from '@/i18n'
import type {
  Provider,
  ProviderBalance,
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

/** Our deposit at the provider's supplier, asked live from the supplier whenever the card loads. */
export const useProviderBalance = (id: string, enabled: boolean) =>
  useQuery<ProviderBalance>({
    queryKey: ['provider-balance', id],
    queryFn: async () => {
      const res = await api.get(`/providers/${id}/balance`)
      return res.data.data
    },
    enabled,
    retry: 1,
  })

/** Everything PUT /providers/:id needs, taken from the provider as it is now. */
export function toProviderUpdate(provider: Provider): ProviderUpdatePayload {
  return {
    api_url: provider.api_url,
    status: provider.status,
    priority: provider.priority,
    config: JSON.stringify(provider.config ?? {}),
  }
}

/** Providers are only read and edited here: the backend creates them from its supplier integrations and never deletes them. */
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
