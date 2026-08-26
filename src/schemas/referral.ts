import { z } from 'zod'
import i18n from '@/i18n'

/** Cerminan `codeRegex` di backend: `^[A-Z0-9_-]{3,20}$`. */
const CODE_PATTERN = /^[A-Z0-9_-]{3,20}$/

/**
 * Tipe masukan dan keluaran skema ini sengaja dijaga identik — tanpa
 * `z.coerce`, `.default()`, atau `.transform()`. Ketiganya membuat
 * `z.input` menyimpang dari `z.output`, dan itulah satu-satunya alasan
 * pemanggil dulu harus menambal `zodResolver` dengan cast paksa.
 */
export const referralCodeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: () => i18n.t('referralPage.form.errors.nameRequired') }),
  code: z
    .string()
    .trim()
    .min(1, { error: () => i18n.t('referralPage.form.errors.codeRequired') })
    .regex(CODE_PATTERN, { error: () => i18n.t('referralPage.form.errors.codeFormat') }),
  percent: z
    .number({ error: () => i18n.t('referralPage.form.errors.percentRequired') })
    // Backend menandai `percent` sebagai `required`, dan validator Go menolak
    // nilai nol untuk float — jadi 0 memang bukan nilai yang sah, bukan sekadar
    // tidak berguna.
    .gt(0, { error: () => i18n.t('referralPage.form.errors.percentMin') })
    .max(100, { error: () => i18n.t('referralPage.form.errors.percentMax') }),
  is_active: z.boolean(),
})

export type ReferralCodeFormValues = z.infer<typeof referralCodeSchema>
