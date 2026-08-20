import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
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
  nbInput,
  nbLabel,
} from '@/lib/nb'
import { cn } from '@/lib/utils'
import { Plus, Edit3, Loader2 } from 'lucide-react'
import type { RateLimit } from '@/types/rate_limit'
import { useRateLimitSubmit } from '@/hooks/useRateLimiter'

interface Props {
  rateLimit?: RateLimit;
}

export default function ModalRateLimit({ rateLimit }: Props) {
  const [open, setOpen] = useState(false)
  const isUpdate = !!rateLimit

  // Tiap baris tabel merender modalnya sendiri, jadi id statis akan bentrok
  // dan `htmlFor` label menunjuk ke input baris lain.
  const keyId = useId()
  const valueId = useId()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RateLimit>()

  const mutation = useRateLimitSubmit({ setOpen })

  const onSubmit = (payload: RateLimit) => {
    mutation.mutate(payload)
  }

  useEffect(() => {
    if (open) {
      if (isUpdate && rateLimit) {
        reset(rateLimit)
      } else {
        reset({ key: '', value: '' })
      }
    }
  }, [open, rateLimit, reset, isUpdate])

  const accent = isUpdate ? nbAccent.yellow : nbAccent.lime

  return (
    <>
      {isUpdate ? (
        <button
          type='button'
          className={cn(nbIconButton, nbAccent.yellow)}
          onClick={() => setOpen(true)}
          aria-label={`Update ${rateLimit?.key}`}
        >
          <Edit3 className='h-3.5 w-3.5' strokeWidth={3} aria-hidden />
        </button>
      ) : (
        <button
          type='button'
          className={cn(nbDialogButton, nbAccent.lime, 'h-10 w-full px-4 sm:w-auto')}
          onClick={() => setOpen(true)}
        >
          <Plus className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
          Create Rate Limit
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={nbDialog} showCloseButton={false}>
          <div className={cn(nbDialogHeader, accent)}>
            <DialogHeader className='gap-2 text-left'>
              <div className='flex items-center gap-2.5'>
                <span className={nbDialogIcon}>
                  {isUpdate ? (
                    <Edit3 className='h-4 w-4' strokeWidth={3} aria-hidden />
                  ) : (
                    <Plus className='h-4 w-4' strokeWidth={3} aria-hidden />
                  )}
                </span>
                <DialogTitle className={nbDialogTitle}>
                  {isUpdate ? 'Update Setting' : 'New Rate Limit'}
                </DialogTitle>
              </div>
              <DialogDescription className={nbHint}>
                Threshold is applied per minute, per API key.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={nbDialogBody}>
            <div className='space-y-2'>
              <Label htmlFor={keyId} className={nbLabel}>
                Setting Key
              </Label>
              <Input
                id={keyId}
                autoComplete='off'
                {...register('key', {
                  required: 'Key is required',
                  pattern: {
                    value: /^[A-Z_]+$/,
                    message: 'Key must be UPPERCASE_WITH_UNDERSCORES',
                  },
                })}
                placeholder='e.g. LIMIT_UPLOAD'
                aria-invalid={!!errors.key}
                className={cn(nbInput, 'font-mono uppercase', errors.key && 'nb-invalid')}
              />
              {errors.key && (
                <p className={nbError} role='alert'>
                  {errors.key.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor={valueId} className={nbLabel}>
                Threshold Value (req/min)
              </Label>
              <Input
                id={valueId}
                type='number'
                {...register('value', {
                  required: 'Value is required',
                  min: { value: 1, message: 'Minimum value is 1' },
                })}
                placeholder='10'
                aria-invalid={!!errors.value}
                className={cn(nbInput, 'tabular-nums', errors.value && 'nb-invalid')}
              />
              {errors.value && (
                <p className={nbError} role='alert'>
                  {errors.value.message}
                </p>
              )}
            </div>

            <DialogFooter className={nbDialogFooter}>
              <button
                type='button'
                onClick={() => setOpen(false)}
                className={cn(nbDialogButton, nbAccent.white)}
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={mutation.isPending}
                className={cn(nbDialogButton, accent)}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
                    Saving
                  </>
                ) : isUpdate ? (
                  'Update'
                ) : (
                  'Create'
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
