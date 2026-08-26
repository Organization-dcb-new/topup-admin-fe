import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import { cn } from '@/lib/utils'

interface CopySlugButtonProps {
  slug: string
  className?: string
}

const COPIED_RESET_MS = 2000

/**
 * Tombol hidup di dalam pembungkus ber-`group/slug`: ikut muncul saat baris
 * di-hover **dan** saat tombolnya sendiri menerima fokus keyboard, supaya fokus
 * tidak pernah mendarat di elemen yang tak terlihat.
 */
export function CopySlugButton({ slug, className }: CopySlugButtonProps) {
  const { t } = useTranslation('common')
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current)
    },
    [],
  )

  const handleCopy = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      copyTextToClipboard(slug)
        .then(() => {
          setCopied(true)
          if (resetTimer.current) clearTimeout(resetTimer.current)
          resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS)
        })
        .catch(() => toast.error(t('blogList.copySlugError')))
    },
    [slug, t],
  )

  return (
    <>
      <button
        type='button'
        onClick={handleCopy}
        aria-label={t('blogList.copySlugAria', { slug })}
        className={cn(
          'shrink-0 cursor-pointer rounded p-0.5 text-muted-foreground opacity-0',
          'transition-opacity duration-200 ease-out motion-reduce:transition-none',
          'hover:bg-muted hover:text-foreground',
          'group-hover/slug:opacity-100 group-focus-within/slug:opacity-100 focus-visible:opacity-100',
          'focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none',
          className,
        )}
      >
        {copied ? (
          <Check className='h-3 w-3 text-success' aria-hidden />
        ) : (
          <Copy className='h-3 w-3' aria-hidden />
        )}
      </button>
      <span role='status' aria-live='polite' className='sr-only'>
        {copied ? t('blogList.copySlugDone') : ''}
      </span>
    </>
  )
}
