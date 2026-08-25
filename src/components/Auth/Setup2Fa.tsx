import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'

import { api } from '@/api/axios'
import { useAuthUser } from '@/lib/auth'
import { apiErrorMessage } from '@/lib/api-error'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { SetupWizard, type SetupData } from './twofa/SetupWizard'
import { TwoFactorStatus } from './twofa/TwoFactorStatus'

function SecurityHeader({ isActive }: { isActive: boolean }) {
  const { t } = useTranslation('common')
  return (
    <header className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
      <div className='flex gap-3'>
        <span
          className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'
          aria-hidden
        >
          <ShieldCheck className='h-5 w-5' />
        </span>
        <div className='min-w-0 space-y-1'>
          {/* h2, bukan h1: navbar sudah merender h1 judul halaman */}
          <h2 className='text-2xl font-semibold tracking-tight text-foreground'>
            {t('setup2faPage.title')}
          </h2>
          <p className='text-sm text-muted-foreground'>
            {t('setup2faPage.subtitle')}
          </p>
        </div>
      </div>

      <span
        role='status'
        className={cn(
          'flex shrink-0 items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs font-semibold',
          isActive
            ? 'border-success/30 bg-success/10 text-success'
            : 'border-border bg-muted text-muted-foreground',
        )}
      >
        <span
          className={cn(
            'h-2 w-2 shrink-0 rounded-full',
            isActive ? 'bg-success' : 'bg-muted-foreground',
          )}
          aria-hidden
        />
        {isActive
          ? t('setup2faPage.activeBadge')
          : t('setup2faPage.inactiveBadge')}
      </span>
    </header>
  )
}

function LoadingState() {
  const { t } = useTranslation('common')
  return (
    <div
      className='space-y-6'
      role='status'
      aria-live='polite'
      aria-busy='true'
      aria-label={t('setup2faPage.checkingTitle')}
    >
      <div className='flex gap-3'>
        <Skeleton className='h-11 w-11 rounded-lg' />
        <div className='space-y-2'>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='h-4 w-64' />
        </div>
      </div>
      <Skeleton className='h-48 w-full rounded-xl' />
    </div>
  )
}

function ProfileErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation('common')
  return (
    <Card className='border-destructive/25'>
      <CardContent className='flex flex-col items-center gap-4 px-6 py-12 text-center'>
        <span
          className='flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive'
          aria-hidden
        >
          <ShieldAlert className='h-6 w-6' />
        </span>
        <div className='space-y-1'>
          <h3 className='text-base font-semibold text-foreground'>
            {t('setup2faPage.profileErrorTitle')}
          </h3>
          <p className='mx-auto max-w-sm text-sm text-muted-foreground'>
            {t('setup2faPage.profileErrorDescription')}
          </p>
        </div>
        <Button type='button' variant='outline' onClick={onRetry} className='gap-2'>
          <RefreshCw className='h-4 w-4' aria-hidden />
          {t('common.refresh')}
        </Button>
      </CardContent>
    </Card>
  )
}

const Setup2FA = () => {
  const { t } = useTranslation('common')
  const [setupData, setSetupData] = useState<SetupData | null>(null)

  // Satu sumber data profil: query 'auth-me' yang juga dipakai guard rute
  const {
    user: profile,
    isLoading: isChecking,
    isError,
    refetchProfile,
  } = useAuthUser()

  const isMfaActive = profile?.two_factor_enabled === true
  const accountLabel: string = profile?.email ?? profile?.username ?? ''

  const { mutate: generateSetup, isPending: isGenerating } = useMutation({
    mutationFn: async (): Promise<SetupData> => {
      const res = await api.get('/admin/setup-2fa')
      return res.data.data
    },
    onSuccess: (data) => setSetupData(data),
    onError: (err: unknown) =>
      toast.error(apiErrorMessage(err, t('setup2faPage.qrCreateError'))),
  })

  if (isChecking) return <LoadingState />

  // Tanpa cabang ini, profil yang gagal dimuat membuat `two_factor_enabled`
  // undefined dan halaman menawarkan "Aktifkan 2FA" ke akun yang sudah aktif
  if (isError || !profile)
    return <ProfileErrorState onRetry={refetchProfile} />

  const benefits = [
    { icon: Smartphone, text: t('setup2faPage.benefitApp') },
    { icon: KeyRound, text: t('setup2faPage.benefitRecovery') },
    { icon: ShieldCheck, text: t('setup2faPage.benefitProtection') },
  ]

  return (
    <div className='space-y-6'>
      <SecurityHeader isActive={isMfaActive} />

      {isMfaActive ? (
        <TwoFactorStatus />
      ) : setupData ? (
        <SetupWizard
          setupData={setupData}
          accountLabel={accountLabel}
          onCancel={() => setSetupData(null)}
          onActivated={() => setSetupData(null)}
        />
      ) : (
        <Card>
          <CardContent className='flex flex-col items-center gap-6 px-6 py-10 text-center sm:py-14'>
            <span
              className='flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary'
              aria-hidden
            >
              <ShieldCheck className='h-7 w-7' />
            </span>

            <div className='space-y-1.5'>
              <h3 className='text-lg font-semibold tracking-tight text-foreground'>
                {t('setup2faPage.setupHeading')}
              </h3>
              <p className='mx-auto max-w-md text-sm text-muted-foreground'>
                {t('setup2faPage.setupDescription')}
              </p>
            </div>

            <ul className='mx-auto grid w-full max-w-md gap-2.5 text-left'>
              {benefits.map(({ icon: Icon, text }) => (
                <li key={text} className='flex items-start gap-2.5'>
                  <Icon
                    className='mt-0.5 h-4 w-4 shrink-0 text-primary'
                    aria-hidden
                  />
                  <span className='min-w-0 text-sm text-muted-foreground'>
                    {text}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              type='button'
              size='lg'
              onClick={() => generateSetup()}
              disabled={isGenerating}
              className='w-full gap-2 sm:w-auto sm:px-10'
            >
              {isGenerating ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
                  {t('setup2faPage.preparing')}
                </>
              ) : (
                t('setup2faPage.enableButton')
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Setup2FA
