import { z } from 'zod'

export const loginSchema = z.object({
  email_or_username: z.string().min(3, 'Email atau username wajib diisi'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
