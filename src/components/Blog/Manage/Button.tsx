import { Button } from '@/components/ui/button'
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
        },
        {
          id: 'draft' as const,
          label: t('blogPublish.draftLabel'),
          desc: t('blogPublish.draftDesc'),
        },
      ] as const,
    [t],
  )

  return (
    <div className='space-y-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm ring-1 ring-gray-900/5'>
      <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
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
              onClick={() => onStatusChange(item.id)}
              className={cn(
                'flex w-full cursor-pointer items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors',
                selected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border/60 bg-muted/20 hover:border-border hover:bg-muted/40',
              )}
            >
              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                  selected ? 'border-primary bg-primary' : 'border-muted-foreground/40 bg-background',
                )}
              >
                {selected && <span className='h-1.5 w-1.5 rounded-full bg-background' />}
              </span>
              <span className='min-w-0'>
                <span
                  className={cn(
                    'block text-xs font-semibold',
                    selected ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {item.label}
                </span>
                <span className='block text-[10px] text-muted-foreground'>{item.desc}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className='border-t border-border/60 pt-4'>
        <Button
          type='button'
          disabled={isDisabled}
          className='h-11 w-full text-xs font-semibold uppercase tracking-wide'
          onClick={() => handlePublish(currentStatusValue)}
        >
          {isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' aria-hidden />
              {t('blogPublish.processing')}
            </>
          ) : isEdit ? (
            <>
              <Save className='mr-2 h-4 w-4' aria-hidden />
              {t('blogPublish.saveChanges')}
            </>
          ) : (
            <>
              <Send className='mr-2 h-4 w-4' aria-hidden />
              {currentStatusValue === 'published' ? t('blogPublish.publish') : t('blogPublish.saveDraft')}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
