import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { UploadCloud } from 'lucide-react'
import { createCategory, uploadFile } from '@/hooks/useCategory'
import toast from 'react-hot-toast'

type FormValues = {
  name: string
  description: string
  icon_url: string
}

const MAX_FILE_SIZE = 2 * 1024 * 1024

export function CreateCategoryModal() {
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>()

  /* ---------------- validation ---------------- */
  const validateFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files allowed')
      return false
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Max image size 2MB')
      return false
    }
    return true
  }

  /* ---------------- auto upload ---------------- */
  const handleFile = async (file: File) => {
    if (!validateFile(file)) return

    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)

    try {
      setIsUploading(true)
      setUploadProgress(0)

      const res = await uploadFile(file, setUploadProgress)
      const url = res.data.url

      setValue('icon_url', url)
      toast.success('Upload success')
    } catch {
      toast.error('Upload failed')
      setPreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  /* ---------------- mutation ---------------- */
  const mutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success('Category created successfully')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      reset()
      setPreview(null)
      setOpen(false)
    },
    onError: () => {
      toast.error('Failed to create category')
    },
  })

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values)
  }

  /* ---------------- cleanup preview ---------------- */
  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Create Category</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label>Name</Label>
              <div className="space-y-1">
                <Input
                  {...register('name', {
                    required: 'Name is required',
                  })}
                  placeholder="Name"
                  aria-invalid={!!errors.name}
                />

                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label>Description</Label>

              <Textarea
                {...register('description', {
                  required: 'Description is required',
                  minLength: {
                    value: 10,
                    message: 'Description must be at least 10 characters',
                  },
                })}
                placeholder="Description"
                className={
                  errors.description ? 'border-destructive focus-visible:ring-destructive' : ''
                }
                aria-invalid={!!errors.description}
              />

              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Drag & Drop Zone */}
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
                  ${isUploading ? 'pointer-events-none opacity-60' : 'hover:border-primary'}
                `}
              >
                {preview ? (
                  <img src={preview} className="h-full w-full rounded-lg object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <UploadCloud className="h-6 w-6" />
                    <span className="text-sm">Click or Drop image</span>
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
                    <span className="text-sm">Uploading {uploadProgress}%</span>
                  </div>
                )}
              </div>

              {/* Progress */}
              {isUploading && <Progress value={uploadProgress} />}
            </div>

            {/* Hidden Input */}
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

            {/* Save */}
            <DialogFooter>
              <Button type="submit" disabled={isUploading || mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
