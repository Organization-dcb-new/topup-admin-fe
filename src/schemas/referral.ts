import { z } from 'zod'

export const referralCodeSchema = z.object({
  name: z.string().trim().min(1, 'referralPage.form.errors.nameRequired'),
  code: z.string().min(1, 'referralPage.form.errors.codeRequired').toUpperCase(),
  // An emptied number input arrives as NaN; give it a translated message instead of zod's default.
  percent: z.coerce.number({ error: 'referralPage.form.errors.percentRequired' })
    .min(0, 'referralPage.form.errors.percentMin')
    .max(100, 'referralPage.form.errors.percentMax'),
  is_active: z.boolean().default(true),
})

export type ReferralCodeFormValues = z.infer<typeof referralCodeSchema>
