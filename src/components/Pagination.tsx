import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  totalPage: number
  onChange: (page: number) => void
}

export default function Pagination({ page, totalPage, onChange }: PaginationProps) {
  if (totalPage <= 1) return null

  return (
    <div className="mt-6 flex items-center justify-center">
      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="cursor-pointer"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {renderPages(page, totalPage, onChange)}

        <Button
          className="cursor-pointer"
          variant="outline"
          size="icon"
          disabled={page === totalPage}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function renderPages(page: number, totalPage: number, onChange: (page: number) => void) {
  const pages: (number | string)[] = []

  if (totalPage <= 7) {
    for (let i = 1; i <= totalPage; i++) pages.push(i)
  } else {
    pages.push(1)

    if (page > 4) pages.push('...')

    const start = Math.max(2, page - 1)
    const end = Math.min(totalPage - 1, page + 1)

    for (let i = start; i <= end; i++) pages.push(i)

    if (page < totalPage - 3) pages.push('...')

    pages.push(totalPage)
  }

  return pages.map((p, idx) =>
    p === '...' ? (
      <span key={idx} className="px-2 text-muted-foreground">
        ...
      </span>
    ) : (
      <Button
      
        key={p}
        size="icon"
        variant={p === page ? 'default' : 'outline'}
        className={cn('h-9 w-9 cursor-pointer', p === page && 'pointer-events-none cursor-pointer')}
        onClick={() => onChange(p as any)}
      >
        {p}
      </Button>
    )
  )
}
