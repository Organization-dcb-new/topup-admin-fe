import { useEffect, useRef, useState } from 'react'
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
import { Progress } from '@/components/ui/progress'
import toast from 'react-hot-toast'
import slugify from 'slugify'
import { UploadCloud } from 'lucide-react'
import type { Category } from '@/types/category'
import { updateCategory, uploadFile } from '@/hooks/useCategory'

type PropsEditModal = {
  open: boolean
  onClose: () => void
  category: Category
}

type FormValuesEditModal = {
  name: string
  description: string
  icon_url: string
}

export function EditCategoryModal({ open, onClose, category }: PropsEditModal) {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)

  const defaultPreview = useRef<string | null>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValuesEditModal>()

  useEffect(() => {
    if (!open || !category) return

    reset({
      name: category.name,
      description: category.description,
      icon_url: category.icon_url,
    })

    setPreview(category.icon_url)
    defaultPreview.current = category.icon_url
  }, [open, category, reset])

  /* ---------- upload handler ---------- */
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files allowed')
      return
    }

    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)

    try {
      setUploading(true)
      const res = await uploadFile(file, setProgress)
      const url = res.data.url

      setValue('icon_url', url, { shouldValidate: true })
      setPreview(url)

      toast.success('Image uploaded')
    } catch {
      toast.error('Upload failed')
      setPreview(defaultPreview.current)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  /* ---------- submit ---------- */
  const mutation = useMutation({
    mutationFn: (values: FormValuesEditModal) =>
      updateCategory(category.id, {
        ...values,
        slug: slugify(values.name),
      }),
    onSuccess: () => {
      toast.success('Category updated')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      onClose()
    },
    onError: () => toast.error('Failed to update category'),
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              {...register('name', { required: 'Name is required' })}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              {...register('description', {
                required: 'Description is required',
              })}
              className={` overflow-auto max-h-40 ${
                errors.description ? 'border-destructive' : ''
              }`}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Icon (register hidden) */}
          <input
            type="hidden"
            {...register('icon_url', {
              required: 'Icon is required',
            })}
          />

          {/* Drag Upload */}
          <div className="space-y-2">
            <Label>Icon</Label>

            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const file = e.dataTransfer.files[0]
                if (file) handleFile(file)
              }}
              className={`group relative flex h-40 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition
                ${uploading ? 'pointer-events-none opacity-60' : 'hover:border-primary'}
                ${errors.icon_url ? 'border-destructive' : ''}
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
                  <span className="text-sm">Click or Drop image</span>
                </div>
              )}

              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                  <span className="text-sm font-medium">Uploading {progress}%</span>
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
                if (!file) {
                  setPreview(defaultPreview.current)
                  return
                }
                handleFile(file)
                e.target.value = ''
              }}
            />

            {uploading && <Progress value={progress} />}

            {errors.icon_url && (
              <p className="text-xs text-destructive">{errors.icon_url.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose} className="cursor-pointer">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending || uploading}
              className="cursor-pointer"
            >
              {mutation.isPending ? 'Saving...' : 'Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
