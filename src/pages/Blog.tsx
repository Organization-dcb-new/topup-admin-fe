import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen } from 'lucide-react'

import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import HeaderBlog from '@/components/Blog/Header/Header'
import BlogList from '@/components/Blog/List/List'
import ManageBlog from '@/components/Blog/Manage/Manage'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import type { Blog, BlogStatus } from '@/components/Blog/types/blog'

type BlogView = 'list' | 'create' | 'edit'

const DEFAULT_PAGE_SIZE = 12
const SEARCH_DEBOUNCE_MS = 300

export default function BlogPage() {
  const { t } = useTranslation('common')
  const [view, setView] = useState<BlogView>('list')
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)

  // Seluruh state daftar tinggal di halaman ini. `BlogList` dilepas setiap kali
  // form dibuka, jadi nomor halaman, mode tampilan, dan filter akan hilang
  // kalau disimpan di dalamnya.
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<BlogStatus | ''>('')
  const [category, setCategory] = useState('')
  // Kotak pencarian tetap responsif tiap ketikan; hanya nilai yang diteruskan
  // ke query yang ditahan 300 ms.
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS)

  const [isFormDirty, setIsFormDirty] = useState(false)
  const [pendingView, setPendingView] = useState<BlogView | null>(null)

  const applyView = useCallback((next: BlogView) => {
    setIsFormDirty(false)
    if (next !== 'edit') setSelectedBlog(null)
    setView(next)
  }, [])

  /**
   * Perpindahan yang dipicu pengguna. Keluar dari form saat masih ada perubahan
   * yang belum tersimpan ditahan dulu oleh dialog konfirmasi — satu klik salah
   * sebelumnya membuang seluruh isi artikel tanpa jalan pulih.
   */
  const requestView = useCallback(
    (next: BlogView) => {
      if (view !== 'list' && isFormDirty) {
        setPendingView(next)
        return
      }
      applyView(next)
    },
    [applyView, isFormDirty, view],
  )

  const handleEdit = useCallback((blog: Blog) => {
    setSelectedBlog(blog)
    setIsFormDirty(false)
    setView('edit')
  }, [])

  const handleCreate = useCallback(() => {
    requestView('create')
  }, [requestView])

  const handlePageChange = useCallback((next: number) => setPage(next), [])

  const handleViewModeChange = useCallback((mode: 'table' | 'grid') => setViewMode(mode), [])

  // Setiap filter mengembalikan pengguna ke halaman 1: hasil filter baru jarang
  // punya halaman sebanyak hasil sebelumnya.
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const handleStatusChange = useCallback((next: BlogStatus | '') => {
    setStatus(next)
    setPage(1)
  }, [])

  const handleCategoryChange = useCallback((next: string) => {
    setCategory(next)
    setPage(1)
  }, [])

  const handleLimitChange = useCallback((next: number) => {
    setLimit(next)
    setPage(1)
  }, [])

  const handleClearFilters = useCallback(() => {
    setSearch('')
    setStatus('')
    setCategory('')
    setPage(1)
  }, [])

  const confirmDiscard = useCallback(() => {
    const next = pendingView
    setPendingView(null)
    if (next) applyView(next)
  }, [applyView, pendingView])

  const isGridMode = view === 'list' && viewMode === 'grid'

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-7xl space-y-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='flex gap-3'>
            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <BookOpen className='h-5 w-5' aria-hidden />
            </div>
            <div className='min-w-0 space-y-1'>
              <h1 className='text-2xl font-semibold tracking-tight text-gray-900 dark:text-white'>
                {t('blogPage.title')}
              </h1>
              <p className='text-sm text-muted-foreground'>{t('blogPage.subtitle')}</p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'overflow-hidden transition-all duration-200 ease-out motion-reduce:transition-none',
            isGridMode
              ? 'rounded-none bg-transparent shadow-none ring-0'
              : 'rounded-xl bg-white shadow-xs ring-1 ring-gray-200 dark:bg-zinc-950 dark:ring-zinc-800',
          )}
        >
          {/* Padding ditaruh di cabang non-grid, bukan ditimpa `!important`:
              varian breakpoint tidak bisa diruntuhkan oleh twMerge. */}
          <div
            className={cn(
              isGridMode
                ? 'mb-5'
                : 'border-b border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-5 dark:border-zinc-900 dark:bg-zinc-900/10',
            )}
          >
            <HeaderBlog
              className='mb-0'
              setView={requestView}
              view={view}
              viewMode={viewMode}
              setViewMode={handleViewModeChange}
              search={search}
              onSearchChange={handleSearchChange}
              status={status}
              onStatusChange={handleStatusChange}
              category={category}
              onCategoryChange={handleCategoryChange}
              limit={limit}
              onLimitChange={handleLimitChange}
            />
          </div>

          {/* `key={view}` membuat wadah ini di-remount tiap perpindahan, jadi
              animasi masuknya terpicu untuk kedua arah — satu sumber kebenaran
              untuk transisi daftar ↔ form. */}
          <div
            key={view}
            className={cn(
              'animate-in fade-in slide-in-from-bottom-2 duration-200 ease-out motion-reduce:animate-none',
              isGridMode ? undefined : 'p-4 sm:p-6',
            )}
          >
            {view === 'list' ? (
              <BlogList
                onEdit={handleEdit}
                onCreate={handleCreate}
                viewMode={viewMode}
                page={page}
                onPageChange={handlePageChange}
                limit={limit}
                search={debouncedSearch}
                status={status}
                category={category}
                onClearFilters={handleClearFilters}
              />
            ) : (
              <ManageBlog
                setView={applyView}
                initialData={selectedBlog}
                isEdit={view === 'edit'}
                onDirtyChange={setIsFormDirty}
              />
            )}
          </div>
        </div>
      </div>

      <AlertDialog
        open={pendingView !== null}
        onOpenChange={(next) => {
          if (!next) setPendingView(null)
        }}
      >
        <AlertDialogContent className='rounded-xl sm:max-w-md'>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('blogDiscard.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('blogDiscard.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='gap-2 sm:gap-2'>
            <AlertDialogCancel className='cursor-pointer rounded-lg'>
              {t('blogDiscard.keepEditing')}
            </AlertDialogCancel>
            <AlertDialogAction
              className='cursor-pointer rounded-lg bg-destructive text-white hover:bg-destructive/90'
              onClick={confirmDiscard}
            >
              {t('blogDiscard.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
