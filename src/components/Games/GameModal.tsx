import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import type { Game } from '@/types/game'
import { api } from '@/api/axios'
import { DEFAULT_GAME_IMAGE } from '@/tables/table-game'
import { UploadCloud } from 'lucide-react'

interface Props {
  game: Game | null
  onClose: () => void
  onSuccess: () => void
}

const MAX_FILE_SIZE = 2 * 1024 * 1024

export default function GameImageModal({ game, onClose, onSuccess }: Props) {
  const [preview, setPreview] = useState(DEFAULT_GAME_IMAGE)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)

  // reset modal
  useEffect(() => {
    if (game) {
      setPreview(game.thumbnail_url || DEFAULT_GAME_IMAGE)
      setUploadedUrl(null)
      setProgress(0)
      setLoading(false)
    }
  }, [game])

  const validateFile = (file: File) => {
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

  const uploadImage = async (file: File) => {
    try {
      setLoading(true)
      setProgress(0)

      const formData = new FormData()
      formData.append('file', file)

      const res = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (!e.total) return
          const percent = Math.min(Math.round((e.loaded * 100) / e.total), 100)
          setProgress(percent)
        },
      })

      const url = res.data?.data?.url
      if (!url) throw new Error()

      setUploadedUrl(url)
      setPreview(url)
      toast.success('Upload success')
    } catch {
      toast.error('Upload failed')
      setPreview(game?.thumbnail_url || DEFAULT_GAME_IMAGE)
    } finally {
      setProgress(100)

      setTimeout(() => setLoading(false), 200)
    }
  }

  const handleFile = (file: File) => {
    if (!validateFile(file)) return

    // preview lokal cepat
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    uploadImage(file)
  }

  const handleSave = async () => {
    if (!uploadedUrl || !game) return

    try {
      setSaving(true)
      await api.patch('/games/image', {
        game_id: game.id,
        thumbnail_url: uploadedUrl,
      })

      toast.success('Image saved')
      onSuccess()
      onClose()
    } catch {
      toast.error('Failed to save image')
    } finally {
      setSaving(false)
    }
  }

  if (!game) return null

  return (
    <Dialog open={!!game} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Game Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dropzone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const f = e.dataTransfer.files[0]
              if (f) handleFile(f)
            }}
            className="group relative mx-auto flex h-40 w-40 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition hover:border-primary"
          >
            <img
              src={preview}
              className="h-full w-full rounded-xl object-contain transition-opacity group-hover:opacity-60"
            />

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl bg-black/50 opacity-0 transition group-hover:opacity-100">
              <UploadCloud className="h-6 w-6 text-white" />
              <span className="text-xs font-medium text-white">Click or Drop</span>
            </div>
          </div>

          {/* Progress */}
          {loading && (
            <div className="space-y-1">
              <div className="h-2 w-full overflow-hidden rounded bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-xs text-muted-foreground">Uploading {progress}%</p>
            </div>
          )}

          {/* Hidden Input */}
          <Input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={loading}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />

          {/* Save */}
          <Button
            onClick={handleSave}
            disabled={!uploadedUrl || loading || saving}
            className="w-full cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Image'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
