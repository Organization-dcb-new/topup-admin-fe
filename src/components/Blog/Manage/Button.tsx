import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { BlogFormBlogMutationResult } from '../hooks/useBlog'
import { Loader2, Save, Send } from 'lucide-react'

interface ButtonManageProps {
  handlePublish: (status: 'draft' | 'published') => void
  blogMutation: BlogFormBlogMutationResult
  isFormValid: boolean
  isEdit?: boolean
  currentStatusValue: 'draft' | 'published'
  onStatusChange: (status: 'draft' | 'published') => void
}

const statusOptions = [
  {
    id: 'published' as const,
    label: 'Terbit',
    desc: 'Terlihat di halaman publik',
  },
  {
    id: 'draft' as const,
    label: 'Draf',
    desc: 'Hanya di panel admin',
  },
]

export default function ButtonManage({
  blogMutation,
  handlePublish,
  isFormValid,
  isEdit = false,
  currentStatusValue,
  onStatusChange,
}: ButtonManageProps) {
  const isPending = blogMutation.isPending
  const isDisabled = isPending || !isFormValid

  return (
    <div className="space-y-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm ring-1 ring-gray-900/5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Status publikasi
      </p>

      <div className="space-y-2" role="radiogroup" aria-label="Status publikasi">
        {statusOptions.map((item) => {
          const selected = currentStatusValue === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onStatusChange(item.id)}
              className={cn(
                'flex w-full cursor-pointer items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors',
                selected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border/60 bg-muted/20 hover:border-border hover:bg-muted/40',
              )}
            >
              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                  selected ? 'border-primary bg-primary' : 'border-muted-foreground/40 bg-background',
                )}
              >
                {selected && <span className="h-1.5 w-1.5 rounded-full bg-background" />}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    'block text-xs font-semibold',
                    selected ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {item.label}
                </span>
                <span className="block text-[10px] text-muted-foreground">{item.desc}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="border-t border-border/60 pt-4">
        <Button
          type="button"
          disabled={isDisabled}
          className="h-11 w-full text-xs font-semibold uppercase tracking-wide"
          onClick={() => handlePublish(currentStatusValue)}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Memproses…
            </>
          ) : isEdit ? (
            <>
              <Save className="mr-2 h-4 w-4" aria-hidden />
              Simpan perubahan
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" aria-hidden />
              {currentStatusValue === 'published' ? 'Publikasikan' : 'Simpan draf'}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
