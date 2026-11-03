import { api } from '@/api/axios'
import type {
  ProductCallbackLogFilters,
  ProductCallbackLogListResponse,
  ProductCallbackLogResponse,
} from '@/types/product_callback_log'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

export const useGetProductCallbackLogs = (filters: ProductCallbackLogFilters) =>
  useQuery({
    queryKey: ['product-callback-logs', filters],
    queryFn: async (): Promise<ProductCallbackLogListResponse> => {
      const res = await api.get('/products/callback-logs', {
        params: {
          page: filters.page,
          limit: filters.limit,
          start_date: filters.startDate || undefined,
          end_date: filters.endDate || undefined,
          search: filters.search || undefined,
          status: filters.status || undefined,
          min_price: filters.minPrice || undefined,
          max_price: filters.maxPrice || undefined,
          sort_by: filters.sortBy || undefined,
          sort_order: filters.sortOrder || undefined,
        },
      })
      return res.data
    },
    // Keep the current page on screen while a new filter loads.
    placeholderData: keepPreviousData,
  })

export const useGetProductCallbackLogById = (id: string) =>
  useQuery({
    queryKey: ['product-callback-log', id],
    queryFn: async (): Promise<{ message: string; data: ProductCallbackLogResponse }> => {
      const res = await api.get(`/products/callback-logs/${id}`)
      return res.data
    },
    enabled: !!id,
  })
