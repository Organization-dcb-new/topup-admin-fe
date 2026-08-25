import { ArrowLeft, Plus, LayoutGrid, List as ListIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../ui/button'
import { cn } from '@/lib/utils'
import { Can } from '@/components/Auth/Can'
import { PERM } from '@/constants/permissions'

type ViewMode = 'list' | 'create' | 'edit'

interface HeaderBlogProps {
  view: ViewMode
  setView: (view: ViewMode) => void
  className?: string
  viewMode?: 'table' | 'grid'
  setViewMode?: (mode: 'table' | 'grid') => void
}

export default function HeaderBlog({ view, setView, className, viewMode, setViewMode }: HeaderBlogProps) {
  const { t } = useTranslation('common')

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4',
        className,
      )}
    >
      <h2 className='text-sm font-semibold tracking-tight text-gray-900 dark:text-white'>
        {view === 'list' && t('blogPage.listHeading')}
        {view === 'create' && t('blogPage.createHeading')}
        {view === 'edit' && t('blogPage.editHeading')}
      </h2>
      <div className='flex shrink-0 justify-end items-center gap-3'>
        {view === 'list' && setViewMode && viewMode && (
          <div className='flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 mr-1'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={() => setViewMode('table')}
              className={cn(
                'h-7 w-7 rounded-md transition-all duration-200 cursor-pointer',
                viewMode === 'table' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-400 dark:text-slate-500'
              )}
              title='Table View'
            >
              <ListIcon className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={() => setViewMode('grid')}
              className={cn(
                'h-7 w-7 rounded-md transition-all duration-200 cursor-pointer',
                viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-400 dark:text-slate-500'
              )}
              title='Grid View'
            >
              <LayoutGrid className='h-4 w-4' />
            </Button>
          </div>
        )}
        
        {view === 'list' ? (
          <Can perm={PERM.BLOG_CREATE}>
            <Button
              type='button'
              onClick={() => setView('create')}
              className='w-full cursor-pointer gap-2 shadow-sm sm:w-auto'
            >
              <Plus className='h-4 w-4 shrink-0' aria-hidden />
              {t('blogPage.addArticle')}
            </Button>
          </Can>
        ) : (
          <Button
            type='button'
            onClick={() => setView('list')}
            variant='outline'
            className='w-full cursor-pointer gap-2 sm:w-auto'
          >
            <ArrowLeft className='h-4 w-4 shrink-0' aria-hidden />
            {t('blogPage.backToList')}
          </Button>
        )}
      </div>
    </div>
  )
}
