import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { enUS, id as idLocale } from 'date-fns/locale'
import type { TFunction } from 'i18next'
import type { Locale } from 'date-fns'
import i18n from '@/i18n'
import { BlogActionsHeader, BlogRowActions } from '@/components/Blog/BlogRowActions'
import { CopyButton } from '@/components/ui/copy-button'
import { FallbackImage } from '@/components/ui/fallback-image'
import { cn } from '@/lib/utils'

export type Blog = {
  id: string
  title: string
  slug: string
  category: string
  tags: string[]
  thumbnail: string
  status: 'draft' | 'published'
  created_at: string
}

function dateLocale(): Locale {
  return i18n.language.startsWith('id') ? idLocale : enUS
}

function TitleCell({
  title,
  slug,
  createdAt,
  locale,
  t,
}: {
  title: string
  slug: string
  createdAt: string
  locale: Locale
  t: TFunction
}) {
  return (
    <div className='flex max-w-[16rem] flex-col gap-1'>
      <span className='truncate text-sm font-black uppercase tracking-tight'>{title}</span>
      <div className='flex items-center gap-1.5 text-[11px] font-bold text-[#111]/55'>
        <time dateTime={createdAt} className='tabular-nums'>
          {format(new Date(createdAt), 'd MMM yyyy', { locale })}
        </time>
        <span aria-hidden>•</span>
        <div className='flex max-w-[10rem] items-center gap-1'>
          <span className='truncate font-mono'>/{slug}</span>
          <CopyButton
            value={slug}
            label={t('blogTable.copySlug')}
            errorLabel={t('blogTable.copyFailed')}
            className='h-6 w-6'
            iconClassName='h-3 w-3'
          />
        </div>
      </div>
    </div>
  )
}

export function getBlogColumns(t: TFunction, onEdit: (blog: Blog) => void): ColumnDef<Blog>[] {
  return [
    {
      accessorKey: 'thumbnail',
      header: t('blogTable.colThumbnail'),
      cell: ({ row }) => (
        <div className='nb-frame nb-frame-thin nb-sd-sm h-11 w-20 shrink-0 overflow-hidden bg-[#f5f1e8]'>
          <FallbackImage
            src={row.original.thumbnail}
            alt={row.original.title}
            className='h-full w-full object-cover'
          />
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: t('blogTable.colTitle'),
      cell: ({ row }) => (
        <TitleCell
          title={row.original.title}
          slug={row.original.slug}
          createdAt={row.original.created_at}
          locale={dateLocale()}
          t={t}
        />
      ),
    },
    {
      accessorKey: 'category',
      header: t('blogTable.colCategory'),
      cell: ({ row }) => (
        <span className='nb-frame nb-frame-thin inline-block bg-[#6fe3f5] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider'>
          {row.original.category?.trim() ? row.original.category : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'tags',
      header: t('blogTable.colTags'),
      cell: ({ row }) => {
        const tags = row.original.tags || []
        return (
          <div className='flex max-w-[10rem] flex-wrap gap-1'>
            {tags.length > 0 ? (
              tags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className='nb-frame nb-frame-thin bg-[#ff9ed2] px-1.5 py-0 text-[9px] font-black uppercase tracking-wide'
                >
                  #{tag}
                </span>
              ))
            ) : (
              <span className='text-[10px] font-black uppercase tracking-wide text-[#111]/40'>
                {t('blogTable.noTags')}
              </span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: t('blogTable.colStatus'),
      cell: ({ row }) => {
        const isPublished = row.original.status === 'published'
        const label = isPublished ? t('blogTable.statusPublished') : t('blogTable.statusDraft')
        return (
          <span
            className={cn(
              'nb-frame nb-frame-thin inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-black uppercase tracking-wide',
              isPublished ? 'bg-[#c9f24d]' : 'bg-[#ffd84d]',
            )}
          >
            <span className='h-2 w-2 shrink-0 border-2 border-[#111] bg-white' aria-hidden />
            {label}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: () => <BlogActionsHeader />,
      cell: ({ row }) => <BlogRowActions blog={row.original} onEdit={onEdit} />,
    },
  ]
}
