import type { ListResponse } from './integration-log'

/** Who made a request (GET /activity-logs): an admin, a signed-in buyer, a guest buyer known by the email
 * they gave, a supplier or the payment gateway calling back, or no one known. */
export const ACTIVITY_ACTORS = ['ADMIN', 'USER', 'GUEST', 'SYSTEM', 'ANONYMOUS'] as const
export type ActivityActor = (typeof ACTIVITY_ACTORS)[number]

/** Every method but GET is logged. */
export const ACTIVITY_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'] as const

/** One write request to the backend. Kept 90 days. */
export type ActivityLog = {
  id: string
  /** RFC3339 in WIB. */
  created_at: string
  method: string
  /** The endpoint as registered, e.g. /v1/transactions/:id; `path` is the one called. */
  route: string
  path: string
  status: number
  duration_ms: number
  actor_type: ActivityActor
  /** The admin's or the buyer's account id. */
  actor_id?: string
  /** The account's email, or the one a guest or a sign-in gave. */
  actor_email: string
  /** A system caller's name, e.g. Paylabs. */
  actor_name: string
  ip: string
  /** Browser and system, e.g. "Chrome di Android"; empty when the User-Agent names neither. */
  device: string
  user_agent: string
  /** The record the request made or changed. */
  resource_id: string
  message: string
}

export type ActivityLogDetail = ActivityLog & {
  /** The body as sent, with passwords, tokens, codes and the like hidden and phone numbers masked. */
  request_body?: unknown
}

export type ActivityLogFilters = {
  page: number
  limit: number
  search?: string
  actorType?: ActivityActor
  method?: string
  outcome?: 'success' | 'failed'
  startDate?: string
  endDate?: string
}

export type ActivityLogListResponse = ListResponse<ActivityLog>
