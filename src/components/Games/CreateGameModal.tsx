import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useCreateGame } from '@/hooks/useGame'
import toast from 'react-hot-toast'
import { useGetProvider } from '@/hooks/useProvider'
import { api } from '@/api/axios'
import { useGetCategories } from '@/hooks/useCategory'
import type { CreateGamePayload, GameInputPayload } from '@/types/game'
import { GameInput, GameInputForm } from './GameInput'

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
      <Button onClick={() => setOpen(true)} className="cursor-pointer">
        + Create Game
      </Button>
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
            <GameInput
              uploadingThumb={uploadingThumb}
              uploadingBanner={uploadingBanner}
              bannerFile={bannerFile}
              categories={categories!}
              providers={providers!}
              register={register}
              setBannerFile={setBannerFile}
              setBannerUrl={setBannerUrl}
              setThumbnailUrl={setThumbnailUrl}
              setUploadingBanner={setUploadingBanner}
              setUploadingThumb={setUploadingThumb}
              setValue={setValue}
              thumbnailFile={thumbnailFile}
              uploadFileHandler={uploadFileHandler}
            />
            <GameInputForm
              addInput={addInput}
              inputs={inputs}
              removeInput={removeInput}
              updateInput={updateInput}
            />
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
