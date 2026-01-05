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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

import { Pencil, UploadCloud } from 'lucide-react'
import type { FormValuesCategory, PropsEditModal } from '@/types/category'
import { useUpdateCategory } from '@/hooks/useCategory'
import { handleFileAutoUpload } from '@/helpers/upload'

export function EditCategoryModal({ category }: PropsEditModal) {
  const inputRef = useRef<HTMLInputElement>(null)
  const defaultPreview = useRef<string | null>(null)
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
  } = useForm<FormValuesCategory>()

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

  const handleFile = (file: File) => {
    handleFileAutoUpload({
      file,
      setPreview,
      setIsUploading,
      setUploadProgress,
      setValue: setValue as any,
      fieldName: 'icon_url',
    })
  }
  const updateCategoryMutation = useUpdateCategory(category.id, setOpen)

  return (
    <div>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="cursor-pointer">
        <Pencil className="h-4 w-4" />
      </Button>

      <Dialog
        open={open}
        onOpenChange={() => {
          setOpen(false)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit((v) => updateCategoryMutation.mutate(v))}
            className="space-y-4"
          >
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
                ${isUploading ? 'pointer-events-none opacity-60' : 'hover:border-primary'}
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

                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                    <span className="text-sm font-medium">Uploading {uploadProgress}%</span>
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

              {isUploading && <Progress value={uploadProgress} />}

              {errors.icon_url && (
                <p className="text-xs text-destructive">{errors.icon_url.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setOpen(false)
                }}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateCategoryMutation.isPending || isUploading}
                className="cursor-pointer"
              >
                {updateCategoryMutation.isPending ? 'Saving...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
