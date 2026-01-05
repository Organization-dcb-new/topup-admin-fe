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
import type { ProviderPayload } from '@/types/provider'

import { useCreateProvider } from '@/hooks/useProvider'
import { Eye, EyeOff } from 'lucide-react'

export function CreateProviderModal() {
  const [open, setOpen] = useState(false)
  const mutation = useCreateProvider({ setOpen })
  const [showApiKey, setShowApiKey] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProviderPayload>({
    defaultValues: {
      priority: 1,
      config: '{"timeout":5000}',
    },
  })

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  useEffect(() => {
    if (!open) {
      reset()
      setShowApiKey(false)
    }
  }, [open, reset])

  return (
    <div>
      <Button onClick={() => setOpen(true)} className="cursor-pointer">
        + Create Provider
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Provider</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            {/* Global error */}
            {errors.root && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {errors.root.message}
              </div>
            )}

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
              {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
            </div>

            {/* API URL */}
            <div className="space-y-1">
              <Label>API URL</Label>
              <Input
                {...register('api_url', {
                  required: 'API URL is required',
                  pattern: {
                    value: /^https?:\/\//,
                    message: 'Invalid URL format',
                  },
                })}
              />
              {errors.api_url && (
                <p className="text-xs text-destructive">{errors.api_url.message}</p>
              )}
            </div>

            {/* API KEY */}
            <div className="space-y-1">
              <Label>API Key (Encrypted)</Label>

              <div className="relative">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  {...register('api_key_encrypted', {
                    required: 'API Key is required',
                  })}
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowApiKey((v) => !v)}
                  className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {errors.api_key_encrypted && (
                <p className="text-xs text-destructive">{errors.api_key_encrypted.message}</p>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <Label>Priority</Label>
              <Input
                type="number"
                {...register('priority', {
                  valueAsNumber: true,
                })}
              />
            </div>

            {/* Config */}
            <div className="space-y-1">
              <Label>Config (JSON)</Label>
              <Textarea
                rows={4}
                className="max-h-32"
                {...register('config', {
                  required: 'Config is required',
                  validate: (v) => {
                    try {
                      JSON.parse(v as any)
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
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="cursor-pointer">
                {mutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
