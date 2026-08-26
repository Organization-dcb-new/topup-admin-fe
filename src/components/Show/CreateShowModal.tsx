import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Clapperboard, EyeOff, Loader2, Plus } from 'lucide-react'

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ImageDropzone } from '@/components/ui/image-dropzone'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useCreateShow } from '@/hooks/useShow'
import {
  createShowDefaults,
  createShowSchema,
  toShowAlias,
  type CreateShowFormValues,
} from '@/schemas/show'

export function CreateShowModal() {
  const { t } = useTranslation('common')

  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  /** Alias hanya diturunkan otomatis dari nama selama admin belum mengetiknya sendiri. */
  const [aliasTouched, setAliasTouched] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  /**
   * ImageDropzone menyimpan pratinjaunya di state internal dan hanya membaca
   * `value` saat mount, jadi dropzone dipasang ulang lewat key setiap kali form
   * direset — tanpa ini gambar draft sebelumnya masih terlihat saat modal dibuka lagi.
   */
  const [dropzoneKey, setDropzoneKey] = useState(0)

  const mutation = useCreateShow()

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors, isDirty, submitCount },
  } = useForm<CreateShowFormValues>({
    resolver: zodResolver(createShowSchema),
    defaultValues: createShowDefaults,
    mode: 'onTouched',
  })

  const busy = mutation.isPending || isUploading

  const closeAndReset = () => {
    setConfirmDiscard(false)
    setAliasTouched(false)
    reset(createShowDefaults)
    setDropzoneKey((key) => key + 1)
    setOpen(false)
  }

  /**
   * Esc, klik overlay, tombol silang, dan tombol Batal semuanya lewat sini:
   * penutupan dikunci selama menyimpan atau mengunggah, dan draft yang sudah
   * terisi meminta konfirmasi lebih dulu.
   */
  const requestOpenChange = (next: boolean) => {
    if (next) {
      setOpen(true)
      return
    }
    if (busy) return
    if (isDirty) {
      setConfirmDiscard(true)
      return
    }
    closeAndReset()
  }

  const nameField = register('name')

  return (
    <>
      <Dialog open={open} onOpenChange={requestOpenChange}>
        {/* Pemicu wajib berada di dalam <Dialog> lewat DialogTrigger: hanya
            dengan begitu Radix mengembalikan fokus keyboard ke tombol ini
            setelah modal ditutup. */}
        <DialogTrigger asChild>
          <Button type='button' className='w-full cursor-pointer gap-2 shadow-sm sm:w-auto'>
            <Plus className='h-4 w-4 shrink-0' aria-hidden />
            {t('createShowModal.trigger')}
          </Button>
        </DialogTrigger>

        <DialogContent className='flex max-h-[min(90vh,40rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg'>
          <div className='shrink-0 border-b border-border bg-muted/30 px-6 py-5'>
            <DialogHeader className='gap-1.5 text-left'>
              <div className='flex items-center gap-2'>
                <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                  <Clapperboard className='h-4 w-4' aria-hidden />
                </span>
                <DialogTitle className='text-xl font-semibold tracking-tight'>
                  {t('createShowModal.title')}
                </DialogTitle>
              </div>
              <DialogDescription>{t('createShowModal.description')}</DialogDescription>
            </DialogHeader>
          </div>

          <form
            onSubmit={handleSubmit((values) =>
              mutation.mutate(values, { onSuccess: closeAndReset }),
            )}
            className='flex min-h-0 flex-1 flex-col'
          >
            {/* Hanya badan form yang menggulir; judul dan tombol simpan tetap terlihat. */}
            <div className='min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5'>
              <div className='space-y-2'>
                <Label htmlFor='show-name'>{t('createShowModal.nameLabel')}</Label>
                <Input
                  id='show-name'
                  {...nameField}
                  onChange={(e) => {
                    void nameField.onChange(e)
                    // Alias adalah pengenal di storefront; menurunkannya dari
                    // nama menghindari alias asal ketik pada show baru.
                    if (!aliasTouched) {
                      setValue('alias', toShowAlias(e.target.value), {
                        shouldValidate: submitCount > 0,
                        shouldDirty: true,
                      })
                    }
                  }}
                  placeholder={t('createShowModal.namePlaceholder')}
                  disabled={busy}
                  aria-invalid={!!errors.name}
                />
                {errors.name ? (
                  <p role='alert' className='text-xs font-medium text-destructive'>
                    {errors.name.message}
                  </p>
                ) : (
                  <p className='text-xs text-muted-foreground'>{t('createShowModal.nameHint')}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='show-alias'>{t('createShowModal.aliasLabel')}</Label>
                <Input
                  id='show-alias'
                  {...register('alias', {
                    onChange: () => setAliasTouched(true),
                    // Normalisasi ditampilkan saat blur supaya nilai yang
                    // dikirim tidak berbeda dari yang dilihat admin.
                    onBlur: () =>
                      setValue('alias', toShowAlias(getValues('alias')), {
                        shouldValidate: submitCount > 0,
                      }),
                  })}
                  placeholder={t('createShowModal.aliasPlaceholder')}
                  autoComplete='off'
                  disabled={busy}
                  aria-invalid={!!errors.alias}
                />
                {errors.alias ? (
                  <p role='alert' className='text-xs font-medium text-destructive'>
                    {errors.alias.message}
                  </p>
                ) : (
                  <p className='text-xs text-muted-foreground'>{t('createShowModal.aliasHint')}</p>
                )}
              </div>

              <ImageDropzone
                key={dropzoneKey}
                label={t('createShowModal.imageLabel')}
                onChange={(url) =>
                  setValue('image', url, { shouldValidate: true, shouldDirty: true })
                }
                onUploadingChange={setIsUploading}
                disabled={mutation.isPending}
                error={errors.image?.message}
              />

              {/* Backend membuat show dalam keadaan belum tayang. Tanpa kalimat
                  ini admin mengira show langsung muncul di storefront. */}
              <div className='flex gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3'>
                <EyeOff className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' aria-hidden />
                <div className='min-w-0 space-y-0.5'>
                  <p className='text-sm font-medium text-foreground'>
                    {t('createShowModal.hiddenNoticeTitle')}
                  </p>
                  <p className='text-xs leading-relaxed text-muted-foreground'>
                    {t('createShowModal.hiddenNotice')}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className='shrink-0 gap-2 border-t border-border px-6 py-5 sm:gap-2'>
              <Button
                className='cursor-pointer sm:min-w-[5.5rem]'
                variant='outline'
                type='button'
                disabled={busy}
                onClick={() => requestOpenChange(false)}
              >
                {t('createShowModal.cancel')}
              </Button>
              <Button className='cursor-pointer sm:min-w-[5.5rem]' type='submit' disabled={busy}>
                {mutation.isPending && (
                  <Loader2 className='mr-2 h-4 w-4 shrink-0 animate-spin' aria-hidden />
                )}
                {mutation.isPending ? t('createShowModal.saving') : t('createShowModal.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('showForm.discardTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('showForm.discardDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='cursor-pointer'>
              {t('showForm.discardKeep')}
            </AlertDialogCancel>
            <AlertDialogAction className='cursor-pointer' onClick={closeAndReset}>
              {t('showForm.discardConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
