import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Loader2, Lock, Pencil } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ImageDropzone } from '@/components/ui/image-dropzone'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  type CategoryProduct,
  type updateCategoryProductPayload,
  useUpdateCategoryProduct,
} from '@/hooks/useCategoryProduct'

type FormValues = {
  name: string
  slug: string
  icon_url: string
  description: string
  is_active: boolean
}

const FIELD = {
  name: 'ucp-name',
  slug: 'ucp-slug',
  description: 'ucp-description',
  active: 'ucp-active',
} as const

/**
 * Isi form dipasang hanya saat dialog terbuka, sama seperti dialog tambah:
 * `defaultValues` selalu berisi baris yang sedang dibuka tanpa reset lewat
 * effect, dan penanda "sudah disunting" ikut bersih tiap kali dibuka.
 */
function FormBody({
  category,
  isPending,
  onSubmit,
  onOpenChange,
}: {
  category: CategoryProduct
  isPending: boolean
  onSubmit: (payload: updateCategoryProductPayload) => void
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation('common')
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, dirtyFields },
  } = useForm<FormValues>({
    defaultValues: {
      name: category.name ?? '',
      slug: category.slug ?? '',
      icon_url: category.icon_url ?? '',
      description: category.description ?? '',
      is_active: category.is_active ?? true,
    },
  })

  const iconUrl = watch('icon_url')
  const isActive = watch('is_active')
  const busy = isPending || isUploading
  const hasChanges =
    dirtyFields.name === true ||
    dirtyFields.slug === true ||
    dirtyFields.icon_url === true ||
    dirtyFields.description === true ||
    dirtyFields.is_active === true

  /**
   * Hanya kolom yang benar-benar disunting yang dikirim. PATCH parsial aman di
   * backend lama (yang hanya membaca `name`) maupun backend baru, dan mencegah
   * dialog ini menimpa kolom yang barusan diubah operator lain.
   */
  const submit = (values: FormValues) => {
    // Penjaga kirim-ganda: tombol sudah nonaktif saat sibuk, tapi Enter di
    // kolom teks tetap bisa mengirim form sebelum React sempat merender ulang.
    if (busy || !hasChanges) return

    const payload: updateCategoryProductPayload = {}
    if (dirtyFields.name) payload.name = values.name.trim()
    if (dirtyFields.slug) payload.slug = values.slug.trim()
    if (dirtyFields.icon_url) payload.icon_url = values.icon_url
    if (dirtyFields.description) payload.description = values.description.trim()
    if (dirtyFields.is_active) payload.is_active = values.is_active

    onSubmit(payload)
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className='flex min-h-0 flex-col duration-200 animate-in fade-in zoom-in-95 motion-reduce:animate-none'
    >
      <div className='min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5'>
        <div className='space-y-2'>
          <ImageDropzone
            label={t('categoryProductUpdate.iconLabel')}
            value={iconUrl}
            onChange={(url) =>
              setValue('icon_url', url, { shouldDirty: true, shouldValidate: true })
            }
            onUploadingChange={setIsUploading}
            disabled={isPending}
          />
          <p className='text-xs text-muted-foreground'>
            {t('categoryProductUpdate.iconHint')}
          </p>
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor={FIELD.name}>{t('categoryProductUpdate.nameLabel')}</Label>
          <Input
            id={FIELD.name}
            autoComplete='off'
            placeholder={t('categoryProductUpdate.namePlaceholder')}
            disabled={busy}
            aria-invalid={!!errors.name}
            aria-describedby={
              errors.name ? `${FIELD.name}-error` : `${FIELD.name}-hint`
            }
            {...register('name', {
              required: t('categoryProductUpdate.nameRequired'),
            })}
          />
          {errors.name ? (
            <p
              id={`${FIELD.name}-error`}
              role='alert'
              className='text-xs font-medium text-destructive'
            >
              {errors.name.message}
            </p>
          ) : (
            <p id={`${FIELD.name}-hint`} className='text-xs text-muted-foreground'>
              {t('categoryProductUpdate.nameHint')}
            </p>
          )}
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor={FIELD.slug}>{t('categoryProductUpdate.slugLabel')}</Label>
          <Input
            id={FIELD.slug}
            autoComplete='off'
            placeholder={t('categoryProductUpdate.slugPlaceholder')}
            disabled={busy}
            aria-invalid={!!errors.slug}
            aria-describedby={
              errors.slug ? `${FIELD.slug}-error` : `${FIELD.slug}-hint`
            }
            {...register('slug', {
              required: t('categoryProductUpdate.slugRequired'),
            })}
          />
          {errors.slug ? (
            <p
              id={`${FIELD.slug}-error`}
              role='alert'
              className='text-xs font-medium text-destructive'
            >
              {errors.slug.message}
            </p>
          ) : (
            <p id={`${FIELD.slug}-hint`} className='text-xs text-muted-foreground'>
              {t('categoryProductUpdate.slugHint')}
            </p>
          )}
        </div>

        {/* Game induk tidak ikut dikirim: memindahkan kategori ke game lain akan
            menyisakan produk yang tidak lagi cocok dengan kategorinya. */}
        <div className='space-y-1.5'>
          <span className='text-sm font-medium text-foreground'>
            {t('categoryProductUpdate.gameLabel')}
          </span>
          <p className='flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground'>
            <Lock className='h-3.5 w-3.5 shrink-0 text-muted-foreground' aria-hidden />
            <span className='min-w-0 truncate'>{category.game_name}</span>
          </p>
          <p className='text-xs text-muted-foreground'>
            {t('categoryProductUpdate.gameLocked')}
          </p>
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor={FIELD.description}>
            {t('categoryProductUpdate.descriptionLabel')}
          </Label>
          <Textarea
            id={FIELD.description}
            rows={3}
            placeholder={t('categoryProductUpdate.descriptionPlaceholder')}
            disabled={busy}
            aria-describedby={`${FIELD.description}-hint`}
            className='min-h-[4.5rem] resize-y rounded-lg'
            {...register('description')}
          />
          <p
            id={`${FIELD.description}-hint`}
            className='text-xs text-muted-foreground'
          >
            {t('categoryProductUpdate.descriptionHint')}
          </p>
        </div>

        <div className='flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3'>
          <div className='min-w-0'>
            <Label htmlFor={FIELD.active} className='cursor-pointer'>
              {t('categoryProductUpdate.statusLabel')}
            </Label>
            <p id={`${FIELD.active}-hint`} className='text-xs text-muted-foreground'>
              {t('categoryProductUpdate.statusHint')}
            </p>
          </div>
          <Switch
            id={FIELD.active}
            checked={isActive}
            disabled={busy}
            aria-describedby={`${FIELD.active}-hint`}
            onCheckedChange={(checked) =>
              setValue('is_active', checked, { shouldDirty: true })
            }
          />
        </div>
      </div>

      <DialogFooter className='shrink-0 items-center gap-2 border-t border-border px-6 py-4 sm:gap-2'>
        {isUploading ? (
          <p className='text-xs text-muted-foreground duration-200 animate-in fade-in motion-reduce:animate-none sm:mr-auto'>
            {t('categoryProductUpdate.uploadWait')}
          </p>
        ) : (
          !hasChanges && (
            <p className='text-xs text-muted-foreground sm:mr-auto'>
              {t('categoryProductUpdate.noChanges')}
            </p>
          )
        )}
        <Button
          type='button'
          variant='outline'
          className='rounded-lg'
          disabled={busy}
          onClick={() => onOpenChange(false)}
        >
          {t('categoryProductUpdate.cancel')}
        </Button>
        <Button
          type='submit'
          className='rounded-lg font-semibold'
          disabled={busy || !hasChanges}
        >
          {isPending && (
            <Loader2 className='mr-2 h-4 w-4 shrink-0 animate-spin' aria-hidden />
          )}
          {isPending
            ? t('categoryProductUpdate.saving')
            : t('categoryProductUpdate.save')}
        </Button>
      </DialogFooter>
    </form>
  )
}

