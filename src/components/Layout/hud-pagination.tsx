import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HudPaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

/** Prev/next pager in the HUD style; renders nothing for a single page. */
export function HudPagination({ page, totalPages, onChange }: HudPaginationProps) {
  const { t } = useTranslation('common')
  if (totalPages <= 1) return null

  return (
    <nav className='flex items-center justify-between border-t border-slate-200 pt-4' aria-label={t('pagination.label')}>
      <span className='font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-400'>
        {t('pagination.pageInfo', { page, total: totalPages })}
      </span>
      <div className='flex gap-2'>
        <PageButton disabled={page <= 1} onClick={() => onChange(page - 1)} label={t('pagination.prev')}>
          <ChevronLeft className='size-4' aria-hidden />
        </PageButton>
        <PageButton disabled={page >= totalPages} onClick={() => onChange(page + 1)} label={t('pagination.next')}>
          <ChevronRight className='size-4' aria-hidden />
        </PageButton>
      </div>
    </nav>
  )
}

function PageButton({
  disabled,
  onClick,
  label,
  children,
}: {
  disabled: boolean
  onClick: () => void
  label: string
  children: ReactNode
}) {
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      title={label}
      className='grid size-9 place-items-center bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hud-clip-sm transition-colors hover:text-brand-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-40 disabled:hover:text-slate-600'
    >
      {children}
    </button>
  )
}
