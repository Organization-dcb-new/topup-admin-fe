import { useTranslation } from 'react-i18next'
import { ArrowRight, Copy, Globe, Loader2, Monitor, User } from 'lucide-react'
import toast from 'react-hot-toast'

import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import ErrorComponent from '@/components/Layout/error'
import { useGetAdminLogById } from '@/hooks/useAdminLog'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import {
  diffRecords,
  formatFieldValue,
  hasSnapshot,
  type FieldChange,
} from '@/lib/json-diff'
import { cn } from '@/lib/utils'
import { ActionBadge, ModuleBadge } from './LogBadges'

interface AdminLogDrawerProps {
  logId: string | null
  adminName: (adminId: string) => string
  onClose: () => void
}

function MetaRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof User
  label: string
  children: React.ReactNode
}) {
  return (
    <div className='flex gap-3'>
      <Icon className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' aria-hidden />
      <div className='min-w-0 space-y-0.5'>
        <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
          {label}
        </p>
        <div className='min-w-0 text-sm text-foreground'>{children}</div>
      </div>
    </div>
  )
}

function ChangeRow({ change }: { change: FieldChange }) {
  const { t } = useTranslation('common')

  const toneClass =
    change.kind === 'added'
      ? 'border-success/30 bg-success/5'
      : change.kind === 'removed'
        ? 'border-destructive/30 bg-destructive/5'
        : change.kind === 'changed'
          ? 'border-primary/25 bg-primary/5'
          : 'border-border bg-muted/30'

  return (
    <li className={cn('rounded-lg border px-3 py-2.5', toneClass)}>
      <div className='mb-1.5 flex items-center justify-between gap-2'>
        <code className='min-w-0 truncate font-mono text-xs font-semibold text-foreground'>
          {change.key}
        </code>
        <span className='shrink-0 text-[10px] font-bold uppercase tracking-wide text-muted-foreground'>
          {t(`adminLogDrawer.change_${change.kind}`)}
        </span>
      </div>

      {change.kind === 'unchanged' ? (
        <pre className='overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs text-muted-foreground'>
          {formatFieldValue(change.after ?? change.before)}
        </pre>
      ) : (
        <div className='flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-2'>
          {change.kind !== 'added' && (
            <pre className='min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap break-all rounded-md bg-background/70 p-2 font-mono text-xs text-muted-foreground line-through decoration-destructive/50'>
              {formatFieldValue(change.before)}
            </pre>
          )}
          {change.kind === 'changed' && (
            <ArrowRight
              className='mt-2 hidden h-3.5 w-3.5 shrink-0 text-muted-foreground sm:block'
              aria-hidden
            />
          )}
          {change.kind !== 'removed' && (
            <pre className='min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap break-all rounded-md bg-background/70 p-2 font-mono text-xs font-medium text-foreground'>
              {formatFieldValue(change.after)}
            </pre>
          )}
        </div>
      )}
    </li>
  )
}

export function AdminLogDrawer({
  logId,
  adminName,
  onClose,
}: AdminLogDrawerProps) {
  const { t } = useTranslation('common')
  const { data, isLoading, isError } = useGetAdminLogById(logId ?? undefined)

  const changes = data ? diffRecords(data.OldData, data.NewData) : []
  const changedOnly = changes.filter((c) => c.kind !== 'unchanged')
  const showsSnapshot = data ? hasSnapshot(data.OldData, data.NewData) : false

  const copyRaw = async () => {
    if (!data) return
    try {
      await copyTextToClipboard(JSON.stringify(data, null, 2))
      toast.success(t('adminLogDrawer.copied'))
    } catch {
      toast.error(t('adminLogDrawer.copyError'))
    }
  }

  return (
    <Sheet open={!!logId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side='right'
        className='w-full sm:max-w-xl'
        aria-describedby={undefined}
      >
        <SheetHeader>
          <SheetTitle>{t('adminLogDrawer.title')}</SheetTitle>
          <SheetDescription>{t('adminLogDrawer.subtitle')}</SheetDescription>
        </SheetHeader>

        <SheetBody className='space-y-6'>
          {isLoading && (
            <div
              className='flex min-h-40 flex-col items-center justify-center gap-3'
              role='status'
              aria-busy='true'
            >
              <Loader2 className='h-8 w-8 animate-spin text-primary' aria-hidden />
              <p className='text-sm text-muted-foreground'>
                {t('adminLogDrawer.loading')}
              </p>
            </div>
          )}

          {isError && <ErrorComponent message={t('adminLogDrawer.loadError')} />}

          {data && (
            <>
              <div className='space-y-3'>
                <div className='flex flex-wrap items-center gap-2'>
                  <ActionBadge action={data.Action} />
                  <ModuleBadge module={data.Module} />
                </div>
                <p className='text-sm text-foreground'>
                  {data.Description || t('adminLogDrawer.noDescription')}
                </p>
              </div>

              <div className='grid gap-4 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-2'>
                <MetaRow icon={User} label={t('adminLogDrawer.actor')}>
                  <span className='block truncate font-medium'>
                    {adminName(data.AdminID)}
                  </span>
                  <span className='block truncate font-mono text-xs text-muted-foreground'>
                    {data.AdminID}
                  </span>
                </MetaRow>

                <MetaRow icon={Globe} label={t('adminLogDrawer.time')}>
                  <span className='tabular-nums'>
                    {formatBackendDateTime(data.CreatedAt)}
                  </span>
                </MetaRow>

                <MetaRow icon={Globe} label={t('adminLogDrawer.ipAddress')}>
                  <span className='font-mono tabular-nums'>
                    {data.IPAddress || '—'}
                  </span>
                </MetaRow>

                <MetaRow icon={Monitor} label={t('adminLogDrawer.userAgent')}>
                  <span className='block break-all text-xs text-muted-foreground'>
                    {data.UserAgent || '—'}
                  </span>
                </MetaRow>
              </div>

              <section className='space-y-3'>
                <div className='flex items-center justify-between gap-2'>
                  <h3 className='text-sm font-semibold text-foreground'>
                    {t('adminLogDrawer.changesTitle')}
                  </h3>
                  {showsSnapshot && (
                    <span className='shrink-0 text-xs text-muted-foreground'>
                      {/* `total`, bukan `count`: i18next memakai `count`
                          untuk pluralisasi dan butuh sufiks _one/_other */}
                      {t('adminLogDrawer.changedCount', {
                        total: changedOnly.length,
                      })}
                    </span>
                  )}
                </div>

                {!showsSnapshot ? (
                  <p className='rounded-lg border border-dashed border-border bg-muted/30 px-3 py-6 text-center text-sm text-muted-foreground'>
                    {t('adminLogDrawer.noSnapshot')}
                  </p>
                ) : changedOnly.length === 0 ? (
                  <p className='rounded-lg border border-dashed border-border bg-muted/30 px-3 py-6 text-center text-sm text-muted-foreground'>
                    {t('adminLogDrawer.noChanges')}
                  </p>
                ) : (
                  <ul className='space-y-2'>
                    {changedOnly.map((change) => (
                      <ChangeRow key={change.key} change={change} />
                    ))}
                  </ul>
                )}
              </section>

              <div className='flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between'>
                <p className='min-w-0 truncate font-mono text-xs text-muted-foreground'>
                  {data.ID}
                </p>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={copyRaw}
                  className='shrink-0 gap-2'
                >
                  <Copy className='h-3.5 w-3.5' aria-hidden />
                  {t('adminLogDrawer.copyRaw')}
                </Button>
              </div>
            </>
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}
