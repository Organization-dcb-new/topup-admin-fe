import { useEffect, useId, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Switch } from '@/components/ui/switch'
import { useCreateReferralCode, useUpdateReferralCode } from '@/hooks/useReferral'
import {
  nbAccent,
  nbDialog,
  nbDialogBody,
  nbDialogButton,
  nbDialogFooter,
  nbDialogHeader,
  nbDialogIcon,
  nbDialogTitle,
  nbError,
  nbHint,
  nbInput,
  nbLabel,
  nbSwitch,
} from '@/lib/nb'
import { cn } from '@/lib/utils'
import { referralCodeSchema, type ReferralCodeFormValues } from '@/schemas/referral'
import type { ReferralCode } from '@/types/referral'
import { Loader2, Pencil, Percent, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const EMPTY_FORM: ReferralCodeFormValues = {
  name: '',
  code: '',
  percent: 0,
  is_active: true,
}

function toFormValues(referral: ReferralCode): ReferralCodeFormValues {
  return {
    name: referral.name,
    code: referral.code,
    percent: referral.percent,
    is_active: referral.is_active,
  }
}

/**
 * Satu dialog untuk tambah dan ubah kode referral. Sebelumnya kedua ragam ini
 * dua komponen dengan isi form yang identik, jadi setiap perubahan field harus
 * ditulis dua kali.
 */
export function ReferralFormModal({ referral }: { referral?: ReferralCode }) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const isEdit = !!referral

  const nameId = useId()
  const codeId = useId()
  const percentId = useId()
  const statusId = useId()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReferralCodeFormValues>({
    resolver: zodResolver(referralCodeSchema) as unknown as Resolver<ReferralCodeFormValues>,
    defaultValues: referral ? toFormValues(referral) : EMPTY_FORM,
  })

  const createMutation = useCreateReferralCode(() => setOpen(false))
  const updateMutation = useUpdateReferralCode(() => setOpen(false))
  const isPending = isEdit ? updateMutation.isPending : createMutation.isPending

  useEffect(() => {
    if (!open) return
    reset(referral ? toFormValues(referral) : EMPTY_FORM)
  }, [open, referral, reset])

  const onSubmit = (values: ReferralCodeFormValues) => {
    if (referral) {
      updateMutation.mutate({ id: referral.id, payload: values })
      return
    }
    createMutation.mutate(values)
  }

  const accent = isEdit ? nbAccent.yellow : nbAccent.lime

  return (
    <>
      {isEdit ? (
        <button
          type='button'
          onClick={() => setOpen(true)}
          className={cn(
            'nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center',
            nbAccent.yellow,
          )}
          aria-label={t('referralPage.editBtn')}
          title={t('referralPage.editBtn')}
        >
          <Pencil className='h-3.5 w-3.5' strokeWidth={3} aria-hidden />
        </button>
      ) : (
        <button
          type='button'
          onClick={() => setOpen(true)}
          className={cn(nbDialogButton, nbAccent.lime, 'h-10 w-full px-4 sm:w-auto')}
        >
          <Plus className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
          {t('referralPage.addBtn')}
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={nbDialog} showCloseButton={false}>
          <div className={cn(nbDialogHeader, accent)}>
            <DialogHeader className='gap-2 text-left'>
              <div className='flex items-center gap-2.5'>
                <span className={nbDialogIcon}>
                  <Percent className='h-4 w-4' strokeWidth={3} aria-hidden />
                </span>
                <DialogTitle className={nbDialogTitle}>
                  {isEdit ? t('referralPage.form.editTitle') : t('referralPage.form.addTitle')}
                </DialogTitle>
              </div>
              <DialogDescription className={nbHint}>
                {t('referralPage.subtitle')}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={nbDialogBody}>
            <div className='space-y-2'>
              <Label htmlFor={nameId} className={nbLabel}>
                {t('referralPage.form.nameLabel')}
              </Label>
              <Input
                id={nameId}
                autoComplete='off'
                placeholder={t('referralPage.form.namePlaceholder')}
                className={cn(nbInput, errors.name && 'nb-invalid')}
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              {errors.name?.message && (
                <p className={nbError} role='alert'>
                  {t(errors.name.message)}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor={codeId} className={nbLabel}>
                {t('referralPage.form.codeLabel')}
              </Label>
              <Input
                id={codeId}
                autoComplete='off'
                placeholder={t('referralPage.form.codePlaceholder')}
                className={cn(nbInput, 'font-mono uppercase', errors.code && 'nb-invalid')}
                aria-invalid={!!errors.code}
                {...register('code')}
              />
              {errors.code?.message && (
                <p className={nbError} role='alert'>
                  {t(errors.code.message)}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor={percentId} className={nbLabel}>
                {t('referralPage.form.percentLabel')}
              </Label>
              <Input
                id={percentId}
                type='number'
                step='any'
                placeholder={t('referralPage.form.percentPlaceholder')}
                className={cn(nbInput, 'tabular-nums', errors.percent && 'nb-invalid')}
                aria-invalid={!!errors.percent}
                {...register('percent', { valueAsNumber: true })}
              />
              {errors.percent?.message && (
                <p className={nbError} role='alert'>
                  {t(errors.percent.message)}
                </p>
              )}
            </div>

            <div className='nb-frame nb-frame-thin nb-sd-sm flex items-center justify-between gap-4 bg-[#f5f1e8] px-3 py-2.5'>
              <Label htmlFor={statusId} className={cn(nbLabel, 'cursor-pointer')}>
                {t('referralPage.form.statusLabel')}
              </Label>
              <Switch
                id={statusId}
                className={nbSwitch}
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
            </div>

            <DialogFooter className={nbDialogFooter}>
              <button
                type='button'
                className={cn(nbDialogButton, nbAccent.white)}
                onClick={() => setOpen(false)}
              >
                {t('referralPage.form.cancel')}
              </button>
              <button type='submit' disabled={isPending} className={cn(nbDialogButton, accent)}>
                {isPending && (
                  <Loader2 className='h-4 w-4 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
                )}
                {t('referralPage.form.save')}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
