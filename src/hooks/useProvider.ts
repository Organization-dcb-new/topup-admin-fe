import { api } from '@/api/axios'
import type { Provider, ProviderPayload, ProviderResponse } from '@/types/provider'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

// Get All Categories
export const useGetProvider = () =>
  useQuery<ProviderResponse>({
    queryKey: ['providers'],
    queryFn: async () => {
      const res = await api.get('/providers')
      return res.data
    },
  })

export const useUpdateProvider = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Provider }) => {
      const res = await api.put(`/providers/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Provider updated')
      queryClient.invalidateQueries({ queryKey: ['providers'] })
    },
    onError: () => {
      toast.error('Failed to update provider')
    },
  })
}

export const useDeleteProvider = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/providers/${id}`)
      return res.data
    },
    onSuccess: () => {
      toast.success('Provider Deleted')
      queryClient.invalidateQueries({ queryKey: ['providers'] })
    },
    onError: () => {
      toast.error('Failed to deleted provider')
    },
  })
}

interface CreateProviderProps {
  setOpen: (open: boolean) => void
}

export const useCreateProvider = ({ setOpen }: CreateProviderProps) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ProviderPayload) => {
      const res = await api.post('/providers/', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Provider Created')
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      setOpen(false)
    },
    onError: () => {
      toast.error('Failed to Create provider')
    },
  })
}
