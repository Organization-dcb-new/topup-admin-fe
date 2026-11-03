import { useId } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Clock, Wrench } from 'lucide-react'

import { AuthSubmitButton, FieldMessage } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass, hudLabelClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  addMinutesToDatetimeLocal,
  datetimeLocalToIso,
  isoToDatetimeLocal,
  nowAsDatetimeLocal,
} from '@/helpers/maintenance-datetime'
import { useCreateMaintenance, useUpdateMaintenance } from '@/hooks/useMaintenance'
import { cn } from '@/lib/utils'
import { maintenanceSchema, type MaintenanceFormValues } from '@/schemas/maintenance'
import type { Maintenance } from '@/types/maintenance'
import { formatDuration } from './maintenance-status'

const DURATION_PRESETS = [30, 60, 120, 240]

interface MaintenanceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Edit this entry; leave out to schedule a new one. */
  maintenance?: Maintenance
}

export function MaintenanceFormDialog({ open, onOpenChange, maintenance }: MaintenanceFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-lg'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {/* Mounted per opening, so every open starts from fresh values without a reset effect. */}
        {open && <MaintenanceForm maintenance={maintenance} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function defaultValues(m?: Maintenance): MaintenanceFormValues {
  if (m) {
    return {
      name: m.name,
      start_time: isoToDatetimeLocal(m.start_time),
      end_time: isoToDatetimeLocal(m.end_time),
      is_maintenance: m.is_maintenance,
    }
  }
  const start = nowAsDatetimeLocal()
  return { name: '', start_time: start, end_time: addMinutesToDatetimeLocal(start, 60), is_maintenance: true }
}

function MaintenanceForm({ maintenance, onDone }: { maintenance?: Maintenance; onDone: () => void }) {
  const { t } = useTranslation()
  const ids = useId()
  const create = useCreateMaintenance(onDone)
  const update = useUpdateMaintenance(onDone)
  const pending = create.isPending || update.isPending

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitted },
  } = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: defaultValues(maintenance),
  })
  const [start, end, isOn] = useWatch({ control, name: ['start_time', 'end_time', 'is_maintenance'] })

  // Presets bypass the inputs, so re-check the window ourselves once the admin has tried to submit.
  const setTime = (field: 'start_time' | 'end_time', value: string) =>
    setValue(field, value, { shouldDirty: true, shouldValidate: isSubmitted })

  const applyDuration = (minutes: number) => {
    const from = start || nowAsDatetimeLocal()
    if (!start) setTime('start_time', from)
    setTime('end_time', addMinutesToDatetimeLocal(from, minutes))
  }

  const onSubmit = (values: MaintenanceFormValues) => {
    const payload = {
      name: values.name,
      is_maintenance: values.is_maintenance,
      start_time: datetimeLocalToIso(values.start_time) ?? null,
      end_time: datetimeLocalToIso(values.end_time) ?? null,
    }
    if (maintenance) update.mutate({ id: maintenance.id, payload })
    else create.mutate(payload)
  }

  const windowError = errors.end_time?.message ?? errors.start_time?.message

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-6 sm:p-7'>
      <div className='flex items-start gap-4'>
        <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-amber-400 to-brand-purple text-white hud-clip-sm'>
          <Wrench className='size-5' aria-hidden />
        </span>
        <div className='min-w-0 space-y-1'>
          <p className={hudEyebrowClass}>
            {maintenance ? t('maintenancePage.form.editEyebrow') : t('maintenancePage.form.addEyebrow')}
          </p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
            {maintenance ? t('maintenancePage.form.editTitle') : t('maintenancePage.form.addTitle')}
          </DialogTitle>
          <DialogDescription className='text-sm leading-relaxed text-slate-500'>
            {t('maintenancePage.form.description')}
          </DialogDescription>
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor={`${ids}-name`} className={hudLabelClass}>
          {t('maintenancePage.form.nameLabel')}
        </Label>
        <Input
          id={`${ids}-name`}
          autoFocus
          placeholder={t('maintenancePage.form.namePlaceholder')}
          aria-invalid={!!errors.name}
          className={hudInputClass}
          {...register('name')}
        />
        {errors.name?.message && <FieldMessage tone='error'>{t(errors.name.message)}</FieldMessage>}
      </div>

      <fieldset className='space-y-3'>
        <div className='flex items-center justify-between gap-3'>
          <legend className={hudLabelClass}>{t('maintenancePage.form.windowLabel')}</legend>
          <span className='font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>
            {t('maintenancePage.wib')}
          </span>
        </div>
        <div className='grid gap-3 sm:grid-cols-2'>
          <div className='space-y-1.5'>
            <Label htmlFor={`${ids}-start`} className='text-xs font-medium text-slate-500'>
              {t('maintenancePage.form.startLabel')}
            </Label>
            <Input
              id={`${ids}-start`}
              type='datetime-local'
              aria-invalid={!!errors.start_time}
              className={cn(hudInputClass, 'tabular-nums')}
              {...register('start_time', { deps: 'end_time' })}
            />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor={`${ids}-end`} className='text-xs font-medium text-slate-500'>
              {t('maintenancePage.form.endLabel')}
            </Label>
            <Input
              id={`${ids}-end`}
              type='datetime-local'
              min={start || undefined}
              aria-invalid={!!errors.end_time}
              className={cn(hudInputClass, 'tabular-nums')}
              {...register('end_time')}
            />
          </div>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='inline-flex items-center gap-1 text-xs text-slate-500'>
            <Clock className='size-3.5' aria-hidden />
            {t('maintenancePage.form.quickDuration')}
          </span>
          {DURATION_PRESETS.map((minutes) => {
            const selected = !!start && end === addMinutesToDatetimeLocal(start, minutes)
            return (
              <button
                key={minutes}
                type='button'
                onClick={() => applyDuration(minutes)}
                aria-pressed={selected}
                className={cn(
                  'h-7 px-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.1em] hud-clip-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/40',
                  selected
                    ? 'bg-brand-purple text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-brand-purple/10 hover:text-brand-purple'
                )}
              >
                {formatDuration(minutes, t)}
              </button>
            )
          })}
        </div>
        {windowError && <FieldMessage tone='error'>{t(windowError)}</FieldMessage>}
      </fieldset>

      <label
        className={cn(
          'flex cursor-pointer items-center justify-between gap-4 rounded-md border px-4 py-3 transition-colors',
          isOn ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200 hover:bg-slate-50'
        )}
      >
        <span className='min-w-0'>
          <span className='block text-sm font-medium text-slate-800'>{t('maintenancePage.form.modeLabel')}</span>
          <span className='block text-xs text-slate-500'>
            {isOn ? t('maintenancePage.form.modeOnHint') : t('maintenancePage.form.modeOffHint')}
          </span>
        </span>
        <Switch
          checked={isOn}
          onCheckedChange={(checked) => setValue('is_maintenance', checked, { shouldDirty: true })}
          className='data-[state=checked]:bg-amber-500'
        />
      </label>

      <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
        <button
          type='button'
          onClick={onDone}
          disabled={pending}
          className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
        >
          {t('maintenancePage.form.cancel')}
        </button>
        <div className='sm:min-w-52'>
          <AuthSubmitButton pending={pending} pendingLabel={t('maintenancePage.form.saving')} cooldown={0}>
            {maintenance ? t('maintenancePage.form.save') : t('maintenancePage.form.create')}
          </AuthSubmitButton>
        </div>
      </div>
    </form>
  )
}
