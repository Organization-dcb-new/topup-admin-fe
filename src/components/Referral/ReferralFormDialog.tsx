import { useId } from 'react'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Ticket } from 'lucide-react'

import { AuthSubmitButton, FieldMessage } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useCreateReferralCode, useUpdateReferralCode } from '@/hooks/useReferral'
import { cn } from '@/lib/utils'
import { referralCodeSchema, type ReferralCodeFormValues } from '@/schemas/referral'
import type { ReferralCode } from '@/types/referral'
import { ReferralTicket } from './ReferralParts'

interface ReferralFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Edit this code; leave out to create one. */
  referral?: ReferralCode
}

export function ReferralFormDialog({ open, onOpenChange, referral }: ReferralFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='gap-0 overflow-hidden rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-lg'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {/* Mounted per opening, so every open starts from fresh values without a reset effect. */}
        {open && <ReferralForm referral={referral} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

/** Codes are stored in capitals; normalise while typing so the preview shows what gets saved. */
function normalizeCode(value: string) {
  return value.toUpperCase().replace(/\s+/g, '')
}

function ReferralForm({ referral, onDone }: { referral?: ReferralCode; onDone: () => void }) {
  const { t } = useTranslation()
  const ids = useId()
  const create = useCreateReferralCode(onDone)
  const update = useUpdateReferralCode(onDone)
  const pending = create.isPending || update.isPending

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ReferralCodeFormValues>({
    resolver: zodResolver(referralCodeSchema) as unknown as Resolver<ReferralCodeFormValues>,
    defaultValues: referral
      ? { name: referral.name, code: referral.code, percent: referral.percent, is_active: referral.is_active }
      : { name: '', code: '', percent: 0, is_active: true },
  })
  const [code, percent, isActive] = useWatch({ control, name: ['code', 'percent', 'is_active'] })
  const codeField = register('code')

  const onSubmit = (values: ReferralCodeFormValues) => {
    if (referral) update.mutate({ id: referral.id, payload: values })
    else create.mutate(values)
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-6 sm:p-7'>
      <div className='flex items-start gap-4'>
        <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
          <Ticket className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 space-y-1'>
          <p className={hudEyebrowClass}>
            {referral ? t('referralPage.form.editEyebrow') : t('referralPage.form.addEyebrow')}
          </p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
            {referral ? t('referralPage.form.editTitle') : t('referralPage.form.addTitle')}
          </DialogTitle>
          <DialogDescription className='text-sm leading-relaxed text-slate-500'>
            {t('referralPage.form.description')}
          </DialogDescription>
        </div>
      </div>

      <ReferralTicket code={code} percent={Number(percent)} active={isActive} />

      <div className='space-y-2'>
        <Label htmlFor={`${ids}-name`} className={hudLabelClass}>
          {t('referralPage.form.nameLabel')}
        </Label>
        <Input
          id={`${ids}-name`}
          autoFocus
          placeholder={t('referralPage.form.namePlaceholder')}
          aria-invalid={!!errors.name}
          className={hudInputClass}
          {...register('name')}
        />
        {errors.name?.message && <FieldMessage tone='error'>{t(errors.name.message)}</FieldMessage>}
      </div>

      <div className='grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem]'>
        <div className='space-y-2'>
          <Label htmlFor={`${ids}-code`} className={hudLabelClass}>
            {t('referralPage.form.codeLabel')}
          </Label>
          <Input
            id={`${ids}-code`}
            autoCapitalize='characters'
            autoComplete='off'
            spellCheck={false}
            placeholder={t('referralPage.form.codePlaceholder')}
            aria-invalid={!!errors.code}
            className={cn(hudInputClass, 'font-mono font-semibold tracking-[0.15em]')}
            {...codeField}
            onChange={(e) => {
              e.target.value = normalizeCode(e.target.value)
              void codeField.onChange(e)
            }}
          />
          {errors.code?.message && <FieldMessage tone='error'>{t(errors.code.message)}</FieldMessage>}
        </div>
        <div className='space-y-2'>
          <Label htmlFor={`${ids}-percent`} className={hudLabelClass}>
            {t('referralPage.form.percentLabel')}
          </Label>
          <div className='relative'>
            <Input
              id={`${ids}-percent`}
              type='number'
              inputMode='decimal'
              min={0}
              max={100}
              step='any'
              aria-invalid={!!errors.percent}
              aria-describedby={`${ids}-percent-hint`}
              className={cn(hudInputClass, 'pr-9 tabular-nums')}
              {...register('percent', { valueAsNumber: true })}
            />
            <span className='pointer-events-none absolute inset-y-0 right-3 flex items-center font-display text-sm font-semibold text-slate-400'>
              %
            </span>
          </div>
        </div>
      </div>
      {errors.percent?.message ? (
        <FieldMessage tone='error'>{t(errors.percent.message)}</FieldMessage>
      ) : (
        <p id={`${ids}-percent-hint`} className='-mt-3 text-xs leading-relaxed text-slate-500'>
          {t('referralPage.form.percentHint')}
        </p>
      )}

      <label className='flex cursor-pointer items-center justify-between gap-4 rounded-md border border-slate-200 px-4 py-3 transition-colors hover:bg-slate-50'>
        <span className='min-w-0'>
          <span className='block text-sm font-medium text-slate-800'>{t('referralPage.form.statusLabel')}</span>
          <span className='block text-xs text-slate-500'>{t('referralPage.form.statusHint')}</span>
        </span>
        <Switch
          checked={isActive}
          onCheckedChange={(checked) => setValue('is_active', checked)}
          className='data-[state=checked]:bg-brand-purple'
        />
      </label>

      <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
        <button
          type='button'
          onClick={onDone}
          disabled={pending}
          className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
        >
          {t('referralPage.form.cancel')}
        </button>
        <div className='sm:w-52'>
          <AuthSubmitButton pending={pending} pendingLabel={t('referralPage.form.saving')} cooldown={0}>
            {referral ? t('referralPage.form.save') : t('referralPage.form.create')}
          </AuthSubmitButton>
        </div>
      </div>
    </form>
  )
}
