import { DataTable } from '@/components/Layout/table-data'
import { getBlogColumns } from '@/tables/table-blog'
import { useGetBlogs } from '@/components/Blog/hooks/useBlog'
import ErrorComponent from '@/components/Layout/error'
import { useMemo, useState } from 'react'
import Pagination from '@/components/Layout/Pagination'
import type { Blog } from '@/tables/table-blog'
import { CopyButton } from '@/components/ui/copy-button'
import { FallbackImage } from '@/components/ui/fallback-image'
import { FileText, Loader2, Calendar, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { enUS, id as idLocale } from 'date-fns/locale'
import i18n from '@/i18n'

interface BlogListProps {
  onEdit: (blog: Blog) => void
  viewMode: 'table' | 'grid'
}

function ArticleCard({
  blog,
  onEdit,
  t,
}: {
  blog: Blog
  onEdit: (blog: Blog) => void
  t: TFunction
}) {
  const isPublished = blog.status === 'published'
  const locale = i18n.language.startsWith('id') ? idLocale : enUS
  const formattedDate = format(new Date(blog.created_at), 'd MMM yyyy', { locale })

  return (
    <div className='nb-frame nb-frame-thick nb-sd nb-press group relative flex flex-col bg-white'>
      <div className='relative aspect-video w-full overflow-hidden border-b-4 border-[#111] bg-[#f5f1e8]'>
        <FallbackImage
          src={blog.thumbnail}
          alt={blog.title}
          label={t('blogTable.noImage')}
          className='h-full w-full object-cover'
        />
        <span
          className={cn(
            'nb-frame nb-frame-thin nb-sd-sm absolute left-3 top-3 inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-black uppercase tracking-wide',
            isPublished ? 'bg-[#c9f24d]' : 'bg-[#ffd84d]',
          )}
        >
          <span className='h-2 w-2 shrink-0 border-2 border-[#111] bg-white' aria-hidden />
          {isPublished ? t('blogTable.statusPublished') : t('blogTable.statusDraft')}
        </span>
      </div>

      <div className='flex flex-1 flex-col gap-3 p-3'>
        <div className='space-y-2'>
          {blog.category && (
            <span className='nb-frame nb-frame-thin inline-block bg-[#6fe3f5] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider'>
              {blog.category}
            </span>
          )}

          <h3 className='line-clamp-2 min-h-[2.5rem] text-sm font-black uppercase leading-snug tracking-tight'>
            {blog.title}
          </h3>
        </div>

        <div className='mt-auto flex flex-col gap-1.5 border-t-4 border-[#111] pt-2.5 text-[11px] font-bold text-[#111]/60'>
          <div className='flex items-center gap-1.5'>
            <Calendar className='h-3.5 w-3.5 shrink-0' strokeWidth={3} aria-hidden />
            <span className='tabular-nums'>{formattedDate}</span>
          </div>

          <div className='flex items-center justify-between gap-2'>
            <span className='truncate font-mono'>/{blog.slug}</span>
            <CopyButton
              value={blog.slug}
              label={t('blogTable.copySlug')}
              errorLabel={t('blogTable.copyFailed')}
              className='h-6 w-6'
              iconClassName='h-3 w-3'
            />
          </div>
        </div>

        {blog.tags && blog.tags.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className='nb-frame nb-frame-thin bg-[#ff9ed2] px-1.5 py-0 text-[8px] font-black uppercase tracking-wide'
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className='flex items-center justify-end border-t-4 border-[#111] pt-2.5'>
          <button
            type='button'
            onClick={() => onEdit(blog)}
            className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-8 cursor-pointer items-center gap-1.5 bg-[#ffd84d] px-2 text-[10px] font-black uppercase tracking-[0.12em]'
          >
            <Pencil className='h-3.5 w-3.5 shrink-0' strokeWidth={3} aria-hidden />
            {t('blogRowActions.editLabel')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BlogList({ onEdit, viewMode }: BlogListProps) {
  const { t } = useTranslation('common')
  const limit = 5
  const [page, setPage] = useState(1)
  const { data: blogs, isPending, isError } = useGetBlogs(page, limit)

  const columns = useMemo(() => getBlogColumns(t, onEdit), [t, onEdit])

  if (isPending) {
    return (
      <div
        className='nb-frame nb-frame-thick nb-sd flex min-h-[16rem] flex-col items-center justify-center gap-4 bg-white py-12'
        role='status'
        aria-live='polite'
        aria-busy='true'
      >
        <span className='nb-frame nb-frame-thin nb-sd-sm flex h-14 w-14 items-center justify-center bg-[#6fe3f5]'>
          <Loader2 className='h-7 w-7 animate-spin' strokeWidth={3} aria-hidden />
        </span>
        <div className='text-center'>
          <p className='text-sm font-black uppercase tracking-tight'>{t('blogList.loadingTitle')}</p>
          <p className='mt-1 text-xs font-bold text-[#111]/55'>{t('blogList.loadingHint')}</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='nb-frame nb-frame-thick nb-sd bg-white'>
        <ErrorComponent message={t('blogList.loadError')} />
      </div>
    )
  }

  if (!blogs || blogs.data.length === 0) {
    return (
      <div
        className='nb-frame nb-frame-thick nb-sd flex min-h-[14rem] flex-col items-center justify-center gap-3 bg-white px-6 py-12 text-center'
        role='status'
      >
        <span className='nb-frame nb-frame-thin nb-sd-sm flex h-14 w-14 items-center justify-center bg-[#ffd84d]'>
          <FileText className='h-6 w-6' strokeWidth={2.5} aria-hidden />
        </span>
        <div className='space-y-1'>
          <p className='text-sm font-black uppercase tracking-tight'>{t('blogList.emptyTitle')}</p>
          <p className='max-w-sm text-xs font-bold text-[#111]/55'>{t('blogList.emptyHint')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {viewMode === 'table' ? (
        <DataTable
          className='nb nb-table nb-sd'
          getRowId={(row) => row.id}
          columns={columns}
          data={blogs.data}
          emptyMessage={t('blogList.emptyPageRow')}
        />
      ) : (
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {blogs.data.map((blog) => (
            <ArticleCard key={blog.id} blog={blog} onEdit={onEdit} t={t} />
          ))}
        </div>
      )}

      <Pagination
        className='nb nb-pagination'
        page={page}
        totalPage={blogs?.meta?.total_page}
        onChange={setPage}
      />
    </div>
  )
}
