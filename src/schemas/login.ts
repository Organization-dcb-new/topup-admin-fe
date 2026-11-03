import { z } from 'zod'

/** Messages are i18n keys, translated where the error is rendered. */
export const loginSchema = z.object({
  email_or_username: z.string().trim().min(1, 'loginPage.validation.identifierRequired'),
  password: z.string().min(1, 'loginPage.validation.passwordRequired'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
