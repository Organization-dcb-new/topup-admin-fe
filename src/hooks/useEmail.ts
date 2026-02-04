import { api } from '@/api/axios'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export const useResendVoucherCode = () => {
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/transactions/${id}/resend-order-email`)
      return res.data
    },
    onSuccess: () => {
      toast.success('Resend Email Voucher Code  successfully')
    },
    onError: () => {
      toast.error('Failed to Resend Email Voucher Code')
    },
  })

  return mutation
}

export const useResendEmail = () => {
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/transactions/${id}/resend-email`)
      return res.data
    },
    onSuccess: () => {
      toast.success('Resend Email  successfully')
    },
    onError: () => {
      toast.error('Failed to Resend Email')
    },
  })

  return mutation
}
