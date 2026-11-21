import { z } from 'zod'

import { datetimeLocalToIso } from '@/helpers/maintenance-datetime'
import { charCount } from '@/schemas/announcement'

/** Limit of the backend contract (topup-be transaction stop); it answers 400 past it. */
export const TRANSACTION_STOP_MESSAGE_MAX = 300

/**
 * What buyers read when the message is left empty (topup-be ErrorCheckoutStopped). Storefront copy,
 * so it stays Indonesian in every panel language.
 */
export const TRANSACTION_STOP_DEFAULT_MESSAGE = 'Transaksi sedang dihentikan sementara. Silakan coba lagi nanti.'

/** A `datetime-local` value read as WIB wall time, in ms; NaN when empty. */
function wibMs(local: string) {
  const iso = datetimeLocalToIso(local)
  return iso ? Date.parse(iso) : Number.NaN
}

export const transactionStopSchema = z.object({
  message: z
    .string()
    .trim()
    .refine((v) => charCount(v) <= TRANSACTION_STOP_MESSAGE_MAX, 'transactionStopPage.form.errors.messageMax'),
  /** `datetime-local` in WIB; empty = stays stopped until switched off by hand. */
  resume_at: z.string().refine((v) => {
    if (!v.trim()) return true
    const ms = wibMs(v)
    return !Number.isNaN(ms) && ms > Date.now()
  }, 'transactionStopPage.form.errors.resumeInPast'),
})

export type TransactionStopFormValues = z.infer<typeof transactionStopSchema>
