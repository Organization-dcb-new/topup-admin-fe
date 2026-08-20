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
  isMaintenanceWindowOrderInvalid,
} from '@/helpers/maintenance-datetime'
import { useCreateMaintenance } from '@/hooks/useMaintenance'
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
} from '@/lib/nb'
import { cn } from '@/lib/utils'
import type { CreateMaintenancePayload } from '@/types/maintenance'
import { Construction, Loader2, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function toCreatePayload(v: MaintenanceFormValues): CreateMaintenancePayload {
  const body: CreateMaintenancePayload = {
    name: v.name.trim(),
    is_maintenance: v.is_maintenance,
  }
  const s = datetimeLocalToIso(v.start_time)
  const e = datetimeLocalToIso(v.end_time)
  if (s) body.start_time = s
  if (e) body.end_time = e
  return body
}

export function CreateMaintenanceModal() {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const mutation = useCreateMaintenance(() => setOpen(false))

  const { register, handleSubmit, reset, watch, setValue, setError, clearErrors, formState } =
    useForm<MaintenanceFormValues>({
      defaultValues: {
        name: '',
        is_maintenance: false,
        start_time: '',
        end_time: '',
      },
    })

  const startTime = watch('start_time')
  const endTime = watch('end_time')

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  const nameVal = watch('name')

  useEffect(() => {
    clearErrors('root')
  }, [startTime, endTime, nameVal, clearErrors])

  return (
    <>
      <button
        type='button'
        className={cn(nbDialogButton, nbAccent.lime, 'h-10 w-full px-4 sm:w-auto')}
        onClick={() => setOpen(true)}
      >
        <Plus className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
        {t('maintenanceCreateModal.trigger')}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={nbDialog} showCloseButton={false}>
          <div className={cn(nbDialogHeader, nbAccent.lime)}>
            <DialogHeader className='gap-2 text-left'>
              <div className='flex items-center gap-2.5'>
                <span className={nbDialogIcon}>
                  <Construction className='h-4 w-4' strokeWidth={3} aria-hidden />
                </span>
                <DialogTitle className={nbDialogTitle}>
                  {t('maintenanceCreateModal.title')}
                </DialogTitle>
              </div>
              <DialogDescription className={nbHint}>
                {t('maintenanceCreateModal.description')}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form
            onSubmit={handleSubmit((v) => {
              if (isMaintenanceWindowOrderInvalid(v.start_time, v.end_time)) {
                setError('root', { message: t('maintenanceForm.orderInvalid') })
                return
              }
              mutation.mutate(toCreatePayload(v))
            })}
            className={cn(nbDialogBody, 'max-h-[70vh] overflow-y-auto')}
          >
            <MaintenanceFormFields
              register={register}
              errors={formState.errors}
              isMaintenance={watch('is_maintenance')}
              onModeChange={(c) => setValue('is_maintenance', c)}
              requireTimes
              namePlaceholder={t('maintenanceForm.namePlaceholder')}
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
                className={cn(nbDialogButton, nbAccent.lime)}
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
