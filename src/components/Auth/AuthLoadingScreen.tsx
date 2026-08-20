import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

interface AuthLoadingScreenProps {
  /** Judul yang diumumkan. Default: teks memuat generik. */
  label?: string
  hint?: string
  /** Setel false bila dipakai di dalam layout yang sudah punya latar sendiri. */
  fullScreen?: boolean
  className?: string
}

/**
 * Satu tampilan tunggu untuk seluruh jalur auth. Sebelumnya ada lima varian
 * berbeda — termasuk teks polos "Loading..." dan `return null` yang berujung
 * layar putih — sehingga tiap perpindahan halaman terlihat patah-patah.
 */
export function AuthLoadingScreen({
  label,
  hint,
  fullScreen = true,
  className,
}: AuthLoadingScreenProps) {
  const { t } = useTranslation('common')

  return (
    <div
      className={cn(
        'nb flex items-center justify-center px-4',
        fullScreen && 'nb-surface min-h-screen',
        !fullScreen && 'min-h-[16rem]',
        className
      )}
      role='status'
      aria-live='polite'
      aria-busy='true'
    >
      <div className='nb-frame nb-frame-thick nb-sd-lg flex items-center gap-4 bg-white px-6 py-5 duration-200 animate-in fade-in'>
        <Loader2 className='h-6 w-6 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
        <div>
          <p className='text-sm font-black uppercase tracking-[0.18em]'>
            {label ?? t('authShared.loading')}
          </p>
          <p className='mt-1 text-xs font-bold text-[#111]/70'>
            {hint ?? t('authShared.loadingHint')}
          </p>
        </div>
      </div>
    </div>
  )
}
