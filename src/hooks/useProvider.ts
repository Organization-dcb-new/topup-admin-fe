import { api } from '@/api/axios'
import type { ProviderResponse } from '@/types/provider'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export type ProviderPayload = {
  name: string
  code: string
  api_url: string
  api_key_encrypted: string
  priority: number
  config: string // JSON string
}

// Get All Categories
export const useGetProvider = () =>
  useQuery<ProviderResponse>({
    queryKey: ['providers'],
    queryFn: async () => {
      const res = await api.get('/providers')
      return res.data
    },
  })

export const createProvider = async (payload: ProviderPayload) => {
  const res = await api.post('/providers', payload)
  return res.data
}

export const updateProvider = async (id: string, payload: ProviderPayload) => {
  const res = await api.put(`/providers/${id}`, payload)
  return res.data
}

export const useCreateProvider = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ProviderPayload) => createProvider(payload),
    onSuccess: () => {
      toast.success('Provider created')
      queryClient.invalidateQueries({ queryKey: ['providers'] })
    },
    onError: () => {
      toast.error('Failed to create provider')
    },
  })
}

export const useUpdateProvider = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProviderPayload }) =>
      updateProvider(id, payload),
    onSuccess: () => {
      toast.success('Provider updated')
      queryClient.invalidateQueries({ queryKey: ['providers'] })
    },
    onError: () => {
      toast.error('Failed to update provider')
    },
  })
}
