import { z } from 'zod'
import type { TFunction } from 'i18next'

/**
 * Dibuat sebagai fungsi, bukan konstanta modul, supaya pesan validasinya ikut
 * berganti saat bahasa diganti. Versi sebelumnya menanam teks Indonesia
 * sehingga error form tetap berbahasa Indonesia di UI berbahasa Inggris.
 */
export const makeLoginSchema = (t: TFunction) =>
  z.object({
    email_or_username: z.string().min(3, t('loginPage.errorIdentifierRequired')),
    password: z.string().min(6, t('loginPage.errorPasswordMin')),
  })

export type LoginFormValues = z.infer<ReturnType<typeof makeLoginSchema>>
