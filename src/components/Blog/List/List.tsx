'use client'

import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, RefreshCw } from 'lucide-react'

import { DataTable } from '@/components/Layout/table-data'
import ErrorComponent from '@/components/Layout/error'
import Pagination from '@/components/Layout/Pagination'
import { EmptyState, TableSkeleton } from '@/components/Layout/table-states'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Can } from '@/components/Auth/Can'
import { PERM } from '@/constants/permissions'
import { getBlogColumns } from '@/tables/table-blog'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { cn } from '@/lib/utils'
import { useGetBlogs } from '@/components/Blog/hooks/useBlog'
import { BlogStatusBadge } from '@/components/Blog/BlogStatusBadge'
import { CopySlugButton } from '@/components/Blog/CopySlugButton'
import { BlogRowActions } from '@/components/Blog/BlogRowActions'
import type { Blog, BlogStatus } from '@/components/Blog/types/blog'

interface BlogListProps {
  onEdit: (blog: Blog) => void
  onCreate: () => void
  viewMode: 'table' | 'grid'
  page: number
  onPageChange: (page: number) => void
  limit: number
  search: string
  status: BlogStatus | ''
  category: string
  onClearFilters: () => void
}

/** Sama seperti versi tabel: tinggi blok tag jadi terprediksi antar kartu. */
const MAX_VISIBLE_TAGS = 3

const tagBadgeClass =
  'border-primary/25 bg-primary/10 px-1.5 py-0 text-[10px] font-semibold text-primary'

function ArticleCard({ blog, onEdit }: { blog: Blog; onEdit: (blog: Blog) => void }) {
  const { t } = useTranslation('common')
  const visibleTags = blog.tags.slice(0, MAX_VISIBLE_TAGS)
  const hiddenCount = blog.tags.length - visibleTags.length

  return (
    <div className='group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all duration-200 ease-out hover:shadow-md motion-reduce:transition-none'>
      <div className='relative aspect-video w-full overflow-hidden border-b border-border bg-muted/40'>
        <img
          src={blog.thumbnail}
          alt={blog.title}
          loading='lazy'
          decoding='async'
          className='h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-103 motion-reduce:transition-none motion-reduce:group-hover:scale-100'
          onError={(e) => {
            e.currentTarget.src = '/placeholder.png'
          }}
        />
        <BlogStatusBadge
          status={blog.status}
          variant='solid'
          className='absolute left-3 top-3 shadow-xs'
        />
      </div>

      <div className='flex flex-1 flex-col gap-3 p-4'>
        <div className='space-y-1.5'>
          {blog.category?.trim() && (
            <Badge
              variant='secondary'
              className='border border-border bg-muted text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground'
            >
              {blog.category}
            </Badge>
          )}
          <h3 className='line-clamp-2 text-sm font-bold text-foreground'>{blog.title}</h3>
        </div>

        <div className='flex flex-col gap-1 border-t border-border pt-2.5 text-xs text-muted-foreground'>
          <div className='flex items-center gap-1.5'>
            <Calendar className='h-3.5 w-3.5 shrink-0' aria-hidden />
            <time dateTime={blog.created_at}>
              {formatBackendDateTime(blog.created_at, 'd MMM yyyy')}
            </time>
          </div>

          <div className='group/slug flex items-center justify-between gap-2'>
            <span className='truncate font-medium italic'>/{blog.slug}</span>
            <CopySlugButton slug={blog.slug} />
          </div>
        </div>

        {visibleTags.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {visibleTags.map((tag, index) => (
              <Badge key={`${tag}-${index}`} variant='outline' className={tagBadgeClass}>
                #{tag}
              </Badge>
            ))}
            {hiddenCount > 0 && (
              <Badge
                variant='outline'
                className='border-border bg-muted px-1.5 py-0 text-[10px] font-semibold text-muted-foreground'
                title={blog.tags.slice(MAX_VISIBLE_TAGS).join(', ')}
                aria-label={t('blogTable.moreTags', { count: hiddenCount })}
              >
                +{hiddenCount}
              </Badge>
            )}
          </div>
        )}

        {/* `mt-auto` di baris aksi, bukan di blok meta: tombol dan garis
            pemisah tetap sejajar walau jumlah tag antar kartu berbeda. */}
        <div className='mt-auto flex items-center justify-end border-t border-border pt-3'>
          <BlogRowActions blog={blog} onEdit={onEdit} />
        </div>
      </div>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className='overflow-hidden rounded-2xl border border-border bg-card shadow-xs'>
      <Skeleton className='aspect-video w-full rounded-none' />
      <div className='space-y-2 p-4'>
        <Skeleton className='h-4 w-20' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-2/3' />
        <Skeleton className='h-8 w-full' />
      </div>
    </div>
  )
}

