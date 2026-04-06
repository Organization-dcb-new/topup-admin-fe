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
import { Checkbox } from '@/components/ui/checkbox'

import { Pencil, UploadCloud } from 'lucide-react'
import type { Show } from '@/types/show'
import { useUpdateShow } from '@/hooks/useShow'
import { handleFileAutoUpload } from '@/helpers/upload'
import { cn } from '@/lib/utils'

type UpdateShowForm = {
  name: string
  alias: string
  image: string
  is_hot: boolean
  is_new: boolean
  is_popular: boolean
  is_show: boolean
}

function showToFormValues(show: Show): UpdateShowForm {
  return {
    name: show.Name,
    alias: show.Alias,
    image: show.Image,
    is_hot: show.IsHot,
    is_new: show.IsNew,
    is_popular: show.IsPopular,
    is_show: show.IsShow,
  }
}

export function UpdateShowModal({
  show,
  triggerClassName,
}: {
  show: Show
  triggerClassName?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const defaultPreview = useRef<string | null>(null)

  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const { register, handleSubmit, reset, setValue, watch, formState } = useForm<UpdateShowForm>()

  const setDialogOpen = (value: boolean) => {
    if (!value) {
      setUploadProgress(0)
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
    setOpen(value)
  }

  const mutation = useUpdateShow({
    id: show.ID,
    setOpen: setDialogOpen,
  })

  const openDialog = () => {
    reset(showToFormValues(show))
    setPreview(show.Image || null)
    defaultPreview.current = show.Image || null
    setOpen(true)
  }

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

  const flagFields: {
    key: keyof Pick<
      UpdateShowForm,
      'is_hot' | 'is_new' | 'is_popular' | 'is_show'
    >
    label: string
    description: string
  }[] = [
    { key: 'is_hot', label: 'Hot', description: 'Tandai sebagai konten hot.' },
    { key: 'is_new', label: 'Baru', description: 'Tandai sebagai konten baru.' },
    { key: 'is_popular', label: 'Populer', description: 'Tandai sebagai populer.' },
    { key: 'is_show', label: 'Tampil sebagai show', description: 'Show aktif di katalog.' },
  ]

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={openDialog}
        className={cn('cursor-pointer gap-1.5', triggerClassName)}
        aria-label="Ubah show"
      >
        <Pencil className="h-4 w-4 shrink-0" aria-hidden />
        <span className="hidden sm:inline">Ubah</span>
      </Button>

      <Dialog open={open} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[min(90vh,40rem)] gap-0 overflow-hidden overflow-y-auto p-0 sm:max-w-lg">
          <div className="border-b border-border bg-muted/30 px-6 py-5">
            <DialogHeader className="gap-1.5 text-left">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Pencil className="h-4 w-4" aria-hidden />
                </span>
                <DialogTitle className="text-xl font-semibold tracking-tight">Ubah show</DialogTitle>
              </div>
              <DialogDescription>
                Perbarui data show, gambar, dan penanda tampilan. Perubahan diterapkan setelah disimpan.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
            className="space-y-5 px-6 py-5"
          >
            <div className="space-y-2">
              <Label htmlFor="edit-show-name">Nama show</Label>
              <div className="space-y-1">
                <Input
                  id="edit-show-name"
                  {...register('name', { required: 'Nama show wajib diisi' })}
                  placeholder="Contoh: Topup Hemat"
                  aria-invalid={!!formState.errors.name}
                />
                {formState.errors.name && (
                  <p className="text-xs text-destructive">{formState.errors.name.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-show-alias">Alias</Label>
              <Input
                id="edit-show-alias"
                {...register('alias', { required: 'Alias wajib diisi' })}
                placeholder="topup-hemat"
                autoComplete="off"
                aria-invalid={!!formState.errors.alias}
              />
              {formState.errors.alias && (
                <p className="text-xs text-destructive">{formState.errors.alias.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Identitas unik untuk sistem (biasanya huruf kecil, tanpa spasi).
              </p>
            </div>

            <input type="hidden" {...register('image')} />

            <div className="space-y-2">
              <Label>Gambar show</Label>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, atau SVG. Seret ke area ini atau ketuk untuk memilih.
              </p>

              <div
                role="button"
                tabIndex={0}
                aria-label="Unggah gambar show"
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
                      alt="Pratinjau gambar show"
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

            <div className="space-y-3 rounded-xl border border-border/80 bg-muted/15 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Penanda</p>
                <p className="text-xs text-muted-foreground">
                  Atur bagaimana show ini ditampilkan di aplikasi.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {flagFields.map(({ key, label, description }) => (
                  <label
                    key={key}
                    className="flex cursor-pointer gap-3 rounded-lg border border-transparent p-2 transition-colors hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={watch(key)}
                      onCheckedChange={(v) => setValue(key, !!v)}
                      aria-describedby={`${key}-hint`}
                    />
                    <span className="min-w-0 space-y-0.5">
                      <span className="block text-sm font-medium leading-none">{label}</span>
                      <span id={`${key}-hint`} className="block text-xs text-muted-foreground">
                        {description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <DialogFooter className="gap-2 border-t border-border pt-5 sm:pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="cursor-pointer sm:min-w-[5.5rem]"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending || isUploading}
                className="cursor-pointer sm:min-w-[5.5rem]"
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
