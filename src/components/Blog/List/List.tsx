'use client'

import { DataTable } from '@/components/Layout/table-data'
import { getBlogColumns } from '@/tables/table-blog'
import { useGetBlogs } from '@/components/Blog/hooks/useBlog'
import ErrorComponent from '@/components/Layout/error'
import { useMemo, useState } from 'react'
import Pagination from '@/components/Layout/Pagination'
import type { Blog } from '@/tables/table-blog'
import { FileText, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface BlogListProps {
  onEdit: (blog: Blog) => void
}

export default function BlogList({ onEdit }: BlogListProps) {
  const { t } = useTranslation('common')
  const limit = 5
  const [page, setPage] = useState(1)
  const { data: blogs, isPending, isError } = useGetBlogs(page, limit)

  const columns = useMemo(() => getBlogColumns(t, onEdit), [t, onEdit])

  if (isPending) {
    return (
      <div
        className="flex min-h-[16rem] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/80 bg-muted/20 py-12"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Loader2 className="h-11 w-11 animate-spin text-primary" aria-hidden />
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">{t('blogList.loadingTitle')}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t('blogList.loadingHint')}</p>
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
        className="flex min-h-[14rem] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center"
        role="status"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <FileText className="h-6 w-6" aria-hidden />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{t('blogList.emptyTitle')}</p>
          <p className="max-w-sm text-xs text-muted-foreground">{t('blogList.emptyHint')}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DataTable columns={columns} data={blogs.data} emptyMessage={t('blogList.emptyPageRow')} />
      <Pagination page={page} totalPage={blogs?.meta?.total_page} onChange={setPage} />
    </>
  )
}
