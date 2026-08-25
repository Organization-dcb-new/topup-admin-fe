import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { QRCodeSVG } from 'qrcode.react'
import {
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
  ShieldOff,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { api } from '@/api/axios'
import { useAuthUser } from '@/lib/auth'
import { apiErrorMessage } from '@/lib/api-error'
import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'

interface SetupData {
  qr_url: string;
  recovery_codes: string[];
}

const Setup2FA = () => {
  const { t } = useTranslation()
  const [setupData, setSetupData] = useState<SetupData | null>(null)
  const [isConfirmingDeactivate, setIsConfirmingDeactivate] = useState(false)
  const [copied, setCopied] = useState(false)

  // Satu sumber data profil: query 'auth-me' yang juga dipakai RoleGuard,
  // supaya status 2FA & guard tidak pernah beda versi
  const { user: profile, isLoading: isChecking } = useAuthUser()
  const queryClient = useQueryClient()
  const reloadProfile = () =>
    queryClient.invalidateQueries({ queryKey: ['auth-me'] })

  const isMfaActive = profile?.two_factor_enabled

  const { mutate: generateSetup, isPending: isGenerating } = useMutation({
    mutationFn: async () => {
      const res = await api.get('/admin/setup-2fa')
      return res.data.data
    },
    onSuccess: (data) => {
      setSetupData(data)
      toast.success(t('setup2faPage.qrCreated'))
    },
    onError: (err: unknown) =>
      toast.error(apiErrorMessage(err, t('setup2faPage.qrCreateError'))),
  })

  const { mutate: activateMfa, isPending: isActivating } = useMutation({
    mutationFn: async (code: string) => {
      const res = await api.post('/admin/activate', { code })
      return res.data
    },
    onSuccess: () => {
      toast.success(t('setup2faPage.activateSuccess'))
      setSetupData(null)
      reloadProfile()
    },
    onError: (err: unknown) => {
      toast.error(apiErrorMessage(err, t('setup2faPage.activateError')))
    },
  })

  const { mutate: deactivateMfa, isPending: isDeactivating } = useMutation({
    mutationFn: async (code: string) => {
      const res = await api.post('/admin/deactivate', { code })
      return res.data
    },
    onSuccess: () => {
      toast.success(t('setup2faPage.deactivateSuccess'))
      setIsConfirmingDeactivate(false)
      reloadProfile()
    },
    onError: (err: unknown) => {
      toast.error(apiErrorMessage(err, t('setup2faPage.deactivateError')))
    },
  })

  const handleCopyCodes = async () => {
    if (!setupData) return
    const text = setupData.recovery_codes.join('\n')
    try {
      await copyTextToClipboard(text)
    } catch {
      toast.error(t('setup2faPage.copyError'))
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success(t('setup2faPage.copySuccess'))
  }

  if (isChecking)
    return (
      <div
        className='flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/80 bg-muted/20 py-12'
        role='status'
        aria-live='polite'
        aria-busy='true'
      >
        <Loader2 className='h-11 w-11 animate-spin text-primary' aria-hidden />
        <div className='text-center'>
          <p className='text-sm font-medium text-foreground'>
            {t('setup2faPage.checkingTitle')}
          </p>
          <p className='mt-1 text-xs text-muted-foreground'>
            {t('setup2faPage.checkingSubtitle')}
          </p>
        </div>
      </div>
    )

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex gap-3'>
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
            <ShieldCheck className='h-5 w-5' aria-hidden />
          </div>
          <div className='min-w-0 space-y-1'>
            <h1 className='text-2xl font-semibold tracking-tight text-gray-900'>
              {t('setup2faPage.title')}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {t('setup2faPage.subtitle')}
            </p>
          </div>
        </div>
        {isMfaActive && (
          <div className='flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 sm:self-auto'>
            <span
              className='h-2 w-2 shrink-0 rounded-full bg-emerald-500'
              aria-hidden
            />
            {t('setup2faPage.activeBadge')}
          </div>
        )}
      </div>

      {isMfaActive ? (
        <Card className='overflow-hidden rounded-xl border border-red-100/80 bg-red-50/10 shadow-sm ring-1 ring-gray-900/5'>
          <CardHeader className='border-b border-red-100/80 bg-white px-4 py-4 sm:px-5'>
            <CardTitle className='flex items-center gap-2 text-base font-semibold text-red-800'>
              <ShieldOff className='h-5 w-5 shrink-0' aria-hidden />
              {t('setup2faPage.manageTitle')}
            </CardTitle>
            <CardDescription className='text-sm text-muted-foreground'>
              {t('setup2faPage.manageSubtitle')}
            </CardDescription>
          </CardHeader>

          <CardContent className='flex flex-col items-center space-y-8 py-10 sm:py-12'>
            {!isConfirmingDeactivate ? (
              <div className='space-y-6 text-center'>
                <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-red-100 shadow-inner'>
                  <AlertTriangle
                    className='h-10 w-10 text-red-600'
                    aria-hidden
                  />
                </div>
                <div className='space-y-2'>
                  <h3 className='text-xl font-semibold text-gray-900'>
                    {t('setup2faPage.deactivateHeading')}
                  </h3>
                  <p className='mx-auto max-w-sm text-sm text-muted-foreground'>
                    {t('setup2faPage.deactivateWarning')}
                  </p>
                </div>
                <Button
                  variant='destructive'
                  size='lg'
                  onClick={() => setIsConfirmingDeactivate(true)}
                  className='h-12 rounded-xl px-10 font-semibold transition-transform active:scale-[0.98]'
                >
                  {t('setup2faPage.deactivateButton')}
                </Button>
              </div>
            ) : (
              <div className='flex flex-col items-center space-y-6 duration-300 animate-in zoom-in-95'>
                <div className='text-center'>
                  <h3 className='text-lg font-semibold text-red-800'>
                    {t('setup2faPage.finalVerifyTitle')}
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    {t('setup2faPage.finalVerifySubtitle')}
                  </p>
                </div>

                <InputOTP
                  maxLength={6}
                  disabled={isDeactivating}
                  onComplete={(v) => deactivateMfa(v)}
                  autoFocus
                >
                  <InputOTPGroup>
                    {[...Array(6)].map((_, i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className='w-12 h-16 bg-white text-xl font-black border-red-200 focus:border-red-500'
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>

                <div className='flex flex-col items-center gap-3'>
                  {isDeactivating ? (
                    <p className='flex items-center gap-2 text-sm font-medium text-red-600'>
                      <Loader2
                        className='h-4 w-4 animate-spin'
                        aria-hidden
                      />
                      {t('setup2faPage.deactivating')}
                    </p>
                  ) : (
                    <Button
                      variant='ghost'
                      onClick={() => setIsConfirmingDeactivate(false)}
                      className='text-xs text-muted-foreground hover:text-red-600'
                    >
                      {t('setup2faPage.cancelDeactivate')}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {!setupData ? (
            <Card className='flex flex-col items-center rounded-xl border border-dashed border-border/80 bg-muted/15 py-16 shadow-sm ring-1 ring-gray-900/5 sm:py-20'>
              <div className='mb-6 rounded-2xl border border-border/60 bg-white p-4 shadow-sm'>
                <RefreshCw
                  className={`h-12 w-12 text-primary/70 ${isGenerating ? 'animate-spin' : ''}`}
                  aria-hidden
                />
              </div>
              <h3 className='mb-2 text-xl font-semibold tracking-tight text-gray-900'>
                {t('setup2faPage.setupHeading')}
              </h3>
              <p className='mb-8 max-w-xs px-4 text-center text-sm text-muted-foreground'>
                {t('setup2faPage.setupDescription')}
              </p>
              <Button
                onClick={() => generateSetup()}
                disabled={isGenerating}
                size='lg'
                className='h-12 rounded-xl px-10 text-base font-semibold shadow-sm transition-transform active:scale-[0.98]'
              >
                {isGenerating ? (
                  <span className='flex items-center gap-2'>
                    <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
                    {t('setup2faPage.preparing')}
                  </span>
                ) : (
                  t('setup2faPage.enableButton')
                )}
              </Button>
            </Card>
          ) : (
            <div className='grid grid-cols-1 gap-4 duration-500 animate-in slide-in-from-bottom-4 sm:gap-6 lg:grid-cols-3'>
              <Card className='rounded-xl border-0 shadow-sm ring-1 ring-gray-900/5'>
                <CardHeader className='pb-2 pt-4'>
                  <CardTitle className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                    {t('setup2faPage.stepScan')}
                  </CardTitle>
                </CardHeader>
                <CardContent className='flex justify-center py-4 sm:py-6'>
                  <div className='rounded-2xl border-2 border-dashed border-border/80 bg-white p-4 shadow-inner'>
                    <QRCodeSVG value={setupData.qr_url} size={180} />
                  </div>
                </CardContent>
              </Card>

              <Card className='rounded-xl border-0 shadow-sm ring-1 ring-gray-900/5'>
                <CardHeader className='pb-2 pt-4'>
                  <CardTitle className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                    {t('setup2faPage.stepBackup')}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4 py-4 sm:py-6'>
                  <div className='grid grid-cols-2 gap-2'>
                    {setupData.recovery_codes.map((code) => (
                      <div
                        key={code}
                        className='rounded-lg border border-border/80 bg-muted/30 p-2 text-center font-mono text-[11px] font-semibold text-foreground shadow-sm'
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                  <Button
                    variant='secondary'
                    size='sm'
                    className='w-full gap-2 font-semibold'
                    onClick={handleCopyCodes}
                  >
                    {copied ? (
                      <Check className='h-4 w-4 text-emerald-600' aria-hidden />
                    ) : (
                      <Copy className='h-4 w-4' aria-hidden />
                    )}
                    {copied
                      ? t('setup2faPage.copied')
                      : t('setup2faPage.copyAll')}
                  </Button>
                </CardContent>
              </Card>

              <Card className='rounded-xl border border-primary/20 shadow-sm ring-2 ring-primary/10'>
                <CardHeader className='pb-2 pt-4'>
                  <CardTitle className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                    {t('setup2faPage.stepActivate')}
                  </CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col items-center space-y-6 pt-6 sm:space-y-8 sm:pt-8'>
                  <InputOTP
                    maxLength={6}
                    disabled={isActivating}
                    onComplete={(v) => activateMfa(v)}
                  >
                    <InputOTPGroup>
                      {[...Array(6)].map((_, i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className='h-14 w-10 border-border bg-muted/30 text-xl font-semibold focus-visible:ring-primary/30'
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                  {isActivating && (
                    <p className='flex items-center gap-2 text-xs font-medium text-muted-foreground'>
                      <Loader2 className='h-3.5 w-3.5 animate-spin' aria-hidden />
                      {t('setup2faPage.verifying')}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Info Warning */}
      {setupData && !isMfaActive && (
        <Alert className='rounded-xl border-amber-200 border-l-4 bg-amber-50/90 shadow-sm ring-1 ring-amber-900/5'>
          <AlertTriangle className='h-5 w-5 text-amber-600' aria-hidden />
          <AlertTitle className='font-semibold text-amber-950'>
            {t('setup2faPage.beforeActivationTitle')}
          </AlertTitle>
          <AlertDescription className='text-xs text-amber-900/90'>
            {t('setup2faPage.beforeActivationDescription')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default Setup2FA
