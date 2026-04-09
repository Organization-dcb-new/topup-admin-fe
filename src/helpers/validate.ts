import { MAX_FILE_SIZE } from "@/lib/file"
import toast from "react-hot-toast"

/** Tanpa toast — untuk pesan error di UI (mis. modal gambar). */
export type ImageFileValidationErrorKey = "invalidType" | "tooLarge"

export function getImageFileValidationError(file: File): ImageFileValidationErrorKey | null {
  if (!file.type.startsWith("image/")) return "invalidType"
  if (file.size > MAX_FILE_SIZE) return "tooLarge"
  return null
}

export const validateFileImage = (file: File) => {
  if (!file.type.startsWith('image/')) {
    toast.error('Only image files allowed')
    return false
  }
  if (file.size > MAX_FILE_SIZE) {
    toast.error('Max image size 10MB')
    return false
  }
  return true
}
