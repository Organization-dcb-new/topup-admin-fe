'use client'

import { DataTable } from '@/components/Layout/table-data'
import { getBlogColumns } from '@/tables/table-blog'
import { useGetBlogs } from '@/components/Blog/hooks/useBlog'
import ErrorComponent from '@/components/Layout/error'
import { useMemo, useState } from 'react'
import Pagination from '@/components/Layout/Pagination'
import type { Blog } from '@/tables/table-blog'
import { FileText, Loader2, Calendar, Edit, Copy, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { enUS, id as idLocale } from 'date-fns/locale'
import i18n from '@/i18n'

interface BlogListProps {
  onEdit: (blog: Blog) => void
  viewMode: 'table' | 'grid'
}

function ArticleCard({ blog, onEdit, t }: { blog: Blog; onEdit: (blog: Blog) => void; t: any }) {
  const [copied, setCopied] = useState(false)
  const isPublished = blog.status === 'published'

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(blog.slug)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const locale = i18n.language.startsWith('id') ? idLocale : enUS
  const formattedDate = format(new Date(blog.created_at), 'd MMM yyyy', { locale })

  return (
    <div className='group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700'>
      <div className='relative aspect-video w-full overflow-hidden bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-900'>
        <img
          src={blog.thumbnail}
          alt={blog.title}
          className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-103'
          onError={(e) => {
            e.currentTarget.src = '/placeholder.png'
          }}
        />
        <div className='absolute left-3 top-3'>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md shadow-xs',
              isPublished
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 shrink-0 rounded-full',
                isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              )}
            />
            {isPublished ? t('blogTable.statusPublished') : t('blogTable.statusDraft')}
          </span>
        </div>
      </div>

      <div className='flex flex-col flex-1 p-4 gap-3'>
        <div className='space-y-1.5'>
          {blog.category && (
            <Badge
              variant='secondary'
              className='text-[9px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-zinc-800'
            >
              {blog.category}
            </Badge>
          )}
          
          <h3 className='text-sm font-bold text-slate-900 dark:text-white line-clamp-2 min-h-[2.5rem]'>
            {blog.title}
          </h3>
        </div>

        <div className='flex flex-col gap-1 text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-50 dark:border-zinc-900/50 pt-2.5 mt-auto'>
          <div className='flex items-center gap-1.5'>
            <Calendar className='h-3.5 w-3.5 shrink-0' />
            <span>{formattedDate}</span>
          </div>
          
          <div className='flex items-center justify-between gap-2 group/slug'>
            <span className='truncate italic font-medium'>/{blog.slug}</span>
            <button
              type='button'
              onClick={handleCopy}
              className='opacity-0 group-hover/slug:opacity-100 transition-opacity duration-200 cursor-pointer p-0.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded'
              title='Copy Slug'
            >
              {copied ? <Check className='h-3.5 w-3.5 text-emerald-500' /> : <Copy className='h-3.5 w-3.5 text-slate-400' />}
            </button>
          </div>
        </div>

        {blog.tags && blog.tags.length > 0 && (
          <div className='flex flex-wrap gap-1 mt-1'>
            {blog.tags.map((tag) => (
              <Badge
                key={tag}
                variant='outline'
                className='border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 px-1.5 py-0 text-[8px] font-bold text-indigo-600 dark:text-indigo-400'
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className='flex items-center justify-end border-t border-slate-100 dark:border-zinc-900 pt-3 mt-1'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => onEdit(blog)}
            className='h-8 gap-1.5 text-xs font-semibold border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800'
          >
            <Edit className='h-3.5 w-3.5' />
            Edit Article
          </Button>
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
        className='flex min-h-[16rem] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/80 bg-muted/20 py-12'
        role='status'
        aria-live='polite'
        aria-busy='true'
      >
        <Loader2 className='h-11 w-11 animate-spin text-primary' aria-hidden />
        <div className='text-center'>
          <p className='text-sm font-medium text-foreground'>{t('blogList.loadingTitle')}</p>
          <p className='mt-1 text-xs text-muted-foreground'>{t('blogList.loadingHint')}</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return <ErrorComponent message={t('blogList.loadError')} />
  }

  if (!blogs || blogs.data.length === 0) {
    return (
      <div
        className='flex min-h-[14rem] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center'
        role='status'
      >
        <span className='flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground'>
          <FileText className='h-6 w-6' aria-hidden />
        </span>
        <div className='space-y-1'>
          <p className='text-sm font-medium text-foreground'>{t('blogList.emptyTitle')}</p>
          <p className='max-w-sm text-xs text-muted-foreground'>{t('blogList.emptyHint')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {viewMode === 'table' ? (
        <DataTable columns={columns} data={blogs.data} emptyMessage={t('blogList.emptyPageRow')} />
      ) : (
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {blogs.data.map((blog) => (
            <ArticleCard key={blog.id} blog={blog} onEdit={onEdit} t={t} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPage={blogs?.meta?.total_page} onChange={setPage} />
    </div>
  )
}
