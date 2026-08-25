import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Check, Copy, Download, TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import { buildRecoveryCodesFile, downloadTextFile } from '@/lib/twofa'

interface RecoveryCodesProps {
  codes: string[]
  accountLabel: string
  acknowledged: boolean
  onAcknowledgedChange: (next: boolean) => void
}

export function RecoveryCodes({
  codes,
  accountLabel,
  acknowledged,
  onAcknowledgedChange,
}: RecoveryCodesProps) {
  const { t } = useTranslation('common')
  const [copied, setCopied] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const copyResetTimer = useRef<number | undefined>(undefined)
  const acknowledgeId = useId()

  // Timer harus dibersihkan; kalau tidak, setState terpanggil setelah unmount
  useEffect(() => () => window.clearTimeout(copyResetTimer.current), [])

  const handleCopy = async () => {
    try {
      await copyTextToClipboard(codes.join('\n'))
    } catch {
      toast.error(t('setup2faPage.copyError'))
      return
    }
    setCopied(true)
    window.clearTimeout(copyResetTimer.current)
    copyResetTimer.current = window.setTimeout(() => setCopied(false), 2000)
    toast.success(t('setup2faPage.copySuccess'))
  }

  const handleDownload = () => {
    downloadTextFile(
      'pakargaming-recovery-codes.txt',
      buildRecoveryCodesFile(codes, {
        heading: t('setup2faPage.fileHeading'),
        accountLabel: t('setup2faPage.fileAccount', { account: accountLabel }),
        note: t('setup2faPage.fileNote'),
      }),
    )
    setDownloaded(true)
    toast.success(t('setup2faPage.downloadSuccess'))
  }

  return (
    <div className='space-y-4'>
      {/* Peringatan dinaikkan ke atas kode: dulu tampil di kaki halaman,
          jauh di bawah tombol aktivasi yang mengakhiri alur */}
      <div className='flex gap-3 rounded-lg border border-warning/30 bg-warning/10 p-3'>
        <TriangleAlert
          className='mt-0.5 h-4.5 w-4.5 shrink-0 text-warning'
          aria-hidden
        />
        <div className='min-w-0 space-y-1'>
          <p className='text-sm font-semibold text-foreground'>
            {t('setup2faPage.beforeActivationTitle')}
          </p>
          <p className='text-sm text-muted-foreground'>
            {t('setup2faPage.beforeActivationDescription')}
          </p>
        </div>
      </div>

      <ul className='grid grid-cols-2 gap-2 sm:grid-cols-2'>
        {codes.map((code, index) => (
          <li
            key={code}
            className='flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2'
          >
            <span className='w-5 shrink-0 text-xs tabular-nums text-muted-foreground'>
              {index + 1}
            </span>
            {/* select-all: kode ini kerap disalin satu per satu secara manual */}
            <code className='min-w-0 select-all truncate font-mono text-sm font-semibold tracking-wide text-foreground'>
              {code}
            </code>
          </li>
        ))}
      </ul>

      <div className='flex flex-col gap-2 sm:flex-row'>
        <Button
          type='button'
          variant='outline'
          onClick={handleCopy}
          className='flex-1 gap-2'
        >
          {copied ? (
            <Check className='h-4 w-4 text-success' aria-hidden />
          ) : (
            <Copy className='h-4 w-4' aria-hidden />
          )}
          {copied ? t('setup2faPage.copied') : t('setup2faPage.copyAll')}
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={handleDownload}
          className='flex-1 gap-2'
        >
          {downloaded ? (
            <Check className='h-4 w-4 text-success' aria-hidden />
          ) : (
            <Download className='h-4 w-4' aria-hidden />
          )}
          {t('setup2faPage.downloadCodes')}
        </Button>
      </div>

      <label
        htmlFor={acknowledgeId}
        className='flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-3 transition-colors duration-200 hover:bg-muted/50'
      >
        <Checkbox
          id={acknowledgeId}
          checked={acknowledged}
          onCheckedChange={(next) => onAcknowledgedChange(next === true)}
          className='mt-0.5'
        />
        <span className='min-w-0 text-sm text-foreground'>
          {t('setup2faPage.acknowledgeSaved')}
        </span>
      </label>
    </div>
  )
}
