import { ArrowLeft, Plus, LayoutGrid, List as ListIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

type ViewMode = 'list' | 'create' | 'edit'

interface HeaderBlogProps {
  view: ViewMode
  setView: (view: ViewMode) => void
  className?: string
  viewMode?: 'table' | 'grid'
  setViewMode?: (mode: 'table' | 'grid') => void
}

function ViewToggleButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'nb-frame nb-frame-thin nb-press-sm flex h-9 w-9 cursor-pointer items-center justify-center',
        active ? 'nb-sd-sm bg-[#6fe3f5]' : 'bg-white text-[#111]/45',
      )}
    >
      {children}
    </button>
  )
}

export default function HeaderBlog({
  view,
  setView,
  className,
  viewMode,
  setViewMode,
}: HeaderBlogProps) {
  const { t } = useTranslation('common')

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4',
        className,
      )}
    >
      <h2 className='text-sm font-black uppercase tracking-tight'>
        {view === 'list' && t('blogPage.listHeading')}
        {view === 'create' && t('blogPage.createHeading')}
        {view === 'edit' && t('blogPage.editHeading')}
      </h2>

      <div className='flex shrink-0 items-center justify-between gap-3 sm:justify-end'>
        {view === 'list' && setViewMode && viewMode && (
          <div className='flex items-center gap-1.5'>
            <ViewToggleButton
              active={viewMode === 'table'}
              onClick={() => setViewMode('table')}
              label={t('blogPage.tableView')}
            >
              <ListIcon className='h-4 w-4' strokeWidth={3} aria-hidden />
            </ViewToggleButton>
            <ViewToggleButton
              active={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
              label={t('blogPage.gridView')}
            >
              <LayoutGrid className='h-4 w-4' strokeWidth={3} aria-hidden />
            </ViewToggleButton>
          </div>
        )}

        {view === 'list' ? (
          <button
            type='button'
            onClick={() => setView('create')}
            className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-9 cursor-pointer items-center justify-center gap-2 bg-[#c9f24d] px-3 text-xs font-black uppercase tracking-[0.12em]'
          >
            <Plus className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
            {t('blogPage.addArticle')}
          </button>
        ) : (
          <button
            type='button'
            onClick={() => setView('list')}
            className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-9 cursor-pointer items-center justify-center gap-2 bg-white px-3 text-xs font-black uppercase tracking-[0.12em]'
          >
            <ArrowLeft className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
            {t('blogPage.backToList')}
          </button>
        )}
      </div>
    </div>
  )
}
