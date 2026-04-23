import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit3, Loader2 } from 'lucide-react' // Tambah Loader2
import type { RateLimit } from '@/types/rate_limit'
import { useRateLimitSubmit } from '@/hooks/useRateLimiter'

interface Props {
  rateLimit?: RateLimit;
}

export default function ModalRateLimit({ rateLimit }: Props) {
  const [open, setOpen] = useState(false)
  const isUpdate = !!rateLimit

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

  return (
    <>
      {isUpdate ? (
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 cursor-pointer hover:bg-purple-50 hover:text-purple-600 transition-colors'
          onClick={() => setOpen(true)}
        >
          <Edit3 className='h-4 w-4' />
        </Button>
      ) : (
        <Button className='cursor-pointer' onClick={() => setOpen(true)}>
          <Plus className='h-4 w-4' /> Create Rate Limit
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              {isUpdate ? (
                <>
                  <Edit3 className='h-5 w-5 text-purple-600' /> Update Setting
                </>
              ) : (
                <>
                  <Plus className='h-5 w-5 text-purple-600' /> New Rate Limit
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-4 py-2'>
              {/* Key Setting */}
              <div className='space-y-2'>
                <Label htmlFor='key' className='text-sm font-semibold'>
                  Setting Key
                </Label>
                <Input
                  {...register('key', {
                    required: 'Key is required',
                    pattern: {
                      value: /^[A-Z_]+$/,
                      message: 'Key must be UPPERCASE_WITH_UNDERSCORES',
                    },
                  })}
                  placeholder='e.g. LIMIT_UPLOAD'
                  className={` transition-all`}
                />
                {errors.key && (
                  <p className='text-[11px] font-medium text-destructive italic'>
                    {errors.key.message}
                  </p>
                )}
              </div>

              {/* Value Setting */}
              <div className='space-y-2'>
                <Label htmlFor='value' className='text-sm font-semibold'>
                  Threshold Value (req/min)
                </Label>
                <Input
                  type='number'
                  {...register('value', {
                    required: 'Value is required',
                    min: { value: 1, message: 'Minimum value is 1' },
                  })}
                  placeholder='10'
                  className='transition-all focus-visible:ring-purple-500'
                />
                {errors.value && (
                  <p className='text-[11px] font-medium text-destructive italic'>
                    {errors.value.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className='gap-2 sm:gap-5 border-t pt-4'>
              <Button
                variant='ghost'
                type='button'
                onClick={() => setOpen(false)}
                className='cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={mutation.isPending}
                className='cursor-pointer bg-purple-600 hover:bg-purple-700 min-w-25'
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Saving
                  </>
                ) : isUpdate ? (
                  'Update'
                ) : (
                  'Create'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
