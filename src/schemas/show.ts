import { z } from 'zod'

export const showSchema = z.object({
  name: z.string().trim().min(1, 'showPage.form.errors.nameRequired'),
  alias: z
    .string()
    .trim()
    .min(1, 'showPage.form.errors.aliasRequired')
    // Trailing dashes are allowed while typing; trim them on save.
    .transform((v) => v.replace(/-+$/, '')),
  image: z.string(),
  is_hot: z.boolean(),
  is_new: z.boolean(),
  is_popular: z.boolean(),
  is_show: z.boolean(),
})

export type ShowFormInput = z.input<typeof showSchema>
export type ShowFormValues = z.output<typeof showSchema>
