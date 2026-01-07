import { api } from '@/api/axios'
import { DEFAULT_GAME_IMAGE } from '@/tables/table-game'
import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
  gameId: string
  currentImage: string
}

export function GameThumbnailCell({ row }: { row: any }) {
  const [open, setOpen] = useState(false)

  const image = row.original.thumbnail_url?.trim() || DEFAULT_GAME_IMAGE

  return (
    <>
      <img
        src={image}
        alt={row.original.name}
        className="h-12 w-12 rounded-md object-contain border cursor-pointer hover:opacity-80 transition"
        loading="lazy"
        onClick={() => setOpen(true)}
        onError={(e) => {
          e.currentTarget.src = DEFAULT_GAME_IMAGE
        }}
      />

      <UploadImageModal
        open={open}
        onClose={() => setOpen(false)}
        gameId={row.original.id}
        currentImage={image}
      />
    </>
  )
}

export function UploadImageModal({ open, onClose, gameId, currentImage }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [preview, setPreview] = useState<string | null>(currentImage)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return

    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)

    try {
      setIsUploading(true)
      setProgress(0)

      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await api.post('/upload/new', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) {
            setProgress(Math.round((e.loaded * 100) / e.total))
          }
        },
      })

      const thumbnailUrl = uploadRes.data.data.url

      await api.patch('/games/image', {
        game_id: gameId,
        thumbnail_url: thumbnailUrl,
      })

      onClose()
    } catch (err) {
      console.error(err)
      alert('Upload gagal')
    } finally {
      setIsUploading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-105 space-y-4">
        <h2 className="text-lg font-semibold">Change Game Image</h2>

        {preview && <img src={preview} className="h-32 w-full object-contain rounded border" />}

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const file = e.dataTransfer.files[0]
            if (file) handleFile(file)
          }}
          className={`relative flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition
            ${isUploading ? 'pointer-events-none opacity-60' : 'hover:border-primary'}
          `}
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <UploadCloud className="h-6 w-6" />
            <span className="text-sm">Click or Drop image</span>
          </div>

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
              Uploading {progress}%
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*,.svg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />

        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <button
          onClick={onClose}
          disabled={isUploading}
          className="w-full border rounded-md py-2 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  )
}
