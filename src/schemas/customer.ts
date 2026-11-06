import { z } from 'zod'

/** Limits match the backend's validator (name max 100, email max 254). */
export const customerEditSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'customerPage.errors.nameRequired')
    .max(100, 'customerPage.errors.nameTooLong'),
  email: z
    .string()
    .trim()
    .min(1, 'customerPage.errors.emailRequired')
    .max(254, 'customerPage.errors.emailInvalid')
    .pipe(z.email('customerPage.errors.emailInvalid')),
})

export type CustomerEditFormValues = z.infer<typeof customerEditSchema>