/**
 * Versi lama hanya bisa mengubah `name` dan tidak pernah membaca
 * `formState.errors`, jadi kolom kosong ditolak diam-diam tanpa pesan apa pun.
 * Sekarang set kolomnya sama dengan dialog tambah, dan yang dikirim hanya
 * kolom yang berubah.
 */
export function UpdateCategoryProduct({ category }: { category: CategoryProduct }) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)

  // Argumen `reset` tidak lagi dipakai: isi dialog dipasang saat terbuka dan
  // dilepas saat tertutup, jadi tidak ada state sisa yang perlu dibersihkan.
  const mutation = useUpdateCategoryProduct(category.id, () => {}, setOpen)

  return (
    <>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-8 w-8 cursor-pointer text-muted-foreground hover:bg-muted hover:text-foreground'
        onClick={() => setOpen(true)}
        aria-label={t('categoryProductUpdate.triggerAria', { name: category.name })}
      >
        <Pencil className='h-4 w-4' aria-hidden />
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          // Jangan biarkan Esc atau klik overlay menutup dialog di tengah
          // penyimpanan; tanpa ini indikator "menyimpan…" tidak pernah terlihat.
          if (mutation.isPending) return
          setOpen(next)
        }}
      >
        <DialogContent className='flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl'>
          <DialogHeader className='shrink-0 space-y-1 border-b border-border px-6 py-4 text-left'>
            <DialogTitle>{t('categoryProductUpdate.title')}</DialogTitle>
            <DialogDescription>
              {t('categoryProductUpdate.description')}
            </DialogDescription>
          </DialogHeader>

          {open && (
            <FormBody
              category={category}
              isPending={mutation.isPending}
              onSubmit={(payload) => mutation.mutate(payload)}
              onOpenChange={setOpen}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
