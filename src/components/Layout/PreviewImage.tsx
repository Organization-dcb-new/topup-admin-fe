import { useDropzone } from "react-dropzone"

type ImageDropzoneProps = {
  file: File | null
  onChange: (file: File) => void
  label: string
}

export function ImageDropzone({ file, onChange, label }: ImageDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    onDrop: (files) => onChange(files[0]),
  })

  const preview = file ? URL.createObjectURL(file) : null

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>

      <div
        {...getRootProps()}
        className={`
          relative flex h-40 w-full cursor-pointer items-center justify-center
          rounded-lg border-2 border-dashed transition
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted'}
        `}
      >
        <input {...getInputProps()} />

        {preview ? (
          <img src={preview} alt="preview" className="h-full w-full rounded-lg object-contain" />
        ) : (
          <span className="text-sm text-muted-foreground">Drag & drop image here</span>
        )}
      </div>
    </div>
  )
}
