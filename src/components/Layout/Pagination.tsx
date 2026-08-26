import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface PaginationProps {
  page: number
  totalPage: number
  onChange: (page: number) => void
}

export default function Pagination({ page, totalPage, onChange }: PaginationProps) {
  const { t } = useTranslation('common')
  const [jump, setJump] = useState('')

  if (totalPage <= 1) return null

  // Nomor halaman yang diminta bisa tertinggal di luar rentang setelah data
  // menyusut (mis. baris terakhir dihapus). Diturunkan ke halaman valid
  // terdekat supaya tombol arah tidak berjalan ke halaman yang tidak ada.
  const current = Math.min(Math.max(page, 1), totalPage)

  return (
    <nav
      className='mt-6 flex flex-wrap items-center justify-center gap-3'
      aria-label={t('pagination.label')}
    >
      {/* Prev */}
      <Button
        variant='outline'
        size='icon'
        type='button'
        aria-label={t('pagination.prev')}
        disabled={current <= 1}
        onClick={() => onChange(current - 1)}
      >
        <ChevronLeft className='h-4 w-4' aria-hidden />
      </Button>

      {/* Pages */}
      <div className='flex items-center gap-1'>{renderPages(current, totalPage, onChange)}</div>

      {/* Next */}
      <Button
        variant='outline'
        size='icon'
        type='button'
        aria-label={t('pagination.next')}
        disabled={current >= totalPage}
        onClick={() => onChange(current + 1)}
      >
        <ChevronRight className='h-4 w-4' aria-hidden />
      </Button>

      {/* Divider */}
      <span className='mx-2 hidden sm:block text-muted-foreground' aria-hidden>
        |
      </span>

      {/* Jump Page */}
      <div className='flex items-center gap-2'>
        <input
          type='number'
          min={1}
          max={totalPage}
          value={jump}
          aria-label={t('pagination.jumpToPage')}
          onChange={(e) => setJump(e.target.value)}
          className='h-9 w-16 rounded-md border border-input bg-transparent px-2 text-center text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
          placeholder='#'
        />

        <Button
          size='sm'
          variant='outline'
          type='button'
          className='cursor-pointer'
          disabled={jump.trim() === ''}
          onClick={() => {
            // Dijepit, bukan diabaikan: nilai di luar rentang dulu membuat
            // tombol terasa rusak karena klik tidak menghasilkan apa pun.
            const target = Math.min(Math.max(Number(jump) || 1, 1), totalPage)
            onChange(target)
            setJump('')
          }}
        >
          {t('pagination.jump')}
        </Button>
      </div>
    </nav>
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
      <span key={`dots-${idx}`} className='px-2 text-muted-foreground' aria-hidden>
        ...
      </span>
    ) : (
      // Halaman aktif tetap bisa difokus: `disabled` akan membuang fokus
      // keyboard ke <body> saat nomor halaman berpindah, sekaligus
      // memudarkannya lewat `disabled:opacity-50` sehingga penanda halaman
      // aktif justru jadi yang paling samar.
      <Button
        key={p}
        size='icon'
        type='button'
        variant={p === page ? 'default' : 'outline'}
        className={cn('h-9 w-9')}
        aria-current={p === page ? 'page' : undefined}
        onClick={() => {
          if (p !== page) onChange(p as number)
        }}
      >
        {p}
      </Button>
    )
  )
}
