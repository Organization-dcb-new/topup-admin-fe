import { useState } from 'react'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import CreateBlog from '@/components/Blog/Create/Create'
import HeaderBlog from '@/components/Blog/Header/Header'
import BlogList from '@/components/Blog/List/List'

export default function BlogPage() {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [selectedBlog, setSelectedBlog] = useState<any>(null)

  const handleEdit = (blog: any) => {
    setSelectedBlog(blog)
    setView('edit')
  }

  const handleCreate = () => {
    setSelectedBlog(null)
    setView('create')
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <HeaderBlog setView={(v) => (v === 'create' ? handleCreate() : setView(v))} view={view} />
        <div className="mt-6">
          {view === 'list' ? (
            <BlogList onEdit={handleEdit} />
          ) : (
            <CreateBlog setView={setView} initialData={selectedBlog} isEdit={view === 'edit'} />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
