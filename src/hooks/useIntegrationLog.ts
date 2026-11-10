import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/api/axios'
import type {
  ListResponse,
  PaymentCallbackLog,
  PaymentCallbackLogDetail,
  PaymentCallbackLogFilters,
  ProviderOrderLog,
  ProviderOrderLogDetail,
  ProviderOrderLogFilters,
  ProviderOrderStatus,
} from '@/types/integration-log'

export const usePaymentCallbackLogs = (filters: PaymentCallbackLogFilters, enabled = true) =>
  useQuery({
    queryKey: ['payment-callback-logs', filters],
    queryFn: async (): Promise<ListResponse<PaymentCallbackLog>> => {
      const res = await api.get('/payment-callback/logs', {
        params: {
          page: filters.page,
          limit: filters.limit,
          search: filters.search || undefined,
          outcome: filters.outcome || undefined,
          status: filters.status || undefined,
          order_id: filters.orderId || undefined,
          start_date: filters.startDate || undefined,
          end_date: filters.endDate || undefined,
        },
      })
      return res.data
    },
    enabled,
    // Keep the current page on screen while a new filter loads.
    placeholderData: keepPreviousData,
  })

export const usePaymentCallbackLog = (id: string) =>
  useQuery({
    queryKey: ['payment-callback-log', id],
    queryFn: async (): Promise<PaymentCallbackLogDetail> => {
      const res = await api.get(`/payment-callback/logs/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })

export const useProviderOrderLogs = (filters: ProviderOrderLogFilters, enabled = true) =>
  useQuery({
    queryKey: ['provider-order-logs', filters],
    queryFn: async (): Promise<ListResponse<ProviderOrderLog>> => {
      const res = await api.get('/provider-order-logs', {
        params: {
          page: filters.page,
          limit: filters.limit,
          search: filters.search || undefined,
          operation: filters.operation || undefined,
          result: filters.result || undefined,
          order_id: filters.orderId || undefined,
          start_date: filters.startDate || undefined,
          end_date: filters.endDate || undefined,
        },
      })
      return res.data
    },
    enabled,
    placeholderData: keepPreviousData,
  })

export const useProviderOrderLog = (id: string) =>
  useQuery({
    queryKey: ['provider-order-log', id],
    queryFn: async (): Promise<ProviderOrderLogDetail> => {
      const res = await api.get(`/provider-order-logs/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })

/** Asks LapakGaming for the order's live status. The check itself is logged, so the order's logs refresh after it. */
export const useCheckProviderStatus = (orderId: string | undefined) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (): Promise<ProviderOrderStatus> => {
      const res = await api.post(`/provider-order-logs/orders/${orderId}/check-status`)
      return res.data.data
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['provider-order-logs'] }),
  })
}

/** The backend's message for a failed request, if it sent one. */
export function apiErrorMessage(err: unknown): string | undefined {
  const message = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message
  return typeof message === 'string' && message ? message : undefined
}
