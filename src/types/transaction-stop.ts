/**
 * The transaction stop (topup-be GET /transaction-stop/admin): one switch that refuses new checkouts
 * while the storefront stays open. Pending payments are still paid and fulfilled.
 */
export type TransactionStop = {
  /** In force now: switched on AND (no `resume_at` OR `resume_at` still ahead). */
  is_stopped: boolean
  /** The switch as an admin left it. On with `is_stopped` false = it reopened by itself at `resume_at`. */
  switched_on: boolean
  /** Shown to buyers while stopped; `""` = the storefront's default text. Kept when switched off. */
  message: string
  /** RFC3339 WIB, e.g. `2026-11-20T18:00:00+07:00`; checkout reopens by itself then. null = only by hand. */
  resume_at: string | null
  /** RFC3339 WIB; when the last stop began. */
  stopped_at: string | null
  /** Admin email; `""` when never changed. */
  updated_by: string
  /** RFC3339 WIB; null when never changed. */
  updated_at: string | null
}

export type TransactionStopResponse = {
  status?: string
  message?: string
  data: TransactionStop
}

/**
 * Body of PUT /transaction-stop. A missing `message` keeps the saved one; `resume_at` is replaced on
 * every call (null clears it) and always cleared when `is_stopped` is false.
 */
export type UpdateTransactionStopPayload = {
  is_stopped: boolean
  message?: string
  resume_at?: string | null
}
