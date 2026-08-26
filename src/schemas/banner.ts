import { z } from 'zod'
import i18n from '@/i18n'
// Pembaca waktu yang sama dengan yang menilai jendela tayang di halaman
// banner. Nilai tak terbaca menghasilkan null dan dilewatkan, supaya pesan
// galat yang tampil bukan soal urutan waktu.
import { toTime } from '@/lib/banner-schedule'
import { isSafeBannerLink, toSafeLink } from '@/lib/safe-url'

const tr = (key: string, params?: Record<string, unknown>) => () =>
  i18n.t(key, params ?? {})

const MAX_LINK = 2048

export const bannerSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, { error: tr('bannerForm.errors.titleRequired') })
      .max(150, { error: tr('bannerForm.errors.titleTooLong', { max: 150 }) }),
    // Gambar dirender sebagai `src`, jadi hanya URL absolut http/https yang
    // boleh lolos — aturan yang sama dipakai backend.
    image: z
      .string()
      .trim()
      .min(1, { error: tr('bannerForm.errors.imageRequired') })
      .refine((v) => isSafeBannerLink(v) && toSafeLink(v)?.isExternal === true, {
        error: tr('bannerForm.errors.imageInvalid'),
      }),
    alt_text: z
      .string()
      .trim()
      .max(255, { error: tr('bannerForm.errors.altTooLong', { max: 255 }) }),
    redirect_link: z
      .string()
      .trim()
      .max(MAX_LINK, { error: tr('bannerForm.errors.linkTooLong', { max: MAX_LINK }) })
      .refine(isSafeBannerLink, { error: tr('bannerForm.errors.linkInvalid') }),
    is_active: z.boolean(),
    start_at: z.string(),
    end_at: z.string(),
  })
  .refine(
    (v) => {
      if (v.start_at === '' || v.end_at === '') return true
      const start = toTime(v.start_at)
      const end = toTime(v.end_at)
      if (start === null || end === null) return true
      return end >= start
    },
    {
      error: tr('bannerForm.errors.endBeforeStart'),
      path: ['end_at'],
    },
  )

export type BannerSchemaValues = z.infer<typeof bannerSchema>
