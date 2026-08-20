import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Loader2, Plus, UploadCloud } from 'lucide-react'

import { handleFileAutoUpload } from '@/helpers/upload'
import { cn } from '@/lib/utils'

import { useCreatePaymentCategory } from '@/hooks/usePaymentMethodCategory'
import {
  pmAddBtn,
  pmBtn,
  pmDialog,
  pmDialogDesc,
  pmDialogHeader,
  pmDialogIcon,
  pmDialogTitle,
  pmDrop,
  pmError,
  pmField,
  pmLabel,
  pmProgress,
} from '@/components/PaymentMethod/styles'

export type FormValuesPaymentCategory = {
  name: string
  slug: string
  icon_url: string
  sort_order: number
}

export type PaymentCategoryPayload = {
  name: string
  slug: string
  icon_url: string
  sort_order: number
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
    defaultValues: { name: '', slug: '', icon_url: '', sort_order: 0 },
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
      <button type='button' className={cn(pmAddBtn, 'bg-[#ff9ed2]')} onClick={() => applyOpen(true)}>
        <Plus className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
        Tambah kategori
      </button>

      <Dialog open={open} onOpenChange={applyOpen}>
        <DialogContent
          className={cn(pmDialog, 'max-h-[min(90vh,44rem)] overflow-y-auto sm:max-w-md')}
          showCloseButton={false}
        >
          <div className={cn(pmDialogHeader, 'bg-[#ff9ed2]')}>
            <DialogHeader className='gap-2 text-left'>
              <div className='flex items-center gap-2.5'>
                <span className={pmDialogIcon}>
                  <Plus className='h-4 w-4' strokeWidth={3} aria-hidden />
                </span>
                <DialogTitle className={pmDialogTitle}>Tambah kategori</DialogTitle>
              </div>
              <DialogDescription className={pmDialogDesc}>
                Nama, slug, dan ikon digunakan untuk menampilkan grup metode pembayaran.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5 px-5 py-5'>
            <input type='hidden' {...register('icon_url')} />
            <div className='space-y-2'>
              <Label htmlFor='pmc-name' className={pmLabel}>
                Nama
              </Label>
              <div className='space-y-1.5'>
                <Input
                  id='pmc-name'
                  {...register('name', { required: 'Nama wajib diisi' })}
                  placeholder='Contoh: E-wallet'
                  aria-invalid={!!errors.name}
                  className={cn(pmField, errors.name && 'nb-invalid')}
                />

                {errors.name && (
                  <p className={pmError} role='alert'>
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='pmc-slug' className={pmLabel}>
                Slug
              </Label>
              <div className='space-y-1.5'>
                <Input
                  id='pmc-slug'
                  {...register('slug', { required: 'Slug wajib diisi' })}
                  placeholder='ewallet'
                  aria-invalid={!!errors.slug}
                  className={cn(pmField, errors.slug && 'nb-invalid')}
                />

                {errors.slug && (
                  <p className={pmError} role='alert'>
                    {errors.slug.message}
                  </p>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='pmc-sort-order' className={pmLabel}>
                Sort order
              </Label>
              <div className='space-y-1.5'>
                <Input
                  id='pmc-sort-order'
                  type='number'
                  {...register('sort_order', {
                    required: 'Sort order wajib diisi',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Sort order minimal 0' },
                  })}
                  placeholder='0'
                  aria-invalid={!!errors.sort_order}
                  className={cn(pmField, errors.sort_order && 'nb-invalid')}
                />

                {errors.sort_order && (
                  <p className={pmError} role='alert'>
                    {errors.sort_order.message}
                  </p>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <Label className={pmLabel}>Ikon</Label>

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
                aria-busy={isUploading}
                className={cn(pmDrop, isUploading && 'pointer-events-none opacity-60')}
              >
                {preview ? (
                  <img src={preview} alt='' className='h-full w-full object-contain p-2' />
                ) : (
                  <div className='flex flex-col items-center gap-2 text-center'>
                    <span className='nb-frame nb-frame-thin nb-sd-sm flex h-12 w-12 items-center justify-center bg-[#6fe3f5]'>
                      <UploadCloud className='h-6 w-6' strokeWidth={2.5} aria-hidden />
                    </span>
                    <span className='max-w-[16rem] text-xs font-bold leading-relaxed text-[#111]/70'>
                      Klik atau letakkan gambar di sini
                    </span>
                  </div>
                )}

                {isUploading && (
                  <div className='absolute inset-0 flex items-center justify-center bg-[#f5f1e8]/95 text-xs font-black uppercase tracking-[0.12em]'>
                    Mengunggah {uploadProgress}%
                  </div>
                )}
              </div>

              {isUploading && <Progress value={uploadProgress} className={pmProgress} />}
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

            <DialogFooter className='gap-2 border-t-4 border-[#111] pt-5 sm:pt-5'>
              <button type='button' className={cn(pmBtn, 'bg-white')} onClick={() => applyOpen(false)}>
                Batal
              </button>
              <button
                type='submit'
                className={cn(pmBtn, 'bg-[#ff9ed2]')}
                disabled={isUploading || mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' strokeWidth={3} aria-hidden />
                    Menyimpan…
                  </>
                ) : (
                  'Simpan'
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
