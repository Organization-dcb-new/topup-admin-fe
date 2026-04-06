import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '../../ui/button'
import { cn } from '@/lib/utils'

type ViewMode = 'list' | 'create' | 'edit'

interface HeaderBlogProps {
  view: ViewMode
  setView: (view: ViewMode) => void
  className?: string
}

export default function HeaderBlog({ view, setView, className }: HeaderBlogProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4',
        className,
      )}
    >
      <h2 className="text-lg font-semibold tracking-tight text-gray-900">
        {view === 'list' && 'Daftar blog'}
        {view === 'create' && 'Artikel baru'}
        {view === 'edit' && 'Ubah artikel'}
      </h2>
      <div className="flex shrink-0 justify-end">
        {view === 'list' ? (
          <Button
            type="button"
            onClick={() => setView('create')}
            className="w-full cursor-pointer gap-2 shadow-sm sm:w-auto"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden />
            Tambah artikel
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => setView('list')}
            variant="outline"
            className="w-full cursor-pointer gap-2 sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            Kembali ke daftar
          </Button>
        )}
      </div>
    </div>
  )
}
