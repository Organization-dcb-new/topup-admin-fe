import type { ReactNode } from 'react'
import { Loader2, Trash2, type LucideIcon } from 'lucide-react'

import { hudEyebrowClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

interface DangerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eyebrow: string
  title: string
  description: ReactNode
  confirmLabel: string
  cancelLabel: string
  pending: boolean
  onConfirm: () => void
  /** Shown above the buttons, e.g. why the server refused. */
  error?: ReactNode
  icon?: LucideIcon
}

/** Confirmation for destructive actions, in the login card's style. */
export function DangerDialog({
  open,
  onOpenChange,
  eyebrow,
  title,
  description,
  confirmLabel,
  cancelLabel,
  pending,
  onConfirm,
  error,
  icon: Icon = Trash2,
}: DangerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent
        showCloseButton={false}
        className='gap-0 overflow-hidden rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-md'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        <div className='space-y-6 p-6 sm:p-7'>
          <div className='flex items-start gap-4'>
            <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-rose-500 to-brand-purple text-white hud-clip-sm'>
              <Icon className='size-5' aria-hidden />
            </span>
            <div className='min-w-0 space-y-1'>
              <p className={hudEyebrowClass}>{eyebrow}</p>
              <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
                {title}
              </DialogTitle>
              <DialogDescription className='text-sm leading-relaxed text-slate-500'>
                {description}
              </DialogDescription>
            </div>
          </div>

          {error}

          {/* Cancel first in the DOM so it, not the destructive action, gets the initial focus. */}
          <div className='flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <button
              type='button'
              onClick={() => onOpenChange(false)}
              disabled={pending}
              className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
            >
              {cancelLabel}
            </button>
            <button
              type='button'
              disabled={pending}
              onClick={onConfirm}
              className='inline-flex h-12 w-full items-center justify-center gap-2 bg-rose-600 font-display text-sm font-bold uppercase tracking-[0.2em] text-white hud-clip-sm transition-[background-color,transform,opacity] duration-300 hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/90 active:scale-[0.985] disabled:opacity-70 sm:w-48'
            >
              {pending ? (
                <Loader2 className='size-4 animate-spin' aria-hidden />
              ) : (
                <Icon className='size-4' aria-hidden />
              )}
              {confirmLabel}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
