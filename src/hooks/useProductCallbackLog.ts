import { api } from '@/api/axios'
import type { ProductCallbackLogListResponse, ProductCallbackLogResponse } from '@/types/product_callback_log'
import { useQuery } from '@tanstack/react-query'

export const useGetProductCallbackLogs = (
  page: number,
  limit: number,
  startDate?: string,
  endDate?: string,
  search?: string,
  status?: string,
  minPrice?: string,
  maxPrice?: string,
  sortBy?: string,
  sortOrder?: string,
) => {
  return useQuery({
    queryKey: [
      'product-callback-logs',
      page,
      limit,
      startDate,
      endDate,
      search,
      status,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
    ],
    queryFn: async (): Promise<ProductCallbackLogListResponse> => {
      const res = await api.get('/products/callback-logs', {
        params: {
          page,
          limit,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          search: search || undefined,
          status: status || undefined,
          min_price: minPrice || undefined,
          max_price: maxPrice || undefined,
          sort_by: sortBy || undefined,
          sort_order: sortOrder || undefined,
        },
      })
      return res.data
    },
  })
}

export const useGetProductCallbackLogById = (id: string) => {
  return useQuery({
    queryKey: ['product-callback-log', id],
    queryFn: async (): Promise<{ message: string; data: ProductCallbackLogResponse }> => {
      const res = await api.get(`/products/callback-logs/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}
