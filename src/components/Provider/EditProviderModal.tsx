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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useUpdateProvider } from '@/hooks/useProvider'
import type { Provider, ProviderFormValues } from '@/types/provider'
import { Eye, EyeOff, Loader2, Pencil } from 'lucide-react'

type Props = {
  provider: Provider
}

export function EditProviderModal({ provider }: Props) {
  const [showApiKey, setShowApiKey] = useState(false)
  const [open, setOpen] = useState(false)

  const nameId = useId()
  const codeId = useId()
  const apiUrlId = useId()
  const apiKeyId = useId()
  const priorityId = useId()
  const configId = useId()

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
    } else if (!open) {
      reset()
      /* eslint-disable react-hooks/set-state-in-effect -- reset tampilan kunci API saat dialog ditutup */
      setShowApiKey(false)
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [open, provider, reset])

  const onSubmit = (v: ProviderFormValues) => {
    const payload: Record<string, unknown> = { ...v, config: v.config }

    if (!v.api_key_encrypted) {
      delete payload.api_key_encrypted
    }

    mutation.mutate({
      id: provider.id,
      payload: payload as Provider,
    })
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="cursor-pointer"
        aria-label={`Ubah penyedia ${provider.name}`}
      >
        <Pencil className="h-4 w-4" aria-hidden />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-xl sm:max-w-lg">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-lg font-semibold tracking-tight">Ubah penyedia</DialogTitle>
            <DialogDescription>
              Kode penyedia tidak dapat diubah. Kosongkan kunci API jika tidak ingin mengganti nilai di
              server.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={nameId} className="text-sm font-medium">
                Nama
              </Label>
              <Input
                id={nameId}
                autoComplete="off"
                className="rounded-lg"
                aria-invalid={!!errors.name}
                {...register('name', { required: 'Nama wajib diisi' })}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor={codeId} className="text-sm font-medium">
                Kode
              </Label>
              <Input id={codeId} disabled className="rounded-lg bg-muted/50 font-mono text-sm" {...register('code')} />
              <p className="text-xs text-muted-foreground">Kode bersifat tetap setelah dibuat.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor={apiUrlId} className="text-sm font-medium">
                URL API
              </Label>
              <Input
                id={apiUrlId}
                autoComplete="off"
                className="rounded-lg"
                aria-invalid={!!errors.api_url}
                {...register('api_url', {
                  required: 'URL API wajib diisi',
                  pattern: {
                    value: /^https?:\/\//,
                    message: 'Gunakan URL yang diawali http:// atau https://',
                  },
                })}
              />
              {errors.api_url && (
                <p className="text-xs text-destructive">{errors.api_url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={apiKeyId} className="text-sm font-medium">
                Kunci API
              </Label>
              <p className="text-xs text-muted-foreground">
                Biarkan kosong untuk mempertahankan kunci yang tersimpan di server.
              </p>
              <div className="relative">
                <Input
                  id={apiKeyId}
                  type={showApiKey ? 'text' : 'password'}
                  autoComplete="off"
                  className="rounded-lg pr-10"
                  placeholder="••••••••"
                  {...register('api_key_encrypted')}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={showApiKey ? 'Sembunyikan kunci API' : 'Tampilkan kunci API'}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={priorityId} className="text-sm font-medium">
                Prioritas
              </Label>
              <Input
                id={priorityId}
                type="number"
                min={0}
                className="rounded-lg"
                {...register('priority', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={configId} className="text-sm font-medium">
                Konfigurasi (JSON)
              </Label>
              <Textarea
                id={configId}
                rows={4}
                className="max-h-36 min-h-[5rem] resize-y rounded-lg font-mono text-sm"
                aria-invalid={!!errors.config}
                {...register('config', {
                  required: 'Konfigurasi wajib diisi',
                  validate: (value) => {
                    const s = typeof value === 'string' ? value : String(value ?? '')
                    try {
                      JSON.parse(s)
                      return true
                    } catch {
                      return 'Format JSON tidak valid'
                    }
                  },
                })}
              />
              {errors.config?.message && (
                <p className="text-xs text-destructive">{errors.config.message}</p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                    Menyimpan…
                  </>
                ) : (
                  'Simpan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
