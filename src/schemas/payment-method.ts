import { z } from 'zod'
import i18n from '@/i18n'

const tr = (key: string, params?: Record<string, unknown>) => () =>
  i18n.t(key, params ?? {})

/** Kolom angka kosong menghasilkan NaN lewat `valueAsNumber`; pesannya harus
 *  "wajib diisi", bukan "minimal 0" yang membingungkan. */
const requiredNumber = (key: string) =>
  z.number({ error: tr(key) }).refine((v) => Number.isFinite(v), {
    error: tr(key),
  })

const trimmed = (min: number, max: number, requiredKey: string, maxKey: string) =>
  z
    .string()
    .trim()
    .min(min, { error: tr(requiredKey) })
    .max(max, { error: tr(maxKey, { max }) })

export const paymentMethodSchema = z
  .object({
    name: trimmed(1, 100, 'paymentMethodForm.errors.nameRequired', 'paymentMethodForm.errors.tooLong'),
    code: trimmed(1, 50, 'paymentMethodForm.errors.codeRequired', 'paymentMethodForm.errors.tooLong')
      .regex(/^[A-Za-z0-9_-]+$/, { error: tr('paymentMethodForm.errors.codeFormat') })
      .transform((v) => v.toUpperCase()),
    type: trimmed(1, 50, 'paymentMethodForm.errors.typeRequired', 'paymentMethodForm.errors.tooLong'),
    provider: trimmed(1, 50, 'paymentMethodForm.errors.providerRequired', 'paymentMethodForm.errors.tooLong'),
    icon_url: z.string().trim().min(1, { error: tr('paymentMethodForm.errors.iconRequired') }),
    // Batas nyata: biaya persen di luar 0–100 selalu salah input
    fee_percentage: requiredNumber('paymentMethodForm.errors.feePercentRequired')
      .min(0, { error: tr('paymentMethodForm.errors.feePercentRange') })
      .max(100, { error: tr('paymentMethodForm.errors.feePercentRange') }),
    fee_fixed: requiredNumber('paymentMethodForm.errors.feeFixedRequired').min(0, {
      error: tr('paymentMethodForm.errors.negative'),
    }),
    min_amount: requiredNumber('paymentMethodForm.errors.minRequired').min(0, {
      error: tr('paymentMethodForm.errors.negative'),
    }),
    max_amount: requiredNumber('paymentMethodForm.errors.maxRequired').min(0, {
      error: tr('paymentMethodForm.errors.negative'),
    }),
    sort_order: requiredNumber('paymentMethodForm.errors.sortRequired').min(0, {
      error: tr('paymentMethodForm.errors.negative'),
    }),
    is_active: z.boolean(),
  })
  .refine((v) => v.max_amount === 0 || v.max_amount >= v.min_amount, {
    error: tr('paymentMethodForm.errors.maxBelowMin'),
    path: ['max_amount'],
  })

export type PaymentMethodSchemaValues = z.infer<typeof paymentMethodSchema>

export const paymentCategorySchema = z.object({
  name: trimmed(1, 100, 'paymentCategoryForm.errors.nameRequired', 'paymentCategoryForm.errors.tooLong'),
  slug: trimmed(1, 100, 'paymentCategoryForm.errors.slugRequired', 'paymentCategoryForm.errors.tooLong')
    .regex(/^[a-z0-9-]+$/, { error: tr('paymentCategoryForm.errors.slugFormat') }),
  icon_url: z.string().trim().min(1, { error: tr('paymentCategoryForm.errors.iconRequired') }),
  sort_order: requiredNumber('paymentCategoryForm.errors.sortRequired').min(0, {
    error: tr('paymentCategoryForm.errors.negative'),
  }),
  is_active: z.boolean(),
})

export type PaymentCategorySchemaValues = z.infer<typeof paymentCategorySchema>
