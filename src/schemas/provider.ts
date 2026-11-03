import { z } from 'zod'

function isJsonObject(value: string) {
  try {
    const parsed: unknown = JSON.parse(value)
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
  } catch {
    return false
  }
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/** `isEdit` lets the key stay empty, meaning "keep the stored key". */
export function providerSchema(isEdit: boolean) {
  return z.object({
    name: z.string().trim().min(1, 'providerPage.form.errors.nameRequired'),
    code: z.string().trim().min(1, 'providerPage.form.errors.codeRequired'),
    api_url: z.string().trim().refine(isHttpUrl, 'providerPage.form.errors.urlInvalid'),
    api_key: isEdit ? z.string() : z.string().trim().min(1, 'providerPage.form.errors.keyRequired'),
    priority: z.coerce
      .number({ error: 'providerPage.form.errors.priorityInvalid' })
      .int('providerPage.form.errors.priorityInvalid')
      .min(0, 'providerPage.form.errors.priorityInvalid'),
    status: z.enum(['ACTIVE', 'INACTIVE', 'ERROR']),
    config: z.string().trim().refine(isJsonObject, 'providerPage.form.errors.configInvalid'),
  })
}

export type ProviderFormInput = z.input<ReturnType<typeof providerSchema>>
export type ProviderFormValues = z.output<ReturnType<typeof providerSchema>>
