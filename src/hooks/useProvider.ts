import { api } from '@/api/axios'
import type {
  LapakGamingBalanceResponse,
  Provider,
  ProviderPayload,
  ProviderResponse,
} from '@/types/provider'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

// Get All Categories
export const useGetProvider = () =>
  useQuery<ProviderResponse>({
    queryKey: ['providers'],
    queryFn: async () => {
      const res = await api.get('/providers')
      return res.data
    },
  })

// Get Lapak Gaming balance
export const useGetLapakGamingBalance = () =>
  useQuery<LapakGamingBalanceResponse>({
    queryKey: ['lapak-gaming-balance'],
    queryFn: async () => {
      const res = await api.get('/lapak-gaming/balance')
      return res.data
    },
  })

export const useUpdateProvider = () => {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Provider }) => {
      const res = await api.put(`/providers/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(t('providerToasts.updateSuccess'))
      queryClient.invalidateQueries({ queryKey: ['providers'] })
    },
    onError: () => {
      toast.error(t('providerToasts.updateError'))
    },
  })
}

export const useDeleteProvider = (id: string) => {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/providers/${id}`)
      return res.data
    },
    onSuccess: () => {
      toast.success(t('providerToasts.deleteSuccess'))
      queryClient.invalidateQueries({ queryKey: ['providers'] })
    },
    onError: () => {
      toast.error(t('providerToasts.deleteError'))
    },
  })
}

interface CreateProviderProps {
  setOpen: (open: boolean) => void
}

export const useCreateProvider = ({ setOpen }: CreateProviderProps) => {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ProviderPayload) => {
      const res = await api.post('/providers/', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(t('providerToasts.createSuccess'))
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      setOpen(false)
    },
    onError: () => {
      toast.error(t('providerToasts.createError'))
    },
  })
}
