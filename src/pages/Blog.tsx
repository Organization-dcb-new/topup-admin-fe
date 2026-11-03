import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, CalendarDays, Gamepad2, ImageOff, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { Can } from '@/components/Auth/Can'
import { DangerDialog } from '@/components/Auth/DangerDialog'
import { hudEyebrowClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { BlogEditor } from '@/components/Blog/BlogEditor'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { HudPagination } from '@/components/Layout/hud-pagination'
import { PERM } from '@/constants/permissions'
import { useDeleteBlog, useGetBlogs } from '@/hooks/useBlog'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { cn } from '@/lib/utils'
import type { Blog } from '@/types/blog'
import { useRetained } from '@/hooks/useRetained'

const PAGE_SIZE = 12

const iconButtonClass =
  'grid size-8 shrink-0 place-items-center text-slate-400 hud-clip-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset'

export default function BlogPage() {
  // 'new' writes an article; a blog edits it; null shows the list.
  const [editing, setEditing] = useState<Blog | 'new' | null>(null)

  const open = (target: Blog | 'new' | null) => {
    setEditing(target)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl'>
        {editing ? (
          <BlogEditor key={editing === 'new' ? 'new' : editing.id} blog={editing === 'new' ? undefined : editing} onClose={() => open(null)} />
        ) : (
          <BlogList onCreate={() => open('new')} onEdit={(blog) => open(blog)} />
        )}
      </div>
    </DashboardLayout>
  )
}

function BlogList({ onCreate, onEdit }: { onCreate: () => void; onEdit: (blog: Blog) => void }) {
  const { t } = useTranslation('common')
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isFetching, isPlaceholderData, refetch } = useGetBlogs(page, PAGE_SIZE)
  const deleteBlog = useDeleteBlog()
  const [toDelete, setToDelete] = useState<Blog | null>(null)
  // The confirm dialog keeps naming its target while it animates closed.
  const deleting = useRetained(toDelete)
  const blogs = data?.data ?? []
  const total = data?.meta?.total_data

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div className='space-y-1'>
          <p className={hudEyebrowClass}>{t('blogPage.eyebrow')}</p>
          <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>{t('blogPage.title')}</h1>
          <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('blogPage.subtitle')}</p>
        </div>
        <div className='flex shrink-0 items-center gap-3'>
          {total !== undefined && (
            <span className='font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-400'>
              {t('blogPage.total', { count: total })}
            </span>
          )}
          <Can permission={PERM.blogCreate}>
            <button type='button' onClick={onCreate} className={hudPrimaryButtonClass}>
              <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
              <Plus className='size-4' aria-hidden />
              {t('blogPage.addBtn')}
            </button>
          </Can>
        </div>
      </header>

      {isError && (
        <div className='space-y-3'>
          <AuthAlert>{t('blogPage.loadError')}</AuthAlert>
          <button
            type='button'
            onClick={() => void refetch()}
            className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
          >
            <RefreshCw className='size-4' aria-hidden />
            {t('blogPage.retry')}
          </button>
        </div>
      )}

      {!isError && !isLoading && blogs.length === 0 ? (
        <div className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center'>
          <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
            <BookOpen className='size-6' aria-hidden />
          </span>
          <h2 className='font-display text-xl font-bold text-slate-900'>{t('blogPage.emptyTitle')}</h2>
          <p className='mt-1 max-w-sm text-sm text-slate-500'>{t('blogPage.emptyBody')}</p>
          <Can permission={PERM.blogCreate}>
            <button type='button' onClick={onCreate} className={`${hudPrimaryButtonClass} mt-6`}>
              <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
              <Plus className='size-4' aria-hidden />
              {t('blogPage.addBtn')}
            </button>
          </Can>
        </div>
      ) : (
        <ul
          className={cn('grid gap-5 md:grid-cols-2 xl:grid-cols-3 transition-opacity duration-300', isPlaceholderData && 'opacity-60')}
          aria-busy={isFetching}
        >
          {isLoading &&
            Array.from({ length: 6 }, (_, i) => <li key={i} className='h-80 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />)}
          {blogs.map((blog, index) => (
            <BlogCard key={blog.id} blog={blog} order={index} onEdit={() => onEdit(blog)} onDelete={() => setToDelete(blog)} />
          ))}
        </ul>
      )}

      <HudPagination page={page} totalPages={data?.meta?.total_page ?? 1} onChange={setPage} />

      <DangerDialog
        open={!!toDelete}
        onOpenChange={(next) => !next && setToDelete(null)}
        eyebrow={t('blogPage.deleteConfirm.eyebrow')}
        title={t('blogPage.deleteConfirm.title', { title: deleting?.title ?? '' })}
        description={t('blogPage.deleteConfirm.description')}
        confirmLabel={t('blogPage.deleteConfirm.confirm')}
        cancelLabel={t('blogPage.deleteConfirm.cancel')}
        pending={deleteBlog.isPending}
        onConfirm={() => {
          if (!toDelete) return
          deleteBlog.mutate(toDelete.id, {
            onSuccess: () => {
              setToDelete(null)
              if (blogs.length === 1 && page > 1) setPage((p) => p - 1)
            },
          })
        }}
      />
    </div>
  )
}