export default function BlogList({
  onEdit,
  onCreate,
  viewMode,
  page,
  onPageChange,
  limit,
  search,
  status,
  category,
  onClearFilters,
}: BlogListProps) {
  const { t } = useTranslation('common')
  const {
    data: blogs,
    isPending,
    isError,
    isSuccess,
    isPlaceholderData,
    refetch,
  } = useGetBlogs({ page, limit, search, status, category })

  const columns = useMemo(() => getBlogColumns(t, onEdit), [t, onEdit])

  const rows = blogs?.data ?? []
  const totalPage = blogs?.meta?.total_page ?? 1
  const totalData = blogs?.meta?.total_data ?? 0
  const hasFilters = Boolean(search.trim() || status || category)

  // Menghapus baris terakhir sebuah halaman membuat `page` menunjuk halaman
  // yang sudah tidak ada. Nomor halaman dijepit setelah data terbaru tiba —
  // state-nya milik halaman induk, jadi tidak bisa disesuaikan saat render.
  useEffect(() => {
    if (isSuccess && !isPlaceholderData && page > totalPage) {
      onPageChange(totalPage)
    }
  }, [isSuccess, isPlaceholderData, page, totalPage, onPageChange])

  const rangeFrom = totalData === 0 ? 0 : (page - 1) * limit + 1
  const rangeTo = Math.min(page * limit, totalData)

  const emptyState =
    page > 1 && !isPlaceholderData ? (
      <EmptyState
        message={t('blogList.emptyPageRow')}
        action={
          <Button type='button' variant='outline' size='sm' onClick={() => onPageChange(1)}>
            {t('blogList.backToFirstPage')}
          </Button>
        }
      />
    ) : hasFilters ? (
      <EmptyState
        message={t('blogList.filterNoMatch')}
        action={
          <Button type='button' variant='outline' size='sm' onClick={onClearFilters}>
            {t('blogList.filterClear')}
          </Button>
        }
      />
    ) : (
      <EmptyState
        message={t('blogList.emptyTitle')}
        action={
          <Can perm={PERM.BLOG_CREATE}>
            <Button type='button' size='sm' onClick={onCreate}>
              {t('blogPage.addArticle')}
            </Button>
          </Can>
        }
      />
    )

  return (
    <div className='space-y-4'>
      {/* Wilayah live permanen: region yang baru dipasang bersamaan dengan
          isinya tidak diumumkan sama sekali oleh pembaca layar. */}
      <p className='sr-only' role='status' aria-live='polite'>
        {isPending
          ? t('blogList.loadingTitle')
          : isError
            ? t('blogList.loadError')
            : t('blogList.resultsAnnounce', { shown: rows.length, total: totalData })}
      </p>

      {isPending && !isError && (
        <div aria-busy='true'>
          {viewMode === 'table' ? (
            <TableSkeleton rows={limit} />
          ) : (
            <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
              {Array.from({ length: limit }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          )}
        </div>
      )}

      {isError && (
        <div className='flex flex-col items-center gap-3 py-6'>
          <ErrorComponent message={t('blogList.loadError')} />
          <Button type='button' variant='outline' className='gap-2' onClick={() => void refetch()}>
            <RefreshCw className='h-3.5 w-3.5' aria-hidden />
            {t('common.refresh')}
          </Button>
        </div>
      )}

      {isSuccess && (
        <>
          {totalData > 0 && (
            <p className='text-xs text-muted-foreground'>
              {t('blogList.showingRange', { from: rangeFrom, to: rangeTo, total: totalData })}
            </p>
          )}

          {/* Daftar halaman sebelumnya sengaja dipertahankan selama halaman
              berikutnya dimuat; peredupan inilah satu-satunya penanda bahwa
              datanya belum yang terbaru. */}
          <div
            aria-busy={isPlaceholderData}
            inert={isPlaceholderData}
            className={cn(
              'transition-opacity duration-200 ease-out motion-reduce:transition-none',
              isPlaceholderData && 'opacity-60',
            )}
          >
            {viewMode === 'table' ? (
              <DataTable
                columns={columns}
                data={rows}
                getRowId={(row) => row.id}
                stickyHeader
                caption={t('blogTable.tableCaption', { page, totalPage })}
                emptyMessage={emptyState}
              />
            ) : rows.length === 0 ? (
              emptyState
            ) : (
              <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
                {rows.map((blog) => (
                  <ArticleCard key={blog.id} blog={blog} onEdit={onEdit} />
                ))}
              </div>
            )}
          </div>

          <Pagination page={page} totalPage={totalPage} onChange={onPageChange} />
        </>
      )}
    </div>
  )
}
