import { useRef, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Clapperboard, Plus, UploadCloud } from 'lucide-react'

import { handleFileAutoUpload } from '@/helpers/upload'
import { useCreateShow } from '@/hooks/useShow'
import { useTranslation } from 'react-i18next'

export type FormValuesShow = {
  name: string
  alias: string
  image: string
}

export type ShowPayload = {
  name: string
  alias: string
  image: string
}

export function CreateShowModal() {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValuesShow>({
    defaultValues: { name: '', alias: '', image: '' },
  })

  const setDialogOpen = (value: boolean) => {
    if (!value) {
      reset({ name: '', alias: '', image: '' })
      setPreview(null)
      setUploadProgress(0)
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
    setOpen(value)
  }

  const mutation = useCreateShow(reset, setPreview, setDialogOpen)
  const onSubmit = (values: FormValuesShow) => {
    mutation.mutate(values)
  }

  const handleFile = (file: File) => {
    handleFileAutoUpload({
      file,
      setPreview,
      setIsUploading,
      setUploadProgress,
      setValue: setValue as Parameters<typeof handleFileAutoUpload>[0]['setValue'],
      fieldName: 'image',
    })
  }

  return (
    <>
      <Button
        type="button"
        className="w-full cursor-pointer gap-2 shadow-sm sm:w-auto"
        onClick={() => setDialogOpen(true)}
      >
        <Plus className="h-4 w-4 shrink-0" aria-hidden />
        {t('createShowModal.trigger')}
      </Button>

      <Dialog open={open} onOpenChange={setDialogOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
          <div className="border-b border-border bg-muted/30 px-6 py-5">
            <DialogHeader className="gap-1.5 text-left">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clapperboard className="h-4 w-4" aria-hidden />
                </span>
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  {t('createShowModal.title')}
                </DialogTitle>
              </div>
              <DialogDescription>{t('createShowModal.description')}</DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="show-name">{t('createShowModal.nameLabel')}</Label>
              <div className="space-y-1">
                <Input
                  id="show-name"
                  {...register('name', {
                    required: t('createShowModal.nameRequired'),
                  })}
                  placeholder={t('createShowModal.namePlaceholder')}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <p className="text-xs text-muted-foreground">{t('createShowModal.nameHint')}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="show-alias">{t('createShowModal.aliasLabel')}</Label>
              <div className="space-y-1">
                <Input
                  id="show-alias"
                  {...register('alias', {
                    required: t('createShowModal.aliasRequired'),
                  })}
                  placeholder={t('createShowModal.aliasPlaceholder')}
                  autoComplete="off"
                  aria-invalid={!!errors.alias}
                />
                {errors.alias && <p className="text-xs text-destructive">{errors.alias.message}</p>}
              </div>
              <p className="text-xs text-muted-foreground">{t('createShowModal.aliasHint')}</p>
            </div>

            <input type="hidden" {...register('image')} />

            <div className="space-y-2">
              <Label>{t('createShowModal.imageLabel')}</Label>
              <p className="text-xs text-muted-foreground">{t('createBannerModal.imageHint')}</p>

              <div
                role="button"
                tabIndex={0}
                aria-label={t('createShowModal.uploadAria')}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    inputRef.current?.click()
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file) handleFile(file)
                }}
                className={`group relative flex min-h-[11rem] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/20 px-4 py-6 transition-colors outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50 ${
                  isUploading
                    ? 'pointer-events-none opacity-60'
                    : 'hover:border-primary/50 hover:bg-muted/35'
                }`}
              >
                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt={t('createShowModal.previewAlt')}
                      className="max-h-44 w-full rounded-lg object-contain"
                    />
                    {!isUploading && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
                        <span className="rounded-md bg-background/95 px-3 py-1.5 text-sm font-medium shadow-sm">
                          {t('createBannerModal.changeImage')}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border">
                      <UploadCloud className="h-6 w-6 text-primary" aria-hidden />
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {t('createBannerModal.uploadTitle')}
                    </span>
                    <span className="max-w-[16rem] text-xs leading-relaxed">
                      {t('createBannerModal.uploadDropHint')}
                    </span>
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-background/85 backdrop-blur-[2px]">
                    <span className="text-sm font-medium text-foreground">
                      {t('createBannerModal.uploading', { percent: uploadProgress })}
                    </span>
                    <Progress value={uploadProgress} className="h-2 w-[min(100%,12rem)]" />
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
                }}
              />
            </div>

            <DialogFooter className="gap-2 border-t border-border pt-5 sm:pt-5">
              <Button
                className="cursor-pointer sm:min-w-[5.5rem]"
                variant="outline"
                type="button"
                onClick={() => setDialogOpen(false)}
              >
                {t('createBannerModal.cancel')}
              </Button>
              <Button
                className="cursor-pointer sm:min-w-[5.5rem]"
                type="submit"
                disabled={isUploading || mutation.isPending}
              >
                {mutation.isPending ? t('createBannerModal.saving') : t('createBannerModal.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
