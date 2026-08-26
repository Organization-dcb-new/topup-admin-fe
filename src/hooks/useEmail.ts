import { api } from '@/api/axios'
import { apiErrorMessage } from '@/lib/api-error'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export const useResendVoucherCode = () => {
  const { t } = useTranslation('common')

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/transactions/${id}/resend-order-email`)
      return res.data
    },
    onSuccess: () => {
      toast.success(t('transactionDetail.resendVoucherSuccess'))
    },
    onError: (err: unknown) =>
      toast.error(apiErrorMessage(err, t('transactionDetail.resendVoucherError'))),
  })
}

export const useResendEmail = () => {
  const { t } = useTranslation('common')

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/transactions/${id}/resend-email`)
      return res.data
    },
    onSuccess: () => {
      toast.success(t('transactionDetail.resendEmailSuccess'))
    },
    onError: (err: unknown) =>
      toast.error(apiErrorMessage(err, t('transactionDetail.resendEmailError'))),
  })
}
