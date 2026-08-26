import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

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
import { Switch } from '@/components/ui/switch'
import { useCreateReferralCode, useUpdateReferralCode } from '@/hooks/useReferral'
import { apiErrorMessage } from '@/lib/api-error'
import { referralCodeSchema, type ReferralCodeFormValues } from '@/schemas/referral'
import type { ReferralCode } from '@/types/referral'

interface ReferralFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Kosong berarti membuat kode baru. */
  referral?: ReferralCode | null
}

/**
 * Isi form dipasang ulang lewat `key` tiap kali dialog dibuka atau target
 * berganti — pola yang sama dipakai RoleForm, dan menggantikan reset lewat
 * useEffect yang tidak pernah benar-benar sinkron dengan prop.
 */
export const ReferralFormDialog = ({ open, onOpenChange, referral }: ReferralFormProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className='rounded-2xl sm:max-w-md'>
      {open && (
        <ReferralFormBody
          key={referral?.id ?? 'new'}
          referral={referral ?? null}
          onDone={() => onOpenChange(false)}
        />
      )}
    </DialogContent>
  </Dialog>
)

const ReferralFormBody = ({
  referral,
  onDone,
}: {
  referral: ReferralCode | null
  onDone: () => void
}) => {
  const { t } = useTranslation('common')
  const isEdit = !!referral
  const [fieldPrefix] = useState(() => (referral ? `edit-${referral.id}` : 'create'))

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    setFocus,
    watch,
    formState: { errors },
  } = useForm<ReferralCodeFormValues>({
    resolver: zodResolver(referralCodeSchema),
    defaultValues: {
      name: referral?.name ?? '',
      code: referral?.code ?? '',
      // Bukan 0: backend menandai `percent` required dan validator Go menolak
      // nol, jadi nilai awal 0 adalah kiriman yang pasti gagal.
      percent: referral?.percent ?? 1,
      is_active: referral?.is_active ?? true,
    },
  })

  const isActive = watch('is_active')

  const handleError = (err: unknown) => {
    const serverMessage = (
      err as { response?: { status?: number; data?: { message?: string } } }
    )?.response
    // Backend membalas 409 khusus untuk kode ganda — itu milik field `code`,
    // bukan pesan melayang di sudut layar.
    if (serverMessage?.status === 409) {
      setError('code', { type: 'server', message: t('referralPage.form.errors.codeTaken') })
      setFocus('code')
      return
    }
    toast.error(apiErrorMessage(err, t('referralToasts.createError')))
  }

  const create = useCreateReferralCode(onDone)
  const update = useUpdateReferralCode(onDone)
  const isPending = create.isPending || update.isPending

  const onSubmit = (values: ReferralCodeFormValues) => {
    const payload = { ...values, code: values.code.toUpperCase() }
    if (referral) {
      update.mutate({ id: referral.id, payload }, { onError: handleError })
    } else {
      create.mutate(payload, { onError: handleError })
    }
  }

  const errorId = (field: string) => `${fieldPrefix}-${field}-error`

  return (
    <>
      <DialogHeader>
        <DialogTitle className='text-lg font-semibold tracking-tight'>
          {isEdit ? t('referralPage.form.editTitle') : t('referralPage.form.addTitle')}
        </DialogTitle>
        <DialogDescription className='text-sm text-muted-foreground'>
          {isEdit ? t('referralPage.form.editDescription') : t('referralPage.form.addDescription')}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-2'>
        <div className='space-y-1.5'>
          <Label htmlFor={`${fieldPrefix}-name`}>{t('referralPage.form.nameLabel')}</Label>
          <Input
            id={`${fieldPrefix}-name`}
            placeholder={t('referralPage.form.namePlaceholder')}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? errorId('name') : undefined}
            {...register('name')}
          />
          {errors.name?.message && (
            <p id={errorId('name')} className='text-xs font-medium text-destructive'>
              {errors.name.message}
            </p>
          )}
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor={`${fieldPrefix}-code`}>{t('referralPage.form.codeLabel')}</Label>
          <Input
            id={`${fieldPrefix}-code`}
            placeholder={t('referralPage.form.codePlaceholder')}
            autoCapitalize='characters'
            spellCheck={false}
            className='font-mono uppercase'
            aria-invalid={!!errors.code}
            aria-describedby={errors.code ? errorId('code') : undefined}
            {...register('code')}
          />
          {errors.code?.message && (
            <p id={errorId('code')} className='text-xs font-medium text-destructive'>
              {errors.code.message}
            </p>
          )}
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor={`${fieldPrefix}-percent`}>{t('referralPage.form.percentLabel')}</Label>
          <Input
            id={`${fieldPrefix}-percent`}
            type='number'
            step='any'
            min={0}
            max={100}
            inputMode='decimal'
            placeholder={t('referralPage.form.percentPlaceholder')}
            aria-invalid={!!errors.percent}
            aria-describedby={errors.percent ? errorId('percent') : undefined}
            {...register('percent', { valueAsNumber: true })}
          />
          {errors.percent?.message && (
            <p id={errorId('percent')} className='text-xs font-medium text-destructive'>
              {errors.percent.message}
            </p>
          )}
        </div>

        <div className='flex items-center justify-between py-1.5'>
          <Label htmlFor={`${fieldPrefix}-status`} className='cursor-pointer'>
            {t('referralPage.form.statusLabel')}
          </Label>
          <Switch
            id={`${fieldPrefix}-status`}
            checked={isActive}
            onCheckedChange={(checked) => setValue('is_active', checked, { shouldDirty: true })}
          />
        </div>

        <DialogFooter className='gap-2 pt-4 sm:gap-0'>
          <Button
            type='button'
            variant='outline'
            className='rounded-xl'
            disabled={isPending}
            onClick={onDone}
          >
            {t('referralPage.form.cancel')}
          </Button>
          <Button type='submit' className='rounded-xl' disabled={isPending}>
            {isPending ? (
              <span className='flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
                {t('referralPage.form.saving')}
              </span>
            ) : (
              t('referralPage.form.save')
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
