import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { CalendarClock, Loader2 } from 'lucide-react'

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
import { Switch } from '@/components/ui/switch'
import { ImageDropzone } from '@/components/ui/image-dropzone'
import { bannerSchema, type BannerSchemaValues } from '@/schemas/banner'
import type { BannerFormValues } from '@/types/banner'

interface BannerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  initialValues?: Partial<BannerFormValues>
  isPending?: boolean
  onSubmit: (values: BannerFormValues, done: () => void) => void
}

const EMPTY: BannerFormValues = {
  title: '',
  image: '',
  alt_text: '',
  redirect_link: '',
  is_active: true,
  start_at: '',
  end_at: '',
}

const LOCAL_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

const pad = (value: number) => String(value).padStart(2, '0')

/**
 * `<input type='datetime-local'>` hanya mau menampilkan 'YYYY-MM-DDTHH:mm'
 * tanpa zona, sedangkan jadwal dari backend datang sebagai ISO ber-zona.
 * Tanpa penyesuaian ini kolom jadwal tampak kosong saat mengubah banner
 * yang sudah punya jendela tayang.
 */
const toLocalDateTime = (raw: string | undefined): string => {
  if (!raw) return ''
  if (LOCAL_DATETIME.test(raw)) return raw
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * Kebalikannya. Admin mengetik waktu lokal; yang dikirim harus ISO ber-zona
 * supaya server menyimpan momen yang sama, bukan angka jam mentah.
 */
const toIsoDateTime = (raw: string): string => {
  if (raw === '') return ''
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? raw : date.toISOString()
}

const FIELD = {
  title: 'banner-title',
  alt: 'banner-alt',
  link: 'banner-link',
  active: 'banner-active',
  start: 'banner-start',
  end: 'banner-end',
} as const

/**
 * Satu form untuk tambah dan ubah, menggantikan CreateBannerModal dan
 * EditBannerModal yang saling menyimpang. Isi form hanya dipasang saat dialog
 * terbuka, jadi `defaultValues` selalu berisi baris yang sedang dibuka tanpa
 * reset lewat effect.
 */
function FormBody({
  mode,
  initialValues,
  isPending,
  onSubmit,
  onOpenChange,
}: Omit<BannerFormDialogProps, 'open'>) {
  const { t } = useTranslation('common')
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BannerSchemaValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      ...EMPTY,
      ...initialValues,
      start_at: toLocalDateTime(initialValues?.start_at),
      end_at: toLocalDateTime(initialValues?.end_at),
    },
  })

  const image = watch('image')
  const isActive = watch('is_active')
  const busy = isPending === true || isUploading

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit(
          {
            ...values,
            start_at: toIsoDateTime(values.start_at),
            end_at: toIsoDateTime(values.end_at),
          },
          () => onOpenChange(false),
        ),
      )}
      className='flex min-h-0 flex-col duration-200 animate-in fade-in zoom-in-95 motion-reduce:animate-none'
    >
      <div className='min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5'>
        <div className='space-y-2'>
          <ImageDropzone
            label={t('bannerForm.imageLabel')}
            value={image}
            onChange={(url) => setValue('image', url, { shouldValidate: true })}
            onUploadingChange={setIsUploading}
            disabled={isPending}
            error={errors.image?.message}
          />
          <p className='text-xs text-muted-foreground'>
            {t('bannerForm.imageHint')}
          </p>
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor={FIELD.title}>{t('bannerForm.titleLabel')}</Label>
          <Input
            id={FIELD.title}
            placeholder={t('bannerForm.titlePlaceholder')}
            disabled={busy}
            aria-invalid={!!errors.title}
            aria-describedby={
              errors.title ? `${FIELD.title}-error` : `${FIELD.title}-hint`
            }
            {...register('title')}
          />
          {errors.title ? (
            <p
              id={`${FIELD.title}-error`}
              role='alert'
              className='text-xs font-medium text-destructive'
            >
              {errors.title.message}
            </p>
          ) : (
            <p id={`${FIELD.title}-hint`} className='text-xs text-muted-foreground'>
              {t('bannerForm.titleHint')}
            </p>
          )}
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor={FIELD.alt}>{t('bannerForm.altLabel')}</Label>
          <Input
            id={FIELD.alt}
            placeholder={t('bannerForm.altPlaceholder')}
            disabled={busy}
            aria-invalid={!!errors.alt_text}
            aria-describedby={
              errors.alt_text ? `${FIELD.alt}-error` : `${FIELD.alt}-hint`
            }
            {...register('alt_text')}
          />
          {errors.alt_text ? (
            <p
              id={`${FIELD.alt}-error`}
              role='alert'
              className='text-xs font-medium text-destructive'
            >
              {errors.alt_text.message}
            </p>
          ) : (
            <p id={`${FIELD.alt}-hint`} className='text-xs text-muted-foreground'>
              {t('bannerForm.altHint')}
            </p>
          )}
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor={FIELD.link}>{t('bannerForm.linkLabel')}</Label>
          <Input
            id={FIELD.link}
            inputMode='url'
            placeholder={t('bannerForm.linkPlaceholder')}
            disabled={busy}
            aria-invalid={!!errors.redirect_link}
            aria-describedby={
              errors.redirect_link ? `${FIELD.link}-error` : `${FIELD.link}-hint`
            }
            {...register('redirect_link')}
          />
          {errors.redirect_link ? (
            <p
              id={`${FIELD.link}-error`}
              role='alert'
              className='text-xs font-medium text-destructive'
            >
              {errors.redirect_link.message}
            </p>
          ) : (
            <p id={`${FIELD.link}-hint`} className='text-xs text-muted-foreground'>
              {t('bannerForm.linkHint')}
            </p>
          )}
        </div>

        <div className='flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3'>
          <div className='min-w-0'>
            <Label htmlFor={FIELD.active} className='cursor-pointer'>
              {t('bannerForm.activeLabel')}
            </Label>
            <p id={`${FIELD.active}-hint`} className='text-xs text-muted-foreground'>
              {t('bannerForm.activeHint')}
            </p>
          </div>
          <Switch
            id={FIELD.active}
            checked={isActive}
            disabled={busy}
            aria-describedby={`${FIELD.active}-hint`}
            onCheckedChange={(checked) => setValue('is_active', checked)}
          />
        </div>

        <fieldset className='space-y-3 rounded-lg border border-border px-4 pt-2 pb-4'>
          <legend className='flex items-center gap-2 px-1 text-sm font-medium text-foreground'>
            <CalendarClock className='h-4 w-4 shrink-0' aria-hidden />
            {t('bannerForm.scheduleLabel')}
          </legend>
          <p id='banner-schedule-hint' className='text-xs text-muted-foreground'>
            {t('bannerForm.scheduleHint')}
          </p>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label htmlFor={FIELD.start}>{t('bannerForm.startLabel')}</Label>
              <Input
                id={FIELD.start}
                type='datetime-local'
                disabled={busy}
                aria-invalid={!!errors.start_at}
                aria-describedby={
                  errors.start_at ? `${FIELD.start}-error` : 'banner-schedule-hint'
                }
                {...register('start_at')}
              />
              {errors.start_at && (
                <p
                  id={`${FIELD.start}-error`}
                  role='alert'
                  className='text-xs font-medium text-destructive'
                >
                  {errors.start_at.message}
                </p>
              )}
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor={FIELD.end}>{t('bannerForm.endLabel')}</Label>
              <Input
                id={FIELD.end}
                type='datetime-local'
                disabled={busy}
                aria-invalid={!!errors.end_at}
                aria-describedby={
                  errors.end_at ? `${FIELD.end}-error` : 'banner-schedule-hint'
                }
                {...register('end_at')}
              />
              {errors.end_at && (
                <p
                  id={`${FIELD.end}-error`}
                  role='alert'
                  className='text-xs font-medium text-destructive'
                >
                  {errors.end_at.message}
                </p>
              )}
            </div>
          </div>
        </fieldset>
      </div>

      <DialogFooter className='shrink-0 items-center gap-2 border-t border-border px-6 py-4 sm:gap-2'>
        {isUploading && (
          <p className='text-xs text-muted-foreground duration-200 animate-in fade-in motion-reduce:animate-none sm:mr-auto'>
            {t('bannerForm.uploadWait')}
          </p>
        )}
        <Button
          type='button'
          variant='outline'
          className='rounded-lg'
          disabled={busy}
          onClick={() => onOpenChange(false)}
        >
          {t('bannerForm.cancel')}
        </Button>
        <Button type='submit' className='rounded-lg font-semibold' disabled={busy}>
          {isPending && (
            <Loader2 className='mr-2 h-4 w-4 shrink-0 animate-spin' aria-hidden />
          )}
          {mode === 'create'
            ? isPending
              ? t('bannerForm.creating')
              : t('bannerForm.create')
            : isPending
              ? t('bannerForm.saving')
              : t('bannerForm.save')}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function BannerFormDialog({
  open,
  onOpenChange,
  ...rest
}: BannerFormDialogProps) {
  const { t } = useTranslation('common')

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (rest.isPending) return
        onOpenChange(next)
      }}
    >
      <DialogContent className='flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl'>
        <DialogHeader className='shrink-0 space-y-1 border-b border-border px-6 py-4 text-left'>
          <DialogTitle>
            {rest.mode === 'create'
              ? t('bannerForm.createTitle')
              : t('bannerForm.editTitle')}
          </DialogTitle>
          <DialogDescription>
            {rest.mode === 'create'
              ? t('bannerForm.createDescription')
              : t('bannerForm.editDescription')}
          </DialogDescription>
        </DialogHeader>

        {/* Dipasang hanya saat terbuka: form selalu mulai dari nilai baris
            yang sedang dibuka, tanpa reset lewat effect. Sengaja TANPA `key`
            berbasis isi initialValues — daftar banner di-refetch saat jendela
            kembali fokus, dan key semacam itu akan memasang ulang form yang
            sedang diisi sehingga ketikan admin hilang tanpa peringatan. */}
        {open && <FormBody {...rest} onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  )
}
