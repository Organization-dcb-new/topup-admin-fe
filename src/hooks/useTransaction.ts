import { api } from '@/api/axios'
import type { PaymentResponse } from '@/types/transaction'
import { useQuery } from '@tanstack/react-query'

export const useGetTransactions = (
  page: number,
  limit: number,
  search: string,
  startDate?: string,
  endDate?: string,
  gameId?: string,
  paymentMethodId?: string,
  status?: string,
  /** Selaras `dto.TransactionListQuery.PriceAbove` — query `price_above` (≥) */
  minAmount?: string,
  /** Selaras `PriceBelow` — query `price_below` (≤) */
  maxAmount?: string,
  /** Selaras `PriceExact` — query `price` (=) */
  exactAmount?: string,
  refetchInterval: number | false = 10_000,
) => {
  return useQuery({
    queryKey: [
      'transactions',
      page,
      limit,
      search,
      startDate,
      endDate,
      gameId,
      paymentMethodId,
      status,
      minAmount,
      maxAmount,
      exactAmount,
    ],
    queryFn: async ({ signal }): Promise<PaymentResponse> => {
      const res = await api.get('/transactions', {
        signal,
        params: {
          page,
          limit,
          search,
          ...(startDate && { start_date: startDate }),
          ...(endDate && { end_date: endDate }),
          ...(gameId && { game_id: gameId }),
          ...(paymentMethodId && { payment_method_id: paymentMethodId }),
          ...(status && { status }),
          ...(minAmount && { price_above: minAmount }),
          ...(maxAmount && { price_below: maxAmount }),
          ...(exactAmount && { price: exactAmount }),
        },
      })
      return res.data
    },
    refetchInterval,
    refetchIntervalInBackground: false,
  })
}
