import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Loader2, Plus } from 'lucide-react'

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
import { useCreateCategoryProduct } from '@/hooks/useCategoryProduct'
import { useGetGameNamesWithType, type GameNames } from '@/hooks/useGame'
import { cn } from '@/lib/utils'

export type FormValuesCategoryProduct = {
  name: string
  game_id: string
  slug: string
  icon_url: string
  description: string
  is_active: boolean
}

const FIELD = {
  name: 'ccp-name',
  slug: 'ccp-slug',
  game: 'ccp-game',
  description: 'ccp-description',
  active: 'ccp-active',
} as const

/** Slug otomatis dari nama, hanya selama admin belum menyuntingnya sendiri. */
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * Isi form dipasang hanya saat dialog terbuka, jadi setiap kali dibuka form
 * mulai dari keadaan bersih tanpa reset lewat effect — pola yang sama dengan
 * BannerFormDialog dan CategoryFormDialog.
 */
function FormBody({
  isPending,
  onSubmit,
  onOpenChange,
}: {
  isPending: boolean
  onSubmit: (values: FormValuesCategoryProduct) => void
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation('common')
  const [isUploading, setIsUploading] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValuesCategoryProduct>({
    defaultValues: {
      name: '',
      game_id: '',
      slug: '',
      icon_url: '',
      description: '',
      is_active: true,
    },
  })

  const { data: gameNames } = useGetGameNamesWithType()

  const iconUrl = watch('icon_url')
  const isActive = watch('is_active')
  const busy = isPending || isUploading

  const submit = (values: FormValuesCategoryProduct) => {
    // Penjaga kirim-ganda: tombol sudah nonaktif saat sibuk, tapi Enter di
    // kolom teks tetap bisa mengirim form sebelum React sempat merender ulang.
    if (busy) return
    onSubmit({
      ...values,
      name: values.name.trim(),
      slug: values.slug.trim(),
      description: values.description.trim(),
    })
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className='flex min-h-0 flex-col duration-200 animate-in fade-in zoom-in-95 motion-reduce:animate-none'
    >
      <div className='min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5'>
        <div className='space-y-2'>
          <ImageDropzone
            label={t('categoryProductCreate.iconLabel')}
            value={iconUrl}
            onChange={(url) => setValue('icon_url', url, { shouldValidate: true })}
            onUploadingChange={setIsUploading}
            disabled={isPending}
          />
          <p className='text-xs text-muted-foreground'>
            {t('categoryProductCreate.iconHint')}
          </p>
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor={FIELD.name}>{t('categoryProductCreate.nameLabel')}</Label>
          <Input
            id={FIELD.name}
            placeholder={t('categoryProductCreate.namePlaceholder')}
            disabled={busy}
            aria-invalid={!!errors.name}
            aria-describedby={
              errors.name ? `${FIELD.name}-error` : `${FIELD.name}-hint`
            }
            {...register('name', {
              required: t('categoryProductCreate.nameRequired'),
              onChange: (e) => {
                if (slugTouched) return
                setValue('slug', slugify(e.target.value))
              },
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
              {t('categoryProductCreate.nameHint')}
            </p>
          )}
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor={FIELD.slug}>{t('categoryProductCreate.slugLabel')}</Label>
          <Input
            id={FIELD.slug}
            placeholder={t('categoryProductCreate.slugPlaceholder')}
            disabled={busy}
            aria-invalid={!!errors.slug}
            aria-describedby={
              errors.slug ? `${FIELD.slug}-error` : `${FIELD.slug}-hint`
            }
            {...register('slug', {
              required: t('categoryProductCreate.slugRequired'),
              onChange: () => setSlugTouched(true),
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
              {t('categoryProductCreate.slugHint')}
            </p>
          )}
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor={FIELD.game}>{t('categoryProductCreate.gameLabel')}</Label>
          <select
            id={FIELD.game}
            disabled={busy}
            aria-invalid={!!errors.game_id}
            aria-describedby={
              errors.game_id ? `${FIELD.game}-error` : `${FIELD.game}-hint`
            }
            className={cn(
              'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs',
              'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              errors.game_id && 'border-destructive/60',
            )}
            {...register('game_id', {
              required: t('categoryProductCreate.gameRequired'),
            })}
          >
            <option value=''>{t('categoryProductCreate.selectGame')}</option>
            {gameNames?.map((game: GameNames) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
          {errors.game_id ? (
            <p
              id={`${FIELD.game}-error`}
              role='alert'
              className='text-xs font-medium text-destructive'
            >
              {errors.game_id.message}
            </p>
          ) : (
            <p id={`${FIELD.game}-hint`} className='text-xs text-muted-foreground'>
              {t('categoryProductCreate.gameHint')}
            </p>
          )}
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor={FIELD.description}>
            {t('categoryProductCreate.descriptionLabel')}
          </Label>
          <Textarea
            id={FIELD.description}
            rows={3}
            placeholder={t('categoryProductCreate.descriptionPlaceholder')}
            disabled={busy}
            aria-describedby={`${FIELD.description}-hint`}
            className='min-h-[4.5rem] resize-y rounded-lg'
            {...register('description')}
          />
          <p
            id={`${FIELD.description}-hint`}
            className='text-xs text-muted-foreground'
          >
            {t('categoryProductCreate.descriptionHint')}
          </p>
        </div>

        <div className='flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3'>
          <div className='min-w-0'>
            <Label htmlFor={FIELD.active} className='cursor-pointer'>
              {t('categoryProductCreate.statusLabel')}
            </Label>
            <p id={`${FIELD.active}-hint`} className='text-xs text-muted-foreground'>
              {t('categoryProductCreate.statusHint')}
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
      </div>

      <DialogFooter className='shrink-0 items-center gap-2 border-t border-border px-6 py-4 sm:gap-2'>
        {isUploading && (
          <p className='text-xs text-muted-foreground duration-200 animate-in fade-in motion-reduce:animate-none sm:mr-auto'>
            {t('categoryProductCreate.uploadWait')}
          </p>
        )}
        <Button
          type='button'
          variant='outline'
          className='rounded-lg'
          disabled={busy}
          onClick={() => onOpenChange(false)}
        >
          {t('categoryProductCreate.cancel')}
        </Button>
        <Button type='submit' className='rounded-lg font-semibold' disabled={busy}>
          {isPending && (
            <Loader2 className='mr-2 h-4 w-4 shrink-0 animate-spin' aria-hidden />
          )}
          {isPending
            ? t('categoryProductCreate.saving')
            : t('categoryProductCreate.save')}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function CreateCategoryProductModal() {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)

  // Dua argumen pertama hook adalah `reset` form dan penyetel pratinjau milik
  // dropzone buatan tangan yang sudah dibuang. Isi dialog baru dipasang saat
  // terbuka dan ikut dilepas saat tertutup, jadi tidak ada state sisa yang
  // perlu dibersihkan di sini.
  const mutation = useCreateCategoryProduct(
    () => {},
    () => {},
    setOpen,
  )

  return (
    <>
      <Button
        type='button'
        className='w-full gap-2 rounded-lg font-semibold shadow-sm sm:w-auto'
        onClick={() => setOpen(true)}
      >
        <Plus className='h-4 w-4 shrink-0' aria-hidden />
        {t('categoryProductCreate.trigger')}
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
            <DialogTitle>{t('categoryProductCreate.title')}</DialogTitle>
            <DialogDescription>
              {t('categoryProductCreate.description')}
            </DialogDescription>
          </DialogHeader>

          {open && (
            <FormBody
              isPending={mutation.isPending}
              onSubmit={(values) => mutation.mutate(values)}
              onOpenChange={setOpen}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
