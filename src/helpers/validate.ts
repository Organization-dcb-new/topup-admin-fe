import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/file'

/** Tanpa toast — untuk pesan error di UI (mis. modal gambar). */
export type ImageFileValidationErrorKey = 'invalidType' | 'tooLarge'

export function getImageFileValidationError(file: File): ImageFileValidationErrorKey | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'invalidType'
  if (file.size > MAX_FILE_SIZE) return 'tooLarge'
  return null
}
