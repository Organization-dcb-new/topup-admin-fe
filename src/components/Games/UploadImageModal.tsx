import { useEffect, useId, useRef, useState } from 'react'
import {
  GAME_BANNER_ASPECT,
  GAME_THUMBNAIL_ASPECT,
} from '@/constants/image-ratios'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Loader2, Pencil, Trash2, UploadCloud } from 'lucide-react'

import type { Game } from '@/types/game'
import { useUpdateImageGame } from '@/hooks/useGame'
import { handleFileAutoUpload } from '@/helpers/upload'
import { getImageFileValidationError } from '@/helpers/validate'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { ACCEPTED_IMAGE_ACCEPT } from '@/lib/file'

type PropsImageGame = {
  game: Game
  image: string
  children?: React.ReactNode
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

type FileField = 'thumbnail_url' | 'banner_url'

const emptyUploadState = (): UploadState => ({
  preview: null,
  uploading: false,
  progress: 0,
})

function revokeBlobUrl(url: string | null | undefined) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
}

export function ChangeImageModal({ game, image, children }: PropsImageGame) {
  const { t } = useTranslation('common')
  const inputThumbnailRef = useRef<HTMLInputElement>(null)
  const inputBannerRef = useRef<HTMLInputElement>(null)
  const thumbnailLabelId = useId()
  const bannerLabelId = useId()
  const thumbnailInputId = useId()
  const bannerInputId = useId()

  const [open, setOpen] = useState(false)
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false)
  const [fileErrors, setFileErrors] = useState<Partial<Record<FileField, string>>>({})

  const [thumbnail, setThumbnail] = useState<UploadState>(emptyUploadState)
  const [banner, setBanner] = useState<UploadState>(emptyUploadState)

  const baselineRef = useRef({ thumbnail_url: '', banner_url: '' })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValuesChangeImage>()

  const thumbnailUrl = watch('thumbnail_url')
  const bannerUrl = watch('banner_url')

  const isDirty =
    open &&
    (thumbnailUrl !== baselineRef.current.thumbnail_url || bannerUrl !== baselineRef.current.banner_url)

  const performClose = () => {
    revokeBlobUrl(thumbnail.preview)
    revokeBlobUrl(banner.preview)
    setThumbnail(emptyUploadState())
    setBanner(emptyUploadState())
    setFileErrors({})
    if (inputThumbnailRef.current) inputThumbnailRef.current.value = ''
    if (inputBannerRef.current) inputBannerRef.current.value = ''
    setOpen(false)
  }

  const handleRequestClose = () => {
    if (!isDirty) {
      performClose()
    } else {
      setConfirmDiscardOpen(true)
    }
  }

  const handleMainOpenChange = (next: boolean) => {
    if (next) {
      setOpen(true)
    } else {
      handleRequestClose()
    }
  }

  const updateImageMutation = useUpdateImageGame(() => {
    performClose()
  })

  useEffect(() => {
    if (!open) return

    const thumb = game.thumbnail_url ?? ''
    const ban = game.banner_url ?? ''

    reset({
      thumbnail_url: thumb,
      banner_url: ban,
    })

    baselineRef.current = { thumbnail_url: thumb, banner_url: ban }

    setThumbnail((s) => ({ ...s, preview: thumb || null }))
    setBanner((s) => ({ ...s, preview: ban || null }))
  }, [open, game.id, game.thumbnail_url, game.banner_url, reset])

  const handleFile = async (file: File, field: FileField) => {
    const validation = getImageFileValidationError(file)
    if (validation) {
      setFileErrors((prev) => ({
        ...prev,
        [field]: t(`gameImageModal.errors.${validation}`),
      }))
      return
    }

    setFileErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })

    await handleFileAutoUpload({
      file,
      setPreview: (url) =>
        field === 'thumbnail_url'
          ? setThumbnail((s) => ({ ...s, preview: url }))
          : setBanner((s) => ({ ...s, preview: url })),
      setIsUploading: (val) =>
        field === 'thumbnail_url'
          ? setThumbnail((s) => ({ ...s, uploading: val }))
          : setBanner((s) => ({ ...s, uploading: val })),
      setUploadProgress: (val) =>
        field === 'thumbnail_url'
          ? setThumbnail((s) => ({ ...s, progress: val }))
          : setBanner((s) => ({ ...s, progress: val })),
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

  const displayUrl = (field: FileField, state: UploadState) =>
    (state.preview ?? (field === 'thumbnail_url' ? thumbnailUrl : bannerUrl)) || ''

  const handleRemove = (field: FileField) => {
    revokeBlobUrl(field === 'thumbnail_url' ? thumbnail.preview : banner.preview)
    if (field === 'thumbnail_url') {
      setThumbnail(emptyUploadState())
    } else {
      setBanner(emptyUploadState())
    }
    setValue(field, '', { shouldValidate: true, shouldDirty: true })
    setFileErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
    const ref = field === 'thumbnail_url' ? inputThumbnailRef : inputBannerRef
    if (ref.current) ref.current.value = ''
  }

  const renderUploadBox = ({
    labelId,
    inputId,
    label,
    requiredMessage,
    state,
    inputRef,
    field,
    variant,
    hint,
  }: {
    labelId: string
    inputId: string
    label: string
    requiredMessage: string
    hint: string
    state: UploadState
    inputRef: React.RefObject<HTMLInputElement | null>
    field: FileField
    variant: 'thumbnail' | 'banner'
  }) => {
    const url = displayUrl(field, state)
    const hasImage = Boolean(url)
    const fileError = fileErrors[field]
    const fieldError = errors[field]?.message

    return (
      <div className='space-y-2'>
        <Label id={labelId} htmlFor={inputId} className='text-sm font-medium'>
          {label}
        </Label>

        <input
          type='hidden'
          {...register(field, field === 'thumbnail_url' ? { required: requiredMessage } : {})}
        />

        <div
          className='relative rounded-lg'
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            const file = e.dataTransfer.files[0]
            if (file) void handleFile(file, field)
          }}
        >
          <button
            type='button'
            id={inputId}
            aria-labelledby={labelId}
            aria-busy={state.uploading}
            disabled={state.uploading}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-muted/15 text-left transition outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              state.uploading ? 'pointer-events-none opacity-60' : 'hover:border-primary',
              fieldError || fileError ? 'border-destructive' : 'border-border/80',
              variant === 'thumbnail' &&
                `${GAME_THUMBNAIL_ASPECT} max-h-44 max-w-[11rem] mx-auto`,
              variant === 'banner' && `${GAME_BANNER_ASPECT} min-h-[7.5rem] w-full`,
            )}
          >
            {hasImage ? (
              <img
                src={url}
                alt=''
                className='h-full w-full bg-muted/20 object-cover'
              />
            ) : (
              <div className='flex flex-col items-center gap-2 px-4 py-8 text-muted-foreground'>
                <UploadCloud className='h-6 w-6 shrink-0' aria-hidden />
                <span className='text-center text-sm'>{t('gameImageModal.dropHint')}</span>
              </div>
            )}

            {state.uploading && (
              <div
                className='absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-sm font-medium text-white'
                aria-live='polite'
              >
                {t('gameImageModal.uploadingPercent', { percent: state.progress })}
              </div>
            )}
          </button>

          <Input
            id={`${inputId}-file`}
            ref={inputRef}
            type='file'
            accept={ACCEPTED_IMAGE_ACCEPT}
            className='sr-only'
            tabIndex={-1}
            aria-hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleFile(file, field)
              e.target.value = ''
            }}
          />
        </div>

        <p className='text-xs text-muted-foreground'>{hint}</p>

        {state.uploading && <Progress value={state.progress} />}

        {hasImage && !state.uploading && (
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-8 gap-1.5 rounded-lg text-xs text-destructive hover:bg-destructive/10 hover:text-destructive'
              onClick={() => handleRemove(field)}
              aria-label={
                field === 'thumbnail_url'
                  ? t('gameImageModal.removeImageAriaThumbnail')
                  : t('gameImageModal.removeImageAriaBanner')
              }
            >
              <Trash2 className='h-3.5 w-3.5' aria-hidden />
              {t('gameImageModal.remove')}
            </Button>
          </div>
        )}

        {(fileError || fieldError) && (
          <p className='text-xs text-destructive'>{fileError ?? fieldError}</p>
        )}
      </div>
    )
  }

  return (
    <>
      {children ? (
        <div
          onClick={(e) => {
            e.stopPropagation()
            setOpen(true)
          }}
          className='inline-block min-w-0 shrink-0'
        >
          {children}
        </div>
      ) : (
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation()
            setOpen(true)
          }}
          className='group relative h-10 w-10 shrink-0 rounded-md outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring'
          aria-label={t('gameImageModal.openAria', { name: game.name })}
        >
          <img
            src={image}
            alt=''
            className='h-10 w-10 rounded-md border border-border/80 bg-muted/20 object-contain ring-1 ring-gray-900/5'
            loading='lazy'
            onError={(e) => {
              e.currentTarget.src = '/placeholder.png'
            }}
          />

          <span className='pointer-events-none absolute inset-0 flex items-center justify-center rounded-md bg-black/40 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100'>
            <Pencil className='h-4 w-4 text-white' aria-hidden />
          </span>
        </button>
      )}

      <Dialog open={open} onOpenChange={handleMainOpenChange}>
        <DialogContent className='rounded-xl sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>{t('gameImageModal.title')}</DialogTitle>
            <DialogDescription>{t('gameImageModal.description', { name: game.name })}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
            {renderUploadBox({
              labelId: thumbnailLabelId,
              inputId: thumbnailInputId,
              label: t('gameImageModal.thumbnailLabel'),
              requiredMessage: t('gameImageModal.thumbnailRequired'),
              state: thumbnail,
              inputRef: inputThumbnailRef,
              field: 'thumbnail_url',
              variant: 'thumbnail',
              hint: t('gameImageModal.thumbnailHint'),
            })}

            {renderUploadBox({
              labelId: bannerLabelId,
              inputId: bannerInputId,
              label: t('gameImageModal.bannerLabel'),
              requiredMessage: t('gameImageModal.bannerRequired'),
              state: banner,
              inputRef: inputBannerRef,
              field: 'banner_url',
              variant: 'banner',
              hint: t('gameImageModal.bannerHint'),
            })}

            <DialogFooter className='gap-2 sm:gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleRequestClose()}
                disabled={updateImageMutation.isPending}
                className='cursor-pointer rounded-xl'
              >
                {t('gameImageModal.cancel')}
              </Button>
              <Button
                type='submit'
                disabled={updateImageMutation.isPending || thumbnail.uploading || banner.uploading}
                className='inline-flex cursor-pointer items-center gap-2 rounded-xl'
              >
                {updateImageMutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 shrink-0 animate-spin' aria-hidden />
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

      <AlertDialog open={confirmDiscardOpen} onOpenChange={setConfirmDiscardOpen}>
        <AlertDialogContent className='rounded-xl'>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('gameImageModal.discardTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('gameImageModal.discardDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='rounded-lg'>{t('gameImageModal.discardStay')}</AlertDialogCancel>
            <AlertDialogAction
              className='rounded-lg'
              onClick={() => {
                setConfirmDiscardOpen(false)
                performClose()
              }}
            >
              {t('gameImageModal.discardLeave')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
