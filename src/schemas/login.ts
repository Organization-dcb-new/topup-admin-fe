import { z } from 'zod'
import i18n from '@/i18n'

export const loginSchema = z.object({
  email_or_username: z
    .string()
    .trim()
    .min(3, { error: () => i18n.t('loginPage.identifierRequired') }),
  password: z.string().min(6, { error: () => i18n.t('loginPage.passwordMin') }),
})

export type LoginFormValues = z.infer<typeof loginSchema>
