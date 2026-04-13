import { ArrowLeft, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../ui/button'
import { cn } from '@/lib/utils'

type ViewMode = 'list' | 'create' | 'edit'

interface HeaderBlogProps {
  view: ViewMode
  setView: (view: ViewMode) => void
  className?: string
}

export default function HeaderBlog({ view, setView, className }: HeaderBlogProps) {
  const { t } = useTranslation('common')

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4',
        className,
      )}
    >
      <h2 className="text-lg font-semibold tracking-tight text-gray-900">
        {view === 'list' && t('blogPage.listHeading')}
        {view === 'create' && t('blogPage.createHeading')}
        {view === 'edit' && t('blogPage.editHeading')}
      </h2>
      <div className="flex shrink-0 justify-end">
        {view === 'list' ? (
          <Button
            type="button"
            onClick={() => setView('create')}
            className="w-full cursor-pointer gap-2 shadow-sm sm:w-auto"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden />
            {t('blogPage.addArticle')}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => setView('list')}
            variant="outline"
            className="w-full cursor-pointer gap-2 sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            {t('blogPage.backToList')}
          </Button>
        )}
      </div>
    </div>
  )
}
