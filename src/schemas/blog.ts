import { z } from 'zod'

export const EXCERPT_MAX_LENGTH = 150

export const blogSchema = z.object({
  title: z.string().trim().min(1, 'blogPage.editor.errors.title'),
  content_markdown: z.string().trim().min(1, 'blogPage.editor.errors.content'),
  excerpt: z
    .string()
    .trim()
    .min(1, 'blogPage.editor.errors.excerpt')
    .max(EXCERPT_MAX_LENGTH, 'blogPage.editor.errors.excerptMax'),
  thumbnail: z.string().min(1, 'blogPage.editor.errors.thumbnail'),
  category: z.string().min(1, 'blogPage.editor.errors.category'),
  tags: z.array(z.string()),
  status: z.enum(['draft', 'published']),
})

export type BlogFormValues = z.infer<typeof blogSchema>
