import { z } from 'zod'

/** The backend's admin password policy (create and change): at least 12 characters, and not the email. */
export const ADMIN_PASSWORD_MIN = 12

function isEmailAsPassword(password: string, email: string | undefined) {
  return !!email && password.trim().toLowerCase() === email.trim().toLowerCase()
}

export const createAdminSchema = z
  .object({
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
    password: z.string().min(ADMIN_PASSWORD_MIN, 'adminPage.form.errors.passwordMin'),
    role: z.string().min(1),
    confirm_admin_password: z.string().min(1, 'adminPage.form.errors.confirmRequired'),
  })
  .refine((values) => !isEmailAsPassword(values.password, values.email), {
    path: ['password'],
    message: 'adminPage.form.errors.passwordIsEmail',
  })

export type CreateAdminFormValues = z.infer<typeof createAdminSchema>

/** The signed-in admin's own password change; `email` is theirs, which the new password must not equal. */
export function makeChangePasswordSchema(email: string | undefined) {
  return z
    .object({
      current_password: z.string().min(1, 'changePassword.errors.currentRequired'),
      new_password: z.string().min(ADMIN_PASSWORD_MIN, 'changePassword.errors.newMin'),
      confirm_password: z.string().min(1, 'changePassword.errors.confirmRequired'),
    })
    .refine((values) => !isEmailAsPassword(values.new_password, email), {
      path: ['new_password'],
      message: 'changePassword.errors.newIsEmail',
    })
    .refine((values) => values.new_password !== values.current_password, {
      path: ['new_password'],
      message: 'changePassword.errors.newSameAsCurrent',
    })
    .refine((values) => values.confirm_password === values.new_password, {
      path: ['confirm_password'],
      message: 'changePassword.errors.confirmMismatch',
    })
}

export type ChangePasswordFormValues = z.infer<ReturnType<typeof makeChangePasswordSchema>>
