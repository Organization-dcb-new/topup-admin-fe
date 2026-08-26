/** Status pembayaran kanonik dari backend (`payments.status`). */
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'PROCESSING' | 'EXPIRED'

/** Satu baris respons `GET /transactions` (admin). */
export interface Payment {
  id: string
  payment_number: string
  order_id: string
  amount: number
  status: PaymentStatus
  payment_method_id: string
  payment_channel: string
  status_provider: string
  va_number: string
  app_name: string
  /** BE mengirim `*float64` — bisa `null` saat margin belum terhitung. */
  margin: number | null
  created_at: string
}

/**
 * Meta paginasi daftar transaksi — berdiri sendiri, tidak menumpang
 * `PaginationMeta` milik game. Empat field stats bersifat opsional beneran:
 * saat `GetStatsFiltered` gagal, BE tidak mengirim kuncinya sama sekali dan
 * halaman jatuh ke perhitungan per-halaman.
 */
export interface TransactionPaginationMeta {
  page: number
  limit: number
  total_data: number
  total_page: number
  total_volume?: number
  total_paid_count?: number
  total_margin?: number
  success_rate?: number
}

export interface PaymentResponse {
  data: Payment[]
  message: string
  meta: TransactionPaginationMeta
  status: string
}

/**
 * Parameter daftar transaksi. Nilai string sudah di-debounce oleh pemanggil —
 * hook `useGetTransactions` tidak men-debounce sendiri.
 */
export interface TransactionListParams {
  page: number
  limit: number
  search?: string
  startDate?: string
  endDate?: string
  gameId?: string
  paymentMethodId?: string
  status?: PaymentStatus | ''
  /** Selaras `dto.TransactionListQuery.PriceAbove` — query `price_above` (≥). */
  minAmount?: string
  /** Selaras `PriceBelow` — query `price_below` (≤). */
  maxAmount?: string
  /** Selaras `PriceExact` — query `price` (=). */
  exactAmount?: string
}
