import { api } from '@/api/axios'
import type { OrderItemListResponse, OrderSort } from '@/types/order-item'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'

export const orderItemsQueryKey = ['order-items'] as const

async function fetchOrderItems(page: number, limit: number): Promise<OrderItemListResponse> {
  const { data } = await api.get('/orders/order-item', { params: { page, limit } })
  return data
}

function newestFirst(res: OrderItemListResponse): OrderItemListResponse {
  return { ...res, data: [...(res.data ?? [])].reverse() }
}

/**
 * Order items, newest first by default. The API only returns them oldest first, so "newest" reads
 * the pages from the end (a one-row request learns the total) and reverses each page.
 */
export function useGetOrderItems(page: number, limit: number, sort: OrderSort) {
  const queryClient = useQueryClient()
  const newest = sort === 'newest'

  const total = useQuery({
    queryKey: [...orderItemsQueryKey, 'total'],
    queryFn: async () => (await fetchOrderItems(1, 1)).meta?.total_data ?? 0,
    enabled: newest,
    staleTime: 30_000,
  })
  const newestPages = total.data !== undefined ? Math.max(1, Math.ceil(total.data / limit)) : undefined
  const apiPage = newest ? (newestPages !== undefined ? Math.max(1, newestPages - page + 1) : undefined) : page

  const list = useQuery({
    queryKey: [...orderItemsQueryKey, 'page', apiPage, limit],
    queryFn: () => fetchOrderItems(apiPage ?? 1, limit),
    enabled: apiPage !== undefined,
    // Keep the current page on screen while the next one loads.
    placeholderData: keepPreviousData,
    select: newest ? newestFirst : undefined,
  })

  return {
    rows: list.data?.data ?? [],
    total: newest ? total.data : list.data?.meta?.total_data,
    totalPages: newest ? newestPages : list.data?.meta?.total_page,
    isLoading: (newest && total.isLoading) || list.isLoading,
    isError: total.isError || list.isError,
    isFetching: total.isFetching || list.isFetching,
    isPlaceholderData: list.isPlaceholderData,
    refetch: () => queryClient.invalidateQueries({ queryKey: orderItemsQueryKey }),
  }
}
