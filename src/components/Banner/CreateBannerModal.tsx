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
import { UploadCloud } from 'lucide-react'

import { handleFileAutoUpload } from '@/helpers/upload'
import type { FormValuesBanner } from '@/types/banner'
import { useCreateBanner } from '@/hooks/useBanner'

export function CreateBannerModal() {
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
  } = useForm<FormValuesBanner>()

  const mutation = useCreateBanner(reset, setPreview, setOpen)
  const onSubmit = (values: FormValuesBanner) => {
    mutation.mutate(values)
  }

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

  useEffect(() => {
    if (!open) {
      reset()
      setPreview(null)
      setUploadProgress(0)
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }, [open, reset])

  return (
    <>
      <Button className="cursor-pointer" onClick={() => setOpen(true)}>
        + Create Banner
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Banner</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label>Redirect Link</Label>
              <div className="space-y-1">
                <Input
                  {...register('redirect_link', {
                    required: 'Redirect Link is required',
                  })}
                  placeholder="Redirect Link"
                  aria-invalid={!!errors.redirect_link}
                />

                {errors.redirect_link && (
                  <p className="text-xs text-destructive">{errors.redirect_link.message}</p>
                )}
              </div>
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
              <Button
                className="cursor-pointer"
                variant="outline"
                type="button"
                onClick={() => {
                  setOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button
                className="cursor-pointer"
                type="submit"
                disabled={isUploading || mutation.isPending}
              >
                {mutation.isPending ? 'Saving...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