interface BlogCardProps {
  blog: Blog
  order: number
  onEdit: () => void
  onDelete: () => void
}

function BlogCard({ blog, order, onEdit, onDelete }: BlogCardProps) {
  const { t } = useTranslation('common')
  const [imageFailed, setImageFailed] = useState(false)
  const published = blog.status === 'published'

  return (
    <li
      className='min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both'
      style={{ animationDelay: `${order * 50}ms` }}
    >
      <div className='h-full bg-slate-200/80 p-px transition-colors duration-300 hud-clip hover:bg-brand-purple/40'>
        <article className='group flex h-full flex-col bg-white hud-clip'>
          <div className='relative aspect-video overflow-hidden bg-slate-100'>
            {blog.thumbnail && !imageFailed ? (
              <img
                src={blog.thumbnail}
                alt=''
                loading='lazy'
                onError={() => setImageFailed(true)}
                className='size-full object-cover transition-transform duration-700 ease-hud group-hover:scale-[1.04]'
              />
            ) : (
              <span className='grid size-full place-items-center text-slate-300'>
                <ImageOff className='size-7' aria-hidden />
              </span>
            )}
            <span
              className={cn(
                'absolute left-3 top-3 inline-flex items-center gap-1.5 px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] hud-clip-sm',
                published ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-amber-950'
              )}
            >
              <span className={cn('size-1.5 rounded-full', published ? 'bg-white' : 'bg-amber-950/60')} aria-hidden />
              {t(`blogPage.status.${blog.status}`)}
            </span>
          </div>
          <div className='flex flex-1 flex-col gap-2 p-5'>
            {blog.category && (
              <p className='inline-flex items-center gap-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-purple'>
                <Gamepad2 className='size-3' aria-hidden />
                <span className='truncate'>{blog.category}</span>
              </p>
            )}
            <h2 className='line-clamp-2 font-display text-lg font-bold leading-snug text-slate-900'>{blog.title}</h2>
            {blog.excerpt && <p className='line-clamp-2 text-sm leading-relaxed text-slate-500'>{blog.excerpt}</p>}
            {blog.tags?.length > 0 && (
              <p className='truncate font-mono text-[11px] text-slate-400'>{blog.tags.map((tag) => `#${tag}`).join(' ')}</p>
            )}
            <div className='mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3'>
              <span className='inline-flex min-w-0 items-center gap-1.5 text-xs text-slate-500'>
                <CalendarDays className='size-3.5 shrink-0' aria-hidden />
                <span className='truncate'>{formatBackendDateTime(blog.published_at || blog.created_at, 'dd MMM yyyy')}</span>
              </span>
              <div className='flex shrink-0 items-center gap-0.5'>
                <Can permission={PERM.blogUpdate}>
                  <button
                    type='button'
                    onClick={onEdit}
                    aria-label={t('blogPage.editBtn', { title: blog.title })}
                    title={t('blogPage.editBtn', { title: blog.title })}
                    className={`${iconButtonClass} hover:bg-brand-purple/10 hover:text-brand-purple focus-visible:ring-brand-purple/40`}
                  >
                    <Pencil className='size-4' aria-hidden />
                  </button>
                </Can>
                <Can permission={PERM.blogDelete}>
                  <button
                    type='button'
                    onClick={onDelete}
                    aria-label={t('blogPage.deleteBtn', { title: blog.title })}
                    title={t('blogPage.deleteBtn', { title: blog.title })}
                    className={`${iconButtonClass} hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-rose-500/30`}
                  >
                    <Trash2 className='size-4' aria-hidden />
                  </button>
                </Can>
              </div>
            </div>
          </div>
        </article>
      </div>
    </li>
  )
}
