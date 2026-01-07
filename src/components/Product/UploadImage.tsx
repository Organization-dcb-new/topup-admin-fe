import { useEffect, useRef, useState } from 'react'
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
import { Progress } from '@/components/ui/progress'
import { Pencil, UploadCloud } from 'lucide-react'

import { handleFileAutoUpload } from '@/helpers/upload'
import type { Product } from '@/types/product'
import { useUpdateImageProduct } from '@/hooks/useProduct'

type PropsImageProducts = {
  product: Product
  image: string
}

export type FormValuesChangeImageProduct = {
  image: string
  product_id: string
}

export function ChangeImageModalProduct({ product, image }: PropsImageProducts) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValuesChangeImageProduct>()

  const updateImageMutation = useUpdateImageProduct(() => setOpen(false))

  useEffect(() => {
    if (!open) return

    reset({
      image: product.image,
    })

    setPreview(product.image)
  }, [open, product, reset])

  const handleFile = (file: File) => {
    handleFileAutoUpload({
      file,
      setPreview,
      setIsUploading,
      setUploadProgress,
      setValue: setValue as any,
      fieldName: 'image',
    })
  }

  const onSubmit = (values: FormValuesChangeImageProduct) => {
    updateImageMutation.mutate({
      product_id: product.id,
      image: values.image,
    })
  }

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        className="group relative h-12 w-12 cursor-pointer"
      >
        <img
          src={image}
          alt={product.name}
          className="h-12 w-12 rounded-md border object-contain"
          loading="lazy"
        />

        <div className="absolute inset-0 flex items-center cursor-pointer justify-center rounded-md bg-black/40 opacity-0 transition group-hover:opacity-100">
          <Pencil className="h-4 w-4 text-white" />
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Product Image</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Hidden Field */}
            <input
              type="hidden"
              {...register('image', {
                required: 'Image is required',
              })}
            />

            {/* Upload Area */}
            <div className="space-y-2">
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file) handleFile(file)
                }}
                className={`relative flex h-40 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition
                  ${isUploading ? 'pointer-events-none opacity-60' : 'hover:border-primary'}
                  ${errors.image ? 'border-destructive' : ''}
                `}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="h-full w-full rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <UploadCloud className="h-6 w-6" />
                    <span className="text-sm">Click or drop image</span>
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                    Uploading {uploadProgress}%
                  </div>
                )}
              </div>

              <Input
                ref={inputRef}
                type="file"
                accept="image/*,.svg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                  e.target.value = ''
                }}
              />

              {isUploading && <Progress value={uploadProgress} />}

              {errors.image && <p className="text-xs text-destructive">{errors.image.message}</p>}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>

              <Button type="submit" disabled={updateImageMutation.isPending || isUploading}>
                {updateImageMutation.isPending ? 'Saving...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
