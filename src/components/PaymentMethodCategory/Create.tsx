import { useRef, useState } from 'react'
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
import { Loader2, Plus, UploadCloud } from 'lucide-react'

import { handleFileAutoUpload } from '@/helpers/upload'

import { useCreatePaymentCategory } from '@/hooks/usePaymentMethodCategory'

export type FormValuesPaymentCategory = {
  name: string
  slug: string
  icon_url: string
}

export type PaymentCategoryPayload = {
  name: string
  slug: string
  icon_url: string
}

export function CreatePaymentCategoryModal() {
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValuesPaymentCategory>({
    defaultValues: { name: '', slug: '', icon_url: '' },
  })

  const applyOpen = (next: boolean) => {
    setOpen(next)
    if (!next) {
      reset()
      setPreview(null)
      setUploadProgress(0)
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const mutation = useCreatePaymentCategory(reset, setPreview, applyOpen)

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
        type='button'
        className='w-full gap-2 rounded-xl font-semibold shadow-sm sm:w-auto'
        onClick={() => applyOpen(true)}
      >
        <Plus className='h-4 w-4 shrink-0' aria-hidden />
        Tambah kategori
      </Button>

      <Dialog open={open} onOpenChange={applyOpen}>
        <DialogContent className='rounded-xl sm:max-w-md'>
          <DialogHeader className='space-y-1 text-left'>
            <DialogTitle className='text-lg font-semibold tracking-tight'>Tambah kategori</DialogTitle>
            <p className='text-sm text-muted-foreground'>
              Nama, slug, dan ikon digunakan untuk menampilkan grup metode pembayaran.
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <input type='hidden' {...register('icon_url')} />
            <div className='space-y-2'>
              <Label htmlFor='pmc-name'>Nama</Label>
              <div className='space-y-1'>
                <Input
                  id='pmc-name'
                  {...register('name', { required: 'Nama wajib diisi' })}
                  placeholder='Contoh: E-wallet'
                  aria-invalid={!!errors.name}
                />

                {errors.name && <p className='text-xs text-destructive'>{errors.name.message}</p>}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='pmc-slug'>Slug</Label>
              <div className='space-y-1'>
                <Input
                  id='pmc-slug'
                  {...register('slug', { required: 'Slug wajib diisi' })}
                  placeholder='ewallet'
                  aria-invalid={!!errors.slug}
                />

                {errors.slug && <p className='text-xs text-destructive'>{errors.slug.message}</p>}
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Ikon</Label>

              <div
                role='button'
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
                  <img src={preview} alt='' className='h-full w-full rounded-lg object-contain' />
                ) : (
                  <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                    <UploadCloud className='h-6 w-6' aria-hidden />
                    <span className='text-sm'>Klik atau letakkan gambar di sini</span>
                  </div>
                )}

                {isUploading && (
                  <div className='absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-sm font-medium text-white'>
                    Mengunggah {uploadProgress}%
                  </div>
                )}
              </div>

              {isUploading && <Progress value={uploadProgress} />}
            </div>

            <input
              ref={inputRef}
              type='file'
              accept='image/*,.svg'
              className='hidden'
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />

            <DialogFooter className='gap-2 sm:gap-0'>
              <Button type='button' variant='outline' className='rounded-lg' onClick={() => applyOpen(false)}>
                Batal
              </Button>
              <Button
                type='submit'
                className='rounded-lg font-semibold'
                disabled={isUploading || mutation.isPending}
              >
                {mutation.isPending ? (
                  <span className='flex items-center gap-2'>
                    <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
                    Menyimpan…
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
