import { Toaster, resolveValue, toast as hotToast, type Toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Info, Loader2, X, XCircle, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

const TONES: Record<Toast['type'], { icon: LucideIcon; tile: string; bar: string; spin?: boolean }> = {
  success: { icon: CheckCircle2, tile: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-500' },
  error: { icon: XCircle, tile: 'bg-rose-50 text-rose-600', bar: 'bg-rose-500' },
  loading: { icon: Loader2, tile: 'bg-brand-purple/10 text-brand-purple', bar: 'bg-brand-purple', spin: true },
  blank: { icon: Info, tile: 'bg-brand-purple/10 text-brand-purple', bar: 'bg-linear-to-r from-brand-purple to-brand-cyan' },
  custom: { icon: Info, tile: 'bg-brand-purple/10 text-brand-purple', bar: 'bg-linear-to-r from-brand-purple to-brand-cyan' },
}

/** App-wide toaster in the HUD style; every `toast.*` call renders through it. */
export function HudToaster() {
  return (
    <Toaster
      position='top-center'
      gutter={10}
      containerStyle={{ top: 16 }}
      containerClassName='group/toaster'
      toastOptions={{ success: { duration: 3500 }, error: { duration: 5000 } }}
    >
      {(t) => <HudToast toast={t} />}
    </Toaster>
  )
}

function HudToast({ toast: t }: { toast: Toast }) {
  const { t: translate } = useTranslation('common')
  const tone = TONES[t.type]
  const Icon = tone.icon
  const timed = t.type !== 'loading' && Number.isFinite(t.duration)

  return (
    <div
      {...t.ariaProps}
      className={cn(
        'pointer-events-auto w-[min(26rem,calc(100vw-2rem))] drop-shadow-[0_14px_28px_rgba(15,23,42,0.16)]',
        t.visible
          ? 'animate-in fade-in slide-in-from-top-3 zoom-in-95 duration-300 ease-hud'
          : 'animate-out fade-out slide-out-to-top-2 zoom-out-95 duration-200 fill-mode-forwards'
      )}
    >
      <div className='bg-slate-200/90 p-px hud-clip-sm'>
        <div className='relative flex items-center gap-3 overflow-hidden bg-white py-3 pl-3 pr-2 hud-clip-sm'>
          <span className={cn('absolute inset-y-0 left-0 w-1', tone.bar)} aria-hidden />
          <span className={cn('ml-1 grid size-8 shrink-0 place-items-center hud-clip-sm', tone.tile)} aria-hidden>
            <Icon className={cn('size-4', tone.spin && 'animate-spin')} />
          </span>
          <div className='min-w-0 flex-1 text-sm font-medium leading-snug text-slate-800'>
            {resolveValue(t.message, t)}
          </div>
          {t.type !== 'loading' && (
            <button
              type='button'
              onClick={() => hotToast.dismiss(t.id)}
              aria-label={translate('toast.dismiss')}
              title={translate('toast.dismiss')}
              className='grid size-7 shrink-0 place-items-center text-slate-400 transition-colors hud-clip-sm hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40'
            >
              <X className='size-3.5' aria-hidden />
            </button>
          )}
          {timed && (
            // Remaining time; it freezes while the pointer is over the toasts, as the timer does.
            <span
              key={`${t.type}-${t.createdAt}`}
              className={cn(
                'absolute inset-x-0 bottom-0 h-0.5 origin-left opacity-60 animate-hud-toast-timer group-hover/toaster:[animation-play-state:paused]',
                tone.bar
              )}
              style={{ animationDuration: `${t.duration}ms` }}
              aria-hidden
            />
          )}
        </div>
      </div>
    </div>
  )
}
