import { DeleteBlogDialog } from '@/components/Blog/Delete/Delete'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Blog } from '@/components/Blog/types/blog'
import { Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Can } from '@/components/Auth/Can'
import { PERM } from '@/constants/permissions'

export function BlogActionsHeader() {
  const { t } = useTranslation('common')
  return (
    <span className='flex w-full min-w-[10rem] justify-end pr-1 text-right'>
      {t('blogRowActions.actionsHeader')}
    </span>
  )
}

export function BlogRowActions({
  blog,
  onEdit,
}: {
  blog: Blog
  onEdit: (blog: Blog) => void
}) {
  const { t } = useTranslation('common')
  const toolbarBtn =
    'border-0 bg-transparent shadow-none hover:bg-muted/70'

  return (
    <div className='flex w-full min-w-[10rem] justify-end pr-0.5'>
      <div
        className='inline-flex items-center gap-1 rounded-lg border border-input bg-muted/25 p-1 shadow-xs dark:bg-muted/35'
        role='group'
        aria-label={t('blogRowActions.rowGroupAria')}
      >
        <Can perm={PERM.BLOG_UPDATE}>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => onEdit(blog)}
            className={cn('cursor-pointer gap-1.5', toolbarBtn)}
            aria-label={t('blogRowActions.editAria')}
          >
            <Pencil className='h-4 w-4 shrink-0' aria-hidden />
            <span className='hidden sm:inline'>{t('blogRowActions.editLabel')}</span>
          </Button>
        </Can>
        <Can perm={PERM.BLOG_DELETE}>
          <DeleteBlogDialog blog={blog} triggerLabel={t('deleteBlogModal.triggerLabel')} />
        </Can>
      </div>
    </div>
  )
}
