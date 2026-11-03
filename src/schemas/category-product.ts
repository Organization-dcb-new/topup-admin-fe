import { z } from 'zod'

const name = z.string().trim().min(1, 'categoryProductPage.form.errors.nameRequired')

export const createCategoryProductSchema = z.object({
  game_id: z.string().min(1, 'categoryProductPage.form.errors.gameRequired'),
  name,
  // Trailing dashes are allowed while typing; trim them before checking anything is left.
  slug: z
    .string()
    .transform((v) => v.trim().replace(/-+$/, ''))
    .pipe(z.string().min(1, 'categoryProductPage.form.errors.slugRequired')),
  icon_url: z.string(),
  description: z.string().trim(),
  is_active: z.boolean(),
})

export type CreateCategoryProductInput = z.input<typeof createCategoryProductSchema>
export type CreateCategoryProductValues = z.output<typeof createCategoryProductSchema>

export const renameCategoryProductSchema = z.object({ name })

export type RenameCategoryProductValues = z.infer<typeof renameCategoryProductSchema>
