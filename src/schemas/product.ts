import { z } from 'zod'

/** Guardrails against fat-finger markups; the backend itself only rejects negatives. */
export const PRICE_LIMITS = { fee: 1_000_000, percent: 40 } as const

/**
 * Wraps a markup field so it must be typed in. An emptied number input arrives as '', and
 * z.coerce.number reads '' as 0: saving would set a 0 markup (selling at the base price) nobody
 * typed. Blank counts as missing instead, so the field's own "required" message shows.
 */
export const blankAsMissing = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), schema)

export const isBlank = (v: unknown) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '')

export const productPriceSchema = z
  .object({
    type: z.enum(['fee', 'percent']),
    value: blankAsMissing(
      z.coerce.number({ error: 'productsPage.price.errors.required' }).min(0, 'productsPage.price.errors.negative')
    ),
  })
  .superRefine((v, ctx) => {
    if (v.type === 'fee' && !Number.isInteger(v.value)) {
      // The backend stores the fee as a whole number of rupiah and rejects decimals.
      ctx.addIssue({ code: 'custom', path: ['value'], message: 'productsPage.price.errors.feeWhole' })
    }
    if (v.type === 'fee' && v.value > PRICE_LIMITS.fee) {
      ctx.addIssue({ code: 'custom', path: ['value'], message: 'productsPage.price.errors.feeMax' })
    }
    if (v.type === 'percent' && v.value > PRICE_LIMITS.percent) {
      ctx.addIssue({ code: 'custom', path: ['value'], message: 'productsPage.price.errors.percentMax' })
    }
  })

export type ProductPriceFormInput = z.input<typeof productPriceSchema>
export type ProductPriceFormValues = z.output<typeof productPriceSchema>
