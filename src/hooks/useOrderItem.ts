import { api } from '@/api/axios'
import type { OrderItemResponses } from '@/types/order-item'
import { useQuery } from '@tanstack/react-query'

export function useGetOrderItem(page: number, limit: number) {
  return useQuery<OrderItemResponses>({
    queryKey: ['order-items', page, limit],
    queryFn: async () => {
      const { data } = await api.get('/orders/order-item', {
        params: {
          page,
          limit,
        },
      })
      return data
    },
  })
}
