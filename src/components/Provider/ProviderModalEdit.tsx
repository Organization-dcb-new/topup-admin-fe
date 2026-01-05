import { useEffect, useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Pencil } from 'lucide-react'

import type { Provider, ProviderFormValues } from '@/types/provider'
import { useUpdateProvider } from '@/hooks/useProvider'

type Props = {
  provider: Provider
}

export function EditProviderModal({ provider }: Props) {
  const [showApiKey, setShowApiKey] = useState(false)
  const [open, setOpen] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProviderFormValues>()

  const mutation = useUpdateProvider()

  useEffect(() => {
    if (open && provider) {
      reset({
        name: provider.name,
        code: provider.code,
        api_url: provider.api_url,
        api_key_encrypted: provider.api_key_encrypted,
        priority: provider.priority,
        config: JSON.stringify(provider.config, null, 2),
      })
    }
  }, [open, provider, reset])

  useEffect(() => {
    if (!open) {
      reset()
      setShowApiKey(false)
    }
  }, [open, reset])

  const onSubmit = (v: ProviderFormValues) => {
    const payload: any = { ...v, config: v.config }

    if (!v.api_key_encrypted) {
      delete payload.api_key_encrypted
    }

    mutation.mutate({
      id: provider.id,
      payload,
    })
  }

  return (
    <div>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="cursor-pointer">
        <Pencil className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Provider</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <Label>Name</Label>
              <Input {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            {/* Code (readonly) */}
            <div className="space-y-1">
              <Label>Code</Label>
              <Input disabled {...register('code')} />
            </div>

            {/* API URL */}
            <div className="space-y-1">
              <Label>API URL</Label>
              <Input
                {...register('api_url', {
                  required: 'API URL is required',
                })}
              />
            </div>

            {/* API KEY */}
            <div className="space-y-1">
              <Label>API Key (leave empty if unchanged)</Label>

              <div className="relative">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  {...register('api_key_encrypted')}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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
                  required: 'Config is required',
                  validate: (v) => {
                    try {
                      JSON.parse(v as any)
                      console.log(v)
                      return true
                    } catch {
                      return 'Invalid JSON format'
                    }
                  },
                })}
              />
              {errors.config?.message && (
                <p className="text-xs text-destructive">{errors.config?.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                className="cursor-pointer"
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button className="cursor-pointer" type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
