'use client'

import { DataTable } from '@/components/Layout/table-data'
import { blogColumns } from '@/tables/table-blog'
import { useGetBlogs } from '@/components/Blog/hooks/useBlog'
import ErrorComponent from '@/components/Layout/error'
import TableSkeleton from '@/components/Layout/loading'
import { useState } from 'react'
import Pagination from '@/components/Layout/Pagination'

interface BlogListProps {
  onEdit: (blog: any) => void
}

export default function BlogList({ onEdit }: BlogListProps) {
  const limit = 5
  const [page, setPage] = useState(1)
  const { data: blogs, isLoading, isError } = useGetBlogs(page, limit)

  if (isLoading) {
    return <TableSkeleton />
  }

  if (isError) {
    return <ErrorComponent message="Failed to load the article list. Please try again later." />
  }

  if (!blogs || blogs.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-3xl text-gray-400 bg-gray-50/50">
        <p className="font-medium">No articles have been created yet..</p>
      </div>
    )
  }

  return (
    <>
      <DataTable columns={blogColumns(onEdit)} data={blogs.data} />
      <Pagination page={page} totalPage={blogs?.meta?.total_page} onChange={setPage} />
    </>
  )
}
