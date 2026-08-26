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

import { handleFileAutoUpload } from '@/helpers/upload'
import type { Product } from '@/types/product'
import { useUpdateImageProductV2 } from '@/hooks/useProduct'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { ACCEPTED_IMAGE_ACCEPT } from '@/lib/file'

type PropsImageProducts = {
  product: Product
  image: string
}

export type FormValuesChangeImageProductV2 = {
  image: string
  product_id: string
}

export function ChangeImageModalProduct({ product, image }: PropsImageProducts) {
  const { t } = useTranslation('common')
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadLabelId = useId()
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValuesChangeImageProductV2>()

  const applyOpen = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setPreview(null)
      setUploadProgress(0)
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const updateImageMutation = useUpdateImageProductV2(() => applyOpen(false))

  useEffect(() => {
    if (!open) return

    reset({
      image: product.image,
    })

    setPreview(product.image)
  }, [open, product, reset])

  const handleFile = (file: File) => {
    handleFileAutoUpload({
      file,
      setPreview,
      setIsUploading,
      setUploadProgress,
      setValue: setValue as any,
      fieldName: 'image',
    })
  }

  const onSubmit = (values: FormValuesChangeImageProductV2) => {
    updateImageMutation.mutate({
      product_id: product.id,
      image: values.image,
    })
  }

  return (
    <>
      <div
        role='button'
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
        className='group relative h-10 w-10 shrink-0 cursor-pointer rounded-md outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring'
        aria-label={t('productImageModal.openAria', { name: product.name })}
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

        <div className='pointer-events-none absolute inset-0 flex items-center justify-center rounded-md bg-black/40 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100'>
          <Pencil className='h-4 w-4 text-white' aria-hidden />
        </div>
      </div>

      <Dialog open={open} onOpenChange={applyOpen}>
        <DialogContent className='rounded-xl sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>{t('productImageModal.title')}</DialogTitle>
            <DialogDescription>
              {t('productImageModal.description', { name: product.name })}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <input
              type='hidden'
              {...register('image', {
                required: t('productImageModal.required'),
              })}
            />

            <div className='space-y-2'>
              <Label id={uploadLabelId} className='text-sm font-medium'>
                {t('productImageModal.label')}
              </Label>
              <div
                aria-labelledby={uploadLabelId}
                role='button'
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
                  if (file) handleFile(file)
                }}
                className={cn(
                  'relative flex h-40 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition',
                  isUploading ? 'pointer-events-none opacity-60' : 'hover:border-primary',
                  errors.image ? 'border-destructive' : 'border-border/80',
                )}
              >
                {preview ? (
                  <img src={preview} alt='' className='h-full w-full rounded-lg object-contain' />
                ) : (
                  <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                    <UploadCloud className='h-6 w-6' aria-hidden />
                    <span className='text-sm'>{t('productImageModal.dropHint')}</span>
                  </div>
                )}

                {isUploading && (
                  <div className='absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-sm font-medium text-white'>
                    {t('productImageModal.uploading', { percent: uploadProgress })}
                  </div>
                )}
              </div>

              <Input
                ref={inputRef}
                type='file'
                accept={ACCEPTED_IMAGE_ACCEPT}
                className='hidden'
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                  e.target.value = ''
                }}
              />

              {isUploading && <Progress value={uploadProgress} />}

              {errors.image && <p className='text-xs text-destructive'>{errors.image.message}</p>}
            </div>

            <DialogFooter className='gap-2 sm:gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => applyOpen(false)}
                disabled={updateImageMutation.isPending}
                className='cursor-pointer rounded-xl'
              >
                {t('productImageModal.cancel')}
              </Button>
              <Button
                type='submit'
                disabled={updateImageMutation.isPending || isUploading}
                className='inline-flex cursor-pointer items-center gap-2 rounded-xl'
              >
                {updateImageMutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 shrink-0 animate-spin' aria-hidden />
                    {t('productImageModal.saving')}
                  </>
                ) : (
                  t('productImageModal.save')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
