import { api } from '@/api/axios'
import type {
  CreateReferralCodeRequest,
  ReferralCodeListResponse,
  UpdateReferralCodeRequest,
  ReferralCodeDetailResponse,
} from '@/types/referral'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
}

export const useGetReferralCodes = (params: { page: number; limit: number }) =>
  useQuery<ReferralCodeListResponse>({
    queryKey: ['referral-codes', params],
    queryFn: async () => {
      const res = await api.get('/admin/referral-codes', { params })
      return res.data
    },
  })

export const useCreateReferralCode = (onSuccessCallback?: () => void) => {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateReferralCodeRequest) => {
      const res = await api.post('/admin/referral-codes', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(t('referralToasts.createSuccess') || 'Referral code created successfully')
      queryClient.invalidateQueries({ queryKey: ['referral-codes'] })
      onSuccessCallback?.()
    },
    onError: (err: unknown) => {
      const e = err as ApiError
      const msg = e.response?.data?.message || t('referralToasts.createError') || 'Failed to create referral code'
      toast.error(msg)
    },
  })
}

export const useUpdateReferralCode = (onSuccessCallback?: () => void) => {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateReferralCodeRequest }) => {
      const res = await api.patch(`/admin/referral-codes/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success(t('referralToasts.updateSuccess') || 'Referral code updated successfully')
      queryClient.invalidateQueries({ queryKey: ['referral-codes'] })
      onSuccessCallback?.()
    },
    onError: (err: unknown) => {
      const e = err as ApiError
      const msg = e.response?.data?.message || t('referralToasts.updateError') || 'Failed to update referral code'
      toast.error(msg)
    },
  })
}

export const useDeleteReferralCode = () => {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/referral-codes/${id}`)
      return res.data
    },
    onSuccess: () => {
      toast.success(t('referralToasts.deleteSuccess') || 'Referral code deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['referral-codes'] })
    },
    onError: (err: unknown) => {
      const e = err as ApiError
      const msg = e.response?.data?.message || t('referralToasts.deleteError') || 'Failed to delete referral code'
      toast.error(msg)
    },
  })
}

export const useGetReferralCodeById = (id?: string) =>
  useQuery<ReferralCodeDetailResponse>({
    queryKey: ['referral-codes', id],
    queryFn: async () => {
      const res = await api.get(`/admin/referral-codes/${id}`)
      return res.data
    },
    enabled: !!id,
  })
