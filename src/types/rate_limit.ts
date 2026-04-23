import type { PaginationMeta } from './game'

export interface RateLimit {
  key: string;
  value: string;
}

export interface RateLimitResponse {
  status: string;
  message: string;
  data: RateLimit | RateLimit[];
  meta: PaginationMeta;
}
