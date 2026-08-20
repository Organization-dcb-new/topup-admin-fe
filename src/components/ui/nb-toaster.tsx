import { cn } from '@/lib/utils'
import { Check, Info, Loader2, TriangleAlert, X } from 'lucide-react'
import type { ElementType } from 'react'
import toast, {
  Toaster,
  ToastBar,
  resolveValue,
  type Toast,
  type ToastType,
} from 'react-hot-toast'

/**
 * Toaster neo-brutalism. Dipasang sekali di `src/main.tsx`, jadi semua
 * pemanggilan `toast.success/error/loading` yang sudah ada ikut berubah
 * tampilannya tanpa perlu disentuh.
 */

const VARIANTS: Record<ToastType, { accent: string; icon: ElementType }> = {
  success: { accent: 'bg-[#c9f24d]', icon: Check },
  error: { accent: 'bg-[#ff4d3d]', icon: TriangleAlert },
  loading: { accent: 'bg-[#6fe3f5]', icon: Loader2 },
  blank: { accent: 'bg-[#ffd84d]', icon: Info },
  custom: { accent: 'bg-[#ff9ed2]', icon: Info },
}

/** Menetralkan kartu bawaan ToastBar; animasi masuk/keluarnya tetap dipakai. */
const RESET_TOAST_BAR = {
  padding: 0,
  background: 'transparent',
  boxShadow: 'none',
  borderRadius: 0,
  maxWidth: 'none',
  color: 'inherit',
} as const

function NbToast({ toast: t }: { toast: Toast }) {
  const variant = VARIANTS[t.type] ?? VARIANTS.blank
  const Icon = variant.icon
  const isLoading = t.type === 'loading'

  return (
    <div
      className='nb nb-frame nb-frame-thick nb-sd flex min-w-[15rem] max-w-[min(92vw,26rem)] items-stretch bg-white'
      {...t.ariaProps}
    >
      <div
        className={cn(
          'flex w-11 shrink-0 items-center justify-center border-r-4 border-[#111]',
          variant.accent,
        )}
      >
        <Icon
          className={cn('h-5 w-5', isLoading && 'animate-spin')}
          strokeWidth={3}
          aria-hidden
        />
      </div>

      <div className='flex min-w-0 flex-1 items-center break-words px-3 py-2.5 text-[13px] font-bold leading-snug'>
        {resolveValue(t.message, t)}
      </div>

      {!isLoading && (
        <button
          type='button'
          onClick={() => toast.dismiss(t.id)}
          aria-label='Tutup notifikasi'
          className='flex w-9 shrink-0 cursor-pointer items-center justify-center border-l-4 border-[#111] bg-white transition-colors hover:bg-[#f5f1e8]'
        >
          <X className='h-4 w-4' strokeWidth={3} aria-hidden />
        </button>
      )}
    </div>
  )
}

export function NbToaster() {
  return (
    <Toaster gutter={14}>
      {(t) => (
        <ToastBar toast={t} style={RESET_TOAST_BAR}>
          {() => <NbToast toast={t} />}
        </ToastBar>
      )}
    </Toaster>
  )
}
