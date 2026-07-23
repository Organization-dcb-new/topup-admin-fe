import type { Payment } from './transaction'

export interface ReferralCode {
  id: string
  name: string
  code: string
  percent: number
  is_active: boolean
  created_at: string
  updated_at: string
  total_earnings?: number
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

export interface ReferralCodeListResponse {
  status: string
  message: string
  data: ReferralCode[]
  meta?: {
    page: number
    limit: number
    total_data: number
    total_page: number
  }
}

export interface ReferralCodeDetailResponse {
  status: string
  message: string
  data: ReferralCode
}
