import { ArrowLeft, LayoutGrid, List as ListIcon, Plus, Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '../../ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Can } from '@/components/Auth/Can'
import { PERM } from '@/constants/permissions'
import { useGetBlogTaxonomy } from '../hooks/useBlog'
import type { BlogStatus } from '../types/blog'

type ViewMode = 'list' | 'create' | 'edit'

/** Kelipatan 6 supaya grid 2 dan 3 kolom tidak pernah menyisakan slot kosong. */
const PAGE_SIZES = [6, 12, 24]

/** Radix `SelectItem` menolak nilai kosong, jadi "semua" memakai sentinel. */
const ALL_VALUE = 'all'

interface HeaderBlogProps {
  view: ViewMode
  setView: (view: ViewMode) => void
  className?: string
  viewMode: 'table' | 'grid'
  setViewMode: (mode: 'table' | 'grid') => void
  search: string
  onSearchChange: (value: string) => void
  status: BlogStatus | ''
  onStatusChange: (status: BlogStatus | '') => void
  category: string
  onCategoryChange: (category: string) => void
  limit: number
  onLimitChange: (limit: number) => void
}

export default function HeaderBlog({
  view,
  setView,
  className,
  viewMode,
  setViewMode,
  search,
  onSearchChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
  limit,
  onLimitChange,
}: HeaderBlogProps) {
  const { t } = useTranslation('common')
  const { data: taxonomy } = useGetBlogTaxonomy()
  const isList = view === 'list'
  const categories = taxonomy?.categories ?? []

  const toggleClass = (active: boolean) =>
    cn(
      'h-7 w-7 cursor-pointer rounded-md transition-all duration-200 ease-out motion-reduce:transition-none',
      active
        ? 'bg-white text-slate-900 shadow-xs dark:bg-zinc-800 dark:text-white'
        : 'text-slate-400 dark:text-slate-500',
    )

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4'>
        <h2 className='text-sm font-semibold tracking-tight text-gray-900 dark:text-white'>
          {view === 'list' && t('blogPage.listHeading')}
          {view === 'create' && t('blogPage.createHeading')}
          {view === 'edit' && t('blogPage.editHeading')}
        </h2>

        {/* Tanpa `w-full`, tombol tidak lagi mendorong grup toggle keluar
            viewport di layar sempit. */}
        <div className='flex items-center justify-between gap-3 sm:justify-end'>
          {isList && (
            <div
              role='group'
              aria-label={t('blogPage.viewModeGroupAria')}
              className='flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-zinc-800/80 dark:bg-zinc-900'
            >
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => setViewMode('table')}
                className={toggleClass(viewMode === 'table')}
                aria-label={t('blogPage.tableView')}
                aria-pressed={viewMode === 'table'}
              >
                <ListIcon className='h-4 w-4' aria-hidden />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => setViewMode('grid')}
                className={toggleClass(viewMode === 'grid')}
                aria-label={t('blogPage.gridView')}
                aria-pressed={viewMode === 'grid'}
              >
                <LayoutGrid className='h-4 w-4' aria-hidden />
              </Button>
            </div>
          )}

          {isList ? (
            <Can perm={PERM.BLOG_CREATE}>
              <Button
                type='button'
                onClick={() => setView('create')}
                className='cursor-pointer gap-2 shadow-sm'
              >
                <Plus className='h-4 w-4 shrink-0' aria-hidden />
                {t('blogPage.addArticle')}
              </Button>
            </Can>
          ) : (
            <Button
              type='button'
              onClick={() => setView('list')}
              variant='outline'
              className='cursor-pointer gap-2'
            >
              <ArrowLeft className='h-4 w-4 shrink-0' aria-hidden />
              {t('blogPage.backToList')}
            </Button>
          )}
        </div>
      </div>

      {isList && (
        <div className='flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center'>
          <div className='relative w-full sm:max-w-xs'>
            <Search
              className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground'
              aria-hidden
            />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t('blogFilters.searchPlaceholder')}
              aria-label={t('blogFilters.searchPlaceholder')}
              className='pl-9 pr-9'
            />
            {search && (
              <button
                type='button'
                onClick={() => onSearchChange('')}
                aria-label={t('blogFilters.searchClear')}
                className='absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1 text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground motion-reduce:transition-none'
              >
                <X className='h-4 w-4' aria-hidden />
              </button>
            )}
          </div>

          <Select
            value={status === '' ? ALL_VALUE : status}
            onValueChange={(value) => onStatusChange(value === ALL_VALUE ? '' : (value as BlogStatus))}
          >
            <SelectTrigger
              id='blog-status-filter'
              size='sm'
              className='w-full sm:w-40'
              aria-label={t('blogFilters.statusLabel')}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t('blogFilters.statusAll')}</SelectItem>
              <SelectItem value='published'>{t('blogTable.statusPublished')}</SelectItem>
              <SelectItem value='draft'>{t('blogTable.statusDraft')}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={category === '' ? ALL_VALUE : category}
            onValueChange={(value) => onCategoryChange(value === ALL_VALUE ? '' : value)}
          >
            <SelectTrigger
              id='blog-category-filter'
              size='sm'
              className='w-full sm:w-48'
              aria-label={t('blogFilters.categoryLabel')}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t('blogFilters.categoryAll')}</SelectItem>
              {categories.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {t('blogFilters.categoryOption', { category: item.value, total: item.count })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className='flex items-center gap-2 sm:ml-auto'>
            <Label
              htmlFor='blog-page-size'
              className='whitespace-nowrap text-xs font-medium text-muted-foreground'
            >
              {t('blogFilters.perPage')}
            </Label>
            <Select value={String(limit)} onValueChange={(value) => onLimitChange(Number(value))}>
              <SelectTrigger id='blog-page-size' size='sm' className='w-20'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
