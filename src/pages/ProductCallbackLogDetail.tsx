import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { useGetProductCallbackLogById } from '@/hooks/useProductCallbackLog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  Loader2,
  AlertCircle,
  Code2,
  Copy,
  Check,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import toast from 'react-hot-toast'

import { formatBackendDateTime } from '@/lib/backend-datetime'

export default function ProductCallbackLogDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation('common')
  const { data, isLoading, isError } = useGetProductCallbackLogById(id ?? '')
  const [copied, setCopied] = useState(false)

  const log = data?.data

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success(t('transactionDetail.copy.ariaCopied'))
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-4xl space-y-6'>
        {/* Navigation & Title */}
        <div className='flex items-center gap-4 border-b border-border pb-6'>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <h1 className='text-xl font-semibold text-foreground'>
            {t('productCallbackLogPage.detailTitle', { id: id?.slice(0, 8) })}
          </h1>
          {log && (
            <Badge variant={log.status === 'available' || log.status === 'success' ? 'success' : 'secondary'}>
              {log.status}
            </Badge>
          )}
        </div>

        {isLoading && (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-primary/60' />
          </div>
        )}

        {isError && (
          <div className='flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-muted/20'>
            <AlertCircle className='h-6 w-6 text-destructive' />
            <p className='text-sm font-medium text-destructive'>{t('productCallbackLogPage.toastError')}</p>
          </div>
        )}

        {log && (
          <div className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
            <div className='p-6 space-y-10'>
              {/* Top Grid Info */}
              <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
                <div className='space-y-1'>
                  <p className='text-xs font-medium text-muted-foreground uppercase tracking-tight'>
                    {t('productCallbackLogTable.colProductName')}
                  </p>
                  <p className='text-sm font-semibold'>{log.product_name}</p>
                </div>
                <div className='space-y-1'>
                  <p className='text-xs font-medium text-muted-foreground uppercase tracking-tight'>
                    {t('productCallbackLogTable.colProductCode')}
                  </p>
                  <p className='font-mono text-sm'>{log.product_code}</p>
                </div>
                <div className='space-y-1'>
                  <p className='text-xs font-medium text-muted-foreground uppercase tracking-tight'>
                    {t('productCallbackLogTable.colProviderCode')}
                  </p>
                  <p className='text-sm'>{log.provider_code}</p>
                </div>
                <div className='space-y-1'>
                  <p className='text-xs font-medium text-muted-foreground uppercase tracking-tight'>
                    {t('productCallbackLogTable.colPrice')}
                  </p>
                  <div className='flex items-baseline gap-2'>
                    <p className='text-lg font-bold text-foreground'>
                      Rp {log.price.toLocaleString('id-ID')}
                    </p>
                    <p className='text-xs text-muted-foreground line-through'>
                      Rp {log.previous_price.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                <div className='space-y-1'>
                  <p className='text-xs font-medium text-muted-foreground uppercase tracking-tight'>
                    {t('productCallbackLogTable.colCreatedAt')}
                  </p>
                  <p className='text-sm'>{formatBackendDateTime(log.created_at)}</p>
                </div>
                <div className='space-y-1'>
                  <p className='text-xs font-medium text-muted-foreground uppercase tracking-tight'>
                    {t('productCallbackLogTable.colId')}
                  </p>
                  <p className='font-mono text-[11px] text-muted-foreground truncate' title={log.id}>
                    {log.id}
                  </p>
                </div>
              </div>

              {/* Provider Meta Section */}
              <div className='space-y-4 pt-6 border-t border-border'>
                <h2 className='text-sm font-semibold flex items-center gap-2'>
                  <div className='h-1 w-1 rounded-full bg-primary' />
                  {t('productCallbackLogPage.sectionMeta')}
                </h2>
                <div className='flex gap-12'>
                  <div className='space-y-1'>
                    <p className='text-[10px] font-bold text-muted-foreground uppercase'>{t('productCallbackLogTable.colMetaLevel')}</p>
                    <p className='text-sm capitalize'>{log.meta_level}</p>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-[10px] font-bold text-muted-foreground uppercase'>{t('productCallbackLogTable.colMetaTimestamp')}</p>
                    <p className='text-sm font-mono'>{log.meta_timestamp}</p>
                  </div>
                </div>
              </div>

              {/* Original Payload section */}
              <div className='space-y-4 pt-6 border-t border-border'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-sm font-semibold flex items-center gap-2'>
                    <Code2 className='h-4 w-4 text-muted-foreground' />
                    {t('productCallbackLogPage.sectionPayload')}
                  </h2>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 gap-1.5 text-xs'
                    onClick={() => handleCopy(JSON.stringify(log.original_payload, null, 2))}
                  >
                    {copied ? <Check className='h-3.5 w-3.5' /> : <Copy className='h-3.5 w-3.5' />}
                    {copied ? 'Copied' : 'Copy JSON'}
                  </Button>
                </div>
                <div className='rounded-lg border border-border bg-muted/20 p-4'>
                  <pre className='max-h-96 overflow-auto text-xs font-mono text-muted-foreground leading-relaxed'>
                    {JSON.stringify(log.original_payload, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
