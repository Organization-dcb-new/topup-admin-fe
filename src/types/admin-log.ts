import type { PaginationMeta } from '@/types/game'

export interface AdminLog {
  ID: string
  AdminID: string
  Action: string
  Module: string
  Description: string
  OldData: Record<string, unknown> | null
  NewData: Record<string, unknown> | null
  IPAddress: string
  UserAgent: string
  CreatedAt: string
}

export interface AdminLogResponse {
  data: AdminLog[]
  message: string
  meta: PaginationMeta
  status: string
}

export interface AdminLogDetailResponse {
  data: AdminLog
  message: string
  status: string
}
