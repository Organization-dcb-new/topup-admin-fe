import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'
import type { FormValuesProvider } from '@/types/provider'

type Props = {
  open: boolean
  onClose: () => void
  defaultValues?: FormValuesProvider
  onSubmit: (payload: FormValuesProvider) => Promise<any>
  title?: string
}

export function ProviderModal({
  open,
  onClose,
  defaultValues,
  onSubmit,
  title = 'Provider',
}: Props) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValuesProvider>({
    defaultValues: {
      name: '',
      code: '',
      api_url: '',
      api_key_encrypted: '',
      priority: 1,
      config: '{"timeout":5000}',
    },
  })

  /* init / reset */
  useEffect(() => {
    if (!open) {
      reset()
      return
    }

    if (defaultValues) {
      reset(defaultValues)
    }
  }, [open, defaultValues, reset])

  const mutation = useMutation({
    mutationFn: onSubmit,
    onSuccess: () => {
      toast.success('Provider saved')
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      onClose()
    },
    onError: () => toast.error('Failed to save provider'),
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <Label>Name</Label>
            <Input {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Code */}
          <div className="space-y-1">
            <Label>Code</Label>
            <Input {...register('code', { required: 'Code is required' })} />
          </div>

          {/* API URL */}
          <div className="space-y-1">
            <Label>API URL</Label>
            <Input {...register('api_url', { required: 'API URL is required' })} />
          </div>

          {/* API KEY */}
          <div className="space-y-1">
            <Label>API Key (Encrypted)</Label>
            <Input
              type="password"
              {...register('api_key_encrypted', {
                required: 'API Key is required',
              })}
            />
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <Label>Priority</Label>
            <Input type="number" {...register('priority', { valueAsNumber: true })} />
          </div>

          {/* Config */}
          <div className="space-y-1">
            <Label>Config (JSON)</Label>
            <Textarea
              rows={4}
              {...register('config', {
                validate: (v) => {
                  try {
                    JSON.parse(v)
                    return true
                  } catch {
                    return 'Invalid JSON format'
                  }
                },
              })}
              placeholder='{"timeout":5000}'
            />
            {errors.config && <p className="text-xs text-destructive">{errors.config.message}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
