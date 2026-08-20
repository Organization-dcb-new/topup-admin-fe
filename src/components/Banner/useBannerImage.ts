import { getImageFileValidationError } from '@/helpers/validate'
import { uploadFile } from '@/hooks/useUpload'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export type BannerImageState = ReturnType<typeof useBannerImage>

/**
 * State gambar banner untuk modal buat/ubah.
 *
 * Berkas sengaja **tidak** langsung diunggah saat dipilih. Perilaku lama
 * (`handleFileAutoUpload`) mengunggah begitu berkas dipilih, jadi setiap kali
 * user membatalkan modal berkasnya sudah telanjur nyangkut di server tanpa ada
 * banner yang menunjuk ke sana. Di sini pratinjaunya pakai object URL lokal dan
 * unggahannya baru jalan saat form disubmit lewat `upload()`.
 */
export function useBannerImage(initialUrl?: string | null) {
  const { t } = useTranslation('common')
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(initialUrl ?? null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null)
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const objectUrl = useRef<string | null>(null)
  // Dinaikkan setiap kali state di-reset atau unggahan baru dimulai. Unggahan
  // yang sudah tidak relevan memeriksa nilai ini dan berhenti tanpa menyentuh
  // state — tanpa ini, membatalkan modal saat unggahan berjalan tetap membuat
  // banner ketika promise-nya resolve belakangan.
  const runId = useRef(0)
  const uploadingRef = useRef(false)

  const revokeObjectUrl = useCallback(() => {
    if (!objectUrl.current) return
    URL.revokeObjectURL(objectUrl.current)
    objectUrl.current = null
  }, [])

  useEffect(() => revokeObjectUrl, [revokeObjectUrl])

  const reset = useCallback(
    (url?: string | null) => {
      runId.current += 1
      uploadingRef.current = false
      revokeObjectUrl()
      setUploadedUrl(url ?? null)
      setPreview(url ?? null)
      setPendingFile(null)
      setProgress(0)
      setIsUploading(false)
      setError(null)
    },
    [revokeObjectUrl],
  )

  const selectFile = useCallback(
    (file: File) => {
      // `disabled` pada <button> hanya memblokir click, bukan drop. Dijaga di
      // hook supaya semua pemanggil (drop, input berkas) ikut terlindungi.
      if (uploadingRef.current) return
      const invalid = getImageFileValidationError(file)
      if (invalid) {
        setError(t(`bannerImageField.errors.${invalid}`))
        return
      }
      revokeObjectUrl()
      const local = URL.createObjectURL(file)
      objectUrl.current = local
      setPendingFile(file)
      setPreview(local)
      setProgress(0)
      setError(null)
    },
    [revokeObjectUrl, t],
  )

  /** Mengunggah berkas yang tertunda dan mengembalikan URL final, atau `null`
   *  bila belum ada gambar / unggahannya gagal. */
  const upload = useCallback(async (): Promise<string | null> => {
    if (!pendingFile) {
      setError(uploadedUrl ? null : t('bannerImageField.errors.required'))
      return uploadedUrl
    }

    const run = ++runId.current
    const isCurrent = () => run === runId.current

    uploadingRef.current = true
    setIsUploading(true)
    setProgress(0)
    setError(null)
    try {
      const res = await uploadFile(pendingFile, (percent) => {
        if (isCurrent()) setProgress(percent)
      })
      // Modal ditutup / state di-reset selagi unggahan berjalan: jangan
      // hidupkan lagi state yang sudah dibersihkan, dan jangan kembalikan URL
      // (pemanggil memakai nilai null ini untuk membatalkan mutation).
      if (!isCurrent()) return null

      const url: string = res.data.url
      revokeObjectUrl()
      setUploadedUrl(url)
      setPreview(url)
      setPendingFile(null)
      return url
    } catch {
      if (isCurrent()) setError(t('bannerImageField.errors.uploadFailed'))
      return null
    } finally {
      if (isCurrent()) {
        uploadingRef.current = false
        setIsUploading(false)
      }
    }
  }, [pendingFile, revokeObjectUrl, t, uploadedUrl])

  return {
    preview,
    hasImage: !!preview,
    isUploading,
    progress,
    error,
    setError,
    selectFile,
    upload,
    reset,
  }
}
