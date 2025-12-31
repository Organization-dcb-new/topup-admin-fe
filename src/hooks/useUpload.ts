import { api } from "@/api/axios"

export const uploadFile = async (file: File, onProgress?: (progress: number) => void) => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await api.post('/upload/new', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (!e.total) return
      const percent = Math.round((e.loaded * 100) / e.total)
      onProgress?.(percent)
    },
  })

  return res.data
}
