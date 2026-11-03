import { z } from 'zod'

/** Empty, a storefront path like `/games/mlbb`, or a full http(s) URL. */
function isValidRedirect(value: string) {
  if (!value || value.startsWith('/')) return true
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const bannerSchema = z.object({
  image: z.string().min(1, 'bannerPage.form.errors.imageRequired'),
  redirect_link: z.string().trim().refine(isValidRedirect, 'bannerPage.form.errors.linkInvalid'),
})

export type BannerFormValues = z.infer<typeof bannerSchema>
