import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useCreateGame } from '@/hooks/useGame'
import toast from 'react-hot-toast'
import { useGetProvider } from '@/hooks/useProvider'
import { ImageDropzone } from '../Layout/PreviewImage'
import { api } from '@/api/axios'
import { useGetCategories } from '@/hooks/useCategory'
import type { CreateGamePayload, GameInputPayload } from '@/types/game'

export function CreateGameModal() {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, setValue, reset } = useForm<CreateGamePayload>()
  const [inputs, setInputs] = useState<GameInputPayload[]>([])
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [bannerUrl, setBannerUrl] = useState<string | null>(null)
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const { data: categories } = useGetCategories()
  const { data: providers } = useGetProvider()
  const { mutateAsync, isPending } = useCreateGame()

  const addInput = () => {
    setInputs((prev) => [
      ...prev,
      {
        key: '',
        label: '',
        input_type: 'text',
        required: false,
        sort_order: prev.length + 1,
        placeholder: '',
      },
    ])
  }

  const updateInput = <K extends keyof GameInputPayload>(
    index: number,
    field: K,
    value: GameInputPayload[K]
  ) => {
    const next = [...inputs]
    next[index][field] = value
    setInputs(next)
  }

  const removeInput = (index: number) => {
    const next = inputs.filter((_, i) => i !== index)
    setInputs(
      next.map((item, i) => ({
        ...item,
        sort_order: i + 1,
      }))
    )
  }

  const uploadFileHandler = async (
    file: File,
    setUrl: (url: string) => void,
    setUploading: (b: boolean) => void,
    setProgress?: (p: number) => void
  ) => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const res = await api.post('/upload/new', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (setProgress) {
            const total = progressEvent.total ?? 1
            const percent = Math.round((progressEvent.loaded * 100) / total)
            setProgress(percent)
          }
        },
      })

      if (res.data?.url) {
        setUrl(res.data.url)
        toast.success('Upload berhasil')
      } else {
        toast.error('Upload gagal')
      }
    } catch (err) {
      console.error(err)
      toast.error('Upload gagal')
    } finally {
      setUploading(false)
      if (setProgress) setProgress(0)
    }
  }

  /* ================= SUBMIT ================= */

  const onSubmit = async (data: CreateGamePayload) => {
    if (!thumbnailUrl || !bannerUrl) {
      toast.error('Thumbnail dan Banner harus di-upload terlebih dahulu')
      return
    }

    const payload = {
      ...data,
      thumbnail_url: thumbnailUrl,
      banner_url: bannerUrl,
    }

    await mutateAsync(payload as any, {
      onSuccess: () => {
        toast.success('Game berhasil ditambahkan')
        reset()
        setThumbnailFile(null)
        setBannerFile(null)
        setThumbnailUrl(null)
        setBannerUrl(null)
        setOpen(false)
      },
    })
  }

  return (
    <div>
      <Button onClick={() => setOpen(true)}>+ Create Game</Button>
      <Dialog
        open={open}
        onOpenChange={() => {
          setOpen(false)
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Game</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Category & Provider */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select onValueChange={(v) => setValue('category_id', v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.data?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(v) => setValue('provider_id', v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Provider" />
                </SelectTrigger>
                <SelectContent>
                  {providers?.data?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Name" {...register('name')} />
              <Input placeholder="Code" {...register('code')} />
            </div>

            <Input placeholder="Slug" {...register('slug')} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Developer" {...register('developer')} />
              <Input placeholder="Publisher" {...register('publisher')} />
            </div>

            <Textarea placeholder="Description" {...register('description')} />
            <Textarea placeholder="Instruction" {...register('instruction')} />

            {/* Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageDropzone
                label="Thumbnail"
                file={thumbnailFile}
                onChange={(file) => uploadFileHandler(file, setThumbnailUrl, setUploadingThumb)}
              />

              {uploadingThumb && <p className="text-sm text-muted-foreground">Uploading...</p>}

              <ImageDropzone
                label="Banner"
                file={bannerFile}
                onChange={(file) => {
                  setBannerFile(file)
                  uploadFileHandler(file, setBannerUrl, setUploadingBanner)
                }}
              />
              {uploadingBanner && <p className="text-sm text-muted-foreground">Uploading...</p>}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Game Inputs</h3>
                <Button type="button" size="sm" onClick={addInput}>
                  + Add Input
                </Button>
              </div>

              {inputs.map((item, idx) => (
                <div key={idx} className="border rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <Input
                      placeholder="Key"
                      value={item.key}
                      onChange={(e) => updateInput(idx, 'key', e.target.value)}
                    />
                    <Input
                      placeholder="Label"
                      value={item.label}
                      onChange={(e) => updateInput(idx, 'label', e.target.value)}
                    />

                    <Select
                      value={item.input_type}
                      onValueChange={(v) => updateInput(idx, 'input_type', v as 'text' | 'number')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Placeholder"
                      value={item.placeholder}
                      onChange={(e) => updateInput(idx, 'placeholder', e.target.value)}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={item.required}
                        onChange={(e) => updateInput(idx, 'required', e.target.checked)}
                      />
                      Required
                    </label>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeInput(idx)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Action */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
