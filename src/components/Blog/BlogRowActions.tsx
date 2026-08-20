import { DeleteBlogDialog } from '@/components/Blog/Delete/Delete'
import type { Blog } from '@/tables/table-blog'
import { Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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

  return (
    <div
      className='flex w-full min-w-[10rem] items-center justify-end gap-2'
      role='group'
      aria-label={t('blogRowActions.rowGroupAria')}
    >
      <button
        type='button'
        onClick={() => onEdit(blog)}
        className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-8 cursor-pointer items-center gap-1.5 bg-[#ffd84d] px-2 text-[10px] font-black uppercase tracking-[0.12em]'
        aria-label={t('blogRowActions.editAria')}
      >
        <Pencil className='h-3.5 w-3.5 shrink-0' strokeWidth={3} aria-hidden />
        <span className='hidden sm:inline'>{t('blogRowActions.editLabel')}</span>
      </button>

      <DeleteBlogDialog blogId={blog.id} triggerClassName='bg-[#ff4d3d]' />
    </div>
  )
}
