import { z } from 'zod'

export const createAdminSchema = z.object({
  full_name: z.string().trim().min(1, 'adminPage.form.errors.fullNameRequired'),
  username: z
    .string()
    .trim()
    .min(1, 'adminPage.form.errors.usernameRequired')
    // It doubles as a login name, so keep it free of spaces and symbols.
    .regex(/^[a-zA-Z0-9._-]+$/, 'adminPage.form.errors.usernameFormat'),
  email: z
    .string()
    .trim()
    .min(1, 'adminPage.form.errors.emailRequired')
    .pipe(z.email('adminPage.form.errors.emailInvalid')),
  password: z.string().min(6, 'adminPage.form.errors.passwordMin'),
  role: z.string().min(1),
  confirm_admin_password: z.string().min(1, 'adminPage.form.errors.confirmRequired'),
})

export type CreateAdminFormValues = z.infer<typeof createAdminSchema>
