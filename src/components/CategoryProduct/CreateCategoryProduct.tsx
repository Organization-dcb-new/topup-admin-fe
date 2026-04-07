import { useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus, UploadCloud } from 'lucide-react'

import { handleFileAutoUpload } from '@/helpers/upload'
import { useCreateCategoryProduct } from '@/hooks/useCategoryProduct'
import { useGetGameNamesWithType, type GameNames } from '@/hooks/useGame'
import { cn } from '@/lib/utils'

export type FormValuesCategoryProduct = {
  name: string
  game_id: string
  slug: string
  icon_url: string
  description: string
  is_active: boolean
}

export function CreateCategoryProductModal() {
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
    control,
    formState: { errors },
  } = useForm<FormValuesCategoryProduct>({
    defaultValues: {
      name: '',
      game_id: '',
      slug: '',
      icon_url: '',
      description: '',
      is_active: true,
    },
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

  const mutation = useCreateCategoryProduct(reset, setPreview, applyOpen)
  const { data: dataGameNames } = useGetGameNamesWithType()

  const onSubmit = (values: FormValuesCategoryProduct) => {
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
      <Button
        type="button"
        className="w-full gap-2 rounded-xl font-semibold shadow-sm sm:w-auto"
        onClick={() => applyOpen(true)}
      >
        <Plus className="h-4 w-4 shrink-0" aria-hidden />
        Tambah kategori produk
      </Button>

      <Dialog open={open} onOpenChange={applyOpen}>
        <DialogContent className="rounded-xl sm:max-w-md">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Tambah kategori produk
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Hubungkan kategori ke satu game. Ikon diunggah otomatis setelah file dipilih.
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register('icon_url')} />

            <div className="space-y-2">
              <Label htmlFor="ccp-name" className="text-sm font-medium">
                Nama kategori
              </Label>
              <Input
                id="ccp-name"
                {...register('name', { required: 'Nama wajib diisi' })}
                placeholder="Contoh: Top-up cepat"
                className="rounded-lg"
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ccp-slug" className="text-sm font-medium">
                Slug
              </Label>
              <Input
                id="ccp-slug"
                {...register('slug', { required: 'Slug wajib diisi' })}
                placeholder="top-up-cepat"
                className="rounded-lg"
              />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ccp-game" className="text-sm font-medium">
                Game
              </Label>
              <select
                id="ccp-game"
                {...register('game_id', { required: 'Pilih game' })}
                className={cn(
                  'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs',
                  'ring-offset-background focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                <option value="" disabled>
                  — Pilih game —
                </option>
                {dataGameNames?.map((game: GameNames) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
              {errors.game_id && (
                <p className="text-xs text-destructive">{errors.game_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ccp-desc" className="text-sm font-medium">
                Deskripsi
              </Label>
              <Textarea
                id="ccp-desc"
                {...register('description')}
                placeholder="Deskripsi singkat kategori (opsional)"
                rows={3}
                className="min-h-[4.5rem] resize-y rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between rounded-lg border border-border/80 px-3 py-2">
                    <span className="text-sm text-muted-foreground">
                      {field.value ? 'Kategori aktif' : 'Kategori nonaktif'}
                    </span>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isUploading || mutation.isPending}
                    />
                  </div>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Ikon</Label>

              <div
                role="button"
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
                className={cn(
                  'relative flex h-40 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition',
                  isUploading ? 'pointer-events-none opacity-60' : 'hover:border-primary',
                  'border-border/80',
                )}
              >
                {preview ? (
                  <img src={preview} alt="" className="h-full w-full rounded-lg object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <UploadCloud className="h-6 w-6" aria-hidden />
                    <span className="text-sm">Klik atau letakkan gambar di sini</span>
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-sm font-medium text-white">
                    Mengunggah {uploadProgress}%
                  </div>
                )}
              </div>

              {isUploading && <Progress value={uploadProgress} />}
            </div>

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

            <DialogFooter className="gap-2 sm:gap-3 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="rounded-lg"
                onClick={() => applyOpen(false)}
                disabled={mutation.isPending}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="rounded-lg font-semibold"
                disabled={isUploading || mutation.isPending}
              >
                {mutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Menyimpan…
                  </span>
                ) : (
                  'Simpan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
