import { api } from '@/api/axios'
import i18n from '@/i18n'
import type {
  PaymentResponse,
  TransactionDetail,
  TransactionExportFilters,
  TransactionListFilters,
} from '@/types/transaction'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export const transactionsQueryKey = ['transactions'] as const

function pickNonEmpty(params: Record<string, string | number | undefined>) {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
}

export const useGetTransactions = (filters: TransactionListFilters, refetchInterval: number | false = 10_000) => {
  const params = pickNonEmpty({
    page: filters.page,
    limit: filters.limit,
    search: filters.search?.trim(),
    start_date: filters.startDate,
    end_date: filters.endDate,
    game_id: filters.gameId,
    payment_method_id: filters.paymentMethodId,
    status: filters.status,
    price_above: filters.priceAbove,
    price_below: filters.priceBelow,
    price: filters.price,
  })

  return useQuery({
    queryKey: [...transactionsQueryKey, params],
    queryFn: async (): Promise<PaymentResponse> => {
      const res = await api.get('/transactions', { params })
      return res.data
    },
    // Keep the current page on screen while a new filter or page loads.
    placeholderData: keepPreviousData,
    refetchInterval,
    refetchIntervalInBackground: false,
  })
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isTransactionId(id: string | undefined): id is string {
  return !!id && UUID_RE.test(id)
}

/** The backend answers a missing payment with a 500 carrying gorm's "record not found". */
export function isNotFoundError(err: unknown) {
  const res = (err as { response?: { status?: number; data?: { message?: string } } })?.response
  return res?.status === 404 || /not found/i.test(res?.data?.message ?? '')
}

export const useTransactionDetail = (id: string | undefined) =>
  useQuery({
    queryKey: ['transaction-detail', id],
    queryFn: async (): Promise<TransactionDetail> => {
      const res = await api.get(`/transactions/detail/${id}`)
      return res.data.data
    },
    // Bad ids never reach the backend (it answers them with a 500 too).
    enabled: isTransactionId(id),
    retry: (count, err) => !isNotFoundError(err) && count < 2,
  })

function filenameFrom(disposition: string | undefined) {
  const match = disposition?.match(/filename="?([^"]+)"?/)
  return match?.[1] ?? 'payments_export.csv'
}

export const useExportTransactions = (onDone?: () => void) =>
  useMutation({
    mutationFn: async (filters: TransactionExportFilters) => {
      const res = await api.get('/transactions/export-csv', {
        params: pickNonEmpty({
          start_date: filters.startDate,
          end_date: filters.endDate,
          status: filters.status,
          payment_method_id: filters.paymentMethodId,
        }),
        responseType: 'blob',
      })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8' }))
      const link = document.createElement('a')
      link.href = url
      link.download = filenameFrom(res.headers['content-disposition'])
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    },
    onSuccess: () => {
      toast.success(i18n.t('transactionPage.export.success'))
      onDone?.()
    },
    onError: () => toast.error(i18n.t('transactionPage.export.error')),
  })
