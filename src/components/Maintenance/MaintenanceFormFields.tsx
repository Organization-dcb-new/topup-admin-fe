import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { nbError, nbHint, nbInput, nbLabel, nbSwitch } from '@/lib/nb'
import { cn } from '@/lib/utils'
import { useId } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

export type MaintenanceFormValues = {
  name: string
  is_maintenance: boolean
  start_time: string
  end_time: string
}

type Props = {
  register: UseFormRegister<MaintenanceFormValues>
  errors: FieldErrors<MaintenanceFormValues>
  isMaintenance: boolean
  onModeChange: (checked: boolean) => void
  /** Dialog tambah mewajibkan jendela waktu; dialog ubah membolehkan dikosongkan
   *  supaya jadwal bisa dicabut tanpa menghapus datanya. */
  requireTimes?: boolean
  namePlaceholder?: string
}

/** Isian bersama dialog tambah & ubah pemeliharaan. */
export function MaintenanceFormFields({
  register,
  errors,
  isMaintenance,
  onModeChange,
  requireTimes = false,
  namePlaceholder,
}: Props) {
  const { t } = useTranslation('common')
  const nameId = useId()
  const startId = useId()
  const endId = useId()

  return (
    <>
      <div className='space-y-2'>
        <Label htmlFor={nameId} className={nbLabel}>
          {t('maintenanceForm.nameLabel')}
        </Label>
        <Input
          id={nameId}
          autoComplete='off'
          placeholder={namePlaceholder}
          className={cn(nbInput, errors.name && 'nb-invalid')}
          aria-invalid={!!errors.name}
          {...register('name', {
            required: t('maintenanceForm.nameRequired'),
            validate: (v) => v.trim().length > 0 || t('maintenanceForm.nameRequired'),
          })}
        />
        {errors.name && (
          <p className={nbError} role='alert'>
            {errors.name.message}
          </p>
        )}
      </div>

      <div className='nb-frame nb-frame-thin nb-sd-sm flex items-center justify-between gap-4 bg-[#f5f1e8] px-3 py-2.5'>
        <div className='min-w-0 space-y-0.5'>
          <p className={nbLabel}>{t('maintenanceForm.modeLabel')}</p>
          <p className={nbHint}>{t('maintenanceForm.modeHint')}</p>
        </div>
        <Switch
          className={nbSwitch}
          checked={isMaintenance}
          onCheckedChange={onModeChange}
          aria-label={t('maintenanceForm.modeAria')}
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor={startId} className={nbLabel}>
          {t('maintenanceForm.startLabel')}
        </Label>
        <Input
          id={startId}
          type='datetime-local'
          className={cn(nbInput, 'tabular-nums', errors.start_time && 'nb-invalid')}
          aria-invalid={!!errors.start_time}
          {...register('start_time', {
            required: requireTimes ? t('maintenanceForm.startRequired') : false,
          })}
        />
        {errors.start_time && (
          <p className={nbError} role='alert'>
            {errors.start_time.message}
          </p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor={endId} className={nbLabel}>
          {t('maintenanceForm.endLabel')}
        </Label>
        <Input
          id={endId}
          type='datetime-local'
          className={cn(nbInput, 'tabular-nums', errors.end_time && 'nb-invalid')}
          aria-invalid={!!errors.end_time}
          {...register('end_time', {
            required: requireTimes ? t('maintenanceForm.endRequired') : false,
          })}
        />
        {errors.end_time && (
          <p className={nbError} role='alert'>
            {errors.end_time.message}
          </p>
        )}
      </div>
    </>
  )
}
