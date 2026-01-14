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
import { Checkbox } from '@/components/ui/checkbox'

import { Pencil, UploadCloud } from 'lucide-react'
import type { Show } from '@/types/show'
import { useUpdateShow } from '@/hooks/useShow'
import { handleFileAutoUpload } from '@/helpers/upload'

type UpdateShowForm = {
  name: string
  alias: string
  image: string
  is_hot: boolean
  is_new: boolean
  is_popular: boolean
  is_show: boolean
}

export function UpdateShowModal({ show }: { show: Show }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const defaultPreview = useRef<string | null>(null)

  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const { register, handleSubmit, reset, setValue, watch } = useForm<UpdateShowForm>()

  useEffect(() => {
    if (!open) return

    reset({
      name: show.Name,
      alias: show.Alias,
      image: show.Image,
      is_hot: show.IsHot,
      is_new: show.IsNew,
      is_popular: show.IsPopular,
      is_show: show.IsShow,
    })

    setPreview(show.Image || null)
    defaultPreview.current = show.Image || null
  }, [open, show, reset])

  const mutation = useUpdateShow({
    id: show.ID,
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
            <DialogTitle>Update Show</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <Label>Name</Label>
              <Input {...register('name', { required: true })} />
            </div>

            {/* Alias */}
            <div className="space-y-1">
              <Label>Alias</Label>
              <Input {...register('alias')} />
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

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={watch('is_hot')}
                  onCheckedChange={(v) => setValue('is_hot', !!v)}
                />
                Is Hot
              </label>

              <label className="flex items-center gap-2">
                <Checkbox
                  checked={watch('is_new')}
                  onCheckedChange={(v) => setValue('is_new', !!v)}
                />
                Is New
              </label>

              <label className="flex items-center gap-2">
                <Checkbox
                  checked={watch('is_popular')}
                  onCheckedChange={(v) => setValue('is_popular', !!v)}
                />
                Is Popular
              </label>

              <label className="flex items-center gap-2">
                <Checkbox
                  checked={watch('is_show')}
                  onCheckedChange={(v) => setValue('is_show', !!v)}
                />
                Is Show
              </label>
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
