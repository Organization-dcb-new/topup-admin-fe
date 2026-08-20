import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  MaintenanceFormFields,
  type MaintenanceFormValues,
} from '@/components/Maintenance/MaintenanceFormFields'
import {
  datetimeLocalToIso,
  isoToDatetimeLocal,
  isMaintenanceWindowOrderInvalid,
} from '@/helpers/maintenance-datetime'
import { useUpdateMaintenance } from '@/hooks/useMaintenance'
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
  nbIconButton,
} from '@/lib/nb'
import type { Maintenance, UpdateMaintenancePayload } from '@/types/maintenance'
import { cn } from '@/lib/utils'
import { Loader2, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function maintenanceToForm(m: Maintenance): MaintenanceFormValues {
  return {
    name: m.name,
    is_maintenance: m.is_maintenance,
    start_time: isoToDatetimeLocal(m.start_time),
    end_time: isoToDatetimeLocal(m.end_time),
  }
}

function toUpdatePayload(v: MaintenanceFormValues): UpdateMaintenancePayload {
  return {
    name: v.name.trim(),
    is_maintenance: v.is_maintenance,
    start_time: v.start_time.trim()
      ? (datetimeLocalToIso(v.start_time) ?? null)
      : null,
    end_time: v.end_time.trim() ? (datetimeLocalToIso(v.end_time) ?? null) : null,
  }
}

export function EditMaintenanceModal({
  maintenance,
  triggerClassName,
}: {
  maintenance: Maintenance
  triggerClassName?: string
}) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const mutation = useUpdateMaintenance(maintenance.id, () => setOpen(false))

  const { register, handleSubmit, reset, watch, setValue, setError, clearErrors, formState } =
    useForm<MaintenanceFormValues>()

  const startTime = watch('start_time')
  const endTime = watch('end_time')

  useEffect(() => {
    clearErrors('root')
  }, [startTime, endTime, clearErrors])

  const openDialog = () => {
    reset(maintenanceToForm(maintenance))
    setOpen(true)
  }

  return (
    <>
      <button
        type='button'
        className={cn(nbIconButton, nbAccent.yellow, triggerClassName)}
        aria-label={t('maintenanceEditModal.triggerAria', { name: maintenance.name })}
        onClick={openDialog}
      >
        <Pencil className='h-3.5 w-3.5' strokeWidth={3} aria-hidden />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={nbDialog} showCloseButton={false}>
          <div className={cn(nbDialogHeader, nbAccent.yellow)}>
            <DialogHeader className='gap-2 text-left'>
              <div className='flex items-center gap-2.5'>
                <span className={nbDialogIcon}>
                  <Pencil className='h-4 w-4' strokeWidth={3} aria-hidden />
                </span>
                <DialogTitle className={nbDialogTitle}>
                  {t('maintenanceEditModal.title')}
                </DialogTitle>
              </div>
              <DialogDescription className={nbHint}>
                {t('maintenanceEditModal.description')}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form
            onSubmit={handleSubmit((v) => {
              if (isMaintenanceWindowOrderInvalid(v.start_time, v.end_time)) {
                setError('root', { message: t('maintenanceForm.orderInvalid') })
                return
              }
              mutation.mutate(toUpdatePayload(v))
            })}
            className={cn(nbDialogBody, 'max-h-[70vh] overflow-y-auto')}
          >
            <MaintenanceFormFields
              register={register}
              errors={formState.errors}
              isMaintenance={watch('is_maintenance')}
              onModeChange={(c) => setValue('is_maintenance', c)}
            />

            {formState.errors.root?.message && (
              <p className={nbError} role='alert'>
                {formState.errors.root.message}
              </p>
            )}

            <DialogFooter className={nbDialogFooter}>
              <button
                type='button'
                className={cn(nbDialogButton, nbAccent.white)}
                onClick={() => setOpen(false)}
              >
                {t('maintenanceForm.cancel')}
              </button>
              <button
                type='submit'
                disabled={mutation.isPending}
                className={cn(nbDialogButton, nbAccent.yellow)}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
                    {t('maintenanceForm.saving')}
                  </>
                ) : (
                  t('maintenanceForm.save')
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
