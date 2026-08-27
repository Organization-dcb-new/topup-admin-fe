import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Info, Loader2, Pencil } from 'lucide-react'

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
import { Checkbox } from '@/components/ui/checkbox'
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

import { useUpdateShow } from '@/hooks/useShow'
import {
  showToFormValues,
  toShowAlias,
  updateShowSchema,
  type UpdateShowFormValues,
} from '@/schemas/show'
import type { Show } from '@/types/show'
import {
  getEffectiveShowBadge,
  getOverriddenShowBadges,
  type ShowBadgeKey,
} from '@/lib/show-status'
import { cn } from '@/lib/utils'

const BADGE_LABEL_KEY: Record<ShowBadgeKey, string> = {
  is_popular: 'editShowModal.flagPopularLabel',
  is_new: 'editShowModal.flagNewLabel',
  is_hot: 'editShowModal.flagHotLabel',
}

export function UpdateShowModal({
  show,
  triggerClassName,
}: {
  show: Show
  triggerClassName?: string
}) {
  const { t } = useTranslation('common')

  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  /**
   * ImageDropzone hanya membaca `value` saat mount, jadi key-nya dinaikkan tiap
   * kali form direset agar pratinjau selalu menunjukkan gambar show ini.
   */
  const [dropzoneKey, setDropzoneKey] = useState(0)

  const mutation = useUpdateShow(show.id)

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isDirty, submitCount },
  } = useForm<UpdateShowFormValues>({
    resolver: zodResolver(updateShowSchema),
    defaultValues: showToFormValues(show),
    mode: 'onTouched',
  })

  /**
   * `useWatch` dipakai alih-alih `watch()` karena nilai gambar dan keempat flag
   * dirender langsung: `watch()` mengembalikan fungsi yang tidak aman dimemo
   * dan membuat React Compiler melewati komponen ini.
   */
  const values = useWatch({ control })

  const flagFields = useMemo(
    () =>
      (
        [
          ['is_hot', 'flagHotLabel', 'flagHotDesc'],
          ['is_new', 'flagNewLabel', 'flagNewDesc'],
          ['is_popular', 'flagPopularLabel', 'flagPopularDesc'],
          ['is_show', 'flagShowLabel', 'flagShowDesc'],
        ] as const
      ).map(([key, labelKey, descKey]) => ({
        key,
        label: t(`editShowModal.${labelKey}`),
        description: t(`editShowModal.${descKey}`),
      })),
    [t],
  )

  /**
   * Storefront hanya merender SATU penanda per show, dengan prioritas
   * popular > new > hot. Ketiga checkbox di bawah terlihat setara, jadi tanpa
   * ringkasan ini admin mencentang tiga dan menyangka tiga-tiganya tampil.
   */
  const badgeFlags = {
    is_popular: values.is_popular ?? false,
    is_new: values.is_new ?? false,
    is_hot: values.is_hot ?? false,
  }
  const effectiveBadge = getEffectiveShowBadge(badgeFlags)
  const overriddenBadges = getOverriddenShowBadges(badgeFlags)

  const busy = mutation.isPending || isUploading

  const closeDialog = () => {
    setConfirmDiscard(false)
    setOpen(false)
  }

  /**
   * Nilai form disegarkan saat dibuka (bukan saat render) supaya baris yang
   * berubah di tabel tidak menimpa isian yang sedang dikerjakan. Penutupan
   * dikunci selama menyimpan atau mengunggah, dan perubahan yang belum
   * disimpan meminta konfirmasi lebih dulu.
   */
  const requestOpenChange = (next: boolean) => {
    if (next) {
      reset(showToFormValues(show))
      setDropzoneKey((key) => key + 1)
      setOpen(true)
      return
    }
    if (busy) return
    if (isDirty) {
      setConfirmDiscard(true)
      return
    }
    closeDialog()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={requestOpenChange}>
        {/* DialogTrigger, bukan tombol lepas: Radix hanya mengembalikan fokus
            keyboard ke pemicu yang terdaftar di dalam <Dialog>. */}
        <DialogTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            className={cn('cursor-pointer gap-1.5', triggerClassName)}
            aria-label={t('editShowModal.triggerAria')}
          >
            <Pencil className='h-4 w-4 shrink-0' aria-hidden />
            <span className='hidden sm:inline'>{t('editShowModal.triggerShort')}</span>
          </Button>
        </DialogTrigger>

        <DialogContent className='flex max-h-[min(90vh,40rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg'>
          <div className='shrink-0 border-b border-border bg-muted/30 px-6 py-5'>
            <DialogHeader className='gap-1.5 text-left'>
              <div className='flex items-center gap-2'>
                <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                  <Pencil className='h-4 w-4' aria-hidden />
                </span>
                <DialogTitle className='text-xl font-semibold tracking-tight'>
                  {t('editShowModal.title')}
                </DialogTitle>
              </div>
              <DialogDescription>{t('editShowModal.description')}</DialogDescription>
            </DialogHeader>
          </div>

          <form
            onSubmit={handleSubmit((values) => mutation.mutate(values, { onSuccess: closeDialog }))}
            className='flex min-h-0 flex-1 flex-col'
          >
            {/* Hanya badan form yang menggulir: judul dan tombol Simpan tetap
                terlihat di layar pendek. */}
            <div className='min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5'>
              <div className='space-y-2'>
                <Label htmlFor={`edit-show-name-${show.id}`}>{t('editShowModal.nameLabel')}</Label>
                <Input
                  id={`edit-show-name-${show.id}`}
                  {...register('name')}
                  placeholder={t('editShowModal.namePlaceholder')}
                  disabled={busy}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p role='alert' className='text-xs font-medium text-destructive'>
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor={`edit-show-alias-${show.id}`}>
                  {t('editShowModal.aliasLabel')}
                </Label>
                <Input
                  id={`edit-show-alias-${show.id}`}
                  {...register('alias', {
                    // Normalisasi ditampilkan saat blur supaya nilai yang
                    // dikirim tidak berbeda dari yang dilihat admin.
                    onBlur: () =>
                      setValue('alias', toShowAlias(getValues('alias')), {
                        shouldValidate: submitCount > 0,
                      }),
                  })}
                  placeholder={t('editShowModal.aliasPlaceholder')}
                  autoComplete='off'
                  disabled={busy}
                  aria-invalid={!!errors.alias}
                />
                {errors.alias ? (
                  <p role='alert' className='text-xs font-medium text-destructive'>
                    {errors.alias.message}
                  </p>
                ) : (
                  <p className='text-xs text-muted-foreground'>{t('editShowModal.aliasHint')}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor={`edit-show-sort-${show.id}`}>{t('editShowModal.sortLabel')}</Label>
                <Input
                  id={`edit-show-sort-${show.id}`}
                  type='number'
                  min='0'
                  step='1'
                  inputMode='numeric'
                  {...register('sort_order', { valueAsNumber: true })}
                  disabled={busy}
                  aria-invalid={!!errors.sort_order}
                />
                {errors.sort_order ? (
                  <p role='alert' className='text-xs font-medium text-destructive'>
                    {errors.sort_order.message}
                  </p>
                ) : (
                  <p className='text-xs text-muted-foreground'>{t('editShowModal.sortHint')}</p>
                )}
              </div>

              <ImageDropzone
                key={dropzoneKey}
                label={t('editShowModal.imageLabelOptional')}
                value={values.image ?? ''}
                onChange={(url) =>
                  setValue('image', url, { shouldValidate: true, shouldDirty: true })
                }
                onUploadingChange={setIsUploading}
                disabled={mutation.isPending}
                error={errors.image?.message}
              />

              <div className='space-y-3 rounded-xl border border-border/80 bg-muted/15 p-4'>
                <div>
                  <p className='text-sm font-semibold text-foreground'>
                    {t('editShowModal.flagsTitle')}
                  </p>
                  <p className='text-xs text-muted-foreground'>{t('editShowModal.flagsHint')}</p>
                </div>
                <div className='grid gap-3 sm:grid-cols-2'>
                  {flagFields.map(({ key, label, description }) => (
                    <label
                      key={key}
                      className='flex cursor-pointer gap-3 rounded-lg border border-transparent p-2 transition-colors hover:bg-muted/50'
                    >
                      {/* Radix merender checkbox sebagai <button> tanpa isi teks,
                          jadi nama aksesibelnya harus diberikan eksplisit. */}
                      <Checkbox
                        checked={values[key] ?? false}
                        onCheckedChange={(value) =>
                          setValue(key, value === true, { shouldDirty: true })
                        }
                        disabled={busy}
                        aria-label={label}
                        aria-describedby={`${show.id}-${key}-hint`}
                      />
                      <span className='min-w-0 space-y-0.5'>
                        <span className='block text-sm font-medium leading-none'>{label}</span>
                        <span
                          id={`${show.id}-${key}-hint`}
                          className='block text-xs text-muted-foreground'
                        >
                          {description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>

                <p className='flex gap-2 border-t border-border/70 pt-3 text-xs leading-relaxed text-muted-foreground'>
                  <Info className='mt-0.5 h-3.5 w-3.5 shrink-0' aria-hidden />
                  <span>
                    {effectiveBadge
                      ? t('editShowModal.badgeEffective', {
                          label: t(BADGE_LABEL_KEY[effectiveBadge]),
                        })
                      : t('editShowModal.badgeNone')}
                    {overriddenBadges.length > 0 &&
                      ` ${t('editShowModal.badgeOverridden', {
                        labels: overriddenBadges
                          .map((key) => t(BADGE_LABEL_KEY[key]))
                          .join(', '),
                      })}`}
                  </span>
                </p>
              </div>
            </div>

            <DialogFooter className='shrink-0 gap-2 border-t border-border px-6 py-5 sm:gap-2'>
              <Button
                type='button'
                variant='outline'
                disabled={busy}
                onClick={() => requestOpenChange(false)}
                className='cursor-pointer sm:min-w-[5.5rem]'
              >
                {t('editShowModal.cancel')}
              </Button>
              <Button type='submit' disabled={busy} className='cursor-pointer sm:min-w-[5.5rem]'>
                {mutation.isPending && (
                  <Loader2 className='mr-2 h-4 w-4 shrink-0 animate-spin' aria-hidden />
                )}
                {mutation.isPending ? t('editShowModal.saving') : t('editShowModal.save')}
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
            <AlertDialogAction className='cursor-pointer' onClick={closeDialog}>
              {t('showForm.discardConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
