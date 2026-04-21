import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGetAdminLogById } from '@/hooks/useAdminLog'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { ArrowLeft, ClipboardList, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

function prettyJson(value: Record<string, unknown> | null) {
  if (!value) return '—'
  return JSON.stringify(value, null, 2)
}

export default function AdminLogDetailPage() {
  const { t } = useTranslation('common')
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, isSuccess } = useGetAdminLogById(id)

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-7xl space-y-6'>
        <div className='flex items-start gap-3'>
          <Button type='button' variant='outline' size='icon' asChild>
            <Link to='/admin-logs' aria-label={t('adminLogDetailPage.backButton')}>
              <ArrowLeft className='h-4 w-4' aria-hidden />
            </Link>
          </Button>
          <div className='flex min-w-0 gap-3'>
            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <ClipboardList className='h-5 w-5' aria-hidden />
            </div>
            <div className='min-w-0 space-y-1'>
              <h1 className='text-2xl font-semibold tracking-tight text-gray-900'>
                {t('adminLogDetailPage.title')}
              </h1>
              <p className='text-sm text-muted-foreground'>{t('adminLogDetailPage.subtitle')}</p>
              <p className='text-xs text-muted-foreground'>{t('adminLogDetailPage.pageHint')}</p>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className='flex min-h-[16rem] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/80 bg-muted/20 py-12'>
            <Loader2 className='h-11 w-11 animate-spin text-primary' aria-hidden />
            <p className='text-sm text-muted-foreground'>{t('adminLogDetailPage.loading')}</p>
          </div>
        )}

        {!id && <ErrorComponent message={t('adminLogDetailPage.missingId')} />}
        {isError && <ErrorComponent message={t('adminLogDetailPage.loadError')} />}

        {isSuccess && data && (
          <div className='space-y-4 overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-900/5 sm:p-5'>
            <div className='rounded-lg border border-border/70 bg-muted/30 p-3'>
              <p className='text-sm font-medium text-foreground'>{t('adminLogDetailPage.readGuideTitle')}</p>
              <p className='mt-1 text-xs text-muted-foreground'>{t('adminLogDetailPage.readGuideBody')}</p>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge variant='outline'>{data.Action}</Badge>
              <Badge variant='outline'>{data.Module}</Badge>
            </div>
            <div className='grid gap-3 text-sm sm:grid-cols-2'>
              <p><span className='font-medium'>{t('adminLogDetailPage.id')}:</span> {data.ID}</p>
              <p><span className='font-medium'>{t('adminLogDetailPage.adminId')}:</span> {data.AdminID}</p>
              <p><span className='font-medium'>{t('adminLogDetailPage.createdAt')}:</span> {formatBackendDateTime(data.CreatedAt)}</p>
              <p><span className='font-medium'>{t('adminLogDetailPage.ipAddress')}:</span> {data.IPAddress || '—'}</p>
            </div>
            <div>
              <p className='mb-1 text-sm font-medium'>{t('adminLogDetailPage.description')}</p>
              <p className='text-sm text-muted-foreground'>{data.Description || '—'}</p>
            </div>
            <div className='grid gap-4 lg:grid-cols-2'>
              <div>
                <p className='mb-1 text-sm font-medium'>{t('adminLogDetailPage.oldData')}</p>
                <p className='mb-2 text-xs text-muted-foreground'>{t('adminLogDetailPage.oldDataHint')}</p>
                <pre className='overflow-auto rounded-md bg-muted p-3 text-xs'>{prettyJson(data.OldData)}</pre>
              </div>
              <div>
                <p className='mb-1 text-sm font-medium'>{t('adminLogDetailPage.newData')}</p>
                <p className='mb-2 text-xs text-muted-foreground'>{t('adminLogDetailPage.newDataHint')}</p>
                <pre className='overflow-auto rounded-md bg-muted p-3 text-xs'>{prettyJson(data.NewData)}</pre>
              </div>
            </div>
            <div>
              <p className='mb-1 text-sm font-medium'>{t('adminLogDetailPage.userAgent')}</p>
              <p className='break-all text-xs text-muted-foreground'>{data.UserAgent || '—'}</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
