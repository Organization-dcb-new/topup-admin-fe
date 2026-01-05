import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { ImageDropzone } from '../Layout/PreviewImage'
import type { GameInputFormProps, GameInputProps } from '@/types/game'

export function GameInput({
  setValue,
  register,
  categories,
  providers,
  thumbnailFile,
  bannerFile,
  uploadFileHandler,
  setBannerFile,
  setThumbnailUrl,
  setUploadingThumb,
  uploadingThumb,
  uploadingBanner,
  setBannerUrl,
  setUploadingBanner,
}: GameInputProps) {
  return (
    <>
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

      <Textarea className="max-h-32" placeholder="Description" {...register('description')} />
      <Textarea className="max-h-32" placeholder="Instruction" {...register('instruction')} />

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
    </>
  )
}

export function GameInputForm({ addInput, updateInput, removeInput, inputs }: GameInputFormProps) {
  return (
    <div className="space-y-3 w-full ">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Game Inputs</h3>
        <Button type="button" size="sm" onClick={addInput} className="cursor-pointer">
          + Add Input
        </Button>
      </div>
      <div className=" flex flex-col gap-4 max-h-120 overflow-y-auto">
        {inputs.map((item, idx) => (
          <div key={idx} className="border rounded-lg p-3 space-y-2 ">
            <div className="flex gap-2  ">
              <Input
                className="w-full"
                placeholder="Key"
                value={item.key}
                onChange={(e) => updateInput(idx, 'key', e.target.value)}
              />
              <Input
                className="w-full"
                placeholder="Label"
                value={item.label}
                onChange={(e) => updateInput(idx, 'label', e.target.value)}
              />

              <Select
                value={item.input_type}
                onValueChange={(v) => updateInput(idx, 'input_type', v as 'text' | 'number')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Placeholder"
              value={item.placeholder}
              onChange={(e) => updateInput(idx, 'placeholder', e.target.value)}
            />

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
                className="cursor-pointer"
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => removeInput(idx)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
