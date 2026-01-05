import { uploadFile } from '@/hooks/useUpload'
import toast from 'react-hot-toast'
import { validateFileImage } from './validate'

type HandleFileParams = {
  file: File
  setPreview: (url: string | null) => void
  setIsUploading: (status: boolean) => void
  setUploadProgress: (progress: number) => void
  setValue: (name: string, value: any, options?: { shouldValidate?: boolean }) => void
  fieldName?: string
}

export const handleFileAutoUpload = async ({
  file,
  setPreview,
  setIsUploading,
  setUploadProgress,
  setValue,
  fieldName = 'icon_url',
}: HandleFileParams) => {
  if (!validateFileImage(file)) return
  const localPreview = URL.createObjectURL(file)
  setPreview(localPreview)
  try {
    setIsUploading(true)
    setUploadProgress(0)

    const res = await uploadFile(file, setUploadProgress)
    const url = res.data.url

    setValue(fieldName, url)
    toast.success('Upload success')
  } catch {
    toast.error('Upload failed')
    setPreview(null)
  } finally {
    setIsUploading(false)
  }
}
