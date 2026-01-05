import { useRef } from 'react'
import { Label } from '../ui/label'
import { handleFileAutoUpload } from '@/helpers/upload'
import { UploadCloud } from 'lucide-react'
import { Progress } from '../ui/progress'
import type { UseFormSetValue } from 'react-hook-form'
import type { CreateGamePayload } from '@/types/game'

interface ImageComponentProps {
  title: string
  preview: string
  setPreview: (url: string | null) => void
  isUploading: boolean
  setIsUploading: (upload: boolean) => void
  setValue: UseFormSetValue<CreateGamePayload>
  uploadProgress: number
  setUploadProgress: (value: number) => void
  value: string
}

export default function ImageComponent({
  title,
  value,
  preview,
  setPreview,
  isUploading,
  setIsUploading,
  setValue,
  uploadProgress,
  setUploadProgress,
}: ImageComponentProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    handleFileAutoUpload({
      file,
      setPreview,
      setIsUploading,
      setUploadProgress,
      setValue: setValue as any,
      fieldName: value,
    })
  }
  return (
    <div className="space-y-2">
      <Label>{title}</Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files[0]
          if (file) handleFile(file)
        }}
        className={`group relative flex h-40 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition
                  ${isUploading ? 'pointer-events-none opacity-60' : 'hover:border-primary'}
                `}
      >
        {preview ? (
          <img src={preview} className="h-full w-full rounded-lg object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <UploadCloud className="h-6 w-6" />
            <span className="text-sm">Click or Drop image</span>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
            <span className="text-sm">Uploading {uploadProgress}%</span>
          </div>
        )}
      </div>

      {/* Progress */}
      {isUploading && <Progress value={uploadProgress} />}
    </div>
  )
}
