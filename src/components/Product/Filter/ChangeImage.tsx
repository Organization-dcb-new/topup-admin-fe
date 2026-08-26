import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { handleFileAutoUpload } from '@/helpers/upload'
import type { GameNames } from '@/hooks/useGame'
import { useGetGameNames } from '@/hooks/useGame'
import { useUpdateImageProduct } from '@/hooks/useProduct'
import { cn } from '@/lib/utils'
import { ImagePlus, Loader2, UploadCloud } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ACCEPTED_IMAGE_ACCEPT } from '@/lib/file'

export type FormValuesProductImage = {
  image: string
  game_id: string
}

export function ChangeImageByGame() {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { data: dataGameNames } = useGetGameNames()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValuesProductImage>()

  const mutation = useUpdateImageProduct(setOpen)
  const onSubmit = (values: FormValuesProductImage) => {
    mutation.mutate(values)
  }

  const handleFile = (file: File) => {
    handleFileAutoUpload({
      file,
      setPreview,
      setIsUploading,
      setUploadProgress,
      setValue: (name, value, options) => {
        if (name === 'image') {
          setValue('image', String(value), options)
        }
      },
      fieldName: 'image',
    })
  }

  useEffect(() => {
    if (!open) {
      reset()
      /* eslint-disable react-hooks/set-state-in-effect -- reset pratinjau/unggah saat dialog ditutup */
      setPreview(null)
      setUploadProgress(0)
      setIsUploading(false)
      /* eslint-enable react-hooks/set-state-in-effect */
      if (inputRef.current) inputRef.current.value = ''
    }
  }, [open, reset])

  const openFilePicker = () => inputRef.current?.click()

  return (
    <>
      <Button
        type='button'
        variant='outline'
        className='h-10 shrink-0 gap-2 font-normal shadow-sm'
        onClick={() => setOpen(true)}
      >
        <ImagePlus className='h-4 w-4 text-primary' aria-hidden />
        {t('productFilters.changeImageByGame')}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='rounded-xl sm:max-w-md'>
          <DialogHeader className='space-y-1 text-left'>
            <DialogTitle className='text-lg font-semibold tracking-tight'>
              {t('productGameImageModal.title')}
            </DialogTitle>
            <DialogDescription>
              {t('productGameImageModal.description')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='change-img-game' className='text-sm font-medium'>
                {t('productGameImageModal.gameLabel')}
              </Label>
              <select
                id='change-img-game'
                {...register('game_id', {
                  required: t('productGameImageModal.gameRequired'),
                })}
                className={cn(
                  'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs',
                  'ring-offset-background focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
                aria-invalid={!!errors.game_id}
              >
                <option value='' disabled>
                  {t('productGameImageModal.selectGame')}
                </option>
                {dataGameNames?.map((game: GameNames) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
              {errors.game_id && (
                <p className='text-xs text-destructive'>{errors.game_id.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label className='text-sm font-medium'>{t('productGameImageModal.imageLabel')}</Label>
              <p className='text-xs text-muted-foreground'>
                {t('productGameImageModal.imageHint')}
              </p>

              <div
                role='button'
                tabIndex={0}
                onClick={openFilePicker}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openFilePicker()
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file) handleFile(file)
                }}
                className={cn(
                  'group relative flex h-44 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border/80 bg-muted/15 transition-colors',
                  isUploading
                    ? 'pointer-events-none opacity-70'
                    : 'hover:border-primary/60 hover:bg-muted/25',
                )}
                aria-label={t('productGameImageModal.uploadAria')}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt={t('productGameImageModal.previewAlt')}
                    className='max-h-full max-w-full rounded-lg object-contain p-2'
                  />
                ) : (
                  <div className='flex flex-col items-center gap-2 px-4 text-center text-muted-foreground'>
                    <UploadCloud className='h-8 w-8 opacity-80' aria-hidden />
                    <span className='text-sm font-medium text-foreground'>{t('productGameImageModal.dropHint')}</span>
                    <span className='text-xs'>{t('productGameImageModal.maxHint')}</span>
                  </div>
                )}

                {isUploading && (
                  <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-background/85 backdrop-blur-[2px]'>
                    <Loader2 className='h-8 w-8 animate-spin text-primary' aria-hidden />
                    <span className='text-sm font-medium text-foreground'>
                      {t('productGameImageModal.uploading', { percent: uploadProgress })}
                    </span>
                  </div>
                )}
              </div>

              {isUploading && <Progress value={uploadProgress} className='h-2' />}
            </div>

            <input
              ref={inputRef}
              type='file'
              accept={ACCEPTED_IMAGE_ACCEPT}
              className='hidden'
              tabIndex={-1}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />

            <DialogFooter className='gap-2 sm:gap-2'>
              <Button
                type='button'
                variant='outline'
                className='rounded-xl'
                onClick={() => setOpen(false)}
              >
                {t('productGameImageModal.cancel')}
              </Button>
              <Button
                type='submit'
                className='inline-flex items-center gap-2 rounded-xl'
                disabled={isUploading || mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 shrink-0 animate-spin' aria-hidden />
                    {t('productGameImageModal.saving')}
                  </>
                ) : (
                  t('productGameImageModal.save')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
