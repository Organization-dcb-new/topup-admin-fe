import { api } from '@/api/axios'
import i18n from '@/i18n'
import { apiErrorMessage } from '@/hooks/useIntegrationLog'
import type {
  Provider,
  ProviderBalance,
  ProviderRegions,
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

export const providerRegionsKey = (id: string | undefined) => ['provider-regions', id] as const

/** Every country the supplier sells for, with what is stored for each (GET /providers/:id/regions). */
export const useProviderRegions = (id: string | undefined) =>
  useQuery<ProviderRegions>({
    queryKey: providerRegionsKey(id),
    queryFn: async () => {
      const res = await api.get(`/providers/${id}/regions`)
      return res.data.data
    },
    enabled: !!id,
  })

/**
 * Sets the countries the catalog sync pulls (PUT /providers/:id/regions). Only the config's
 * "regions" changes; the backend keeps the rest of it.
 */
export function useUpdateProviderRegions(onDone?: (saved: ProviderRegions) => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, regions }: { id: string; regions: string[] }) => {
      const res = await api.put(`/providers/${id}/regions`, { regions })
      return res.data.data as ProviderRegions
    },
    onSuccess: (saved, { id }) => {
      toast.success(i18n.t('providerPage.regions.toasts.saved'))
      queryClient.setQueryData(providerRegionsKey(id), saved)
      // The provider cards and the supplier catalog's region filter read the provider's config.
      void queryClient.invalidateQueries({ queryKey: providersQueryKey })
      onDone?.(saved)
    },
    onError: (err) => toast.error(apiErrorMessage(err) ?? i18n.t('providerPage.regions.toasts.saveError')),
  })
}
