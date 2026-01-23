import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface PaginationProps {
  page: number
  totalPage: number
  onChange: (page: number) => void
}

export default function Pagination({ page, totalPage, onChange }: PaginationProps) {
  const [jump, setJump] = useState('')

  if (totalPage <= 1) return null

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      {/* Prev */}
      <Button
        variant="outline"
        size="icon"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Pages */}
      <div className="flex items-center gap-1">{renderPages(page, totalPage, onChange)}</div>

      {/* Next */}
      <Button
        variant="outline"
        size="icon"
        disabled={page === totalPage}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Divider */}
      <span className="mx-2 hidden sm:block text-muted-foreground">|</span>

      {/* Jump Page */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={totalPage}
          value={jump}
          onChange={(e) => setJump(e.target.value)}
          className="h-9 w-16 rounded-md border px-2 text-center text-sm"
          placeholder="#"
        />

        <Button
          size="sm"
          variant="outline"
          className="cursor-pointer"
          onClick={() => {
            const target = Number(jump)
            if (target >= 1 && target <= totalPage) {
              onChange(target)
              setJump('')
            }
          }}
        >
          Jump
        </Button>
      </div>
    </div>
  )
}

function renderPages(page: number, totalPage: number, onChange: (page: number) => void) {
  const pages: (number | string)[] = []

  const range = (start: number, end: number) => {
    const res = []
    for (let i = start; i <= end; i++) res.push(i)
    return res
  }

  if (totalPage <= 7) {
    pages.push(...range(1, totalPage))
  } else {
    pages.push(1)

    if (page > 4) pages.push('...')

    const start = Math.max(2, page - 1)
    const end = Math.min(totalPage - 1, page + 1)

    pages.push(...range(start, end))

    if (page < totalPage - 3) pages.push('...')

    pages.push(totalPage)
  }

  const uniquePages = pages.filter((p, i) => pages.indexOf(p) === i)

  return uniquePages.map((p, idx) =>
    p === '...' ? (
      <span key={`dots-${idx}`} className="px-2 text-muted-foreground">
        ...
      </span>
    ) : (
      <Button
        key={p}
        size="icon"
        variant={p === page ? 'default' : 'outline'}
        className={cn('h-9 w-9', p === page && 'pointer-events-none')}
        onClick={() => onChange(p as number)}
      >
        {p}
      </Button>
    )
  )
}
