import { z } from 'zod'

function isJsonObject(value: string) {
  try {
    const parsed: unknown = JSON.parse(value)
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
  } catch {
    return false
  }
}

/** Empty number inputs arrive as NaN; give them a translated message instead of zod's default. */
const amount = (key: string) =>
  z.coerce.number({ error: `paymentMethodPage.form.errors.${key}` }).min(0, `paymentMethodPage.form.errors.${key}`)

export const paymentMethodSchema = z
  .object({
    name: z.string().trim().min(1, 'paymentMethodPage.form.errors.nameRequired'),
    code: z.string().trim().min(1, 'paymentMethodPage.form.errors.codeRequired'),
    type: z.string().trim().min(1, 'paymentMethodPage.form.errors.typeRequired'),
    provider: z.string().trim().min(1, 'paymentMethodPage.form.errors.providerRequired'),
    icon_url: z.string(),
    fee_percentage: amount('feeInvalid').max(100, 'paymentMethodPage.form.errors.feeInvalid'),
    fee_fixed: amount('feeInvalid'),
    min_amount: amount('amountInvalid'),
    max_amount: amount('amountInvalid'),
    sort_order: z.coerce.number({ error: 'paymentMethodPage.form.errors.orderInvalid' }).int('paymentMethodPage.form.errors.orderInvalid'),
    is_active: z.boolean(),
    config: z.string().trim().refine(isJsonObject, 'paymentMethodPage.form.errors.configInvalid'),
  })
  .refine((v) => !v.max_amount || v.max_amount >= v.min_amount, {
    path: ['max_amount'],
    message: 'paymentMethodPage.form.errors.maxBelowMin',
  })

export type PaymentMethodFormInput = z.input<typeof paymentMethodSchema>
export type PaymentMethodFormValues = z.output<typeof paymentMethodSchema>

export const paymentCategorySchema = z.object({
  name: z.string().trim().min(1, 'paymentCategoryPage.form.errors.nameRequired'),
  slug: z
    .string()
    .trim()
    .min(1, 'paymentCategoryPage.form.errors.slugRequired')
    .transform((v) => v.replace(/-+$/, '')),
  icon_url: z.string(),
  sort_order: z.coerce.number({ error: 'paymentCategoryPage.form.errors.orderInvalid' }).int('paymentCategoryPage.form.errors.orderInvalid'),
  is_active: z.boolean(),
})

export type PaymentCategoryFormInput = z.input<typeof paymentCategorySchema>
export type PaymentCategoryFormValues = z.output<typeof paymentCategorySchema>
