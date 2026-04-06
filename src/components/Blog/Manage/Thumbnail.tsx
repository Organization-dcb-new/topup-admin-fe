import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { BlogFormValues } from '../types/blog'
import type { UseMutationResult } from '@tanstack/react-query'
import { Loader2, UploadCloud } from 'lucide-react'

interface ThumbnailProps {
  formData: BlogFormValues
  uploadMutation: UseMutationResult<string, Error, File, unknown>
}

export default function Thumbnail({ formData, uploadMutation }: ThumbnailProps) {
  const isUploading = uploadMutation.isPending

  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm ring-1 ring-gray-900/5 transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Gambar thumbnail
        </p>
        {formData.thumbnail && !isUploading && (
          <Badge variant="secondary" className="text-[10px] font-normal">
            16:9
          </Badge>
        )}
      </div>

      <div
        className={cn(
          'relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors',
          isUploading
            ? 'border-primary/40 bg-primary/5'
            : 'border-border bg-muted/20 hover:border-primary/50',
        )}
      >
        {formData.thumbnail ? (
          <img
            src={formData.thumbnail}
            alt="Pratinjau thumbnail"
            className={cn(
              'h-full w-full object-cover transition-opacity duration-300',
              isUploading && 'opacity-40',
            )}
          />
        ) : (
          <div className="px-4 text-center">
            <UploadCloud
              className={cn(
                'mx-auto mb-2 h-8 w-8',
                isUploading ? 'text-primary' : 'text-muted-foreground',
              )}
              aria-hidden
            />
            <p className="text-xs font-medium text-muted-foreground">
              {isUploading ? 'Mengunggah…' : 'Klik atau pilih file gambar'}
            </p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[2px]">
            <Loader2 className="mb-2 h-7 w-7 animate-spin text-primary" aria-hidden />
            <div className="h-1 w-24 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
            </div>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          disabled={isUploading}
          className={cn(
            'absolute inset-0 cursor-pointer opacity-0',
            isUploading && 'cursor-not-allowed',
          )}
          aria-label="Unggah thumbnail"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) uploadMutation.mutate(file)
          }}
        />
      </div>

      <p className="mt-2 text-center text-[10px] text-muted-foreground">
        Disarankan 1280×720 px (rasio 16:9)
      </p>
    </div>
  )
}
