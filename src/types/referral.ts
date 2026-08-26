import type { Payment } from './transaction'

export interface ReferralCode {
  id: string
  name: string
  code: string
  percent: number
  is_active: boolean
  /** Format backend — parse lewat `parseBackendDate`, bukan `new Date`. */
  created_at: string
  updated_at: string
  /** Hanya dikirim pada respons detail. */
  total_earnings?: number
  /** Hanya dikirim pada respons detail; tidak dipaginasi backend. */
  transactions?: Payment[]
}

export interface CreateReferralCodeRequest {
  name: string
  code: string
  percent: number
  is_active: boolean
}

export interface UpdateReferralCodeRequest {
  name?: string
  code?: string
  percent?: number
  is_active?: boolean
}

/**
 * Bentuk meta persis seperti di kabel. Service referral memakai
 * `current_page`, bukan `page` seperti mayoritas endpoint lain — menuliskannya
 * sebagai `page` membuat pemeriksaan batas halaman diam-diam membandingkan
 * `undefined`.
 */
export interface ReferralCodeListMeta {
  current_page: number
  limit: number
  total_data: number
  total_page: number
  has_next: boolean
  has_prev: boolean
}

export interface ReferralCodeListResponse {
  status: string
  message: string
  /** Service membangun daftar dari slice nil, jadi halaman kosong terkirim sebagai `null`. */
  data: ReferralCode[] | null
  meta: ReferralCodeListMeta
}

export interface ReferralCodeDetailResponse {
  status: string
  message: string
  data: ReferralCode
}

export interface ReferralCodeMutationResponse {
  status: string
  message: string
  data: ReferralCode
}
