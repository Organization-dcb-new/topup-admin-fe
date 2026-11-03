import { z } from 'zod'

import { PRICE_MAX_PERCENT } from '@/components/Games/game-utils'

const text = z.string().trim()

/** One checkout field of a new game. */
export const gameInputDraftSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, 'gameForm.errors.inputKeyRequired')
    .regex(/^[a-z0-9_]+$/, 'gameForm.errors.inputKeyFormat'),
  label: z.string().trim().min(1, 'gameForm.errors.inputLabelRequired'),
  input_type: z.enum(['text', 'number', 'tel']),
  placeholder: text,
})

export const gameCreateSchema = z
  .object({
    provider_id: z.string().min(1, 'gameForm.errors.providerRequired'),
    category_id: z.string().min(1, 'gameForm.errors.categoryRequired'),
    name: z.string().trim().min(1, 'gameForm.errors.nameRequired'),
    slug: z
      .string()
      .trim()
      .min(1, 'gameForm.errors.slugRequired')
      .transform((v) => v.replace(/-+$/, '')),
    code: z.string().trim().min(1, 'gameForm.errors.codeRequired'),
    thumbnail_url: z.string().min(1, 'gameForm.errors.thumbnailRequired'),
    banner_url: z.string(),
    developer: text,
    publisher: text,
    description: text,
    instruction: text,
    inputs: z.array(gameInputDraftSchema),
  })
  .superRefine((v, ctx) => {
    // Keys identify fields to the provider, so two fields can't share one.
    const seen = new Set<string>()
    v.inputs.forEach((input, index) => {
      if (seen.has(input.key)) {
        ctx.addIssue({ code: 'custom', path: ['inputs', index, 'key'], message: 'gameForm.errors.inputKeyDuplicate' })
      }
      seen.add(input.key)
    })
  })

export type GameCreateFormInput = z.input<typeof gameCreateSchema>
export type GameCreateFormValues = z.output<typeof gameCreateSchema>

export const gameEditSchema = z.object({
  name: z.string().trim().min(1, 'gameForm.errors.nameRequired'),
  category_id: z.string(),
  developer: text,
  publisher: text,
  description: text,
  instruction: text,
  popularity_score: z.coerce
    .number({ error: 'gameForm.errors.popularityInvalid' })
    .int('gameForm.errors.popularityInvalid')
    .min(0, 'gameForm.errors.popularityInvalid'),
  is_featured: z.boolean(),
})

export type GameEditFormInput = z.input<typeof gameEditSchema>
export type GameEditFormValues = z.output<typeof gameEditSchema>

export const gamePriceSchema = z.object({
  additional_percent: z.coerce
    .number({ error: 'gamePriceDialog.errors.percentInvalid' })
    .min(0, 'gamePriceDialog.errors.percentInvalid')
    .max(PRICE_MAX_PERCENT, 'gamePriceDialog.errors.percentMax'),
})

export type GamePriceFormInput = z.input<typeof gamePriceSchema>
export type GamePriceFormValues = z.output<typeof gamePriceSchema>
