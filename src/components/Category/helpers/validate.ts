import { MAX_FILE_SIZE } from "@/lib/file"
import toast from "react-hot-toast"

export const validateFileImage = (file: File) => {
  if (!file.type.startsWith('image/')) {
    toast.error('Only image files allowed')
    return false
  }
  if (file.size > MAX_FILE_SIZE) {
    toast.error('Max image size 2MB')
    return false
  }
  return true
}
