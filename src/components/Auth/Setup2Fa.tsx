import { useEffect, useId, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
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
import { useTranslation } from 'react-i18next'

import { api } from '@/api/axios'
import { AuthLoadingScreen } from '@/components/Auth/AuthLoadingScreen'
import { resolveApiError } from '@/lib/api-error'
import { AUTH_QUERY_KEY, useAuthUser } from '@/lib/auth'
import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import { queryClient } from '@/lib/query-client'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'

interface SetupData {
  qr_url: string;
  recovery_codes: string[];
}

const STEP_HEAD_CLASS =
  'flex items-center gap-2 border-b-4 border-[#111] px-4 py-2.5 text-xs font-black uppercase tracking-[0.18em]'

const Setup2FA = () => {
  const { t } = useTranslation('common')
  const [setupData, setSetupData] = useState<SetupData | null>(null)
  const [isConfirmingDeactivate, setIsConfirmingDeactivate] = useState(false)
  const [copied, setCopied] = useState(false)
  const [codesSaved, setCodesSaved] = useState(false)
  const [activationCode, setActivationCode] = useState('')
  const [deactivationCode, setDeactivationCode] = useState('')
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedId = useId()

  const { user, isLoading: isChecking } = useAuthUser()
  const isMfaActive = user?.two_factor_enabled === true

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current)
    }
  }, [])

  const refreshAuth = () =>
    queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })

  const { mutate: generateSetup, isPending: isGenerating } = useMutation({
    mutationFn: async () => {
      const res = await api.get('/admin/setup-2fa')
      return res.data.data
    },
    onSuccess: (data) => {
      setSetupData(data)
      setCodesSaved(false)
      toast.success(t('setup2fa.toastQrCreated'))
    },
    onError: (err) =>
      toast.error(resolveApiError(err, t, 'setup2fa.toastQrError')),
  })

  const { mutate: activateMfa, isPending: isActivating } = useMutation({
    mutationFn: async (code: string) => {
      const res = await api.post('/admin/activate', { code })
      return res.data
    },
    onSuccess: async () => {
      toast.success(t('setup2fa.toastActivated'))
      setSetupData(null)
      setActivationCode('')
      await refreshAuth()
    },
    onError: (err) => {
      toast.error(resolveApiError(err, t, 'setup2fa.toastActivateError'))
      /** Dikosongkan supaya user tidak perlu menghapus enam digit satu per satu. */
      setActivationCode('')
    },
  })

  const { mutate: deactivateMfa, isPending: isDeactivating } = useMutation({
    mutationFn: async (code: string) => {
      const res = await api.post('/admin/deactivate', { code })
      return res.data
    },
    onSuccess: async () => {
      toast.success(t('setup2fa.toastDeactivated'))
      setIsConfirmingDeactivate(false)
      setDeactivationCode('')
      await refreshAuth()
    },
    onError: (err) => {
      toast.error(resolveApiError(err, t, 'setup2fa.toastDeactivateError'))
      setDeactivationCode('')
    },
  })

  const handleCopyCodes = async () => {
    if (!setupData) return
    try {
      await copyTextToClipboard(setupData.recovery_codes.join('\n'))
    } catch {
      toast.error(t('setup2fa.toastCopyError'))
      return
    }
    setCopied(true)
    if (copyTimer.current) clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopied(false), 2000)
    toast.success(t('setup2fa.toastCopied'))
  }

  if (isChecking)
    return (
      <AuthLoadingScreen
        fullScreen={false}
        label={t('setup2fa.checking')}
        hint={t('setup2fa.checkingHint')}
      />
    )

  return (
    <div className='nb space-y-6'>
      {/* Judul halaman */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex gap-4'>
          <div className='nb-frame nb-sd-sm flex h-12 w-12 shrink-0 -rotate-3 items-center justify-center bg-[#c9f24d]'>
            <ShieldCheck className='h-6 w-6' strokeWidth={2.5} aria-hidden />
          </div>
          <div className='min-w-0 space-y-1.5'>
            <h1 className='text-2xl font-black uppercase leading-none tracking-tight'>
              {t('setup2fa.title')}
            </h1>
            <p className='text-sm font-bold text-[#111]/80'>
              {t('setup2fa.subtitle')}
            </p>
          </div>
        </div>
        {isMfaActive && (
          <div className='nb-frame nb-sd-sm flex items-center gap-2 self-start bg-[#c9f24d] px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] sm:self-auto'>
            <span className='nb-frame nb-frame-thin nb-round h-2.5 w-2.5 shrink-0 bg-[#111]' aria-hidden />
            {t('setup2fa.badgeActive')}
          </div>
        )}
      </div>

      {isMfaActive ? (
        <div className='nb-frame nb-frame-thick nb-sd-lg bg-white'>
          <h2 className={`${STEP_HEAD_CLASS} bg-[#ff4d3d] text-white`}>
            <ShieldOff className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
            {t('setup2fa.manageTitle')}
          </h2>

          <div className='flex flex-col items-center space-y-8 px-4 py-10 sm:py-12'>
            {!isConfirmingDeactivate ? (
              <div className='flex flex-col items-center space-y-6 text-center'>
                <div className='nb-frame nb-sd flex h-20 w-20 rotate-3 items-center justify-center bg-[#ffd84d]'>
                  <AlertTriangle className='h-10 w-10' strokeWidth={2.5} aria-hidden />
                </div>
                <div className='space-y-2'>
                  <h3 className='text-xl font-black uppercase tracking-tight'>
                    {t('setup2fa.deactivateHeading')}
                  </h3>
                  <p className='mx-auto max-w-sm text-sm font-bold text-[#111]/80'>
                    {t('setup2fa.deactivateBody')}
                  </p>
                </div>
                <button
                  type='button'
                  onClick={() => setIsConfirmingDeactivate(true)}
                  className='nb-frame nb-sd nb-press h-12 bg-[#ff4d3d] px-10 text-sm font-black uppercase tracking-[0.15em] text-white'
                >
                  {t('setup2fa.deactivateCta')}
                </button>
              </div>
            ) : (
              <div className='flex flex-col items-center space-y-6 duration-300 animate-in zoom-in-95'>
                <div className='text-center'>
                  <h3 className='text-lg font-black uppercase tracking-tight'>
                    {t('setup2fa.finalVerifyTitle')}
                  </h3>
                  <p className='text-sm font-bold text-[#111]/80'>
                    {t('setup2fa.finalVerifySubtitle')}
                  </p>
                </div>

                <label htmlFor='deactivate-otp' className='sr-only'>
                  {t('setup2fa.otpLabel')}
                </label>
                <div className='w-full overflow-x-auto py-2'>
                  <InputOTP
                    id='deactivate-otp'
                    maxLength={6}
                    value={deactivationCode}
                    onChange={setDeactivationCode}
                    disabled={isDeactivating}
                    onComplete={(v) => deactivateMfa(v)}
                    containerClassName='mx-auto w-max'
                    autoFocus
                  >
                    <InputOTPGroup className='gap-1.5 sm:gap-2'>
                      {[...Array(6)].map((_, i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className='nb-otp nb-frame nb-sd-sm h-12 w-9 bg-white text-lg font-black text-[#111] sm:h-14 sm:w-11 sm:text-xl'
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className='flex flex-col items-center gap-3'>
                  {isDeactivating ? (
                    <p
                      className='flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em]'
                      role='status'
                      aria-live='polite'
                    >
                      <Loader2 className='h-4 w-4 animate-spin' strokeWidth={3} aria-hidden />
                      {t('setup2fa.deactivating')}
                    </p>
                  ) : (
                    <button
                      type='button'
                      onClick={() => setIsConfirmingDeactivate(false)}
                      className='nb-focus min-h-11 px-3 text-xs font-black uppercase tracking-[0.15em] underline decoration-[3px] underline-offset-4 hover:bg-[#ffd84d]'
                    >
                      {t('setup2fa.cancelDeactivate')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {!setupData ? (
            <div className='nb-frame nb-frame-thick nb-sd-lg flex flex-col items-center bg-white px-4 py-16 sm:py-20'>
              <div className='nb-frame nb-sd mb-7 flex h-20 w-20 -rotate-3 items-center justify-center bg-[#6fe3f5]'>
                <RefreshCw
                  className={`h-10 w-10 ${isGenerating ? 'animate-spin' : ''}`}
                  strokeWidth={2.5}
                  aria-hidden
                />
              </div>
              <h2 className='mb-2 text-xl font-black uppercase tracking-tight'>
                {t('setup2fa.enableTitle')}
              </h2>
              <p className='mb-8 max-w-xs px-4 text-center text-sm font-bold text-[#111]/80'>
                {t('setup2fa.enableBody')}
              </p>
              <button
                type='button'
                onClick={() => generateSetup()}
                disabled={isGenerating}
                className='nb-frame nb-sd nb-press flex h-12 items-center gap-2 bg-[#c9f24d] px-10 text-sm font-black uppercase tracking-[0.15em] disabled:cursor-not-allowed disabled:opacity-60'
              >
                {isGenerating ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' strokeWidth={3} aria-hidden />
                    {t('setup2fa.preparing')}
                  </>
                ) : (
                  t('setup2fa.enableCta')
                )}
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-5 duration-500 animate-in slide-in-from-bottom-4 sm:gap-6 lg:grid-cols-3'>
              {/* 1. QR */}
              <div className='nb-frame nb-frame-thick nb-sd-lg bg-white'>
                <h2 className={`${STEP_HEAD_CLASS} bg-[#6fe3f5]`}>
                  {t('setup2fa.step1')}
                </h2>
                <div className='flex justify-center px-4 py-6'>
                  <div className='nb-frame nb-sd-sm bg-white p-4'>
                    <QRCodeSVG value={setupData.qr_url} size={180} />
                  </div>
                </div>
              </div>

              {/* 2. Kode cadangan */}
              <div className='nb-frame nb-frame-thick nb-sd-lg bg-white'>
                <h2 className={`${STEP_HEAD_CLASS} bg-[#ff9ed2]`}>
                  {t('setup2fa.step2')}
                </h2>
                <div className='space-y-4 px-4 py-6'>
                  <div className='grid grid-cols-2 gap-2'>
                    {setupData.recovery_codes.map((code) => (
                      <div
                        key={code}
                        className='nb-frame nb-frame-thin bg-[#f5f1e8] p-2 text-center font-mono text-[11px] font-black'
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                  <button
                    type='button'
                    onClick={handleCopyCodes}
                    className='nb-frame nb-sd-sm nb-press flex h-10 w-full items-center justify-center gap-2 bg-[#ffd84d] text-xs font-black uppercase tracking-[0.15em]'
                  >
                    {copied ? (
                      <Check className='h-4 w-4' strokeWidth={3} aria-hidden />
                    ) : (
                      <Copy className='h-4 w-4' strokeWidth={3} aria-hidden />
                    )}
                    {copied ? t('setup2fa.copied') : t('setup2fa.copyAll')}
                  </button>
                </div>
              </div>

              {/* 3. Aktivasi */}
              <div className='nb-frame nb-frame-thick nb-sd-lg bg-white'>
                <h2 className={`${STEP_HEAD_CLASS} bg-[#c9f24d]`}>
                  {t('setup2fa.step3')}
                </h2>
                <div className='flex flex-col items-center gap-5 px-4 py-8'>
                  {/**
                   * Kode cadangan hilang permanen begitu aktivasi berhasil,
                   * jadi aktivasi dikunci sampai user menyatakan sudah menyimpannya.
                   */}
                  <label
                    htmlFor={savedId}
                    className='nb-frame nb-frame-thin flex w-full cursor-pointer items-start gap-2.5 bg-[#f5f1e8] p-3 text-xs font-bold'
                  >
                    <input
                      id={savedId}
                      type='checkbox'
                      checked={codesSaved}
                      onChange={(e) => setCodesSaved(e.target.checked)}
                      className='mt-0.5 h-4 w-4 shrink-0 accent-[#111]'
                    />
                    <span>{t('setup2fa.confirmSaved')}</span>
                  </label>

                  <label htmlFor='activate-otp' className='sr-only'>
                    {t('setup2fa.otpLabel')}
                  </label>
                  <div className='w-full overflow-x-auto py-2'>
                    <InputOTP
                      id='activate-otp'
                      maxLength={6}
                      value={activationCode}
                      onChange={setActivationCode}
                      disabled={isActivating || !codesSaved}
                      onComplete={(v) => activateMfa(v)}
                      containerClassName='mx-auto w-max'
                    >
                      <InputOTPGroup className='gap-1.5'>
                        {[...Array(6)].map((_, i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className='nb-otp nb-frame nb-sd-sm h-14 w-10 bg-white text-xl font-black text-[#111]'
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <p
                    className='flex min-h-[1.25rem] items-center gap-2 text-xs font-black uppercase tracking-[0.15em]'
                    role='status'
                    aria-live='polite'
                  >
                    {isActivating && (
                      <>
                        <Loader2 className='h-3.5 w-3.5 animate-spin' strokeWidth={3} aria-hidden />
                        {t('setup2fa.verifying')}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Peringatan */}
      {setupData && !isMfaActive && (
        <div className='nb-frame nb-sd flex items-start gap-3 bg-[#ffd84d] px-4 py-3.5'>
          <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0' strokeWidth={3} aria-hidden />
          <div className='space-y-1'>
            <p className='text-sm font-black uppercase tracking-[0.12em]'>
              {t('setup2fa.warnTitle')}
            </p>
            <p className='text-xs font-bold text-[#111]/85'>
              {t('setup2fa.warnBody')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Setup2FA
