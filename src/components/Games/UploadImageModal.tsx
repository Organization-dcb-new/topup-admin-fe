'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Pencil, UploadCloud } from 'lucide-react'

import type { Game } from '@/types/game'
import { useUpdateImageGame } from '@/hooks/useGame'
import { handleFileAutoUpload } from '@/helpers/upload'

type PropsImageGame = {
  game: Game
  image: string
}

export type FormValuesChangeImage = {
  thumbnail_url: string
  banner_url: string
  game_id: string
}

type UploadState = {
  preview: string | null
  uploading: boolean
  progress: number
}

export function ChangeImageModal({ game, image }: PropsImageGame) {
  const inputThumbnailRef = useRef<HTMLInputElement>(null)
  const inputBannerRef = useRef<HTMLInputElement>(null)

  const [open, setOpen] = useState(false)

  const [thumbnail, setThumbnail] = useState<UploadState>({
    preview: null,
    uploading: false,
    progress: 0,
  })

  const [banner, setBanner] = useState<UploadState>({
    preview: null,
    uploading: false,
    progress: 0,
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValuesChangeImage>()

  const updateImageMutation = useUpdateImageGame(() => setOpen(false))

  useEffect(() => {
    if (!open) return

    reset({
      thumbnail_url: game.thumbnail_url,
      banner_url: game.banner_url,
    })

    setThumbnail((s) => ({ ...s, preview: game.thumbnail_url }))
    setBanner((s) => ({ ...s, preview: game.banner_url }))
  }, [open, game, reset])

  const handleFile = (file: File, field: 'thumbnail_url' | 'banner_url') => {
    const setState = field === 'thumbnail_url' ? setThumbnail : setBanner

    handleFileAutoUpload({
      file,
      setPreview: (url) => setState((s) => ({ ...s, preview: url })),
      setIsUploading: (val) => setState((s) => ({ ...s, uploading: val })),
      setUploadProgress: (val) => setState((s) => ({ ...s, progress: val })),
      setValue: setValue as any,
      fieldName: field,
    })
  }

  const onSubmit = (values: FormValuesChangeImage) => {
    updateImageMutation.mutate({
      game_id: game.id,
      thumbnail_url: values.thumbnail_url,
      banner_url: values.banner_url,
    })
  }

  const renderUploadBox = ({
    label,
    state,
    inputRef,
    field,
  }: {
    label: string
    state: UploadState
    inputRef: React.RefObject<HTMLInputElement | null>
    field: 'thumbnail_url' | 'banner_url'
  }) => (
    <div className="space-y-2">
      <p>{label}</p>

      <input type="hidden" {...register(field, { required: 'Image is required' })} />

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files[0]
          if (file) handleFile(file, field)
        }}
        className={`relative flex h-40 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition
          ${state.uploading ? 'pointer-events-none opacity-60' : 'hover:border-primary'}
          ${errors[field] ? 'border-destructive' : ''}
        `}
      >
        {state.preview ? (
          <img
            src={state.preview}
            alt="preview"
            className="h-full w-full rounded-lg object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <UploadCloud className="h-6 w-6" />
            <span className="text-sm">Click or drop image</span>
          </div>
        )}

        {state.uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
            Uploading {state.progress}%
          </div>
        )}
      </div>

      <Input
        ref={inputRef}
        type="file"
        accept="image/*,.svg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file, field)
          e.target.value = ''
        }}
      />

      {state.uploading && <Progress value={state.progress} />}
      {errors[field] && <p className="text-xs text-destructive">{errors[field]?.message}</p>}
    </div>
  )

  return (
    <>
      {/* Trigger */}
      <div
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        className="group relative h-12 w-12 cursor-pointer"
      >
        <img
          src={image}
          alt={game.name}
          className="h-12 w-12 rounded-md border object-contain"
          loading="lazy"
        />

        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40 opacity-0 transition group-hover:opacity-100">
          <Pencil className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Game Image</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {renderUploadBox({
              label: 'Thumbnail',
              state: thumbnail,
              inputRef: inputThumbnailRef,
              field: 'thumbnail_url',
            })}

            {renderUploadBox({
              label: 'Banner',
              state: banner,
              inputRef: inputBannerRef,
              field: 'banner_url',
            })}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={updateImageMutation.isPending || thumbnail.uploading || banner.uploading}
              >
                {updateImageMutation.isPending ? 'Saving...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
