import { z } from 'zod'
import i18n from '@/i18n'

/** Cerminan `maxLength` excerpt di form dan batas kolom di backend. */
export const EXCERPT_MAX_LENGTH = 150

/**
 * Sama seperti `referral.ts`: tipe masukan dan keluaran skema ini sengaja
 * dijaga identik — tanpa `z.coerce`, `.default()`, atau `.transform()`.
 * Ketiganya membuat `z.input` menyimpang dari `z.output` dan memaksa pemanggil
 * menambal `zodResolver` dengan cast paksa.
 */
export const blogSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: () => i18n.t('blogForm.errors.titleRequired') }),
  category: z
    .string()
    .trim()
    .min(1, { error: () => i18n.t('blogForm.errors.categoryRequired') }),
  content_markdown: z
    .string()
    .trim()
    .min(1, { error: () => i18n.t('blogForm.errors.contentRequired') }),
  excerpt: z
    .string()
    .trim()
    .min(1, { error: () => i18n.t('blogForm.errors.excerptRequired') })
    .max(EXCERPT_MAX_LENGTH, {
      error: () => i18n.t('blogForm.errors.excerptMax', { max: EXCERPT_MAX_LENGTH }),
    }),
  thumbnail: z
    .string()
    .trim()
    .min(1, { error: () => i18n.t('blogForm.errors.thumbnailRequired') }),
  status: z.enum(['draft', 'published'], {
    error: () => i18n.t('blogForm.errors.statusInvalid'),
  }),
  tags: z.array(z.string()),
})

export type BlogSchemaValues = z.infer<typeof blogSchema>
