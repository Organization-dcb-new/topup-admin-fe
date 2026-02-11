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
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

import { Pencil, UploadCloud } from 'lucide-react'

import { handleFileAutoUpload } from '@/helpers/upload'
import type { Banner } from '@/types/banner'
import { useUpdateBanner } from '@/hooks/useBanner'

type UpdateBannerForm = {
  redirect_link: string
  image: string
}

export function UpdateBanner({ banner }: { banner: Banner }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const defaultPreview = useRef<string | null>(null)

  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const { register, handleSubmit, reset, setValue } = useForm<UpdateBannerForm>()

  useEffect(() => {
    if (!open) return

    reset({
      image: banner.image,
      redirect_link: banner.redirect_link,
    })

    setPreview(banner.image || null)
    defaultPreview.current = banner.image || null
  }, [open, banner, reset])

  const mutation = useUpdateBanner({
    id: banner.id,
    setOpen,
  })
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

  return (
    <>
      {/* Trigger */}
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="cursor-pointer">
        <Pencil className="h-4 w-4" />
      </Button>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Banners</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            {/* Redirect Link */}
            <div className="space-y-1">
              <Label>Redirect Link</Label>
              <Input {...register('redirect_link')} />
            </div>

            {/* Image (hidden register) */}
            <input type="hidden" {...register('image')} />

            {/* Upload Image */}
            <div className="space-y-2">
              <Label>Image</Label>

              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file) handleFile(file)
                }}
                className={`relative flex h-40 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed
                ${isUploading ? 'pointer-events-none opacity-60' : 'hover:border-primary'}
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
                  if (!file) {
                    setPreview(defaultPreview.current)
                    return
                  }
                  handleFile(file)
                  e.target.value = ''
                }}
              />

              {isUploading && <Progress value={uploadProgress} />}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending || isUploading}
                className="cursor-pointer"
              >
                {mutation.isPending ? 'Saving...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
