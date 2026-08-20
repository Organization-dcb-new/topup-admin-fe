import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import { useGetAdminLogById } from '@/hooks/useAdminLog'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import {
  nbAccent,
  nbBadge,
  nbHint,
  nbIconButton,
  nbLabel,
  nbMutedLabel,
  nbPageIcon,
  nbPageSubtitle,
  nbPageTitle,
  nbPanel,
  nbPanelHeader,
  nbSectionTitle,
} from '@/lib/nb'
import { cn } from '@/lib/utils'
import { ArrowLeft, ClipboardList, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

function prettyJson(value: Record<string, unknown> | null) {
  if (!value) return '—'
  return JSON.stringify(value, null, 2)
}

/** Satu pasang label + nilai di ringkasan log. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='space-y-1'>
      <p className={nbMutedLabel}>{label}</p>
      <p className='break-all text-sm font-black'>{children}</p>
    </div>
  )
}

/** Blok JSON sebelum/sesudah perubahan. */
function JsonBlock({
  title,
  hint,
  accent,
  value,
}: {
  title: string
  hint: string
  accent: string
  value: Record<string, unknown> | null
}) {
  return (
    <div className='nb-frame nb-frame-thin nb-sd-sm min-w-0 bg-white'>
      <div className={cn('border-b-2 border-[#111] px-3 py-2', accent)}>
        <p className={nbLabel}>{title}</p>
        <p className='mt-0.5 text-[11px] font-bold text-[#111]/70'>{hint}</p>
      </div>
      <pre className='max-h-72 overflow-auto bg-[#f5f1e8] p-3 font-mono text-xs font-bold'>
        {prettyJson(value)}
      </pre>
    </div>
  )
}

export default function AdminLogDetailPage() {
  const { t } = useTranslation('common')
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, isSuccess } = useGetAdminLogById(id)

  return (
    <DashboardLayout>
      <div className='mx-auto min-w-0 max-w-7xl space-y-5'>
        <div className={cn(nbPanel, 'flex items-start gap-3 p-4 sm:p-5')}>
          <Link
            to='/admin-logs'
            aria-label={t('adminLogDetailPage.backButton')}
            className={cn(nbIconButton, nbAccent.white, 'h-10 w-10')}
          >
            <ArrowLeft className='h-4 w-4' strokeWidth={3} aria-hidden />
          </Link>
          <div className='flex min-w-0 gap-3'>
            <span className={cn(nbPageIcon, nbAccent.cyan)}>
              <ClipboardList className='h-5 w-5' strokeWidth={2.5} aria-hidden />
            </span>
            <div className='min-w-0 space-y-1.5'>
              <h1 className={nbPageTitle}>{t('adminLogDetailPage.title')}</h1>
              <p className={nbPageSubtitle}>{t('adminLogDetailPage.subtitle')}</p>
              <p className={nbHint}>{t('adminLogDetailPage.pageHint')}</p>
            </div>
          </div>
        </div>

        {isLoading && (
          <div
            className={cn(
              nbPanel,
              'flex min-h-[16rem] flex-col items-center justify-center gap-4 py-12',
            )}
            role='status'
            aria-live='polite'
            aria-busy='true'
          >
            <span
              className={cn(
                'nb-frame nb-frame-thin nb-sd-sm flex h-14 w-14 items-center justify-center',
                nbAccent.cyan,
              )}
            >
              <Loader2 className='h-7 w-7 animate-spin' strokeWidth={3} aria-hidden />
            </span>
            <p className={nbSectionTitle}>{t('adminLogDetailPage.loading')}</p>
          </div>
        )}

        {!id && (
          <div className={nbPanel}>
            <ErrorComponent message={t('adminLogDetailPage.missingId')} />
          </div>
        )}
        {isError && (
          <div className={nbPanel}>
            <ErrorComponent message={t('adminLogDetailPage.loadError')} />
          </div>
        )}

        {isSuccess && data && (
          <div className={nbPanel}>
            <div className={cn(nbPanelHeader, nbAccent.cyan)}>
              <div className='flex flex-wrap items-center gap-2'>
                <span className={cn(nbBadge, nbAccent.white)}>{data.Action}</span>
                <span className={cn(nbBadge, nbAccent.white)}>{data.Module}</span>
              </div>
            </div>

            <div className='space-y-5 p-4 sm:p-5'>
              <div className='nb-frame nb-frame-thin bg-[#ffd84d] p-3'>
                <p className={nbLabel}>{t('adminLogDetailPage.readGuideTitle')}</p>
                <p className='mt-1 text-xs font-bold text-[#111]/80'>
                  {t('adminLogDetailPage.readGuideBody')}
                </p>
              </div>

              <div className='grid gap-4 sm:grid-cols-2'>
                <Field label={t('adminLogDetailPage.id')}>{data.ID}</Field>
                <Field label={t('adminLogDetailPage.adminId')}>{data.AdminID}</Field>
                <Field label={t('adminLogDetailPage.createdAt')}>
                  {formatBackendDateTime(data.CreatedAt)}
                </Field>
                <Field label={t('adminLogDetailPage.ipAddress')}>{data.IPAddress || '—'}</Field>
              </div>

              <Field label={t('adminLogDetailPage.description')}>{data.Description || '—'}</Field>

              <div className='grid min-w-0 gap-4 lg:grid-cols-2'>
                <JsonBlock
                  title={t('adminLogDetailPage.oldData')}
                  hint={t('adminLogDetailPage.oldDataHint')}
                  accent={nbAccent.orange}
                  value={data.OldData}
                />
                <JsonBlock
                  title={t('adminLogDetailPage.newData')}
                  hint={t('adminLogDetailPage.newDataHint')}
                  accent={nbAccent.lime}
                  value={data.NewData}
                />
              </div>

              <Field label={t('adminLogDetailPage.userAgent')}>{data.UserAgent || '—'}</Field>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
