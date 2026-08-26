import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/file'
import toast from 'react-hot-toast'

/** Tanpa toast — untuk pesan error di UI (mis. modal gambar). */
export type ImageFileValidationErrorKey = 'invalidType' | 'tooLarge'

/**
 * Whitelist-nya sengaja sempit dan sama persis dengan backend. Pemeriksaan
 * lama (`file.type.startsWith('image/')`) meloloskan SVG dan GIF di FE, lalu
 * server menolaknya dengan 400 setelah berkas terkirim.
 */
function isAcceptedImageType(file: File): boolean {
  return (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type.toLowerCase())
}

export function getImageFileValidationError(file: File): ImageFileValidationErrorKey | null {
  if (!isAcceptedImageType(file)) return 'invalidType'
  if (file.size > MAX_FILE_SIZE) return 'tooLarge'
  return null
}

export const validateFileImage = (file: File) => {
  if (!isAcceptedImageType(file)) {
    toast.error('Only JPG, PNG, or WebP images are allowed')
    return false
  }
  if (file.size > MAX_FILE_SIZE) {
    toast.error('Max image size 2MB')
    return false
  }
  return true
}
