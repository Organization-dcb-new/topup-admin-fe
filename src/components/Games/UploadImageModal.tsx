import { useEffect, useId, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Loader2, Pencil, UploadCloud } from 'lucide-react'

import type { Game } from '@/types/game'
import { useUpdateImageGame } from '@/hooks/useGame'
import { handleFileAutoUpload } from '@/helpers/upload'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

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

const emptyUploadState = (): UploadState => ({
  preview: null,
  uploading: false,
  progress: 0,
})

export function ChangeImageModal({ game, image }: PropsImageGame) {
  const { t } = useTranslation('common')
  const inputThumbnailRef = useRef<HTMLInputElement>(null)
  const inputBannerRef = useRef<HTMLInputElement>(null)
  const thumbnailLabelId = useId()
  const bannerLabelId = useId()

  const [open, setOpen] = useState(false)

  const [thumbnail, setThumbnail] = useState<UploadState>(emptyUploadState)
  const [banner, setBanner] = useState<UploadState>(emptyUploadState)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValuesChangeImage>()

  const applyOpen = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setThumbnail(emptyUploadState())
      setBanner(emptyUploadState())
      if (inputThumbnailRef.current) inputThumbnailRef.current.value = ''
      if (inputBannerRef.current) inputBannerRef.current.value = ''
    }
  }

  const updateImageMutation = useUpdateImageGame(() => applyOpen(false))

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
      setValue: setValue as Parameters<typeof handleFileAutoUpload>[0]['setValue'],
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
    labelId,
    label,
    requiredMessage,
    state,
    inputRef,
    field,
  }: {
    labelId: string
    label: string
    requiredMessage: string
    state: UploadState
    inputRef: React.RefObject<HTMLInputElement | null>
    field: 'thumbnail_url' | 'banner_url'
  }) => (
    <div className="space-y-2">
      <Label id={labelId} className="text-sm font-medium">
        {label}
      </Label>

      <input type="hidden" {...register(field, { required: requiredMessage })} />

      <div
        aria-labelledby={labelId}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files[0]
          if (file) handleFile(file, field)
        }}
        className={cn(
          'relative flex h-40 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition',
          state.uploading ? 'pointer-events-none opacity-60' : 'hover:border-primary',
          errors[field] ? 'border-destructive' : 'border-border/80',
        )}
      >
        {state.preview ? (
          <img src={state.preview} alt="" className="h-full w-full rounded-lg object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <UploadCloud className="h-6 w-6" aria-hidden />
            <span className="text-sm">{t('gameImageModal.dropHint')}</span>
          </div>
        )}

        {state.uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-sm font-medium text-white">
            {t('gameImageModal.uploadingPercent', { percent: state.progress })}
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
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            e.stopPropagation()
            applyOpen(true)
          }
        }}
        onClick={(e) => {
          e.stopPropagation()
          applyOpen(true)
        }}
        className="group relative h-10 w-10 shrink-0 cursor-pointer rounded-md outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t('gameImageModal.openAria', { name: game.name })}
      >
        <img
          src={image}
          alt=""
          className="h-10 w-10 rounded-md border border-border/80 bg-muted/20 object-contain ring-1 ring-gray-900/5"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.png'
          }}
        />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-md bg-black/40 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <Pencil className="h-4 w-4 text-white" aria-hidden />
        </div>
      </div>

      <Dialog open={open} onOpenChange={applyOpen}>
        <DialogContent className="rounded-xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('gameImageModal.title')}</DialogTitle>
            <DialogDescription>{t('gameImageModal.description', { name: game.name })}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {renderUploadBox({
              labelId: thumbnailLabelId,
              label: t('gameImageModal.thumbnailLabel'),
              requiredMessage: t('gameImageModal.thumbnailRequired'),
              state: thumbnail,
              inputRef: inputThumbnailRef,
              field: 'thumbnail_url',
            })}

            {renderUploadBox({
              labelId: bannerLabelId,
              label: t('gameImageModal.bannerLabel'),
              requiredMessage: t('gameImageModal.bannerRequired'),
              state: banner,
              inputRef: inputBannerRef,
              field: 'banner_url',
            })}

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => applyOpen(false)}
                disabled={updateImageMutation.isPending}
                className="cursor-pointer rounded-xl"
              >
                {t('gameImageModal.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={updateImageMutation.isPending || thumbnail.uploading || banner.uploading}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl"
              >
                {updateImageMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                    {t('gameImageModal.saving')}
                  </>
                ) : (
                  t('gameImageModal.save')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
