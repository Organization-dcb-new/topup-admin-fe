import { z } from 'zod'
import i18n from '@/i18n'
// Penilai link yang sama dengan yang dipakai banner: gambar dirender sebagai
// `src`, jadi hanya URL absolut http/https yang boleh lolos.
import { toSafeLink } from '@/lib/safe-url'
import type { Show } from '@/types/show'

const tr = (key: string, params?: Record<string, unknown>) => () =>
  i18n.t(key, params ?? {})

const MAX_NAME = 100
const MAX_ALIAS = 100

/**
 * Alias dipakai sebagai kunci unik di backend (kolom unique) dan muncul di URL
 * storefront, jadi bentuknya dinormalisasi di satu tempat — bukan diserahkan
 * pada disiplin pengetikan admin. Diekspor supaya form bisa menampilkan hasil
 * normalisasi saat blur, sehingga nilai yang dikirim tidak mengagetkan.
 */
export const toShowAlias = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const showName = z
  .string()
  .trim()
  .min(1, { error: tr('showForm.errors.nameRequired') })
  .max(MAX_NAME, { error: tr('showForm.errors.nameTooLong', { max: MAX_NAME }) })

const showAlias = z
  .string()
  .transform(toShowAlias)
  .refine((v) => v.length > 0, { error: tr('showForm.errors.aliasRequired') })
  .refine((v) => v.length <= MAX_ALIAS, {
    error: tr('showForm.errors.aliasTooLong', { max: MAX_ALIAS }),
  })

/**
 * Gambar show bersifat opsional: storefront tidak pernah merendernya (pemakainya
 * nol di pakargaming-fe), jadi mewajibkannya hanya memaksa admin mengunggah aset
 * yang tidak dibaca siapa pun. Yang tetap ditegakkan adalah bentuknya — begitu
 * diisi, nilainya berakhir di atribut `src`, sehingga hanya URL absolut
 * http/https yang boleh lolos.
 */
const showImage = z
  .string()
  .trim()
  .refine((v) => v === '' || toSafeLink(v)?.isExternal === true, {
    error: tr('showForm.errors.imageInvalid'),
  })

/** Kolom angka kosong menghasilkan NaN lewat `valueAsNumber`; pesannya harus
 *  "wajib diisi", bukan "minimal 0" yang membingungkan. */
const showSortOrder = z
  .number({ error: tr('showForm.errors.sortRequired') })
  .refine((v) => Number.isFinite(v), { error: tr('showForm.errors.sortRequired') })
  .refine((v) => Number.isInteger(v), { error: tr('showForm.errors.sortInvalid') })
  .min(0, { error: tr('showForm.errors.sortNegative') })

/**
 * POST /shows menerima nama, alias, gambar, keempat flag, dan urutan. Form
 * pembuatan sengaja hanya meminta yang dibutuhkan untuk menayangkan show;
 * penanda hot/new/popular dan urutan diatur setelahnya lewat form edit dan
 * tombol urutan di tabel.
 */
export const createShowSchema = z.object({
  name: showName,
  alias: showAlias,
  image: showImage,
  /** Backend sudah menerima flag ini saat pembuatan, jadi show tidak perlu
   *  dibuat dulu lalu disunting lagi hanya untuk menayangkannya. */
  is_show: z.boolean(),
})

export type CreateShowFormValues = z.infer<typeof createShowSchema>

/** PUT /shows/:id — form edit menampilkan seluruh kolom yang bisa diubah. */
export const updateShowSchema = z.object({
  name: showName,
  alias: showAlias,
  image: showImage,
  sort_order: showSortOrder,
  is_hot: z.boolean(),
  is_new: z.boolean(),
  is_popular: z.boolean(),
  is_show: z.boolean(),
})

export type UpdateShowFormValues = z.infer<typeof updateShowSchema>

export const createShowDefaults: CreateShowFormValues = {
  name: '',
  alias: '',
  image: '',
  is_show: false,
}

/** Nilai awal form edit dari satu baris show. */
export const showToFormValues = (show: Show): UpdateShowFormValues => ({
  name: show.name,
  alias: show.alias,
  image: show.image,
  sort_order: show.sort_order,
  is_hot: show.is_hot,
  is_new: show.is_new,
  is_popular: show.is_popular,
  is_show: show.is_show,
})
