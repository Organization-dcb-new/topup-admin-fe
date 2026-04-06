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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

import { Pencil, UploadCloud } from 'lucide-react'

import { handleFileAutoUpload } from '@/helpers/upload'
import type { Banner } from '@/types/banner'
import { useUpdateBanner } from '@/hooks/useBanner'
import { cn } from '@/lib/utils'

type UpdateBannerForm = {
  redirect_link: string
  image: string
}

export function UpdateBanner({
  banner,
  triggerClassName,
}: {
  banner: Banner
  triggerClassName?: string
}) {
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
  } = useForm<UpdateBannerForm>()

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
      setValue: setValue as Parameters<typeof handleFileAutoUpload>[0]['setValue'],
      fieldName: 'image',
    })
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          reset({
            image: banner.image,
            redirect_link: banner.redirect_link,
          })
          setPreview(banner.image || null)
          defaultPreview.current = banner.image || null
          setOpen(true)
        }}
        className={cn('cursor-pointer gap-1.5', triggerClassName)}
        aria-label="Ubah banner"
      >
        <Pencil className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">Ubah</span>
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (next) return
          setUploadProgress(0)
          setIsUploading(false)
          if (inputRef.current) inputRef.current.value = ''
        }}
      >
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
          <div className="border-b border-border bg-muted/30 px-6 py-5">
            <DialogHeader className="gap-1.5 text-left">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Pencil className="h-4 w-4" aria-hidden />
                </span>
                <DialogTitle className="text-xl font-semibold tracking-tight">Ubah banner</DialogTitle>
              </div>
              <DialogDescription>
                Perbarui gambar atau link redirect. Perubahan akan terlihat setelah disimpan.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
            className="space-y-5 px-6 py-5"
          >
            <div className="space-y-2">
              <Label htmlFor="edit-banner-redirect-link">Link redirect</Label>
              <div className="space-y-1">
                <Input
                  id="edit-banner-redirect-link"
                  {...register('redirect_link', {
                    required: 'Link redirect wajib diisi',
                  })}
                  placeholder="https://..."
                  inputMode="url"
                  autoComplete="url"
                  aria-invalid={!!errors.redirect_link}
                />
                {errors.redirect_link && (
                  <p className="text-xs text-destructive">{errors.redirect_link.message}</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                URL lengkap (termasuk https://) untuk halaman promo atau produk.
              </p>
            </div>

            <input type="hidden" {...register('image')} />

            <div className="space-y-2">
              <Label>Gambar banner</Label>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, atau SVG. Seret file ke area ini atau ketuk untuk memilih.
              </p>

              <div
                role="button"
                tabIndex={0}
                aria-label="Unggah gambar banner"
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    inputRef.current?.click()
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file) handleFile(file)
                }}
                className={`group relative flex min-h-[11rem] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/20 px-4 py-6 transition-colors outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50 ${
                  isUploading
                    ? 'pointer-events-none opacity-60'
                    : 'hover:border-primary/50 hover:bg-muted/35'
                }`}
              >
                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt="Pratinjau banner"
                      className="max-h-44 w-full rounded-lg object-contain"
                    />
                    {!isUploading && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
                        <span className="rounded-md bg-background/95 px-3 py-1.5 text-sm font-medium shadow-sm">
                          Ganti gambar
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border">
                      <UploadCloud className="h-6 w-6 text-primary" aria-hidden />
                    </span>
                    <span className="text-sm font-medium text-foreground">Unggah gambar</span>
                    <span className="max-w-[16rem] text-xs leading-relaxed">
                      Klik atau letakkan file di sini
                    </span>
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-background/85 backdrop-blur-[2px]">
                    <span className="text-sm font-medium text-foreground">
                      Mengunggah… {uploadProgress}%
                    </span>
                    <Progress value={uploadProgress} className="h-2 w-[min(100%,12rem)]" />
                  </div>
                )}
              </div>

              <input
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
            </div>

            <DialogFooter className="gap-2 border-t border-border pt-5 sm:pt-5">
              <Button
                className="cursor-pointer sm:min-w-[5.5rem]"
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Batal
              </Button>
              <Button
                className="cursor-pointer sm:min-w-[5.5rem]"
                type="submit"
                disabled={isUploading || mutation.isPending}
              >
                {mutation.isPending ? 'Menyimpan…' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
