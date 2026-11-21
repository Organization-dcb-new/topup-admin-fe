import { api } from '@/api/axios'
import i18n from '@/i18n'
import type {
  PaymentResponse,
  TransactionDetail,
  TransactionExportFilters,
  TransactionListFilters,
  TransactionReveal,
} from '@/types/transaction'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
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
    // Auto refresh retries anyway; one retry keeps a failure from hiding behind a skeleton for seconds.
    retry: 1,
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
    // Stay live while the customer can still pay or the provider is still delivering.
    refetchInterval: (query) => (isInFlight(query.state.data) ? 10_000 : false),
    refetchIntervalInBackground: false,
  })

const OPEN_PAYMENT = ['PENDING', 'WAITING', 'PROCESSING']
const OPEN_FULFILMENT = ['PENDING', 'PAID', 'PROCESSING']

/** Payment still open, or paid and not yet delivered or failed. */
export function isInFlight(detail: TransactionDetail | undefined) {
  if (!detail) return false
  if (OPEN_PAYMENT.includes(detail.status)) return true
  return detail.status === 'PAID' && OPEN_FULFILMENT.includes(detail.order?.status ?? '')
}

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

/** The backend's own words, except RBAC refusals: the axios interceptor already says those. */
function errorMessage(err: unknown, fallbackKey: string) {
  if (isAxiosError(err)) {
    const message = err.response?.data?.message
    if (err.response?.status === 403 && message === 'access denied: insufficient permissions') return undefined
    if (typeof message === 'string' && message) return message
  }
  return i18n.t(fallbackKey)
}

/**
 * Sends a paid order whose supplier order failed (FULFILMENT_FAILED) to the supplier again. A 409
 * ("Order is not waiting for a retry") is shown as the backend words it.
 */
export const useRetryFulfilment = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<{ data: { status: string } }>(`/transactions/detail/${id}/retry-fulfilment`)
      return res.data.data
    },
    onSuccess: (data) => {
      const status = data?.status
        ? i18n.t(`transactionDetailPage.orderStatus.${data.status}`, { defaultValue: data.status })
        : ''
      toast.success(
        status
          ? i18n.t('transactionDetailPage.retryFulfilment.successStatus', { status })
          : i18n.t('transactionDetailPage.retryFulfilment.success')
      )
    },
    onError: (err) => {
      const message = errorMessage(err, 'transactionDetailPage.retryFulfilment.error')
      if (message) toast.error(message)
    },
    // Either way the order may have moved on; show where it stands now.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['transaction-detail', id] })
      void queryClient.invalidateQueries({ queryKey: transactionsQueryKey })
    },
  })
}

/**
 * The real voucher codes, buyer email, IP and game account of one transaction. Kept out of the query
 * cache on purpose: the page holds them for as long as it is open, and every call is logged.
 */
export const useRevealTransaction = (id: string) =>
  useMutation({
    mutationFn: async () => {
      const res = await api.post<{ data: TransactionReveal }>(`/transactions/detail/${id}/reveal`)
      return res.data.data
    },
    onError: (err) => {
      const message = errorMessage(err, 'transactionDetailPage.reveal.error')
      if (message) toast.error(message)
    },
  })
