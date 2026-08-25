import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyRound, ShieldCheck, ShieldOff, Smartphone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DeactivateDialog } from './DeactivateDialog'

/**
 * Tampilan saat 2FA menyala. Sebelumnya keadaan sehat ini justru disajikan
 * sebagai kartu merah berisi peringatan — sekarang statusnya ditegaskan
 * positif dan aksi merusak dipisah ke bagian tersendiri.
 */
export function TwoFactorStatus() {
  const { t } = useTranslation('common')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const facts = [
    { icon: Smartphone, text: t('setup2faPage.activeFactApp') },
    { icon: KeyRound, text: t('setup2faPage.activeFactRecovery') },
  ]

  return (
    <div className='space-y-6'>
      <Card className='overflow-hidden border-success/30 bg-success/5'>
        <CardContent className='flex flex-col items-center gap-5 px-6 py-8 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left'>
          <span
            className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-success/15 text-success'
            aria-hidden
          >
            <ShieldCheck className='h-7 w-7' />
          </span>

          <div className='min-w-0 space-y-3'>
            <div className='space-y-1.5'>
              <h3 className='text-lg font-semibold tracking-tight text-foreground'>
                {t('setup2faPage.activeTitle')}
              </h3>
              <p className='text-sm text-muted-foreground'>
                {t('setup2faPage.activeSubtitle')}
              </p>
            </div>

            <ul className='space-y-2 text-sm text-muted-foreground'>
              {facts.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className='flex items-start justify-center gap-2 sm:justify-start'
                >
                  <Icon
                    className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground'
                    aria-hidden
                  />
                  <span className='min-w-0'>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby='twofa-danger-zone'>
        <Card className='border-destructive/25'>
          <CardContent className='flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6'>
            <div className='flex min-w-0 gap-3'>
              <span
                className='mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive'
                aria-hidden
              >
                <ShieldOff className='h-4.5 w-4.5' />
              </span>
              <div className='min-w-0 space-y-1'>
                <h3
                  id='twofa-danger-zone'
                  className='text-sm font-semibold text-foreground'
                >
                  {t('setup2faPage.dangerZoneTitle')}
                </h3>
                <p className='text-sm text-muted-foreground'>
                  {t('setup2faPage.dangerZoneDescription')}
                </p>
              </div>
            </div>

            <Button
              type='button'
              variant='outline'
              onClick={() => setConfirmOpen(true)}
              className='shrink-0 border-destructive/30 text-destructive transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive sm:w-auto'
            >
              {t('setup2faPage.deactivateButton')}
            </Button>
          </CardContent>
        </Card>
      </section>

      <DeactivateDialog open={confirmOpen} onOpenChange={setConfirmOpen} />
    </div>
  )
}
