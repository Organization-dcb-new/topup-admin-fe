import { api } from '@/api/axios'

/**
 * `scope` menentukan ruang nama object key di bucket ("uploads/<scope>/...").
 * Bucket dipakai bersama seluruh modul, jadi tanpa ruang nama sebuah URL
 * gambar tidak pernah bisa membuktikan berkasnya milik modul tertentu — dan
 * pembuktian itulah yang dipakai backend sebelum berani menghapus berkas.
 * Backend menolak scope yang tidak dikenalnya.
 */
export const uploadFile = async (
  file: File,
  onProgress?: (progress: number) => void,
  scope?: string,
) => {
  const formData = new FormData()
  formData.append('image', file)
  if (scope) formData.append('scope', scope)

  const res = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (!e.total) return
      const percent = Math.round((e.loaded * 100) / e.total)
      onProgress?.(percent)
    },
  })

  return res.data
}
