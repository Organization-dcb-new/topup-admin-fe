import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  Loader2,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { OtpField } from '@/components/ui/otp-field'
import { api } from '@/api/axios'
import { apiErrorMessage } from '@/lib/api-error'
import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import { formatSecretGroups, parseTotpSecret } from '@/lib/twofa'
import { cn } from '@/lib/utils'
import { RecoveryCodes } from './RecoveryCodes'

export interface SetupData {
  qr_url: string
  recovery_codes: string[]
}

interface SetupWizardProps {
  setupData: SetupData
  accountLabel: string
  onCancel: () => void
  onActivated: () => void
}

const STEP_KEYS = ['stepScan', 'stepBackup', 'stepActivate'] as const

export function SetupWizard({
  setupData,
  accountLabel,
  onCancel,
  onActivated,
}: SetupWizardProps) {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()
  const [step, setStep] = useState(0)
  const [acknowledged, setAcknowledged] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [secretCopied, setSecretCopied] = useState(false)
  const [code, setCode] = useState('')
  const [otpError, setOtpError] = useState<string | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const isFirstRender = useRef(true)

  const secret = useMemo(() => parseTotpSecret(setupData.qr_url), [setupData])

  // Setiap GET /admin/setup-2fa membuat ulang secret dan menimpa recovery
  // code di server, jadi memuat ulang halaman membatalkan yang tampil di layar
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  // Fokus berpindah ke judul langkah baru; tanpa ini fokus jatuh ke <body>
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    headingRef.current?.focus()
  }, [step])

  const { mutate: activate, isPending: isActivating } = useMutation({
    mutationFn: async (otp: string) => {
      const res = await api.post('/admin/activate', { code: otp })
      return res.data
    },
    onSuccess: () => {
      toast.success(t('setup2faPage.activateSuccess'))
      queryClient.invalidateQueries({ queryKey: ['auth-me'] })
      onActivated()
    },
    onError: (err: unknown) => {
      setCode('')
      setOtpError(apiErrorMessage(err, t('setup2faPage.activateError')))
    },
  })

  const handleCopySecret = async () => {
    if (!secret) return
    try {
      await copyTextToClipboard(secret)
    } catch {
      toast.error(t('setup2faPage.copyError'))
      return
    }
    setSecretCopied(true)
    window.setTimeout(() => setSecretCopied(false), 2000)
    toast.success(t('setup2faPage.secretCopied'))
  }

  const canGoNext = step === 0 || (step === 1 && acknowledged)

  return (
    <Card>
      <CardContent className='space-y-6 px-5 py-6 sm:px-6'>
        <ol className='flex items-center gap-2' aria-label={t('setup2faPage.stepperAria')}>
          {STEP_KEYS.map((key, index) => {
            const isDone = index < step
            const isCurrent = index === step
            return (
              <li key={key} className='flex min-w-0 flex-1 items-center gap-2'>
                <span
                  aria-hidden
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-200',
                    isDone && 'bg-success text-success-foreground',
                    isCurrent && 'bg-primary text-primary-foreground',
                    !isDone && !isCurrent && 'bg-muted text-muted-foreground',
                  )}
                >
                  {isDone ? <Check className='h-3.5 w-3.5' /> : index + 1}
                </span>
                <span
                  className={cn(
                    'hidden min-w-0 truncate text-xs font-medium sm:block',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {t(`setup2faPage.${key}`)}
                </span>
                {index < STEP_KEYS.length - 1 && (
                  <span
                    aria-hidden
                    className={cn(
                      'h-px min-w-2 flex-1 transition-colors duration-200',
                      isDone ? 'bg-success' : 'bg-border',
                    )}
                  />
                )}
              </li>
            )
          })}
        </ol>

        <div className='space-y-4'>
          <div className='space-y-1'>
            <h3
              ref={headingRef}
              tabIndex={-1}
              className='text-base font-semibold tracking-tight text-foreground outline-none'
            >
              {t(`setup2faPage.${STEP_KEYS[step]}Title`)}
            </h3>
            <p className='text-sm text-muted-foreground'>
              {t(`setup2faPage.${STEP_KEYS[step]}Description`)}
            </p>
          </div>

          {step === 0 && (
            <div className='space-y-4'>
              <div className='flex justify-center'>
                {/* Plat putih disengaja: QR harus hitam-di-atas-putih agar
                    terbaca pemindai — jangan diganti token tema */}
                <div className='rounded-xl border border-border bg-white p-4 shadow-sm'>
                  <QRCodeSVG value={setupData.qr_url} size={168} />
                </div>
              </div>

              {secret && (
                <div className='rounded-lg border border-border'>
                  <button
                    type='button'
                    onClick={() => setShowManual(!showManual)}
                    aria-expanded={showManual}
                    className='flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted/50'
                  >
                    {t('setup2faPage.manualEntryToggle')}
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                        showManual && 'rotate-180',
                      )}
                      aria-hidden
                    />
                  </button>
                  {showManual && (
                    <div className='space-y-2 border-t border-border px-3 py-3'>
                      <p className='text-xs text-muted-foreground'>
                        {t('setup2faPage.manualEntryDescription')}
                      </p>
                      <div className='flex items-center gap-2 rounded-md bg-muted/50 p-2'>
                        <code className='min-w-0 flex-1 select-all break-all font-mono text-sm font-semibold tracking-wider text-foreground'>
                          {formatSecretGroups(secret)}
                        </code>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon-sm'
                          onClick={handleCopySecret}
                          aria-label={t('setup2faPage.copySecret')}
                          className='shrink-0'
                        >
                          {secretCopied ? (
                            <Check className='h-4 w-4 text-success' aria-hidden />
                          ) : (
                            <Copy className='h-4 w-4' aria-hidden />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <RecoveryCodes
              codes={setupData.recovery_codes}
              accountLabel={accountLabel}
              acknowledged={acknowledged}
              onAcknowledgedChange={setAcknowledged}
            />
          )}

          {step === 2 && (
            <div className='space-y-3 py-2'>
              <OtpField
                value={code}
                onChange={(next) => {
                  setCode(next)
                  if (otpError) setOtpError(null)
                }}
                onComplete={(value) => {
                  if (!isActivating) activate(value)
                }}
                disabled={isActivating}
                autoFocus
                label={t('setup2faPage.otpLabel')}
                error={otpError}
              />
              {isActivating && (
                <p
                  role='status'
                  className='flex items-center justify-center gap-2 text-sm text-muted-foreground'
                >
                  <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
                  {t('setup2faPage.verifying')}
                </p>
              )}
            </div>
          )}
        </div>

        <div className='flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between'>
          <Button
            type='button'
            variant='ghost'
            onClick={onCancel}
            disabled={isActivating}
            className='gap-2 text-muted-foreground hover:text-foreground'
          >
            <X className='h-4 w-4' aria-hidden />
            {t('setup2faPage.cancelSetup')}
          </Button>

          <div className='flex gap-2'>
            {step > 0 && (
              <Button
                type='button'
                variant='outline'
                onClick={() => setStep(step - 1)}
                disabled={isActivating}
                className='flex-1 gap-2 sm:flex-none'
              >
                <ArrowLeft className='h-4 w-4' aria-hidden />
                {t('setup2faPage.back')}
              </Button>
            )}
            {step < STEP_KEYS.length - 1 && (
              <Button
                type='button'
                onClick={() => setStep(step + 1)}
                disabled={!canGoNext}
                className='flex-1 gap-2 sm:flex-none'
              >
                {t('setup2faPage.next')}
                <ArrowRight className='h-4 w-4' aria-hidden />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
