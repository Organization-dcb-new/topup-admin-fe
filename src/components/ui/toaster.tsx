import {
  Toaster as HotToaster,
  resolveValue,
  toast,
  type Toast,
} from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, XCircle, Info, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastTone = {
  Icon: typeof Info
  iconClass: string
  accentClass: string
}

const TONES: Record<string, ToastTone> = {
  success: {
    Icon: CheckCircle2,
    iconClass: 'bg-emerald-500/12 text-emerald-600',
    accentClass: 'bg-emerald-500',
  },
  error: {
    Icon: XCircle,
    iconClass: 'bg-destructive/12 text-destructive',
    accentClass: 'bg-destructive',
  },
  loading: {
    Icon: Loader2,
    iconClass: 'bg-primary/10 text-primary',
    accentClass: 'bg-primary',
  },
  blank: {
    Icon: Info,
    iconClass: 'bg-primary/10 text-primary',
    accentClass: 'bg-primary',
  },
}

function AppToast({ t }: { t: Toast }) {
  const { t: translate } = useTranslation('common')
  const tone = TONES[t.type] ?? TONES.blank
  const { Icon } = tone
  const isLoading = t.type === 'loading'

  return (
    <div
      className={cn(
        'relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border border-border bg-background py-3 pl-4 pr-2.5 shadow-lg shadow-foreground/5 ring-1 ring-foreground/5',
        'transition-all duration-300 ease-out motion-reduce:transition-none',
        // Toast lahir dengan visible=true, jadi animasi masuk harus dari
        // keyframe (animate-in), bukan transisi kelas
        t.visible
          ? 'pointer-events-auto animate-in fade-in slide-in-from-top-2'
          : // Non-interaktif selama animasi keluar agar tidak menelan klik
            'pointer-events-none -translate-y-2 scale-95 opacity-0',
      )}
    >
      <span
        className={cn('absolute inset-y-0 left-0 w-1', tone.accentClass)}
        aria-hidden
      />

      <span
        className={cn(
          'mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
          tone.iconClass,
        )}
      >
        <Icon
          className={cn('h-4 w-4', isLoading && 'animate-spin')}
          aria-hidden
        />
      </span>

      {/* aria-live hanya membungkus pesannya, bukan tombol tutup, supaya
          pembaca layar tidak ikut membacakan label tombol */}
      <div
        {...t.ariaProps}
        className='min-w-0 flex-1 whitespace-pre-line break-words py-0.5 text-sm text-foreground'
      >
        {resolveValue(t.message, t)}
      </div>

      {!isLoading && (
        <button
          type='button'
          onClick={() => toast.dismiss(t.id)}
          aria-label={translate('toast.dismiss')}
          className='-mr-0.5 mt-px shrink-0 cursor-pointer rounded-md p-1 text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground'
        >
          <X className='h-3.5 w-3.5' aria-hidden />
        </button>
      )}
    </div>
  )
}

export function AppToaster() {
  return (
    <HotToaster
      position='top-right'
      gutter={10}
      containerClassName='!top-4 !right-4 max-md:!left-4 max-md:!right-4'
      toastOptions={{
        duration: 4000,
        error: { duration: 6000 },
        // Tanpa ini `duration` global menimpa Infinity bawaan toast.loading,
        // sehingga spinner hilang sendiri sebelum prosesnya selesai
        loading: { duration: Infinity },
      }}
    >
      {(t) => <AppToast t={t} />}
    </HotToaster>
  )
}
