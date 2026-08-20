import { cn } from '@/lib/utils'
import type { BlogFormBlogMutationResult } from '../hooks/useBlog'
import { Loader2, Save, Send } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

interface ButtonManageProps {
  handlePublish: (status: 'draft' | 'published') => void
  blogMutation: BlogFormBlogMutationResult
  isFormValid: boolean
  isEdit?: boolean
  currentStatusValue: 'draft' | 'published'
  onStatusChange: (status: 'draft' | 'published') => void
}

export default function ButtonManage({
  blogMutation,
  handlePublish,
  isFormValid,
  isEdit = false,
  currentStatusValue,
  onStatusChange,
}: ButtonManageProps) {
  const { t } = useTranslation('common')
  const isPending = blogMutation.isPending
  const isDisabled = isPending || !isFormValid

  const statusOptions = useMemo(
    () =>
      [
        {
          id: 'published' as const,
          label: t('blogPublish.publishedLabel'),
          desc: t('blogPublish.publishedDesc'),
          accent: 'bg-[#c9f24d]',
        },
        {
          id: 'draft' as const,
          label: t('blogPublish.draftLabel'),
          desc: t('blogPublish.draftDesc'),
          accent: 'bg-[#ffd84d]',
        },
      ] as const,
    [t],
  )

  return (
    <div className='nb-frame nb-frame-thick nb-sd space-y-4 bg-white p-4'>
      <p className='text-[11px] font-black uppercase tracking-[0.14em]'>
        {t('blogPublish.sectionTitle')}
      </p>

      <div className='space-y-2' role='radiogroup' aria-label={t('blogPublish.radiogroupAria')}>
        {statusOptions.map((item) => {
          const selected = currentStatusValue === item.id
          return (
            <button
              key={item.id}
              type='button'
              role='radio'
              aria-checked={selected}
              data-active={selected || undefined}
              onClick={() => onStatusChange(item.id)}
              className={cn(
                'nb-item flex w-full cursor-pointer items-center gap-3 p-3 text-left',
                selected ? item.accent : 'bg-white hover:bg-[#f5f1e8]',
              )}
            >
              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center border-2 border-[#111]',
                  selected ? 'bg-[#111]' : 'bg-white',
                )}
                aria-hidden
              >
                {selected && <span className='h-1.5 w-1.5 bg-white' />}
              </span>
              <span className='min-w-0'>
                <span className='block text-[11px] font-black uppercase tracking-wide'>
                  {item.label}
                </span>
                <span className='block text-[10px] font-bold text-[#111]/55'>{item.desc}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className='border-t-4 border-[#111] pt-4'>
        <button
          type='button'
          disabled={isDisabled}
          className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-11 w-full cursor-pointer items-center justify-center bg-[#c9f24d] text-xs font-black uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-60'
          onClick={() => handlePublish(currentStatusValue)}
        >
          {isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' strokeWidth={3} aria-hidden />
              {t('blogPublish.processing')}
            </>
          ) : isEdit ? (
            <>
              <Save className='mr-2 h-4 w-4' strokeWidth={3} aria-hidden />
              {t('blogPublish.saveChanges')}
            </>
          ) : (
            <>
              <Send className='mr-2 h-4 w-4' strokeWidth={3} aria-hidden />
              {currentStatusValue === 'published'
                ? t('blogPublish.publish')
                : t('blogPublish.saveDraft')}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
