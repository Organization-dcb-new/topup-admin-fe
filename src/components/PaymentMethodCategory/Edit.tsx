import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Loader2, Pencil, UploadCloud } from 'lucide-react'

import { handleFileAutoUpload } from '@/helpers/upload'
import { useUpdatePaymentCategory } from '@/hooks/usePaymentMethodCategory'
import type { PaymentMethodCategory } from '@/types/payment-method-categories'

type FormValuesPaymentCategory = {
  name: string
  slug: string
  icon_url: string
  sort_order: number
  is_active: boolean
}

export function EditPaymentCategoryModal({ category }: { category: PaymentMethodCategory }) {
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValuesPaymentCategory>({
    defaultValues: {
      name: '',
      slug: '',
      icon_url: '',
      sort_order: 0,
      is_active: true,
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      name: category.name,
      slug: category.slug,
      icon_url: category.icon_url,
      sort_order: category.sort_order,
      is_active: category.is_active,
    })
    setPreview(category.icon_url || null)
    setUploadProgress(0)
    setIsUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }, [open, category, reset])

  const closeModal = () => {
    setOpen(false)
    setUploadProgress(0)
    setIsUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const mutation = useUpdatePaymentCategory(category.id, closeModal, reset, setPreview)

  const onSubmit = (values: FormValuesPaymentCategory) => {
    mutation.mutate(values)
  }

  const handleFile = (file: File) => {
    handleFileAutoUpload({
      file,
      setPreview,
      setIsUploading,
      setUploadProgress,
      setValue: (_field, value, options) => {
        setValue('icon_url', value, options)
      },
      fieldName: 'icon_url',
    })
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label={`Edit kategori ${category.name}`}
        onClick={() => setOpen(true)}
      >
        <Pencil className="h-4 w-4" aria-hidden />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-xl sm:max-w-md">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-lg font-semibold tracking-tight">Edit kategori</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Ubah informasi kategori metode pembayaran.
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register('icon_url')} />

            <div className="space-y-2">
              <Label htmlFor={`pmc-name-edit-${category.id}`}>Nama</Label>
              <div className="space-y-1">
                <Input
                  id={`pmc-name-edit-${category.id}`}
                  {...register('name', { required: 'Nama wajib diisi' })}
                  placeholder="Contoh: E-wallet"
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`pmc-slug-edit-${category.id}`}>Slug</Label>
              <div className="space-y-1">
                <Input
                  id={`pmc-slug-edit-${category.id}`}
                  {...register('slug', { required: 'Slug wajib diisi' })}
                  placeholder="ewallet"
                  aria-invalid={!!errors.slug}
                />
                {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`pmc-sort-order-edit-${category.id}`}>Sort order</Label>
              <div className="space-y-1">
                <Input
                  id={`pmc-sort-order-edit-${category.id}`}
                  type="number"
                  {...register('sort_order', {
                    required: 'Sort order wajib diisi',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Sort order minimal 0' },
                  })}
                  placeholder="0"
                  aria-invalid={!!errors.sort_order}
                />
                {errors.sort_order && (
                  <p className="text-xs text-destructive">{errors.sort_order.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-border/80 px-3 py-2">
                <Label htmlFor={`pmc-active-edit-${category.id}`} className="cursor-pointer">
                  Aktif
                </Label>
                <Switch
                  id={`pmc-active-edit-${category.id}`}
                  checked={watch('is_active')}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                  disabled={mutation.isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ikon</Label>

              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    inputRef.current?.click()
                  }
                }}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file) handleFile(file)
                }}
                className={`group relative flex h-40 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition ${
                  isUploading ? 'pointer-events-none opacity-60' : 'hover:border-primary'
                } border-border/80`}
              >
                {preview ? (
                  <img src={preview} alt="" className="h-full w-full rounded-lg object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <UploadCloud className="h-6 w-6" aria-hidden />
                    <span className="text-sm">Klik atau letakkan gambar di sini</span>
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-sm font-medium text-white">
                    Mengunggah {uploadProgress}%
                  </div>
                )}
              </div>

              {isUploading && <Progress value={uploadProgress} />}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*,.svg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" className="rounded-lg" onClick={closeModal}>
                Batal
              </Button>
              <Button
                type="submit"
                className="rounded-lg font-semibold"
                disabled={isUploading || mutation.isPending}
              >
                {mutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Menyimpan...
                  </span>
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
