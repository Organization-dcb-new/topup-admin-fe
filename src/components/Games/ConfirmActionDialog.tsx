import type { ReactNode } from 'react'
import { Loader2, RefreshCw, type LucideIcon } from 'lucide-react'

import { hudEyebrowClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ConfirmActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eyebrow: string
  title: string
  description: ReactNode
  confirmLabel: string
  cancelLabel: string
  pendingLabel: string
  pending: boolean
  onConfirm: () => void
  icon?: LucideIcon
}

/** Confirmation for heavy but non-destructive actions, like pulling data from the provider. */
export function ConfirmActionDialog({
  open,
  onOpenChange,
  eyebrow,
  title,
  description,
  confirmLabel,
  cancelLabel,
  pendingLabel,
  pending,
  onConfirm,
  icon: Icon = RefreshCw,
}: ConfirmActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent showCloseButton={false} className='gap-0 overflow-hidden rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-md'>
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        <div className='space-y-6 p-6 sm:p-7'>
          <div className='flex items-start gap-4'>
            <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
              <Icon className={cn('size-5', pending && 'animate-spin')} aria-hidden />
            </span>
            <div className='min-w-0 space-y-1'>
              <p className={hudEyebrowClass}>{eyebrow}</p>
              <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>{title}</DialogTitle>
              <DialogDescription className='text-sm leading-relaxed text-slate-500'>{description}</DialogDescription>
            </div>
          </div>
          <div className='flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <button
              type='button'
              onClick={() => onOpenChange(false)}
              disabled={pending}
              className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
            >
              {cancelLabel}
            </button>
            <button type='button' onClick={onConfirm} disabled={pending} className={cn(hudPrimaryButtonClass, 'sm:min-w-52')}>
              <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
              {pending && <Loader2 className='size-4 animate-spin' aria-hidden />}
              {pending ? pendingLabel : confirmLabel}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
