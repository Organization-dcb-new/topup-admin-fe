import { z } from 'zod'

export const referralCodeSchema = z.object({
  name: z.string().min(1, 'referralPage.form.errors.nameRequired'),
  code: z.string().min(1, 'referralPage.form.errors.codeRequired').toUpperCase(),
  percent: z.coerce.number()
    .min(0, 'referralPage.form.errors.percentMin')
    .max(100, 'referralPage.form.errors.percentMax'),
  is_active: z.boolean().default(true),
})

export type ReferralCodeFormValues = z.infer<typeof referralCodeSchema>
