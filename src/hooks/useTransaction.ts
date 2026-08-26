import { api } from '@/api/axios'
import type { PaymentResponse, TransactionListParams } from '@/types/transaction'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

/**
 * Daftar transaksi admin. Seluruh parameter masuk lewat satu objek
 * {@link TransactionListParams}; nilai pencarian/nominal sudah di-debounce
 * oleh pemanggil — hook ini tidak men-debounce sendiri.
 */
export const useGetTransactions = (
  params: TransactionListParams,
  refetchInterval: number | false,
) => {
  const {
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
  } = params

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
          ...(search && { search }),
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
    placeholderData: keepPreviousData,
    refetchInterval,
    refetchIntervalInBackground: false,
  })
}
